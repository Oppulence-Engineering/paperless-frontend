import {
  Configuration,
  LeadScraperServiceApi as LeadScraperServiceApiClient,
  type GetAccountUsageResponse,
  type HTTPBody,
  type HTTPHeaders,
  type HTTPMethod,
  type HTTPQuery,
  type RequestOpts,
} from '@playbookmedia/backend-client-sdk'
import type { LeadScraperServiceApi } from '@playbookmedia/backend-client-sdk'
import {
  leadScraperContextParamsSchema,
  type LeadScraperContextParams,
  type LeadScraperQuotaInfo,
} from '@/tools/lead_scraper/types'
import { parseLeadScraperResponse, resolveLeadScraperContext } from '@/tools/lead_scraper/utils'

type RawApiResponse<T> = {
  raw: Response
  value(): Promise<T>
}

type RawResponse = {
  raw: Response
}

type LeadScraperSdkClient = LeadScraperServiceApi & {
  request: (opts: RequestOpts) => Promise<Response>
}

const requireId = (value: string | undefined, label: string) => {
  if (!value) {
    throw new Error(`${label} is required`)
  }
  return value
}

const coalesceId = (...values: Array<string | undefined>) => {
  for (const value of values) {
    const trimmed = value?.trim()
    if (trimmed) return trimmed
  }
  return undefined
}

export const createLeadScraperSdkClient = (
  params: LeadScraperContextParams,
  options: { requireOrganizationId?: boolean; requireTenantId?: boolean } = {}
): LeadScraperServiceApi => {
  const { apiKey, organizationId, tenantId, baseUrl } = resolveLeadScraperContext(params, options)
  const resolvedApiKey = requireId(apiKey, 'apiKey')
  const resolvedOrganizationId = requireId(organizationId, 'organizationId')
  const resolvedTenantId = requireId(tenantId, 'tenantId')
  const configuration = new Configuration({
    basePath: baseUrl,
    headers: {
      'x-api-key': resolvedApiKey,
      'x-organization-id': resolvedOrganizationId,
      'x-tenant-id': resolvedTenantId,
    },
  })

  return new LeadScraperServiceApiClient(configuration)
}

export const buildLeadScraperSdkPath = (params: LeadScraperContextParams, path: string) => {
  const { apiPrefix } = resolveLeadScraperContext(params)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${apiPrefix}${normalizedPath}`
}

export const leadScraperSdkRequest = async (
  client: LeadScraperServiceApi,
  options: {
    path: string
    method: HTTPMethod
    query?: HTTPQuery
    body?: HTTPBody
    headers?: HTTPHeaders
  }
) => {
  const sdkClient = client as LeadScraperSdkClient
  if (typeof sdkClient.request !== 'function') {
    throw new Error('Lead Scraper SDK request handler is unavailable')
  }

  return sdkClient.request({
    path: options.path,
    method: options.method,
    headers: options.headers ?? {},
    query: options.query,
    body: options.body,
  })
}

export const resolveLeadScraperSdkIds = (params: LeadScraperContextParams) => {
  const parsedParams = leadScraperContextParamsSchema.parse(params)
  const { organizationId, tenantId } = resolveLeadScraperContext(parsedParams, {
    requireOrganizationId: true,
    requireTenantId: true,
  })
  const resolvedOrganizationId = requireId(organizationId, 'organizationId')
  const resolvedTenantId = requireId(tenantId, 'tenantId')

  const workspaceId = coalesceId(
    parsedParams.workspaceId,
    parsedParams._context?.workspaceId,
    resolvedOrganizationId
  )
  const accountId = coalesceId(parsedParams.accountId, resolvedTenantId)
  const userId = coalesceId(
    parsedParams.userId,
    parsedParams._context?.userId,
    resolvedTenantId
  )
  const authPlatformUserId = coalesceId(
    parsedParams.authPlatformUserId,
    userId,
    resolvedTenantId
  )

  return {
    organizationId: resolvedOrganizationId,
    tenantId: resolvedTenantId,
    workspaceId: workspaceId ?? resolvedOrganizationId,
    accountId: accountId ?? resolvedTenantId,
    userId: userId ?? resolvedTenantId,
    authPlatformUserId: authPlatformUserId ?? resolvedTenantId,
  }
}

export const parseLeadScraperSdkResponse = async (response: RawApiResponse<unknown> | RawResponse) =>
  parseLeadScraperResponse(response.raw)

const normalizeAccountUsage = (
  usage: GetAccountUsageResponse | null | undefined
): LeadScraperQuotaInfo | null => {
  if (!usage) return null
  const resetValue = usage.resetTime
  const resetTime = resetValue
    ? (resetValue instanceof Date ? resetValue : new Date(resetValue)).toISOString()
    : undefined
  return {
    totalJobsRun: usage.totalJobsRun,
    monthlyJobLimit: usage.monthlyJobLimit,
    remainingJobs: usage.remainingJobs,
    resetTime,
  }
}

export const fetchLeadScraperAccountUsage = async (
  client: LeadScraperServiceApi,
  accountId: string | undefined
) => {
  if (!accountId) return null
  try {
    const usage = await client.getAccountUsage({ id: accountId })
    return normalizeAccountUsage(usage)
  } catch {
    return null
  }
}
