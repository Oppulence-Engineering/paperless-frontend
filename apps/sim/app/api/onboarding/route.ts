/**
 * @fileoverview Root onboarding API route.
 *
 * Provides a convenience endpoint for checking onboarding status
 * without knowing the workspace ID. Returns the state for the
 * user's first workspace.
 *
 * For workspace-specific operations, use the
 * `/api/onboarding/[workspaceId]` endpoints instead.
 */

import { createLogger } from '@sim/logger'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getOnboardingState } from '@/lib/onboarding/utils'

const logger = createLogger('OnboardingAPI')

/**
 * GET /api/onboarding
 *
 * Returns the onboarding state for the user's first workspace.
 * This is useful for checking if a user needs to complete onboarding
 * when the workspace ID is not yet known.
 *
 * @returns Onboarding state with workspace info, or error response
 *
 * @example Response (has workspaces):
 * ```json
 * {
 *   "hasWorkspaces": true,
 *   "workspaceId": "workspace-123",
 *   "isComplete": false,
 *   "currentStepId": "lead-scraper-provisioning",
 *   "stepStatuses": { ... },
 *   "totalSteps": 1,
 *   "completedCount": 0
 * }
 * ```
 *
 * @example Response (no workspaces):
 * ```json
 * {
 *   "hasWorkspaces": false,
 *   "isComplete": false
 * }
 * ```
 */
export async function GET() {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's workspaces
    // Note: We use internal fetch to reuse the workspaces API logic
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/workspaces`, {
      headers: {
        // Forward authentication cookie
        Cookie: `session=${session.session?.id || ''}`,
      },
    })

    if (!response.ok) {
      logger.error('Failed to fetch workspaces', { status: response.status })
      return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 })
    }

    const { workspaces } = await response.json()

    // Handle case where user has no workspaces
    if (!workspaces || workspaces.length === 0) {
      return NextResponse.json({
        hasWorkspaces: false,
        isComplete: false,
      })
    }

    // Get onboarding state for the first workspace
    const firstWorkspace = workspaces[0]
    const state = await getOnboardingState(firstWorkspace.id)

    return NextResponse.json({
      hasWorkspaces: true,
      workspaceId: firstWorkspace.id,
      ...state,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to get onboarding state', { error: errorMessage })
    return NextResponse.json({ error: 'Failed to get onboarding state' }, { status: 500 })
  }
}
