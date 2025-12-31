/**
 * WorkOS SSO Service
 *
 * Handles SSO authentication flows using WorkOS for SAML and OIDC providers.
 * Integrates with the existing Better Auth user management system.
 *
 * @module lib/auth/workos/sso
 */

import { createLogger } from '@sim/logger'
import { db } from '@sim/db'
import * as schema from '@sim/db/schema'
import { eq, and } from 'drizzle-orm'
import { getWorkOSClient, requireWorkOSClient } from './client'
import { isWorkOSSSOEnabled } from './feature-flags'
import type { SSOAuthResult, SSOConnection, SSOProfile, UserLinkResult } from './types'
import { env } from '@/lib/core/config/env'
import { getBaseUrl } from '@/lib/core/utils/urls'

const logger = createLogger('WorkOS:SSO')

/**
 * SAML connection types supported by WorkOS.
 * All connection types ending in 'SAML' are SAML-based.
 */
const SAML_CONNECTION_TYPES = [
  'ADFSSAML',
  'AzureSAML',
  'GenericSAML',
  'GoogleSAML',
  'JumpCloudSAML',
  'OktaSAML',
  'OneLoginSAML',
  'PingFederateSAML',
  'PingOneSAML',
  'SalesforceSAML',
  'VMwareSAML',
] as const

/**
 * Checks if a connection type is SAML-based.
 *
 * @param connectionType - The WorkOS connection type
 * @returns True if the connection type is SAML-based
 */
function isSAMLConnectionType(connectionType: string): boolean {
  return SAML_CONNECTION_TYPES.includes(connectionType as typeof SAML_CONNECTION_TYPES[number]) ||
    connectionType.endsWith('SAML')
}

/**
 * Generates the SSO authorization URL for a given connection or domain.
 *
 * @param options - SSO authorization options
 * @returns The authorization URL to redirect the user to
 */
export async function getAuthorizationUrl(options: {
  /** SSO connection ID (takes precedence over domain) */
  connectionId?: string
  /** Email domain to find the connection for */
  domain?: string
  /** WorkOS organization ID */
  organizationId?: string
  /** URL to redirect back to after authentication */
  redirectUri?: string
  /** Optional state parameter for CSRF protection */
  state?: string
}): Promise<string> {
  if (!isWorkOSSSOEnabled()) {
    throw new Error('WorkOS SSO is not enabled')
  }

  const workos = requireWorkOSClient()
  const redirectUri = options.redirectUri ?? `${getBaseUrl()}/api/auth/workos/callback`

  const authorizationUrl = workos.sso.getAuthorizationUrl({
    clientId: env.WORKOS_CLIENT_ID!,
    redirectUri,
    connection: options.connectionId,
    domain: options.domain,
    organization: options.organizationId,
    state: options.state,
  })

  logger.info('Generated SSO authorization URL', {
    connectionId: options.connectionId,
    domain: options.domain,
    organizationId: options.organizationId,
  })

  return authorizationUrl
}

/**
 * Handles the SSO callback and exchanges the authorization code for user profile.
 *
 * @param code - The authorization code from the SSO callback
 * @returns The SSO authentication result with user profile
 */
export async function handleCallback(code: string): Promise<SSOAuthResult> {
  if (!isWorkOSSSOEnabled()) {
    throw new Error('WorkOS SSO is not enabled')
  }

  const workos = requireWorkOSClient()

  try {
    const { profile } = await workos.sso.getProfileAndToken({
      code,
      clientId: env.WORKOS_CLIENT_ID!,
    })

    logger.info('SSO callback successful', {
      email: profile.email,
      connectionId: profile.connectionId,
      organizationId: profile.organizationId,
    })

    return {
      profile: {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName ?? undefined,
        lastName: profile.lastName ?? undefined,
        idpId: profile.idpId,
        idpUserId: profile.idpId,
        organizationId: profile.organizationId ?? undefined,
        connectionId: profile.connectionId,
        rawAttributes: profile.rawAttributes as Record<string, unknown> | undefined,
      },
      organizationId: profile.organizationId ?? undefined,
      connectionId: profile.connectionId,
      rawAttributes: profile.rawAttributes as Record<string, unknown> | undefined,
    }
  } catch (error) {
    logger.error('SSO callback failed', { error })
    throw new Error('SSO authentication failed. Please try again.')
  }
}

/**
 * Links or creates a user based on the SSO profile.
 * If a user with the email exists, links the WorkOS identity.
 * If no user exists, creates a new one and links the identity.
 * Uses a transaction to ensure atomicity for both existing and new user paths.
 *
 * @param profile - The SSO profile from WorkOS
 * @returns The user link result
 */
export async function linkOrCreateUser(profile: SSOProfile): Promise<UserLinkResult> {
  const email = profile.email.toLowerCase()
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || email.split('@')[0]
  const providerId = `workos-sso-${profile.connectionId}`
  const now = new Date()

  // Use a transaction for the entire operation to prevent race conditions
  return await db.transaction(async (tx) => {
    // Check if user exists within the transaction
    const existingUser = await tx.query.user.findFirst({
      where: eq(schema.user.email, email),
    })

    if (existingUser) {
      // Link WorkOS identity to existing user by creating/updating account
      const existingAccount = await tx.query.account.findFirst({
        where: and(
          eq(schema.account.userId, existingUser.id),
          eq(schema.account.providerId, providerId)
        ),
      })

      if (existingAccount) {
        // Update existing account
        await tx.update(schema.account)
          .set({
            accountId: profile.id,
            updatedAt: now,
          })
          .where(eq(schema.account.id, existingAccount.id))
      } else {
        // Create new account link
        await tx.insert(schema.account).values({
          id: crypto.randomUUID(),
          userId: existingUser.id,
          providerId,
          accountId: profile.id,
          createdAt: now,
          updatedAt: now,
        })
      }

      logger.info('Linked WorkOS identity to existing user', {
        userId: existingUser.id,
        email,
        connectionId: profile.connectionId,
      })

      return {
        isNewUser: false,
        userId: existingUser.id,
        email,
      }
    }

    // Create new user and link account
    const userId = crypto.randomUUID()

    await tx.insert(schema.user).values({
      id: userId,
      email,
      name,
      emailVerified: true, // SSO users are considered verified
      image: null,
      createdAt: now,
      updatedAt: now,
    })

    await tx.insert(schema.account).values({
      id: crypto.randomUUID(),
      userId,
      providerId,
      accountId: profile.id,
      createdAt: now,
      updatedAt: now,
    })

    logger.info('Created new user from SSO', {
      userId,
      email,
      connectionId: profile.connectionId,
    })

    return {
      isNewUser: true,
      userId,
      email,
    }
  })
}

/**
 * Lists all SSO connections for an organization.
 *
 * @param organizationId - The WorkOS organization ID
 * @returns List of SSO connections
 */
export async function listConnections(organizationId: string): Promise<SSOConnection[]> {
  if (!isWorkOSSSOEnabled()) {
    return []
  }

  const workos = requireWorkOSClient()

  try {
    const { data } = await workos.sso.listConnections({
      organizationId,
    })

    return data.map((conn) => ({
      id: conn.id,
      organizationId: conn.organizationId ?? '',
      type: isSAMLConnectionType(conn.connectionType) ? 'saml' as const : 'oidc' as const,
      name: conn.name,
      state: conn.state as SSOConnection['state'],
      domains: conn.domains?.map((d) => d.domain) ?? [],
      createdAt: new Date(conn.createdAt),
      updatedAt: new Date(conn.updatedAt),
    }))
  } catch (error) {
    logger.error('Failed to list SSO connections', { error, organizationId })
    return []
  }
}

/**
 * Gets the email domain from an email address.
 *
 * @param email - The email address
 * @returns The domain portion of the email
 */
export function getEmailDomain(email: string): string {
  const parts = email.split('@')
  return parts[1]?.toLowerCase() ?? ''
}

/**
 * Checks if an email domain has an active WorkOS SSO connection.
 *
 * @param domain - The email domain to check
 * @returns True if the domain has an active SSO connection
 */
export async function hasSSOConnection(domain: string): Promise<boolean> {
  if (!isWorkOSSSOEnabled()) {
    return false
  }

  const workos = getWorkOSClient()
  if (!workos) {
    return false
  }

  try {
    // Try to get connection by domain
    const { data } = await workos.sso.listConnections({
      domain,
    })

    return data.some((conn) => conn.state === 'active')
  } catch (error) {
    logger.error('Failed to check SSO connection', { error, domain })
    return false
  }
}

