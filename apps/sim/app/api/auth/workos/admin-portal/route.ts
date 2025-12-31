/**
 * WorkOS Admin Portal API
 *
 * Generates Admin Portal links for organization administrators to configure
 * SSO, Directory Sync, and other enterprise features.
 *
 * @module api/auth/workos/admin-portal
 */

import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  generatePortalLink,
  isWorkOSAdminPortalEnabled,
  validateReturnUrl,
} from '@/lib/auth/workos'
import { AdminPortalRequestSchema } from '@/lib/auth/workos/types'
import { db } from '@sim/db'
import * as schema from '@sim/db/schema'
import { and, eq } from 'drizzle-orm'

const logger = createLogger('WorkOS:AdminPortal')

/**
 * POST /api/auth/workos/admin-portal
 *
 * Generates an Admin Portal link for the organization.
 * Request body:
 * - organizationId: The WorkOS organization ID
 * - intent: The portal intent ('sso', 'dsync', 'audit_logs', etc.)
 * - returnUrl: Optional URL to return to after the portal session (must be same-origin)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isWorkOSAdminPortalEnabled()) {
    return NextResponse.json(
      { error: 'WorkOS Admin Portal is not enabled' },
      { status: 503 }
    )
  }

  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body with Zod
    const parseResult = AdminPortalRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { organizationId, intent, returnUrl } = parseResult.data

    // Validate returnUrl to prevent open redirect (only same-origin allowed)
    const safeReturnUrl = validateReturnUrl(returnUrl)

    // Verify user is an admin of the organization
    const membership = await db.query.member.findFirst({
      where: and(
        eq(schema.member.userId, session.user.id),
        eq(schema.member.organizationId, organizationId)
      ),
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }

    if (membership.role !== 'admin' && membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Admin access required to configure enterprise features' },
        { status: 403 }
      )
    }

    // Generate Admin Portal link
    const portalSession = await generatePortalLink(organizationId, intent, {
      returnUrl: safeReturnUrl,
    })

    logger.info('Generated Admin Portal link', {
      userId: session.user.id,
      organizationId,
      intent,
    })

    return NextResponse.json({
      link: portalSession.link,
      intent: portalSession.intent,
    })
  } catch (error) {
    logger.error('Failed to generate Admin Portal link', { error })
    return NextResponse.json(
      { error: 'Failed to generate Admin Portal link' },
      { status: 500 }
    )
  }
}
