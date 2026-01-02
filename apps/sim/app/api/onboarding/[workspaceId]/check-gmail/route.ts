/**
 * @fileoverview API route to check Gmail connection status for onboarding.
 *
 * Queries the workspace_oauth_account table to determine if a Gmail account
 * has already been connected to the workspace. This allows the onboarding
 * step to skip or show the current connection status.
 *
 * @endpoint GET /api/onboarding/[workspaceId]/check-gmail
 */

import { db, workspaceOAuthAccount } from '@sim/db'
import { createLogger } from '@sim/logger'
import { eq, and } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { verifyWorkspaceAccess } from '@/lib/onboarding/access'

// Import step registry to ensure steps are initialized
import '@/lib/onboarding/steps'

const logger = createLogger('CheckGmailAPI')

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Schema for connected account in the response.
 */
const ConnectedAccountSchema = z.object({
  id: z.string(),
  displayName: z.string().nullable(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
})

/**
 * Schema for the check-gmail response.
 */
const CheckGmailResponseSchema = z.object({
  /** Whether at least one Gmail account is connected */
  connected: z.boolean(),
  /** Array of connected Gmail accounts */
  accounts: z.array(ConnectedAccountSchema),
})

type CheckGmailResponse = z.infer<typeof CheckGmailResponseSchema>

// =============================================================================
// GET Handler
// =============================================================================

/**
 * GET /api/onboarding/[workspaceId]/check-gmail
 *
 * Checks if a Gmail account is already connected to the workspace.
 *
 * @returns Connection status and list of connected accounts
 *
 * @example Response when connected:
 * ```json
 * {
 *   "connected": true,
 *   "accounts": [
 *     {
 *       "id": "woa_123",
 *       "displayName": "user@gmail.com",
 *       "isPrimary": true,
 *       "createdAt": "2024-01-01T00:00:00.000Z"
 *     }
 *   ]
 * }
 * ```
 *
 * @example Response when not connected:
 * ```json
 * {
 *   "connected": false,
 *   "accounts": []
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

    // Query workspace email accounts with google-email provider
    const gmailAccounts = await db
      .select({
        id: workspaceOAuthAccount.id,
        displayName: workspaceOAuthAccount.displayName,
        isPrimary: workspaceOAuthAccount.isPrimary,
        createdAt: workspaceOAuthAccount.createdAt,
      })
      .from(workspaceOAuthAccount)
      .where(
        and(
          eq(workspaceOAuthAccount.workspaceId, workspaceId),
          eq(workspaceOAuthAccount.provider, 'google-email')
        )
      )

    const response: CheckGmailResponse = {
      connected: gmailAccounts.length > 0,
      accounts: gmailAccounts.map((acc) => ({
        id: acc.id,
        displayName: acc.displayName,
        isPrimary: acc.isPrimary,
        createdAt: acc.createdAt.toISOString(),
      })),
    }

    logger.info('Checked Gmail connection status', {
      workspaceId,
      connected: response.connected,
      accountCount: response.accounts.length,
    })

    return NextResponse.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to check Gmail status', { error: errorMessage })
    return NextResponse.json({ error: 'Failed to check Gmail status' }, { status: 500 })
  }
}

