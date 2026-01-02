/**
 * @fileoverview API route for executing onboarding steps.
 *
 * Provides a generic endpoint for executing any registered onboarding step.
 * The step is looked up in the registry and executed with the provided data.
 *
 * ## When to Use This
 *
 * Use this endpoint when you need to execute a step with custom data input.
 * For steps that auto-execute (like Lead Scraper provisioning), use the
 * step-specific endpoint instead.
 */

import { db } from '@sim/db'
import { workspace } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { verifyWorkspaceAccess } from '@/lib/onboarding/access'
import { stepExecutor } from '@/lib/onboarding/executor'
import { stepRegistry } from '@/lib/onboarding/registry'
import type { OnboardingContext } from '@/lib/onboarding/types'
import { ExecuteStepRequestSchema } from '@/lib/onboarding/types'
import { markStepCompleted } from '@/lib/onboarding/utils'

// Import steps to ensure they're registered with the registry
import '@/lib/onboarding/steps'

const logger = createLogger('OnboardingExecuteAPI')

/**
 * POST /api/onboarding/[workspaceId]/execute
 *
 * Executes a specific onboarding step with the provided data.
 * The step must be registered in the step registry.
 *
 * @body ExecuteStepRequest - Step ID and input data
 * @returns Execution result with step output
 *
 * @example Request:
 * ```json
 * {
 *   "stepId": "company-profile",
 *   "data": {
 *     "companyName": "Acme Corp",
 *     "industry": "Technology"
 *   }
 * }
 * ```
 *
 * @example Response (success):
 * ```json
 * {
 *   "success": true,
 *   "result": { "profileId": "profile-123" }
 * }
 * ```
 *
 * @example Response (skipped):
 * ```json
 * {
 *   "success": true,
 *   "skipped": true
 * }
 * ```
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId } = await params

    // Verify user has access to this workspace
    const hasAccess = await verifyWorkspaceAccess(session.user.id, workspaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = ExecuteStepRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { stepId, data } = parsed.data

    // Look up step in registry
    const step = stepRegistry.getStep(stepId)
    if (!step) {
      return NextResponse.json({ error: `Step not found: ${stepId}` }, { status: 404 })
    }

    // Get workspace details for context
    const [workspaceData] = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        onboardingStep: workspace.onboardingStep,
      })
      .from(workspace)
      .where(eq(workspace.id, workspaceId))
      .limit(1)

    if (!workspaceData) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Build execution context
    const completedStepIds = workspaceData.onboardingStep
      ? workspaceData.onboardingStep.split(',').filter(Boolean)
      : []

    const context: OnboardingContext = {
      workspaceId,
      userId: session.user.id,
      userEmail: session.user.email || undefined,
      workspaceName: workspaceData.name,
      completedStepIds,
      stepResults: {},
    }

    logger.info('Executing onboarding step', {
      workspaceId,
      stepId,
      userId: session.user.id,
    })

    // Execute the step
    const result = await stepExecutor.executeStep(step, data, context)

    if (!result.success) {
      return NextResponse.json(
        { error: 'error' in result ? result.error : 'Step execution failed' },
        { status: 500 }
      )
    }

    // Mark step as completed
    const stepResult = 'result' in result ? result.result : undefined
    await markStepCompleted(workspaceId, stepId, stepResult)

    return NextResponse.json({
      success: true,
      result: stepResult,
      skipped: 'skipped' in result ? result.skipped : false,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to execute onboarding step', { error: errorMessage })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
