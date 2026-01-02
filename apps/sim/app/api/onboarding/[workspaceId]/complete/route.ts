/**
 * @fileoverview API route for marking onboarding as complete.
 *
 * Called after all required steps have been completed to finalize
 * the onboarding process. Sets the workspace's onboardingCompleted
 * flag to true.
 */

import { createLogger } from '@sim/logger'
import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { verifyWorkspaceAccess } from '@/lib/onboarding/access'
// Import steps to ensure they're registered with the registry
import '@/lib/onboarding/steps'
import { markOnboardingComplete } from '@/lib/onboarding/utils'

const logger = createLogger('OnboardingCompleteAPI')

/**
 * POST /api/onboarding/[workspaceId]/complete
 *
 * Marks onboarding as complete for the workspace.
 * After this, the user will be redirected to the workspace.
 *
 * @returns Success response or error
 *
 * @example Response:
 * ```json
 * { "success": true }
 * ```
 */
export async function POST(
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

    logger.info('Marking onboarding complete', {
      workspaceId,
      userId: session.user.id,
    })

    await markOnboardingComplete(workspaceId)

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to complete onboarding', { error: errorMessage })
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
