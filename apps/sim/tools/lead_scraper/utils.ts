import { z } from 'zod'
import {
  type LeadScraperContextParams,
  type LeadScraperCost,
  leadScraperContextParamsSchema,
} from '@/tools/lead_scraper/types'

const DEFAULT_BASE_URL = process.env.LEAD_SCRAPER_BASE_URL || 'http://localhost:8081'
const DEFAULT_API_PREFIX =
  process.env.LEAD_SCRAPER_API_PREFIX || '/lead-scraper-microservice/api/v1'
const DEFAULT_API_KEY = process.env.LEAD_SCRAPER_API_KEY
const DEFAULT_ORG_ID = process.env.LEAD_SCRAPER_ORGANIZATION_ID
const DEFAULT_TENANT_ID = process.env.LEAD_SCRAPER_TENANT_ID
const DEFAULT_JOB_COST = process.env.LEAD_SCRAPER_JOB_COST
const DEFAULT_DOWNLOAD_COST = process.env.LEAD_SCRAPER_DOWNLOAD_COST
const DEFAULT_SAVED_SEARCH_COST = process.env.LEAD_SCRAPER_EXECUTE_SAVED_SEARCH_COST

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '')

const normalizeApiPrefix = (prefix: string) => {
  const trimmed = prefix.trim()
  if (!trimmed) return ''
  const cleaned = trimmed.replace(/^\/+|\/+$/g, '')
  return cleaned ? `/${cleaned}` : ''
}

const formatQueryValue = (value: unknown) => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

const jsonObjectSchema = z.record(z.any())
const jsonValueSchema = z.union([jsonObjectSchema, z.array(z.any())])

const parseJsonValue = <T = Record<string, unknown>>(value: unknown, label: string): T | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return undefined
    }
    try {
      value = JSON.parse(trimmed)
    } catch {
      throw new Error(`${label} must be valid JSON`)
    }
  }

  const parsed = jsonValueSchema.safeParse(value)
  if (!parsed.success) {
    throw new Error(`${label} must be a JSON object or array`)
  }

  return parsed.data as T
}

const parseJsonObject = <T = Record<string, unknown>>(value: unknown, label: string): T | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return undefined
    }
    try {
      value = JSON.parse(trimmed)
    } catch {
      throw new Error(`${label} must be valid JSON`)
    }
  }

  const parsed = jsonObjectSchema.safeParse(value)
  if (!parsed.success) {
    throw new Error(`${label} must be a JSON object`)
  }

  return parsed.data as T
}

const parseCostValue = (value: string | undefined) => {
  if (!value) return 0
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export type LeadScraperBillingAction =
  | 'create_job'
  | 'execute_saved_search'
  | 'download_results'

const leadScraperCostMap: Record<LeadScraperBillingAction, number> = {
  create_job: parseCostValue(DEFAULT_JOB_COST),
  execute_saved_search: parseCostValue(DEFAULT_SAVED_SEARCH_COST),
  download_results: parseCostValue(DEFAULT_DOWNLOAD_COST),
}

export const resolveLeadScraperContext = (
  params: LeadScraperContextParams,
  options: { requireOrganizationId?: boolean; requireTenantId?: boolean } = {}
) => {
  const parsedParams = leadScraperContextParamsSchema.parse(params)
  const apiKey = parsedParams.apiKey || DEFAULT_API_KEY
  if (!apiKey) {
    throw new Error(
      'Lead Scraper API key is required. Provide apiKey or set LEAD_SCRAPER_API_KEY.'
    )
  }

  const organizationId =
    parsedParams.organizationId ||
    parsedParams._context?.organizationId ||
    parsedParams.workspaceId ||
    parsedParams._context?.workspaceId ||
    DEFAULT_ORG_ID

  const tenantId =
    parsedParams.tenantId ||
    parsedParams._context?.tenantId ||
    parsedParams.userId ||
    parsedParams._context?.userId ||
    DEFAULT_TENANT_ID

  if (options.requireOrganizationId && !organizationId) {
    throw new Error(
      'Lead Scraper organizationId is required. Provide it or set LEAD_SCRAPER_ORGANIZATION_ID.'
    )
  }

  if (options.requireTenantId && !tenantId) {
    throw new Error(
      'Lead Scraper tenantId is required. Provide it or set LEAD_SCRAPER_TENANT_ID.'
    )
  }

  return {
    apiKey,
    organizationId,
    tenantId,
    baseUrl: normalizeBaseUrl(parsedParams.baseUrl || DEFAULT_BASE_URL),
    apiPrefix: normalizeApiPrefix(parsedParams.apiPrefix || DEFAULT_API_PREFIX),
  }
}

export const buildLeadScraperUrl = (params: LeadScraperContextParams, path: string) => {
  const parsedParams = leadScraperContextParamsSchema.parse(params)
  const baseUrl = normalizeBaseUrl(parsedParams.baseUrl || DEFAULT_BASE_URL)
  const apiPrefix = normalizeApiPrefix(parsedParams.apiPrefix || DEFAULT_API_PREFIX)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${apiPrefix}${normalizedPath}`
}

export const buildLeadScraperHeaders = (
  params: LeadScraperContextParams,
  options: { requireOrganizationId?: boolean; requireTenantId?: boolean } = {}
) => {
  const { apiKey, organizationId, tenantId } = resolveLeadScraperContext(params, options)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  }

  if (organizationId) {
    headers['x-organization-id'] = String(organizationId)
  }

  if (tenantId) {
    headers['x-tenant-id'] = String(tenantId)
  }

  return headers
}

export const normalizeJsonInput = <T = unknown>(value: unknown, label: string): T | undefined => {
  return parseJsonValue<T>(value, label)
}

export const requireJsonInput = <T = unknown>(value: unknown, label: string): T => {
  const parsed = normalizeJsonInput<T>(value, label)
  if (!parsed) {
    throw new Error(`${label} is required`)
  }
  return parsed
}

export const buildQueryString = (value: unknown, label: string) => {
  const query = parseJsonObject<Record<string, unknown>>(value, label)
  if (!query || Object.keys(query).length === 0) {
    return ''
  }

  const params = new URLSearchParams()
  for (const [key, raw] of Object.entries(query)) {
    if (raw === undefined || raw === null) {
      continue
    }
    if (Array.isArray(raw)) {
      raw.forEach((item) => params.append(key, formatQueryValue(item)))
    } else {
      params.append(key, formatQueryValue(raw))
    }
  }

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const requireStringParam = (value: string | undefined, label: string) => {
  const parsed = z.string().trim().min(1, `${label} is required`).parse(value)
  return parsed
}

export const parseLeadScraperResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()
  const headers: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    headers[key] = value
  })
  return { data, status: response.status, headers }
}

export const buildLeadScraperCost = (
  action: LeadScraperBillingAction
): LeadScraperCost | null => {
  const total = leadScraperCostMap[action]
  if (!total || total <= 0) {
    return null
  }

  return {
    input: 0,
    output: 0,
    total,
    tokens: {
      input: 0,
      output: 0,
      total: 0,
    },
    model: `lead-scraper-${action}`,
  }
}
