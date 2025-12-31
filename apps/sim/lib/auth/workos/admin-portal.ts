/**
 * WorkOS Admin Portal Service
 *
 * Provides functionality to generate Admin Portal links for organization administrators.
 * The Admin Portal allows admins to configure SSO, Directory Sync, and other enterprise features.
 *
 * @module lib/auth/workos/admin-portal
 */

import { createLogger } from '@sim/logger'
import { GeneratePortalLinkIntent } from '@workos-inc/node'
import { requireWorkOSClient } from './client'
import { isWorkOSAdminPortalEnabled } from './feature-flags'
import type { AdminPortalIntent, AdminPortalSession } from './types'
import { getBaseUrl } from '@/lib/core/utils/urls'

/**
 * Maps our intent types to WorkOS SDK enum values
 */
const intentMap: Record<AdminPortalIntent, GeneratePortalLinkIntent> = {
  sso: GeneratePortalLinkIntent.SSO,
  dsync: GeneratePortalLinkIntent.DSync,
  audit_logs: GeneratePortalLinkIntent.AuditLogs,
  log_streams: GeneratePortalLinkIntent.LogStreams,
  domain_verification: GeneratePortalLinkIntent.DomainVerification,
  certificate_renewal: GeneratePortalLinkIntent.CertificateRenewal,
}

const logger = createLogger('WorkOS:AdminPortal')

/**
 * Generates an Admin Portal link for organization configuration.
 *
 * @param organizationId - The WorkOS organization ID
 * @param intent - The portal intent (sso, dsync, audit_logs, etc.)
 * @param options - Additional options for the portal session
 * @returns The portal session with the link URL
 */
export async function generatePortalLink(
  organizationId: string,
  intent: AdminPortalIntent,
  options?: {
    /** URL to return to after the portal session */
    returnUrl?: string
    /** URL to redirect to on successful configuration */
    successUrl?: string
  }
): Promise<AdminPortalSession> {
  if (!isWorkOSAdminPortalEnabled()) {
    throw new Error('WorkOS Admin Portal is not enabled')
  }

  const workos = requireWorkOSClient()
  const baseUrl = getBaseUrl()

  try {
    const portalLink = await workos.portal.generateLink({
      organization: organizationId,
      intent: intentMap[intent],
      returnUrl: options?.returnUrl ?? `${baseUrl}/workspace`,
      successUrl: options?.successUrl ?? `${baseUrl}/workspace?sso_configured=true`,
    })

    logger.info('Generated Admin Portal link', {
      organizationId,
      intent,
    })

    return {
      link: portalLink.link,
      intent,
      organizationId,
      returnUrl: options?.returnUrl,
      successUrl: options?.successUrl,
    }
  } catch (error) {
    logger.error('Failed to generate Admin Portal link', {
      error,
      organizationId,
      intent,
    })
    throw new Error('Failed to generate Admin Portal link. Please try again.')
  }
}

/**
 * Generates an SSO configuration portal link.
 *
 * @param organizationId - The WorkOS organization ID
 * @param returnUrl - Optional return URL
 * @returns The portal session
 */
export function generateSSOPortalLink(
  organizationId: string,
  returnUrl?: string
): Promise<AdminPortalSession> {
  return generatePortalLink(organizationId, 'sso', { returnUrl })
}

/**
 * Generates a Directory Sync configuration portal link.
 *
 * @param organizationId - The WorkOS organization ID
 * @param returnUrl - Optional return URL
 * @returns The portal session
 */
export function generateDSyncPortalLink(
  organizationId: string,
  returnUrl?: string
): Promise<AdminPortalSession> {
  return generatePortalLink(organizationId, 'dsync', { returnUrl })
}

/**
 * Generates an Audit Logs configuration portal link.
 *
 * @param organizationId - The WorkOS organization ID
 * @param returnUrl - Optional return URL
 * @returns The portal session
 */
export function generateAuditLogsPortalLink(
  organizationId: string,
  returnUrl?: string
): Promise<AdminPortalSession> {
  return generatePortalLink(organizationId, 'audit_logs', { returnUrl })
}

/**
 * Generates a domain verification portal link.
 *
 * @param organizationId - The WorkOS organization ID
 * @param returnUrl - Optional return URL
 * @returns The portal session
 */
export function generateDomainVerificationPortalLink(
  organizationId: string,
  returnUrl?: string
): Promise<AdminPortalSession> {
  return generatePortalLink(organizationId, 'domain_verification', { returnUrl })
}

