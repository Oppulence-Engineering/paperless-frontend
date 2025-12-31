/**
 * WorkOS Enterprise Authentication Integration
 *
 * This module exports all WorkOS-related functionality for enterprise authentication:
 * - SSO (SAML/OIDC)
 * - Directory Sync (SCIM)
 * - Audit Logs
 * - Admin Portal
 *
 * @module lib/auth/workos
 */

// Client
export { getWorkOSClient, hasWorkOSClient, requireWorkOSClient } from './client'

// Feature flags
export {
  isWorkOSEnabled,
  isWorkOSSSOEnabled,
  isWorkOSDirectorySyncEnabled,
  isWorkOSAuditLogsEnabled,
  isWorkOSAdminPortalEnabled,
  getWorkOSClientId,
} from './feature-flags'

// SSO
export {
  getAuthorizationUrl,
  handleCallback,
  linkOrCreateUser,
  listConnections,
  getEmailDomain,
  hasSSOConnection,
} from './sso'

// Utilities
export {
  validateCallbackUrl,
  validateReturnUrl,
  validateStateToken,
} from './utils'

// Directory Sync
export {
  verifyWebhookSignature,
  handleDirectorySyncEvent,
} from './directory-sync'

// Audit Logs
export {
  createAuditLogEvent,
  logUserLogin,
  logUserLogout,
  logResourceAccess,
  logSettingsChange,
  logSystemAction,
  AuditLogActions,
  type AuditLogAction,
} from './audit-logs'

// Admin Portal
export {
  generatePortalLink,
  generateSSOPortalLink,
  generateDSyncPortalLink,
  generateAuditLogsPortalLink,
  generateDomainVerificationPortalLink,
} from './admin-portal'

// Zod Schemas (for runtime validation)
export {
  // SSO schemas
  SSOConnectionTypeSchema,
  SSOProfileSchema,
  SSOAuthResultSchema,
  SSOConnectionStateSchema,
  SSOConnectionSchema,
  // Directory sync schemas
  DirectorySyncUserStateSchema,
  DirectorySyncGroupSchema,
  DirectorySyncUserSchema,
  DirectorySyncEventTypeSchema,
  DirectorySyncGroupMembershipEventSchema,
  DirectorySyncEventSchema,
  // Audit log schemas
  AuditLogActorTypeSchema,
  AuditLogActorSchema,
  AuditLogTargetSchema,
  AuditLogContextSchema,
  AuditLogEventSchema,
  // Admin portal schemas
  AdminPortalIntentSchema,
  AdminPortalSessionSchema,
  // Organization schemas
  WorkOSOrganizationSchema,
  // User link schemas
  UserLinkResultSchema,
  // Request/response schemas
  AdminPortalRequestSchema,
  SSOAuthorizeParamsSchema,
  WorkOSWebhookPayloadSchema,
  APIErrorResponseSchema,
  APIAckResponseSchema,
} from './types'

// Types (inferred from Zod schemas)
export type {
  SSOConnectionType,
  SSOAuthResult,
  SSOProfile,
  SSOConnectionState,
  SSOConnection,
  DirectorySyncUserState,
  DirectorySyncUser,
  DirectorySyncGroup,
  DirectorySyncEventType,
  DirectorySyncGroupMembershipEvent,
  DirectorySyncEvent,
  AuditLogActorType,
  AuditLogActor,
  AuditLogTarget,
  AuditLogContext,
  AuditLogEvent,
  AdminPortalSession,
  AdminPortalIntent,
  WorkOSOrganization,
  UserLinkResult,
  AdminPortalRequest,
  SSOAuthorizeParams,
  WorkOSWebhookPayload,
  APIErrorResponse,
  APIAckResponse,
} from './types'
