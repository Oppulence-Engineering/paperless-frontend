/**
 * @fileoverview API routes for managing a single workspace email account.
 *
 * Provides endpoints for:
 * - DELETE: Unlink an email account from the workspace
 * - PATCH: Update account settings (e.g., set as primary)
 */

import { db, workspaceOAuthAccount } from '@sim/db'
import { createLogger } from '@sim/logger'
import { and, eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { verifyWorkspaceAccess } from '@/lib/onboarding/access'

const logger = createLogger('WorkspaceEmailAccountAPI')

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for updating an email account link.
 */
const UpdateEmailAccountRequestSchema = z.object({
  /** Set this account as the primary for the workspace */
  isPrimary: z.boolean().optional(),
})

// =============================================================================
// DELETE /api/workspaces/[workspaceId]/email-accounts/[accountId]
// =============================================================================

/**
 * DELETE /api/workspaces/[workspaceId]/email-accounts/[accountId]
 *
 * Unlinks an email account from the workspace.
 * This does NOT delete the OAuth account itself, only the workspace association.
 *
 * @returns Success response or error
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; accountId: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId, accountId } = await params

    // Verify user has access to this workspace
    const hasAccess = await verifyWorkspaceAccess(session.user.id, workspaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find the link (accountId here is the workspaceOAuthAccount.id)
    const [existingLink] = await db
      .select({
        id: workspaceOAuthAccount.id,
        isPrimary: workspaceOAuthAccount.isPrimary,
      })
      .from(workspaceOAuthAccount)
      .where(
        and(
          eq(workspaceOAuthAccount.id, accountId),
          eq(workspaceOAuthAccount.workspaceId, workspaceId)
        )
      )
      .limit(1)

    if (!existingLink) {
      return NextResponse.json({ error: 'Email account link not found' }, { status: 404 })
    }

    // Delete the link
    await db.delete(workspaceOAuthAccount).where(eq(workspaceOAuthAccount.id, accountId))

    // If this was the primary, promote another account
    if (existingLink.isPrimary) {
      const [nextAccount] = await db
        .select({ id: workspaceOAuthAccount.id })
        .from(workspaceOAuthAccount)
        .where(eq(workspaceOAuthAccount.workspaceId, workspaceId))
        .limit(1)

      if (nextAccount) {
        await db
          .update(workspaceOAuthAccount)
          .set({ isPrimary: true })
          .where(eq(workspaceOAuthAccount.id, nextAccount.id))
      }
    }

    logger.info('Unlinked email account from workspace', {
      workspaceId,
      linkId: accountId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to unlink email account', { error: errorMessage })
    return NextResponse.json({ error: 'Failed to unlink email account' }, { status: 500 })
  }
}

// =============================================================================
// PATCH /api/workspaces/[workspaceId]/email-accounts/[accountId]
// =============================================================================

/**
 * PATCH /api/workspaces/[workspaceId]/email-accounts/[accountId]
 *
 * Updates an email account link's settings.
 * Currently supports setting an account as primary.
 *
 * @body UpdateEmailAccountRequest - Fields to update
 * @returns Updated account link
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; accountId: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId, accountId } = await params

    // Verify user has access to this workspace
    const hasAccess = await verifyWorkspaceAccess(session.user.id, workspaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = UpdateEmailAccountRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { isPrimary } = parsed.data

    // Find the link
    const [existingLink] = await db
      .select({ id: workspaceOAuthAccount.id })
      .from(workspaceOAuthAccount)
      .where(
        and(
          eq(workspaceOAuthAccount.id, accountId),
          eq(workspaceOAuthAccount.workspaceId, workspaceId)
        )
      )
      .limit(1)

    if (!existingLink) {
      return NextResponse.json({ error: 'Email account link not found' }, { status: 404 })
    }

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

    // Update the link
    const [updated] = await db
      .update(workspaceOAuthAccount)
      .set({
        ...(isPrimary !== undefined && { isPrimary }),
      })
      .where(eq(workspaceOAuthAccount.id, accountId))
      .returning()

    logger.info('Updated email account link', {
      workspaceId,
      linkId: accountId,
      isPrimary: updated.isPrimary,
    })

    return NextResponse.json({
      id: updated.id,
      accountId: updated.accountId,
      provider: updated.provider,
      displayName: updated.displayName,
      isPrimary: updated.isPrimary,
      createdAt: updated.createdAt.toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to update email account link', { error: errorMessage })
    return NextResponse.json({ error: 'Failed to update email account' }, { status: 500 })
  }
}

