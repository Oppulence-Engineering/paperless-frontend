/**
 * WorkOS Type Definitions
 *
 * Zod schemas and inferred types for WorkOS integration.
 * All types are derived from Zod schemas for runtime validation.
 *
 * @module lib/auth/workos/types
 */

import { z } from 'zod'

/**
 * SSO connection types supported by WorkOS
 */
export const SSOConnectionTypeSchema = z.enum(['saml', 'oidc'])
export type SSOConnectionType = z.infer<typeof SSOConnectionTypeSchema>

/**
 * User profile returned from WorkOS SSO
 */
export const SSOProfileSchema = z.object({
  /** WorkOS user ID */
  id: z.string(),
  /** User's email address */
  email: z.string().email(),
  /** User's first name */
  firstName: z.string().optional(),
  /** User's last name */
  lastName: z.string().optional(),
  /** Identity provider used for authentication */
  idpId: z.string(),
  /** Identity provider user ID */
  idpUserId: z.string().optional(),
  /** Organization ID this profile belongs to */
  organizationId: z.string().optional(),
  /** SSO connection ID */
  connectionId: z.string().optional(),
  /** Raw profile attributes from the identity provider */
  rawAttributes: z.record(z.unknown()).optional(),
})
export type SSOProfile = z.infer<typeof SSOProfileSchema>

/**
 * SSO authentication result from WorkOS
 */
export const SSOAuthResultSchema = z.object({
  /** WorkOS profile information */
  profile: SSOProfileSchema,
  /** The organization ID this connection belongs to */
  organizationId: z.string().optional(),
  /** The SSO connection ID */
  connectionId: z.string(),
  /** Raw profile data from the identity provider */
  rawAttributes: z.record(z.unknown()).optional(),
})
export type SSOAuthResult = z.infer<typeof SSOAuthResultSchema>

/**
 * SSO connection state
 */
export const SSOConnectionStateSchema = z.enum(['active', 'inactive', 'draft', 'validating'])
export type SSOConnectionState = z.infer<typeof SSOConnectionStateSchema>

/**
 * SSO connection configuration
 */
export const SSOConnectionSchema = z.object({
  /** Unique connection ID */
  id: z.string(),
  /** Organization ID this connection belongs to */
  organizationId: z.string(),
  /** Connection type (SAML or OIDC) */
  type: SSOConnectionTypeSchema,
  /** Connection name */
  name: z.string(),
  /** Connection state */
  state: SSOConnectionStateSchema,
  /** Domain(s) associated with this connection */
  domains: z.array(z.string()),
  /** Creation timestamp */
  createdAt: z.date(),
  /** Last update timestamp */
  updatedAt: z.date(),
})
export type SSOConnection = z.infer<typeof SSOConnectionSchema>

/**
 * Directory sync user state
 */
export const DirectorySyncUserStateSchema = z.enum(['active', 'inactive'])
export type DirectorySyncUserState = z.infer<typeof DirectorySyncUserStateSchema>

/**
 * Directory sync group from WorkOS
 */
export const DirectorySyncGroupSchema = z.object({
  /** WorkOS directory group ID */
  id: z.string(),
  /** Group name */
  name: z.string(),
  /** Directory ID this group belongs to */
  directoryId: z.string(),
  /** Organization ID this group belongs to */
  organizationId: z.string().optional(),
  /** Raw attributes from the directory */
  rawAttributes: z.record(z.unknown()).optional(),
  /** Creation timestamp */
  createdAt: z.date(),
  /** Last update timestamp */
  updatedAt: z.date(),
})
export type DirectorySyncGroup = z.infer<typeof DirectorySyncGroupSchema>

/**
 * Directory sync user from WorkOS
 */
export const DirectorySyncUserSchema = z.object({
  /** WorkOS directory user ID */
  id: z.string(),
  /** User's email address */
  email: z.string().email(),
  /** User's first name */
  firstName: z.string().optional(),
  /** User's last name */
  lastName: z.string().optional(),
  /** User's username */
  username: z.string().optional(),
  /** User's job title */
  jobTitle: z.string().optional(),
  /** User's department */
  department: z.string().optional(),
  /** User's state in the directory */
  state: DirectorySyncUserStateSchema,
  /** Directory ID this user belongs to */
  directoryId: z.string(),
  /** Organization ID this user belongs to */
  organizationId: z.string().optional(),
  /** Raw attributes from the directory */
  rawAttributes: z.record(z.unknown()).optional(),
  /** Group memberships */
  groups: z.array(DirectorySyncGroupSchema).optional(),
  /** Custom attributes */
  customAttributes: z.record(z.unknown()).optional(),
  /** Creation timestamp */
  createdAt: z.date(),
  /** Last update timestamp */
  updatedAt: z.date(),
})
export type DirectorySyncUser = z.infer<typeof DirectorySyncUserSchema>

/**
 * Directory sync webhook event types
 */
export const DirectorySyncEventTypeSchema = z.enum([
  'dsync.user.created',
  'dsync.user.updated',
  'dsync.user.deleted',
  'dsync.group.created',
  'dsync.group.updated',
  'dsync.group.deleted',
  'dsync.group.user_added',
  'dsync.group.user_removed',
])
export type DirectorySyncEventType = z.infer<typeof DirectorySyncEventTypeSchema>

/**
 * Group membership change event data
 */
export const DirectorySyncGroupMembershipEventSchema = z.object({
  /** The group */
  group: DirectorySyncGroupSchema,
  /** The user */
  user: DirectorySyncUserSchema,
})
export type DirectorySyncGroupMembershipEvent = z.infer<typeof DirectorySyncGroupMembershipEventSchema>

/**
 * Directory sync webhook event
 */
export const DirectorySyncEventSchema = z.object({
  /** Event ID */
  id: z.string(),
  /** Event type */
  event: DirectorySyncEventTypeSchema,
  /** Event data */
  data: z.union([DirectorySyncUserSchema, DirectorySyncGroupSchema, DirectorySyncGroupMembershipEventSchema]),
  /** Directory ID */
  directoryId: z.string(),
  /** Organization ID */
  organizationId: z.string().optional(),
  /** Event timestamp */
  createdAt: z.date(),
})
export type DirectorySyncEvent = z.infer<typeof DirectorySyncEventSchema>

/**
 * Audit log actor type
 */
export const AuditLogActorTypeSchema = z.enum(['user', 'system'])
export type AuditLogActorType = z.infer<typeof AuditLogActorTypeSchema>

/**
 * Audit log actor
 */
export const AuditLogActorSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: AuditLogActorTypeSchema,
})
export type AuditLogActor = z.infer<typeof AuditLogActorSchema>

/**
 * Audit log target
 */
export const AuditLogTargetSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string(),
})
export type AuditLogTarget = z.infer<typeof AuditLogTargetSchema>

/**
 * Audit log context
 */
export const AuditLogContextSchema = z.object({
  location: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
})
export type AuditLogContext = z.infer<typeof AuditLogContextSchema>

/**
 * Audit log event to send to WorkOS
 */
export const AuditLogEventSchema = z.object({
  /** Action identifier (e.g., 'user.login', 'document.create') */
  action: z.string(),
  /** Timestamp of the event */
  occurredAt: z.date(),
  /** Actor who performed the action */
  actor: AuditLogActorSchema,
  /** Target(s) of the action */
  targets: z.array(AuditLogTargetSchema).optional(),
  /** Additional context */
  context: AuditLogContextSchema.optional(),
  /** Event-specific metadata */
  metadata: z.record(z.unknown()).optional(),
})
export type AuditLogEvent = z.infer<typeof AuditLogEventSchema>

/**
 * Admin Portal intent types
 * These match WorkOS SDK GeneratePortalLinkIntent enum values
 */
export const AdminPortalIntentSchema = z.enum([
  'sso',
  'dsync',
  'audit_logs',
  'log_streams',
  'domain_verification',
  'certificate_renewal',
])
export type AdminPortalIntent = z.infer<typeof AdminPortalIntentSchema>

/**
 * Admin Portal session configuration
 */
export const AdminPortalSessionSchema = z.object({
  /** Portal link URL */
  link: z.string().url(),
  /** Intent of the portal session */
  intent: AdminPortalIntentSchema,
  /** Organization ID */
  organizationId: z.string(),
  /** Return URL after portal session */
  returnUrl: z.string().optional(),
  /** Success URL for successful operations */
  successUrl: z.string().optional(),
})
export type AdminPortalSession = z.infer<typeof AdminPortalSessionSchema>

/**
 * WorkOS organization
 */
export const WorkOSOrganizationSchema = z.object({
  /** WorkOS organization ID */
  id: z.string(),
  /** Organization name */
  name: z.string(),
  /** Allow profiles outside of organization */
  allowProfilesOutsideOrganization: z.boolean(),
  /** Domain data */
  domains: z.array(z.object({
    id: z.string(),
    domain: z.string(),
  })).optional(),
  /** Creation timestamp */
  createdAt: z.date(),
  /** Last update timestamp */
  updatedAt: z.date(),
})
export type WorkOSOrganization = z.infer<typeof WorkOSOrganizationSchema>

/**
 * User link result for connecting WorkOS identity to local user
 */
export const UserLinkResultSchema = z.object({
  /** Whether a new user was created */
  isNewUser: z.boolean(),
  /** The local user ID */
  userId: z.string(),
  /** The user's email */
  email: z.string().email(),
})
export type UserLinkResult = z.infer<typeof UserLinkResultSchema>

/**
 * Admin Portal request body schema
 */
export const AdminPortalRequestSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  intent: AdminPortalIntentSchema,
  returnUrl: z.string().url().optional(),
})
export type AdminPortalRequest = z.infer<typeof AdminPortalRequestSchema>

/**
 * SSO Authorization query parameters schema
 */
export const SSOAuthorizeParamsSchema = z.object({
  email: z.string().email().optional(),
  connection: z.string().optional(),
  organization: z.string().optional(),
  callbackUrl: z.string().optional(),
}).refine(
  (data) => data.email || data.connection || data.organization,
  { message: 'At least one of email, connection, or organization is required' }
)
export type SSOAuthorizeParams = z.infer<typeof SSOAuthorizeParamsSchema>

/**
 * WorkOS webhook payload schema
 */
export const WorkOSWebhookPayloadSchema = z.object({
  id: z.string(),
  event: z.string(),
  data: z.record(z.unknown()),
  created_at: z.string(),
})
export type WorkOSWebhookPayload = z.infer<typeof WorkOSWebhookPayloadSchema>

/**
 * Standard API error response schema
 */
export const APIErrorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.array(z.string())).optional(),
})
export type APIErrorResponse = z.infer<typeof APIErrorResponseSchema>

/**
 * Standard API success response for acknowledgment
 */
export const APIAckResponseSchema = z.object({
  received: z.boolean(),
})
export type APIAckResponse = z.infer<typeof APIAckResponseSchema>
