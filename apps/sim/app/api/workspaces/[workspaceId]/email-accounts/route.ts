/**
 * @fileoverview API routes for managing workspace email accounts.
 *
 * Provides endpoints for:
 * - GET: List all email accounts linked to a workspace
 * - POST: Link a new OAuth account to the workspace
 *
 * These endpoints manage the `workspace_oauth_account` junction table
 * that associates OAuth accounts (from betterAuth's account table)
 * with specific workspaces for email outreach functionality.
 */

import { account, db, workspaceOAuthAccount } from '@sim/db'
import { createLogger } from '@sim/logger'
import { and, desc, eq } from 'drizzle-orm'
import { jwtDecode } from 'jwt-decode'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { verifyWorkspaceAccess } from '@/lib/onboarding/access'

const logger = createLogger('WorkspaceEmailAccountsAPI')

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for linking an email account to a workspace.
 */
const LinkEmailAccountRequestSchema = z.object({
  /** The OAuth account ID to link */
  accountId: z.string().min(1, 'Account ID is required'),
  /** Whether to set this as the primary account */
  isPrimary: z.boolean().optional().default(false),
})

/**
 * Schema for email account response.
 */
const EmailAccountResponseSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  provider: z.string(),
  displayName: z.string().nullable(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
})

type EmailAccountResponse = z.infer<typeof EmailAccountResponseSchema>

interface GoogleIdToken {
  email?: string
  name?: string
  sub?: string
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Extracts a user-friendly display name from an OAuth account.
 * Tries ID token first, then falls back to account ID.
 */
function extractDisplayName(acc: {
  idToken: string | null
  accountId: string
  providerId: string
}): string {
  if (acc.idToken) {
    try {
      const decoded = jwtDecode<GoogleIdToken>(acc.idToken)
      if (decoded.email) return decoded.email
      if (decoded.name) return decoded.name
    } catch {
      // Ignore decode errors
    }
  }
  return acc.accountId
}

// =============================================================================
// GET /api/workspaces/[workspaceId]/email-accounts
// =============================================================================

/**
 * GET /api/workspaces/[workspaceId]/email-accounts
 *
 * Lists all email accounts linked to the workspace.
 *
 * @returns Array of linked email accounts with metadata
 *
 * @example Response:
 * ```json
 * {
 *   "accounts": [
 *     {
 *       "id": "woa_123",
 *       "accountId": "acc_456",
 *       "provider": "google-email",
 *       "displayName": "user@gmail.com",
 *       "isPrimary": true,
 *       "createdAt": "2024-01-01T00:00:00.000Z"
 *     }
 *   ]
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

    // Fetch linked accounts with their OAuth details
    const linkedAccounts = await db
      .select({
        id: workspaceOAuthAccount.id,
        accountId: workspaceOAuthAccount.accountId,
        provider: workspaceOAuthAccount.provider,
        displayName: workspaceOAuthAccount.displayName,
        isPrimary: workspaceOAuthAccount.isPrimary,
        createdAt: workspaceOAuthAccount.createdAt,
        // Join with account table for additional info
        idToken: account.idToken,
        oauthAccountId: account.accountId,
        providerId: account.providerId,
      })
      .from(workspaceOAuthAccount)
      .innerJoin(account, eq(workspaceOAuthAccount.accountId, account.id))
      .where(eq(workspaceOAuthAccount.workspaceId, workspaceId))
      .orderBy(desc(workspaceOAuthAccount.isPrimary), desc(workspaceOAuthAccount.createdAt))

    // Transform to response format
    const accounts: EmailAccountResponse[] = linkedAccounts.map((acc) => ({
      id: acc.id,
      accountId: acc.accountId,
      provider: acc.provider,
      displayName:
        acc.displayName ||
        extractDisplayName({
          idToken: acc.idToken,
          accountId: acc.oauthAccountId,
          providerId: acc.providerId,
        }),
      isPrimary: acc.isPrimary,
      createdAt: acc.createdAt.toISOString(),
    }))

    return NextResponse.json({ accounts })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to fetch workspace email accounts', { error: errorMessage })
    return NextResponse.json({ error: 'Failed to fetch email accounts' }, { status: 500 })
  }
}

// =============================================================================
// POST /api/workspaces/[workspaceId]/email-accounts
// =============================================================================

/**
 * POST /api/workspaces/[workspaceId]/email-accounts
 *
 * Links an OAuth account to the workspace.
 * The account must exist in the account table and belong to the current user.
 *
 * @body LinkEmailAccountRequest - Account ID and optional primary flag
 * @returns The newly created workspace-account link
 *
 * @example Request:
 * ```json
 * {
 *   "accountId": "acc_456",
 *   "isPrimary": true
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
    const parsed = LinkEmailAccountRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { accountId, isPrimary } = parsed.data

    // Verify the account exists and belongs to the current user
    const [oauthAccount] = await db
      .select({
        id: account.id,
        userId: account.userId,
        providerId: account.providerId,
        idToken: account.idToken,
        accountId: account.accountId,
      })
      .from(account)
      .where(and(eq(account.id, accountId), eq(account.userId, session.user.id)))
      .limit(1)

    if (!oauthAccount) {
      return NextResponse.json(
        { error: 'Account not found or does not belong to you' },
        { status: 404 }
      )
    }

    // Check if already linked
    const [existing] = await db
      .select({ id: workspaceOAuthAccount.id })
      .from(workspaceOAuthAccount)
      .where(
        and(
          eq(workspaceOAuthAccount.workspaceId, workspaceId),
          eq(workspaceOAuthAccount.accountId, accountId)
        )
      )
      .limit(1)

    if (existing) {
      return NextResponse.json({ error: 'Account already linked to this workspace' }, { status: 409 })
    }

    // Extract display name
    const displayName = extractDisplayName({
      idToken: oauthAccount.idToken,
      accountId: oauthAccount.accountId,
      providerId: oauthAccount.providerId,
    })

    // If setting as primary, unset any existing primary
    if (isPrimary) {
      await db
        .update(workspaceOAuthAccount)
        .set({ isPrimary: false })
        .where(
          and(
            eq(workspaceOAuthAccount.workspaceId, workspaceId),
            eq(workspaceOAuthAccount.isPrimary, true)
          )
        )
    }

    // Check if this is the first account (auto-set as primary)
    const [existingCount] = await db
      .select({ count: workspaceOAuthAccount.id })
      .from(workspaceOAuthAccount)
      .where(eq(workspaceOAuthAccount.workspaceId, workspaceId))
      .limit(1)

    const isFirstAccount = !existingCount

    // Create the link
    const id = `woa_${crypto.randomUUID()}`
    const [newLink] = await db
      .insert(workspaceOAuthAccount)
      .values({
        id,
        workspaceId,
        accountId,
        provider: oauthAccount.providerId,
        displayName,
        isPrimary: isPrimary || isFirstAccount,
        createdAt: new Date(),
      })
      .returning()

    logger.info('Linked email account to workspace', {
      workspaceId,
      accountId,
      provider: oauthAccount.providerId,
      isPrimary: newLink.isPrimary,
    })

    const response: EmailAccountResponse = {
      id: newLink.id,
      accountId: newLink.accountId,
      provider: newLink.provider,
      displayName: newLink.displayName,
      isPrimary: newLink.isPrimary,
      createdAt: newLink.createdAt.toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to link email account', { error: errorMessage })
    return NextResponse.json({ error: 'Failed to link email account' }, { status: 500 })
  }
}

