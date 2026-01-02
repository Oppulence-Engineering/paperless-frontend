import { z } from 'zod'
import type { ToolResponse } from '@/tools/types'

const optionalStringSchema = z.preprocess((value) => {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  return value
}, z.string().min(1).optional())

const leadScraperIdSchema = optionalStringSchema

export const leadScraperContextParamsSchema = z
  .object({
    apiKey: optionalStringSchema,
    baseUrl: optionalStringSchema,
    apiPrefix: optionalStringSchema,
    organizationId: leadScraperIdSchema,
    tenantId: leadScraperIdSchema,
    userId: leadScraperIdSchema,
    workspaceId: leadScraperIdSchema,
    accountId: leadScraperIdSchema,
    authPlatformUserId: leadScraperIdSchema,
    _context: z
      .object({
        organizationId: leadScraperIdSchema,
        tenantId: leadScraperIdSchema,
        workspaceId: leadScraperIdSchema,
        userId: leadScraperIdSchema,
      })
      .optional(),
  })
  .passthrough()

export type LeadScraperContextParams = z.infer<typeof leadScraperContextParamsSchema>

export const leadScraperRequestParamsSchema = leadScraperContextParamsSchema
  .extend({
    jobId: leadScraperIdSchema,
    leadId: leadScraperIdSchema,
    leadListId: leadScraperIdSchema,
    savedSearchId: leadScraperIdSchema,
    request: z.unknown().optional(),
    update: z.unknown().optional(),
    query: z.unknown().optional(),
  })
  .passthrough()

export type LeadScraperRequestParams = z.infer<typeof leadScraperRequestParamsSchema>

export interface LeadScraperCost {
  input: number
  output: number
  total: number
  tokens?: {
    input?: number
    output?: number
    total?: number
    prompt?: number
    completion?: number
  }
  model?: string
  pricing?: {
    input: number
    cachedInput: number
    output: number
    updatedAt: string
  }
}

export interface LeadScraperQuotaInfo {
  totalJobsRun?: number
  monthlyJobLimit?: number
  remainingJobs?: number
  resetTime?: string
}

export interface LeadScraperResponse extends ToolResponse {
  output: {
    data: unknown
    status: number
    headers: Record<string, string>
    cost?: LeadScraperCost
    quota?: LeadScraperQuotaInfo
  }
}
