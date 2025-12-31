/**
 * WorkOS SSO Callback Endpoint
 *
 * Handles the callback from WorkOS after SSO authentication.
 * Creates or links the user account and establishes a session.
 *
 * @module api/auth/workos/callback
 */

import { createLogger } from '@sim/logger'
import { db } from '@sim/db'
import * as schema from '@sim/db/schema'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  handleCallback,
  linkOrCreateUser,
  isWorkOSSSOEnabled,
  logUserLogin,
  isWorkOSAuditLogsEnabled,
  validateStateToken,
  validateCallbackUrl,
} from '@/lib/auth/workos'
import { getBaseUrl } from '@/lib/core/utils/urls'

const logger = createLogger('WorkOS:Callback')

/**
 * GET /api/auth/workos/callback
 *
 * Handles the OAuth callback from WorkOS. Query parameters:
 * - code: Authorization code from WorkOS
 * - state: CSRF state token containing callback URL
 * - error: Error code if authentication failed
 * - error_description: Error description if authentication failed
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isWorkOSSSOEnabled()) {
    logger.warn('WorkOS SSO callback received but feature is disabled')
    return NextResponse.redirect(
      new URL('/login?error=sso_disabled', getBaseUrl())
    )
  }

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Validate state token (CSRF protection with timestamp check)
  const stateData = validateStateToken(state)
  const callbackUrl = stateData?.callbackUrl ?? validateCallbackUrl(null)

  if (!stateData && state) {
    // State was provided but invalid (expired or malformed)
    logger.warn('Invalid or expired SSO state token')
    return NextResponse.redirect(
      new URL('/sso?error=invalid_state', getBaseUrl())
    )
  }

  // Handle SSO errors
  if (error) {
    logger.error('SSO authentication error', { error, errorDescription })
    return NextResponse.redirect(
      new URL(`/sso?error=${encodeURIComponent(error)}`, getBaseUrl())
    )
  }

  if (!code) {
    logger.error('SSO callback missing authorization code')
    return NextResponse.redirect(
      new URL('/sso?error=missing_code', getBaseUrl())
    )
  }

  try {
    // Exchange code for profile
    const ssoResult = await handleCallback(code)
    const { profile } = ssoResult

    logger.info('SSO authentication successful', {
      email: profile.email,
      connectionId: profile.connectionId,
    })

    // Link or create user
    const userResult = await linkOrCreateUser(profile)

    logger.info('User linked/created from SSO', {
      userId: userResult.userId,
      email: userResult.email,
      isNewUser: userResult.isNewUser,
    })

    // Get the user to create a session
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, userResult.userId),
    })

    if (!user) {
      throw new Error('Failed to find user after SSO')
    }

    // Create session manually for SSO authentication
    const sessionToken = crypto.randomUUID()
    const sessionId = crypto.randomUUID()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Find user's organization if any
    const memberRecord = await db.query.member.findFirst({
      where: eq(schema.member.userId, userResult.userId),
    })

    await db.insert(schema.session).values({
      id: sessionId,
      userId: userResult.userId,
      token: sessionToken,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: request.headers.get('user-agent') ?? null,
      activeOrganizationId: memberRecord?.organizationId ?? null,
    })

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    })

    logger.info('Session created for SSO user', {
      userId: userResult.userId,
      sessionId,
    })

    // Log audit event if enabled (non-blocking to avoid slowing down SSO callback)
    if (isWorkOSAuditLogsEnabled() && ssoResult.organizationId) {
      // Fire and forget - errors are handled internally by logUserLogin
      void logUserLogin(
        ssoResult.organizationId,
        userResult.userId,
        user.name,
        {
          ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
          userAgent: request.headers.get('user-agent') ?? undefined,
        }
      )
    }

    // Redirect to validated callback URL
    return NextResponse.redirect(new URL(callbackUrl, getBaseUrl()))
  } catch (error) {
    logger.error('SSO callback processing failed', { error })
    return NextResponse.redirect(
      new URL('/sso?error=sso_failed', getBaseUrl())
    )
  }
}
