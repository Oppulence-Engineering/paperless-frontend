/**
 * @fileoverview API route to link a Gmail account to a workspace during onboarding.
 *
 * After betterAuth processes the OAuth callback and stores the account in the
 * `account` table, this endpoint creates the workspace-account association
 * in the `workspace_oauth_account` junction table.
 *
 * ## Flow
 * 1. Client initiates OAuth via `client.oauth2.link("google-email")`
 * 2. User authorizes on Google's consent screen
 * 3. betterAuth handles callback, stores tokens in `account` table
 * 4. Client calls this endpoint to link account to workspace
 * 5. This endpoint finds the user's latest google-email account and links it
 *
 * @endpoint POST /api/onboarding/[workspaceId]/link-gmail
 */

import { account, db, workspaceOAuthAccount } from '@sim/db'
import { createLogger } from '@sim/logger'
import { and, desc, eq } from 'drizzle-orm'
import { jwtDecode } from 'jwt-decode'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { verifyWorkspaceAccess } from '@/lib/onboarding/access'
import { markStepCompleted } from '@/lib/onboarding/utils'

// Import step registry to ensure steps are initialized
import '@/lib/onboarding/steps'

const logger = createLogger('LinkGmailAPI')

// =============================================================================
// Schemas
// =============================================================================

/**
 * Optional request body to specify which account to link.
 * If not provided, links the most recently created google-email account.
 */
const LinkGmailRequestSchema = z.object({
  /** Optional: specific account ID to link */
  accountId: z.string().optional(),
})

/**
 * Schema for the link-gmail response.
 */
const LinkGmailResponseSchema = z.object({
  success: z.boolean(),
  /** The workspace_oauth_account record ID */
  workspaceAccountId: z.string(),
  /** The OAuth account ID from betterAuth */
  accountId: z.string(),
  /** The email address of the connected account */
  email: z.string(),
})

type LinkGmailResponse = z.infer<typeof LinkGmailResponseSchema>

interface GoogleIdToken {
  email?: string
  name?: string
  sub?: string
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Extracts email from an OAuth account's ID token.
 */
function extractEmail(idToken: string | null): string | null {
  if (!idToken) return null
  try {
    const decoded = jwtDecode<GoogleIdToken>(idToken)
    return decoded.email || null
  } catch {
    return null
  }
}

// =============================================================================
// POST Handler
// =============================================================================

/**
 * POST /api/onboarding/[workspaceId]/link-gmail
 *
 * Links a Gmail OAuth account to the workspace.
 * Finds the user's most recent google-email account and creates the association.
 *
 * @body Optional: { accountId?: string } - specific account to link
 * @returns Link result with IDs and email
 *
 * @example Response:
 * ```json
 * {
 *   "success": true,
 *   "workspaceAccountId": "woa_123",
 *   "accountId": "acc_456",
 *   "email": "user@gmail.com"
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

    // Parse optional request body
    let requestedAccountId: string | undefined
    try {
      const body = await request.json()
      const parsed = LinkGmailRequestSchema.safeParse(body)
      if (parsed.success) {
        requestedAccountId = parsed.data.accountId
      }
    } catch {
      // Empty body is fine
    }

    // Find the user's google-email account(s)
    const query = requestedAccountId
      ? and(
          eq(account.userId, session.user.id),
          eq(account.providerId, 'google-email'),
          eq(account.id, requestedAccountId)
        )
      : and(eq(account.userId, session.user.id), eq(account.providerId, 'google-email'))

    const [oauthAccount] = await db
      .select({
        id: account.id,
        accountId: account.accountId,
        idToken: account.idToken,
        createdAt: account.createdAt,
      })
      .from(account)
      .where(query)
      .orderBy(desc(account.createdAt))
      .limit(1)

    if (!oauthAccount) {
      logger.warn('No google-email account found for user', {
        userId: session.user.id,
        requestedAccountId,
      })
      return NextResponse.json(
        { error: 'No Gmail account found. Please connect your Gmail account first.' },
        { status: 404 }
      )
    }

    // Check if already linked to this workspace
    const [existingLink] = await db
      .select({ id: workspaceOAuthAccount.id })
      .from(workspaceOAuthAccount)
      .where(
        and(
          eq(workspaceOAuthAccount.workspaceId, workspaceId),
          eq(workspaceOAuthAccount.accountId, oauthAccount.id)
        )
      )
      .limit(1)

    if (existingLink) {
      // Already linked - return success with existing data
      const email = extractEmail(oauthAccount.idToken) || oauthAccount.accountId

      logger.info('Gmail account already linked to workspace', {
        workspaceId,
        accountId: oauthAccount.id,
        email,
      })

      // Mark step as completed (idempotent)
      await markStepCompleted(workspaceId, 'gmail-connection')

      return NextResponse.json({
        success: true,
        workspaceAccountId: existingLink.id,
        accountId: oauthAccount.id,
        email,
      } satisfies LinkGmailResponse)
    }

    // Extract email for display name
    const email = extractEmail(oauthAccount.idToken) || oauthAccount.accountId

    // Check if this is the first account (make it primary)
    const [existingAccounts] = await db
      .select({ count: workspaceOAuthAccount.id })
      .from(workspaceOAuthAccount)
      .where(eq(workspaceOAuthAccount.workspaceId, workspaceId))
      .limit(1)

    const isFirstAccount = !existingAccounts

    // Create the workspace-account link
    const linkId = `woa_${crypto.randomUUID()}`
    await db.insert(workspaceOAuthAccount).values({
      id: linkId,
      workspaceId,
      accountId: oauthAccount.id,
      provider: 'google-email',
      displayName: email,
      isPrimary: isFirstAccount,
      createdAt: new Date(),
    })

    logger.info('Linked Gmail account to workspace', {
      workspaceId,
      linkId,
      accountId: oauthAccount.id,
      email,
      isPrimary: isFirstAccount,
    })

    // Mark the onboarding step as completed
    await markStepCompleted(workspaceId, 'gmail-connection')

    return NextResponse.json({
      success: true,
      workspaceAccountId: linkId,
      accountId: oauthAccount.id,
      email,
    } satisfies LinkGmailResponse)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to link Gmail account', { error: errorMessage })
    return NextResponse.json({ error: 'Failed to link Gmail account' }, { status: 500 })
  }
}

