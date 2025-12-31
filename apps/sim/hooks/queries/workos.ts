/**
 * WorkOS React Query Hooks
 *
 * Provides client-side hooks for WorkOS enterprise authentication features.
 * Uses Zod schemas for runtime validation of API responses.
 *
 * @module hooks/queries/workos
 */

import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import {
  isWorkOSEnabled,
  SSOConnectionSchema,
  AdminPortalIntentSchema,
  type AdminPortalIntent,
  type SSOConnection,
} from '@/lib/auth/workos'

/**
 * Query keys for WorkOS-related queries
 */
export const workosQueryKeys = {
  all: ['workos'] as const,
  connections: (organizationId: string) => [...workosQueryKeys.all, 'connections', organizationId] as const,
}

/**
 * Checks if WorkOS is enabled
 */
export function useIsWorkOSEnabled(): boolean {
  return isWorkOSEnabled()
}

/**
 * Schema for SSO connections API response
 */
const SSOConnectionsResponseSchema = z.object({
  connections: z.array(SSOConnectionSchema.extend({
    createdAt: z.union([z.date(), z.string().transform((s) => new Date(s))]),
    updatedAt: z.union([z.date(), z.string().transform((s) => new Date(s))]),
  })),
})
type SSOConnectionsResponse = z.infer<typeof SSOConnectionsResponseSchema>

/**
 * Fetches SSO connections for an organization
 */
export function useWorkOSConnections(organizationId: string | undefined) {
  const workosEnabled = useIsWorkOSEnabled()

  return useQuery({
    queryKey: workosQueryKeys.connections(organizationId ?? ''),
    queryFn: async (): Promise<SSOConnectionsResponse> => {
      if (!organizationId) {
        return { connections: [] }
      }

      const response = await fetch(`/api/auth/workos/connections?organizationId=${organizationId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch SSO connections')
      }

      const data = await response.json()
      const parsed = SSOConnectionsResponseSchema.safeParse(data)

      if (!parsed.success) {
        throw new Error('Invalid SSO connections response format')
      }

      return parsed.data
    },
    enabled: workosEnabled && !!organizationId,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Schema for Admin Portal link API response
 */
const AdminPortalLinkResponseSchema = z.object({
  link: z.string().url(),
  intent: AdminPortalIntentSchema,
})
type AdminPortalLinkResponse = z.infer<typeof AdminPortalLinkResponseSchema>

/**
 * Schema for Admin Portal link request
 */
const GenerateAdminPortalLinkParamsSchema = z.object({
  organizationId: z.string().min(1),
  intent: AdminPortalIntentSchema,
  returnUrl: z.string().url().optional(),
})
type GenerateAdminPortalLinkParams = z.infer<typeof GenerateAdminPortalLinkParamsSchema>

/**
 * Generates an Admin Portal link for organization configuration
 */
export function useGenerateAdminPortalLink() {
  return useMutation({
    mutationFn: async (params: GenerateAdminPortalLinkParams): Promise<AdminPortalLinkResponse> => {
      // Validate request params
      const validatedParams = GenerateAdminPortalLinkParamsSchema.parse(params)

      const response = await fetch('/api/auth/workos/admin-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedParams),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate Admin Portal link')
      }

      const data = await response.json()
      const parsed = AdminPortalLinkResponseSchema.safeParse(data)

      if (!parsed.success) {
        throw new Error('Invalid Admin Portal link response format')
      }

      return parsed.data
    },
    onSuccess: (data) => {
      // Redirect to the Admin Portal
      window.location.href = data.link
    },
  })
}

/**
 * Schema for WorkOS SSO auth parameters
 */
const WorkOSSSOAuthParamsSchema = z.object({
  email: z.string().email().optional(),
  connectionId: z.string().optional(),
  organizationId: z.string().optional(),
  callbackUrl: z.string().optional(),
}).refine(
  (data) => data.email || data.connectionId || data.organizationId,
  { message: 'At least one of email, connectionId, or organizationId is required' }
)
type WorkOSSSOAuthParams = z.infer<typeof WorkOSSSOAuthParamsSchema>

/**
 * Initiates WorkOS SSO authentication
 */
export function useWorkOSSSOAuth() {
  return useMutation({
    mutationFn: async (params: WorkOSSSOAuthParams): Promise<void> => {
      // Validate params
      const validatedParams = WorkOSSSOAuthParamsSchema.parse(params)

      const searchParams = new URLSearchParams()

      if (validatedParams.email) searchParams.set('email', validatedParams.email)
      if (validatedParams.connectionId) searchParams.set('connection', validatedParams.connectionId)
      if (validatedParams.organizationId) searchParams.set('organization', validatedParams.organizationId)
      if (validatedParams.callbackUrl) searchParams.set('callbackUrl', validatedParams.callbackUrl)

      // Redirect to authorization endpoint
      window.location.href = `/api/auth/workos/authorize?${searchParams.toString()}`

      // Return a promise that never resolves (page will navigate away)
      return new Promise(() => {})
    },
  })
}
