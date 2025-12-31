/**
 * WorkOS Audit Logs Service
 *
 * Provides enterprise-grade audit logging capabilities through WorkOS.
 * Enables organizations to track and export security-relevant events.
 *
 * @module lib/auth/workos/audit-logs
 */

import { createLogger } from '@sim/logger'
import { requireWorkOSClient } from './client'
import { isWorkOSAuditLogsEnabled } from './feature-flags'
import type { AuditLogEvent } from './types'

const logger = createLogger('WorkOS:AuditLogs')

/**
 * Standard audit log action types used across the application.
 */
export const AuditLogActions = {
  // Authentication events
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_LOGIN_FAILED: 'user.login_failed',
  SSO_LOGIN: 'user.sso_login',
  PASSWORD_RESET: 'user.password_reset',
  PASSWORD_CHANGED: 'user.password_changed',
  MFA_ENABLED: 'user.mfa_enabled',
  MFA_DISABLED: 'user.mfa_disabled',

  // User management
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_INVITED: 'user.invited',
  USER_ROLE_CHANGED: 'user.role_changed',

  // Organization management
  ORG_CREATED: 'organization.created',
  ORG_UPDATED: 'organization.updated',
  ORG_DELETED: 'organization.deleted',
  ORG_MEMBER_ADDED: 'organization.member_added',
  ORG_MEMBER_REMOVED: 'organization.member_removed',

  // Workspace management
  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  WORKSPACE_DELETED: 'workspace.deleted',
  WORKSPACE_MEMBER_ADDED: 'workspace.member_added',
  WORKSPACE_MEMBER_REMOVED: 'workspace.member_removed',
  WORKSPACE_PERMISSION_CHANGED: 'workspace.permission_changed',

  // Workflow management
  WORKFLOW_CREATED: 'workflow.created',
  WORKFLOW_UPDATED: 'workflow.updated',
  WORKFLOW_DELETED: 'workflow.deleted',
  WORKFLOW_DEPLOYED: 'workflow.deployed',
  WORKFLOW_UNDEPLOYED: 'workflow.undeployed',
  WORKFLOW_EXECUTED: 'workflow.executed',

  // API key management
  API_KEY_CREATED: 'api_key.created',
  API_KEY_DELETED: 'api_key.deleted',
  API_KEY_USED: 'api_key.used',

  // Data access
  DOCUMENT_ACCESSED: 'document.accessed',
  DOCUMENT_DOWNLOADED: 'document.downloaded',
  DOCUMENT_DELETED: 'document.deleted',

  // Settings changes
  SETTINGS_UPDATED: 'settings.updated',
  SSO_CONFIGURED: 'sso.configured',
  DIRECTORY_SYNC_CONFIGURED: 'directory_sync.configured',

  // Billing events
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
} as const

export type AuditLogAction = (typeof AuditLogActions)[keyof typeof AuditLogActions]

/**
 * Creates and sends an audit log event to WorkOS.
 *
 * @param organizationId - The WorkOS organization ID
 * @param event - The audit log event details
 */
export async function createAuditLogEvent(
  organizationId: string,
  event: AuditLogEvent
): Promise<void> {
  if (!isWorkOSAuditLogsEnabled()) {
    // Log locally when WorkOS audit logs are disabled
    logger.info('Audit event (local)', {
      action: event.action,
      actor: event.actor,
      targets: event.targets,
      metadata: event.metadata,
    })
    return
  }

  const workos = requireWorkOSClient()

  try {
    await workos.auditLogs.createEvent(organizationId, {
      action: event.action,
      occurredAt: event.occurredAt,
      actor: {
        id: event.actor.id,
        name: event.actor.name,
        type: event.actor.type,
      },
      targets: event.targets?.map((target) => ({
        id: target.id,
        name: target.name,
        type: target.type,
      })) ?? [],
      context: event.context ? {
        location: event.context.location ?? '',
        userAgent: event.context.userAgent,
      } : { location: '' },
      metadata: event.metadata as Record<string, string | number | boolean> | undefined,
    })

    logger.info('Audit event created', {
      organizationId,
      action: event.action,
      actorId: event.actor.id,
    })
  } catch (error) {
    // Log the error but don't throw to prevent disrupting the main flow
    logger.error('Failed to create audit log event', {
      error,
      organizationId,
      action: event.action,
    })
  }
}

/**
 * Helper to create a user login audit event.
 */
export function logUserLogin(
  organizationId: string,
  userId: string,
  userName: string | undefined,
  context?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  return createAuditLogEvent(organizationId, {
    action: AuditLogActions.USER_LOGIN,
    occurredAt: new Date(),
    actor: {
      id: userId,
      name: userName,
      type: 'user',
    },
    context: context ? {
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    } : undefined,
  })
}

/**
 * Helper to create a user logout audit event.
 */
export function logUserLogout(
  organizationId: string,
  userId: string,
  userName: string | undefined
): Promise<void> {
  return createAuditLogEvent(organizationId, {
    action: AuditLogActions.USER_LOGOUT,
    occurredAt: new Date(),
    actor: {
      id: userId,
      name: userName,
      type: 'user',
    },
  })
}

/**
 * Helper to create a resource access audit event.
 */
export function logResourceAccess(
  organizationId: string,
  userId: string,
  userName: string | undefined,
  resourceType: string,
  resourceId: string,
  resourceName?: string,
  action: AuditLogAction = AuditLogActions.DOCUMENT_ACCESSED
): Promise<void> {
  return createAuditLogEvent(organizationId, {
    action,
    occurredAt: new Date(),
    actor: {
      id: userId,
      name: userName,
      type: 'user',
    },
    targets: [
      {
        id: resourceId,
        name: resourceName,
        type: resourceType,
      },
    ],
  })
}

/**
 * Helper to create a settings change audit event.
 */
export function logSettingsChange(
  organizationId: string,
  userId: string,
  userName: string | undefined,
  settingType: string,
  changes: Record<string, unknown>
): Promise<void> {
  return createAuditLogEvent(organizationId, {
    action: AuditLogActions.SETTINGS_UPDATED,
    occurredAt: new Date(),
    actor: {
      id: userId,
      name: userName,
      type: 'user',
    },
    targets: [
      {
        id: settingType,
        type: 'setting',
      },
    ],
    metadata: { changes },
  })
}

/**
 * Helper to create a system action audit event (for automated processes).
 */
export function logSystemAction(
  organizationId: string,
  action: AuditLogAction,
  targets?: Array<{ id: string; name?: string; type: string }>,
  metadata?: Record<string, unknown>
): Promise<void> {
  return createAuditLogEvent(organizationId, {
    action,
    occurredAt: new Date(),
    actor: {
      id: 'system',
      name: 'System',
      type: 'system',
    },
    targets,
    metadata,
  })
}

