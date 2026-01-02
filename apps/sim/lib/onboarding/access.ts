/**
 * @fileoverview Workspace access verification utilities for onboarding.
 *
 * Provides centralized access control for onboarding API routes.
 * All onboarding operations require the user to have permission
 * on the target workspace.
 */

import { db } from '@sim/db'
import { permissions } from '@sim/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

/**
 * Schema for workspace access check parameters.
 */
export const WorkspaceAccessParamsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
})

/** Workspace access parameters type */
export type WorkspaceAccessParams = z.infer<typeof WorkspaceAccessParamsSchema>

/**
 * Verifies that a user has access to a workspace.
 *
 * Checks the permissions table for any permission entry linking
 * the user to the workspace entity. Any permission level (admin, member)
 * grants access to onboarding operations.
 *
 * @param userId - The ID of the user to check
 * @param workspaceId - The ID of the workspace to check access for
 * @returns True if user has any permission on the workspace
 *
 * @example
 * ```typescript
 * const hasAccess = await verifyWorkspaceAccess('user-123', 'workspace-456');
 * if (!hasAccess) {
 *   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 * }
 * ```
 */
export async function verifyWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  // Validate inputs
  const parsed = WorkspaceAccessParamsSchema.safeParse({ userId, workspaceId })
  if (!parsed.success) {
    return false
  }

  const permission = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(
      and(
        eq(permissions.userId, userId),
        eq(permissions.entityType, 'workspace'),
        eq(permissions.entityId, workspaceId)
      )
    )
    .limit(1)

  return permission.length > 0
}

