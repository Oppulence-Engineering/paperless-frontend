/**
 * @fileoverview API routes for workspace-specific onboarding operations.
 *
 * Provides endpoints for:
 * - GET: Retrieve current onboarding state
 * - POST: Mark a step as completed
 *
 * All endpoints require authentication and workspace access.
 */

import { createLogger } from '@sim/logger'
import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { verifyWorkspaceAccess } from '@/lib/onboarding/access'
// Import steps to ensure they're registered with the registry before querying
import '@/lib/onboarding/steps'
import { CompleteStepRequestSchema } from '@/lib/onboarding/types'
import { getOnboardingState, markStepCompleted } from '@/lib/onboarding/utils'

const logger = createLogger('OnboardingWorkspaceAPI')

/**
 * GET /api/onboarding/[workspaceId]
 *
 * Returns the complete onboarding state for a workspace, including:
 * - Whether onboarding is complete
 * - Current step ID
 * - Status of all steps
 * - Completed step count
 *
 * @returns OnboardingState object or error response
 *
 * @example Response:
 * ```json
 * {
 *   "isComplete": false,
 *   "currentStepId": "lead-scraper-provisioning",
 *   "stepStatuses": {
 *     "lead-scraper-provisioning": "in_progress"
 *   },
 *   "completedStepIds": [],
 *   "totalSteps": 1,
 *   "completedCount": 0
 * }
 * ```
 */
export async function GET(
  _request: NextRequest,
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

    const state = await getOnboardingState(workspaceId)

    if (!state) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    return NextResponse.json(state)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to get onboarding state', { error: errorMessage })
    return NextResponse.json({ error: 'Failed to get onboarding state' }, { status: 500 })
  }
}

/**
 * POST /api/onboarding/[workspaceId]
 *
 * Marks a step as completed for the workspace.
 * Updates the workspace record and returns the new state.
 *
 * @body CompleteStepRequest - Step ID and optional result
 * @returns Updated OnboardingState with success flag
 *
 * @example Request:
 * ```json
 * {
 *   "stepId": "lead-scraper-provisioning",
 *   "result": { "organizationId": "org-123", "tenantId": "tenant-456" }
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
    const parsed = CompleteStepRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { stepId, result, skipped } = parsed.data

    logger.info('Completing onboarding step', {
      workspaceId,
      stepId,
      skipped: skipped || false,
    })

    // Mark step as completed
    await markStepCompleted(workspaceId, stepId, result)

    // Get updated state
    const state = await getOnboardingState(workspaceId)

    return NextResponse.json({
      success: true,
      ...state,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to complete onboarding step', { error: errorMessage })
    return NextResponse.json({ error: 'Failed to complete step' }, { status: 500 })
  }
}
