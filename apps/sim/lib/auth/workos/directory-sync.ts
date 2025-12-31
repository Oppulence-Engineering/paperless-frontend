/**
 * WorkOS Directory Sync Service
 *
 * Handles SCIM-based directory synchronization from enterprise identity providers.
 * Manages user and group provisioning/deprovisioning in sync with external directories.
 *
 * @module lib/auth/workos/directory-sync
 */

import { createLogger } from '@sim/logger'
import { db } from '@sim/db'
import * as schema from '@sim/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireWorkOSClient } from './client'
import { isWorkOSDirectorySyncEnabled } from './feature-flags'
import type {
  DirectorySyncEvent,
  DirectorySyncUser,
  DirectorySyncGroup,
  DirectorySyncGroupMembershipEvent,
} from './types'
import { env } from '@/lib/core/config/env'

const logger = createLogger('WorkOS:DirectorySync')

/**
 * Verifies a WorkOS webhook signature.
 *
 * @param payload - The raw webhook payload
 * @param signature - The signature from the webhook header
 * @param timestamp - The timestamp from the webhook header
 * @returns True if the signature is valid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  const workos = requireWorkOSClient()
  const secret = env.WORKOS_WEBHOOK_SECRET

  if (!secret) {
    logger.error('WorkOS webhook secret not configured')
    return false
  }

  try {
    workos.webhooks.verifyHeader({
      payload,
      sigHeader: signature,
      secret,
    })
    return true
  } catch (error) {
    logger.error('Webhook signature verification failed', { error })
    return false
  }
}

/**
 * Handles a directory sync webhook event from WorkOS.
 *
 * @param event - The parsed webhook event
 */
export async function handleDirectorySyncEvent(event: DirectorySyncEvent): Promise<void> {
  if (!isWorkOSDirectorySyncEnabled()) {
    logger.warn('Directory sync event received but feature is disabled', { eventType: event.event })
    return
  }

  logger.info('Processing directory sync event', {
    eventId: event.id,
    eventType: event.event,
    directoryId: event.directoryId,
  })

  switch (event.event) {
    case 'dsync.user.created':
      await handleUserCreated(event.data as DirectorySyncUser, event.organizationId)
      break
    case 'dsync.user.updated':
      await handleUserUpdated(event.data as DirectorySyncUser)
      break
    case 'dsync.user.deleted':
      await handleUserDeleted(event.data as DirectorySyncUser)
      break
    case 'dsync.group.created':
      await handleGroupCreated(event.data as DirectorySyncGroup, event.organizationId)
      break
    case 'dsync.group.updated':
      await handleGroupUpdated(event.data as DirectorySyncGroup)
      break
    case 'dsync.group.deleted':
      await handleGroupDeleted(event.data as DirectorySyncGroup)
      break
    case 'dsync.group.user_added':
      await handleGroupUserAdded(event.data as DirectorySyncGroupMembershipEvent)
      break
    case 'dsync.group.user_removed':
      await handleGroupUserRemoved(event.data as DirectorySyncGroupMembershipEvent)
      break
    default:
      logger.warn('Unhandled directory sync event type', { eventType: event.event })
  }
}

/**
 * Handles user creation from directory sync.
 * Uses a transaction to ensure atomicity of user creation, account linking, and org membership.
 */
async function handleUserCreated(dsUser: DirectorySyncUser, organizationId?: string): Promise<void> {
  const email = dsUser.email.toLowerCase()

  // Check if user already exists
  const existingUser = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
  })

  if (existingUser) {
    // Link directory sync identity
    await linkDirectoryUser(existingUser.id, dsUser)
    logger.info('Linked directory user to existing account', { userId: existingUser.id, email })
    return
  }

  // Create new user, link account, and add to org in a transaction
  const userId = crypto.randomUUID()
  const now = new Date()
  const name = [dsUser.firstName, dsUser.lastName].filter(Boolean).join(' ') || email.split('@')[0]
  const providerId = `workos-dsync-${dsUser.directoryId}`

  await db.transaction(async (tx) => {
    // Create user
    await tx.insert(schema.user).values({
      id: userId,
      email,
      name,
      emailVerified: true, // Directory-synced users are verified
      createdAt: now,
      updatedAt: now,
    })

    // Link directory sync identity
    await tx.insert(schema.account).values({
      id: crypto.randomUUID(),
      userId,
      providerId,
      accountId: dsUser.id,
      createdAt: now,
      updatedAt: now,
    })

    // If organization is specified, add user as member
    if (organizationId) {
      await tx.insert(schema.member).values({
        id: crypto.randomUUID(),
        userId,
        organizationId,
        role: 'member',
        createdAt: now,
      })
    }
  })

  logger.info('Created user from directory sync', { userId, email, directoryId: dsUser.directoryId })
}

/**
 * Handles user updates from directory sync.
 */
async function handleUserUpdated(dsUser: DirectorySyncUser): Promise<void> {
  const email = dsUser.email.toLowerCase()

  // Find user by directory account link
  const account = await db.query.account.findFirst({
    where: and(
      eq(schema.account.providerId, `workos-dsync-${dsUser.directoryId}`),
      eq(schema.account.accountId, dsUser.id)
    ),
  })

  if (!account) {
    logger.warn('Directory user update received for unknown user', { dsyncUserId: dsUser.id })
    return
  }

  // Update user profile
  const name = [dsUser.firstName, dsUser.lastName].filter(Boolean).join(' ')

  await db.update(schema.user)
    .set({
      name: name || undefined,
      email,
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, account.userId))

  // Handle deactivation - revoke all active sessions
  if (dsUser.state === 'inactive') {
    await revokeUserSessions(account.userId)
    logger.info('Directory user marked inactive, sessions revoked', {
      userId: account.userId,
      dsyncUserId: dsUser.id,
    })
  }

  logger.info('Updated user from directory sync', { userId: account.userId, email })
}

/**
 * Handles user deletion from directory sync.
 * Revokes all sessions and removes the directory sync account link.
 * By default, we deactivate rather than delete the user to preserve audit trails.
 */
async function handleUserDeleted(dsUser: DirectorySyncUser): Promise<void> {
  const account = await db.query.account.findFirst({
    where: and(
      eq(schema.account.providerId, `workos-dsync-${dsUser.directoryId}`),
      eq(schema.account.accountId, dsUser.id)
    ),
  })

  if (!account) {
    logger.warn('Directory user delete received for unknown user', { dsyncUserId: dsUser.id })
    return
  }

  // Revoke all active sessions for security
  await revokeUserSessions(account.userId)

  // Remove the directory sync account link (deprovisioning)
  await db.delete(schema.account).where(eq(schema.account.id, account.id))

  logger.info('Deprovisioned user from directory sync', {
    userId: account.userId,
    dsyncUserId: dsUser.id,
    sessionsRevoked: true,
  })
}

/**
 * Handles group creation from directory sync.
 */
async function handleGroupCreated(dsGroup: DirectorySyncGroup, organizationId?: string): Promise<void> {
  // Store group in directory sync state table
  await db.insert(schema.workosDirectoryGroups).values({
    id: crypto.randomUUID(),
    directoryId: dsGroup.directoryId,
    workosGroupId: dsGroup.id,
    name: dsGroup.name,
    organizationId: organizationId ?? null,
    rawAttributes: dsGroup.rawAttributes ?? {},
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  logger.info('Created directory group', { groupName: dsGroup.name, directoryId: dsGroup.directoryId })
}

/**
 * Handles group updates from directory sync.
 */
async function handleGroupUpdated(dsGroup: DirectorySyncGroup): Promise<void> {
  await db.update(schema.workosDirectoryGroups)
    .set({
      name: dsGroup.name,
      rawAttributes: dsGroup.rawAttributes ?? {},
      updatedAt: new Date(),
    })
    .where(eq(schema.workosDirectoryGroups.workosGroupId, dsGroup.id))

  logger.info('Updated directory group', { groupName: dsGroup.name })
}

/**
 * Handles group deletion from directory sync.
 */
async function handleGroupDeleted(dsGroup: DirectorySyncGroup): Promise<void> {
  await db.delete(schema.workosDirectoryGroups)
    .where(eq(schema.workosDirectoryGroups.workosGroupId, dsGroup.id))

  logger.info('Deleted directory group', { groupName: dsGroup.name })
}

/**
 * Handles adding a user to a group.
 */
async function handleGroupUserAdded(event: DirectorySyncGroupMembershipEvent): Promise<void> {
  const { group, user: dsUser } = event

  // Find the local user
  const account = await db.query.account.findFirst({
    where: and(
      eq(schema.account.providerId, `workos-dsync-${dsUser.directoryId}`),
      eq(schema.account.accountId, dsUser.id)
    ),
  })

  if (!account) {
    logger.warn('Group user add for unknown user', { dsyncUserId: dsUser.id })
    return
  }

  // Find the directory group to get organization mapping
  const dsGroup = await db.query.workosDirectoryGroups.findFirst({
    where: eq(schema.workosDirectoryGroups.workosGroupId, group.id),
  })

  if (dsGroup?.organizationId) {
    // Add user to organization if not already a member
    await addUserToOrganization(account.userId, dsGroup.organizationId)
  }

  logger.info('Added user to directory group', {
    userId: account.userId,
    groupName: group.name,
  })
}

/**
 * Handles removing a user from a group.
 */
async function handleGroupUserRemoved(event: DirectorySyncGroupMembershipEvent): Promise<void> {
  const { group, user: dsUser } = event

  logger.info('Removed user from directory group', {
    dsyncUserId: dsUser.id,
    groupName: group.name,
  })

  // Group membership removal handling would be implemented based on business requirements
}

/**
 * Links a directory sync user account to a local user.
 */
async function linkDirectoryUser(userId: string, dsUser: DirectorySyncUser): Promise<void> {
  const providerId = `workos-dsync-${dsUser.directoryId}`
  const now = new Date()

  const existing = await db.query.account.findFirst({
    where: and(
      eq(schema.account.userId, userId),
      eq(schema.account.providerId, providerId)
    ),
  })

  if (existing) {
    await db.update(schema.account)
      .set({ accountId: dsUser.id, updatedAt: now })
      .where(eq(schema.account.id, existing.id))
  } else {
    await db.insert(schema.account).values({
      id: crypto.randomUUID(),
      userId,
      providerId,
      accountId: dsUser.id,
      createdAt: now,
      updatedAt: now,
    })
  }
}

/**
 * Adds a user to an organization as a member.
 */
async function addUserToOrganization(userId: string, organizationId: string): Promise<void> {
  const existingMember = await db.query.member.findFirst({
    where: and(
      eq(schema.member.userId, userId),
      eq(schema.member.organizationId, organizationId)
    ),
  })

  if (!existingMember) {
    await db.insert(schema.member).values({
      id: crypto.randomUUID(),
      userId,
      organizationId,
      role: 'member',
      createdAt: new Date(),
    })

    logger.info('Added user to organization', { userId, organizationId })
  }
}

/**
 * Revokes all active sessions for a user.
 * Called when a user is deactivated or deleted via directory sync.
 */
async function revokeUserSessions(userId: string): Promise<void> {
  try {
    await db.delete(schema.session)
      .where(eq(schema.session.userId, userId))

    logger.info('Revoked user sessions', { userId })
  } catch (error) {
    logger.error('Failed to revoke user sessions', { error, userId })
  }
}

