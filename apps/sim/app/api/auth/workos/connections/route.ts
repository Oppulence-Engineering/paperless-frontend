/**
 * WorkOS SSO Connections API
 *
 * Lists and manages SSO connections for an organization.
 *
 * @module api/auth/workos/connections
 */

import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import {
  listConnections,
  isWorkOSSSOEnabled,
} from '@/lib/auth/workos'
import { db } from '@sim/db'
import * as schema from '@sim/db/schema'
import { and, eq } from 'drizzle-orm'

const logger = createLogger('WorkOS:Connections')

/**
 * Query parameters schema for listing connections
 */
const ConnectionsQuerySchema = z.object({
  organizationId: z.string().min(1).optional(),
})

/**
 * GET /api/auth/workos/connections
 *
 * Lists SSO connections for the current user's organization.
 * Requires authentication and organization membership.
 *
 * Query parameters:
 * - organizationId: Optional organization ID (falls back to session's active organization)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isWorkOSSSOEnabled()) {
    return NextResponse.json(
      { error: 'WorkOS SSO is not enabled' },
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

    // Parse and validate query parameters with Zod
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      organizationId: searchParams.get('organizationId') ?? undefined,
    }

    const parseResult = ConnectionsQuerySchema.safeParse(queryParams)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Get organization ID from query or session
    const organizationId = parseResult.data.organizationId ??
      (session.session as { activeOrganizationId?: string })?.activeOrganizationId

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Verify user is a member of the organization
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

    // Get connections from WorkOS
    const connections = await listConnections(organizationId)

    logger.info('Listed SSO connections', {
      userId: session.user.id,
      organizationId,
      connectionCount: connections.length,
    })

    return NextResponse.json({ connections })
  } catch (error) {
    logger.error('Failed to list SSO connections', { error })
    return NextResponse.json(
      { error: 'Failed to list SSO connections' },
      { status: 500 }
    )
  }
}
