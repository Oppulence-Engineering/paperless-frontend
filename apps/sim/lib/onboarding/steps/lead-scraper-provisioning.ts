/**
 * @fileoverview Lead Scraper provisioning onboarding step.
 *
 * This step provisions organization and tenant records in the Lead Scraper
 * service during user onboarding. It is automatically triggered when users
 * reach this step in the onboarding flow.
 *
 * ## What This Step Does
 *
 * 1. Calls the provisioning API endpoint
 * 2. Creates an organization record in Lead Scraper (using workspace ID)
 * 3. Creates a tenant record under that organization
 * 4. Creates an account record linking the authenticated user
 * 5. Stores both organization ID and tenant ID encrypted in workspace environment
 *
 * ## Why Both IDs Are Needed
 *
 * The Lead Scraper API requires both organization ID and tenant ID for
 * authentication. All API calls must include both values in headers.
 * Storing them in the workspace environment allows workflows to access
 * Lead Scraper features.
 *
 * ## Configuration
 *
 * The step uses environment variables configured on the server:
 * - LEAD_SCRAPER_API_KEY: API key for authenticating with Lead Scraper
 * - LEAD_SCRAPER_BASE_URL: Base URL of Lead Scraper service
 * - LEAD_SCRAPER_API_PREFIX: API path prefix
 *
 * If the API key is not configured, the step is skipped (not failed).
 *
 * @example Result on success:
 * ```typescript
 * {
 *   organizationId: 'workspace-123',
 *   tenantId: 'tenant-456',
 *   organizationStatus: 201,
 *   tenantStatus: 201,
 *   accountStatus: 201,
 * }
 * ```
 *
 * @example Result when skipped:
 * ```typescript
 * {
 *   organizationId: 'workspace-123',
 *   organizationStatus: 0,
 *   tenantStatus: 0,
 *   accountStatus: 0,
 * }
 * ```
 */

import { z } from 'zod'
import { createApiStep } from '../factory'
import type { OnboardingStep } from '../types'

// =============================================================================
// Schema Definitions
// =============================================================================

/**
 * Schema for the Lead Scraper provisioning step result.
 *
 * Contains the organization ID and tenant ID returned from provisioning,
 * plus HTTP status codes for debugging.
 */
export const LeadScraperProvisioningResultSchema = z.object({
  /**
   * Organization ID used for Lead Scraper API authentication.
   * This is the workspace ID used during provisioning.
   */
  organizationId: z.string().min(1, 'Organization ID is required'),

  /**
   * Tenant ID used for Lead Scraper API authentication.
   * Created during provisioning, stored encrypted in workspace env.
   */
  tenantId: z.string().optional(),

  /** HTTP status code from organization creation (201 = created, 409 = exists) */
  organizationStatus: z.number().int(),

  /** HTTP status code from tenant creation */
  tenantStatus: z.number().int(),

  /** HTTP status code from account creation */
  accountStatus: z.number().int(),
})

/**
 * Type for Lead Scraper provisioning result.
 * Inferred from the Zod schema for type safety.
 */
export type LeadScraperProvisioningResult = z.infer<typeof LeadScraperProvisioningResultSchema>

// =============================================================================
// Step Definition
// =============================================================================

/**
 * Lead Scraper provisioning onboarding step.
 *
 * This step is:
 * - Required: Must complete for onboarding to finish
 * - Auto-executing: Triggers automatically when reached
 * - Idempotent: Safe to retry (handles 409 Conflict)
 *
 * The step uses the API factory pattern, delegating execution to
 * the `/api/onboarding/[workspaceId]/provision-lead-scraper` endpoint.
 *
 * The component property returns null because this step's UI is defined
 * separately in `app/onboarding/steps/lead-scraper-provisioning-step.tsx`.
 * This separation avoids circular dependencies between lib and app code.
 */
export const leadScraperProvisioningStep: OnboardingStep<
  Record<string, never>,
  LeadScraperProvisioningResult
> = createApiStep({
  // Step metadata
  id: 'lead-scraper-provisioning',
  title: 'Setting up Lead Scraper',
  description: "We're provisioning your Lead Scraper account. This will only take a moment.",
  order: 1,
  required: true,

  // Validation
  resultSchema: LeadScraperProvisioningResultSchema,

  // UI component (defined separately to avoid circular deps)
  component: () => null,

  // API configuration
  apiEndpoint: '/api/onboarding/[workspaceId]/provision-lead-scraper',

  /**
   * Transforms the execution request to include all required context.
   * The API endpoint needs workspace and user information for provisioning.
   */
  transformRequest: (_, context) => ({
    workspaceId: context.workspaceId,
    workspaceName: context.workspaceName,
    userId: context.userId,
    userEmail: context.userEmail,
  }),

  /**
   * Transforms the API response to the step result type.
   * Validates the response matches the expected schema.
   */
  transformResponse: (response: unknown): LeadScraperProvisioningResult => {
    const parsed = LeadScraperProvisioningResultSchema.safeParse(response)

    if (!parsed.success) {
      // Return minimal valid response if parsing fails
      // This shouldn't happen in production but provides a fallback
      return {
        organizationId: '',
        organizationStatus: 0,
        tenantStatus: 0,
        accountStatus: 0,
      }
    }

    return parsed.data
  },
})
