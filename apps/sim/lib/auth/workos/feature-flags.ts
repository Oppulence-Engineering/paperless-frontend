/**
 * WorkOS Feature Flags
 *
 * Simple feature detection based on WorkOS configuration.
 * All features are automatically enabled when WorkOS is configured.
 *
 * @module lib/auth/workos/feature-flags
 */

import { env, getEnv } from '@/lib/core/config/env'

/**
 * Checks if WorkOS is enabled by verifying the API key is configured.
 * All WorkOS features are automatically enabled when the API key is present.
 */
export function isWorkOSEnabled(): boolean {
  return !!env.WORKOS_API_KEY && !!env.WORKOS_CLIENT_ID
}

/**
 * Checks if WorkOS SSO (SAML/OIDC) is enabled.
 * Automatically enabled when WorkOS is configured.
 */
export function isWorkOSSSOEnabled(): boolean {
  return isWorkOSEnabled()
}

/**
 * Checks if WorkOS Directory Sync (SCIM) is enabled.
 * Automatically enabled when WorkOS is configured.
 */
export function isWorkOSDirectorySyncEnabled(): boolean {
  return isWorkOSEnabled()
}

/**
 * Checks if WorkOS Audit Logs are enabled.
 * Automatically enabled when WorkOS is configured.
 */
export function isWorkOSAuditLogsEnabled(): boolean {
  return isWorkOSEnabled()
}

/**
 * Checks if WorkOS Admin Portal is enabled.
 * Automatically enabled when WorkOS is configured.
 */
export function isWorkOSAdminPortalEnabled(): boolean {
  return isWorkOSEnabled()
}

/**
 * Gets the WorkOS client ID for client-side operations.
 */
export function getWorkOSClientId(): string | undefined {
  return env.WORKOS_CLIENT_ID
}
