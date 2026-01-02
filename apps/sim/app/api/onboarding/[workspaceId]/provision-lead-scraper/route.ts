/**
 * @fileoverview API route for Lead Scraper provisioning.
 *
 * Provisions organization and tenant records in the Lead Scraper service
 * for a workspace. This is the backend handler for the lead-scraper-provisioning
 * onboarding step.
 *
 * ## What This Does
 *
 * 1. Creates an organization record in Lead Scraper (using workspace ID)
 * 2. Creates a tenant record under that organization
 * 3. Creates an account record linking the user
 * 4. Stores both organization ID and tenant ID encrypted in workspace environment
 * 5. Marks the onboarding step as complete
 *
 * ## Environment Variables Required
 *
 * - LEAD_SCRAPER_API_KEY: API key for authenticating with Lead Scraper service
 * - LEAD_SCRAPER_BASE_URL: Base URL of Lead Scraper service (optional, defaults to localhost)
 * - LEAD_SCRAPER_API_PREFIX: API path prefix (optional)
 */

import { db } from '@sim/db'
import { workspace } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { eq } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { provisionLeadScraperAccountForWorkspaceOwner } from '@/lib/lead-scraper/provisioning'
import { verifyWorkspaceAccess } from '@/lib/onboarding/access'
import { markStepCompleted } from '@/lib/onboarding/utils'

const logger = createLogger('OnboardingProvisionLeadScraperAPI')

/**
 * Schema for the Lead Scraper provisioning response.
 */
const ProvisioningResponseSchema = z.object({
  /** Whether provisioning was successful */
  success: z.literal(true),
  /** Whether provisioning was skipped (API key not configured) */
  skipped: z.boolean().optional(),
  /** Organization ID for Lead Scraper API authentication */
  organizationId: z.string(),
  /** Tenant ID for Lead Scraper API authentication */
  tenantId: z.string().optional(),
  /** HTTP status from organization creation */
  organizationStatus: z.number(),
  /** HTTP status from tenant creation */
  tenantStatus: z.number(),
  /** HTTP status from account creation */
  accountStatus: z.number(),
})

type ProvisioningResponse = z.infer<typeof ProvisioningResponseSchema>

/**
 * POST /api/onboarding/[workspaceId]/provision-lead-scraper
 *
 * Provisions Lead Scraper organization and tenant records for a workspace.
 * Automatically stores credentials in workspace environment variables.
 *
 * @returns Provisioning result with organization and tenant IDs
 *
 * @example Response (success):
 * ```json
 * {
 *   "success": true,
 *   "organizationId": "workspace-123",
 *   "tenantId": "tenant-456",
 *   "organizationStatus": 201,
 *   "tenantStatus": 201,
 *   "accountStatus": 201
 * }
 * ```
 *
 * @example Response (skipped):
 * ```json
 * {
 *   "success": true,
 *   "skipped": true,
 *   "organizationId": "workspace-123",
 *   "organizationStatus": 0,
 *   "tenantStatus": 0,
 *   "accountStatus": 0
 * }
 * ```
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId } = await params

    // Verify user has access to this workspace
    const hasAccess = await verifyWorkspaceAccess(session.user.id, workspaceId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get workspace details for provisioning
    const [workspaceData] = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.ownerId,
      })
      .from(workspace)
      .where(eq(workspace.id, workspaceId))
      .limit(1)

    if (!workspaceData) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    logger.info('Starting Lead Scraper provisioning', {
      workspaceId,
      workspaceName: workspaceData.name,
      userId: session.user.id,
    })

    // Call the provisioning function
    const result = await provisionLeadScraperAccountForWorkspaceOwner({
      userId: session.user.id,
      userEmail: session.user.email || undefined,
      workspaceId: workspaceData.id,
      workspaceName: workspaceData.name,
    })

    // Handle skipped provisioning (API key not configured)
    if (!result.success) {
      if ('skipped' in result && result.skipped) {
        logger.info('Lead Scraper provisioning skipped (API key not configured)', {
          workspaceId,
        })

        // Mark step as complete even when skipped
        await markStepCompleted(workspaceId, 'lead-scraper-provisioning', { skipped: true })

        const response: ProvisioningResponse = {
          success: true,
          skipped: true,
          organizationId: workspaceId,
          organizationStatus: 0,
          tenantStatus: 0,
          accountStatus: 0,
        }

        return NextResponse.json(response)
      }

      // Actual failure
      const errorMessage = 'error' in result ? result.error : 'Provisioning failed'
      logger.error('Lead Scraper provisioning failed', {
        workspaceId,
        error: errorMessage,
      })
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    // Mark step as complete with result
    await markStepCompleted(workspaceId, 'lead-scraper-provisioning', result)

    logger.info('Lead Scraper provisioning completed', {
      workspaceId,
      organizationId: result.organizationId,
      tenantId: result.tenantId,
    })

    const response: ProvisioningResponse = {
      success: true,
      organizationId: result.organizationId,
      tenantId: result.tenantId,
      organizationStatus: result.organizationStatus,
      tenantStatus: result.tenantStatus,
      accountStatus: result.accountStatus,
    }

    return NextResponse.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to provision Lead Scraper', { error: errorMessage })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
