/**
 * WorkOS SSO Authorization Endpoint
 *
 * Initiates the SSO authentication flow by redirecting users to WorkOS.
 * Supports connection-based, domain-based, and organization-based SSO.
 *
 * @module api/auth/workos/authorize
 */

import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getAuthorizationUrl,
  isWorkOSSSOEnabled,
  getEmailDomain,
  validateCallbackUrl,
} from '@/lib/auth/workos'
import { getBaseUrl } from '@/lib/core/utils/urls'

const logger = createLogger('WorkOS:Authorize')

/**
 * Query parameters schema for SSO authorization
 */
const AuthorizeParamsSchema = z.object({
  email: z.string().email().optional(),
  connection: z.string().optional(),
  organization: z.string().optional(),
  callbackUrl: z.string().optional(),
}).refine(
  (data) => data.email || data.connection || data.organization,
  { message: 'At least one of email, connection, or organization is required' }
)

/**
 * GET /api/auth/workos/authorize
 *
 * Initiates the WorkOS SSO flow. Accepts the following query parameters:
 * - email: User's email address (used to determine SSO connection by domain)
 * - connection: Specific SSO connection ID
 * - organization: WorkOS organization ID
 * - callbackUrl: URL to redirect to after authentication (must be same-origin)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isWorkOSSSOEnabled()) {
    logger.warn('WorkOS SSO authorization attempted but feature is disabled')
    return NextResponse.redirect(
      new URL('/login?error=sso_disabled', getBaseUrl())
    )
  }

  const searchParams = request.nextUrl.searchParams
  const params = {
    email: searchParams.get('email') ?? undefined,
    connection: searchParams.get('connection') ?? undefined,
    organization: searchParams.get('organization') ?? undefined,
    callbackUrl: searchParams.get('callbackUrl') ?? undefined,
  }

  // Validate parameters with Zod
  const parseResult = AuthorizeParamsSchema.safeParse(params)

  if (!parseResult.success) {
    logger.warn('SSO authorization request missing required parameters', {
      errors: parseResult.error.flatten(),
    })
    return NextResponse.redirect(
      new URL('/sso?error=missing_parameters', getBaseUrl())
    )
  }

  const { email, connection: connectionId, organization: organizationId, callbackUrl } = parseResult.data

  // Validate callback URL to prevent open redirect attacks
  const safeCallbackUrl = validateCallbackUrl(callbackUrl)

  try {
    // Generate state for CSRF protection (includes callback URL and timestamp)
    const state = Buffer.from(
      JSON.stringify({
        callbackUrl: safeCallbackUrl,
        timestamp: Date.now(),
      })
    ).toString('base64url')

    const authorizationUrl = await getAuthorizationUrl({
      connectionId,
      domain: email ? getEmailDomain(email) : undefined,
      organizationId,
      state,
    })

    logger.info('Redirecting to WorkOS SSO', {
      hasEmail: !!email,
      hasConnection: !!connectionId,
      hasOrganization: !!organizationId,
    })

    return NextResponse.redirect(authorizationUrl)
  } catch (error) {
    logger.error('Failed to generate SSO authorization URL', { error })
    return NextResponse.redirect(
      new URL('/sso?error=sso_failed', getBaseUrl())
    )
  }
}
