import type { ToolConfig } from '@/tools/types'
import type {
  LeadScraperCost,
  LeadScraperQuotaInfo,
  LeadScraperRequestParams,
  LeadScraperResponse,
} from '@/tools/lead_scraper/types'
import {
  buildLeadScraperSdkPath,
  createLeadScraperSdkClient,
  fetchLeadScraperAccountUsage,
  leadScraperSdkRequest,
  parseLeadScraperSdkResponse,
  resolveLeadScraperSdkIds,
} from '@/tools/lead_scraper/sdk'
import {
  buildLeadScraperHeaders,
  buildLeadScraperUrl,
  buildQueryString,
  buildLeadScraperCost,
  normalizeJsonInput,
  parseLeadScraperResponse,
  requireJsonInput,
  requireStringParam,
  resolveLeadScraperContext,
} from '@/tools/lead_scraper/utils'

const leadScraperOutputs = {
  data: {
    type: 'json',
    description: 'Lead Scraper API response payload (JSON or text)',
  },
  status: {
    type: 'number',
    description: 'HTTP status code',
  },
  headers: {
    type: 'json',
    description: 'Response headers',
  },
  cost: {
    type: 'json',
    description: 'Billing metadata for the Lead Scraper operation',
    optional: true,
  },
  quota: {
    type: 'json',
    description: 'Quota and usage snapshot for the Lead Scraper account',
    optional: true,
  },
} satisfies NonNullable<ToolConfig['outputs']>

const baseParams = {
  apiKey: {
    type: 'string',
    required: true,
    visibility: 'user-only',
    description: 'Lead Scraper API key',
  },
  baseUrl: {
    type: 'string',
    required: false,
    visibility: 'user-only',
    description: 'Override Lead Scraper base URL',
  },
  apiPrefix: {
    type: 'string',
    required: false,
    visibility: 'user-only',
    description: 'Override Lead Scraper API prefix',
  },
  organizationId: {
    type: 'string',
    required: false,
    visibility: 'user-only',
    description: 'Lead Scraper organization/workspace ID',
  },
  tenantId: {
    type: 'string',
    required: false,
    visibility: 'user-only',
    description: 'Lead Scraper tenant/account ID',
  },
} satisfies ToolConfig['params']

const withBaseParams = (extra: Record<string, any>) => ({
  ...baseParams,
  ...extra,
})

const leadScraperResponse = async (response: Response): Promise<LeadScraperResponse> => {
  const output = await parseLeadScraperResponse(response)
  return { success: true, output }
}

const leadScraperSdkResponse = async (response: { raw: Response }): Promise<LeadScraperResponse> => {
  const output = await parseLeadScraperSdkResponse(response)
  return { success: true, output }
}

const withLeadScraperMetadata = (
  result: LeadScraperResponse,
  options: { cost?: LeadScraperCost | null; quota?: LeadScraperQuotaInfo | null }
): LeadScraperResponse => {
  const { cost, quota } = options
  if (!cost && !quota) return result
  return {
    ...result,
    output: {
      ...result.output,
      ...(cost ? { cost } : {}),
      ...(quota ? { quota } : {}),
    },
  }
}

const enforceLeadScraperJobQuota = (quota: LeadScraperQuotaInfo | null) => {
  if (quota?.remainingJobs !== undefined && quota.remainingJobs <= 0) {
    throw new Error('Lead Scraper job quota exceeded for this account')
  }
}

const decrementLeadScraperJobQuota = (quota: LeadScraperQuotaInfo | null) => {
  if (!quota) return null
  const remainingJobs =
    typeof quota.remainingJobs === 'number'
      ? Math.max(0, quota.remainingJobs - 1)
      : quota.remainingJobs
  const totalJobsRun =
    typeof quota.totalJobsRun === 'number' ? quota.totalJobsRun + 1 : quota.totalJobsRun
  return {
    ...quota,
    ...(remainingJobs !== undefined ? { remainingJobs } : {}),
    ...(totalJobsRun !== undefined ? { totalJobsRun } : {}),
  }
}

const requiredHeaders = (params: LeadScraperRequestParams) =>
  buildLeadScraperHeaders(params, { requireOrganizationId: true, requireTenantId: true })

// Jobs
export const leadScraperCreateJobTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_create_job',
  name: 'Lead Scraper Create Job',
  description: 'Create a new scraping job',
  version: '1.0.0',
  params: withBaseParams({
    request: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Scraping job request payload',
    },
  }),
  request: {
    url: (params) => buildLeadScraperUrl(params, '/jobs'),
    method: 'POST',
    headers: requiredHeaders,
    body: (params) => requireJsonInput(params.request, 'request'),
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const quota = await fetchLeadScraperAccountUsage(client, ids.accountId)
    enforceLeadScraperJobQuota(quota)
    const request = requireJsonInput<Record<string, any>>(params.request, 'request')
    const response = await client.createScrapingJobRaw({
      createScrapingJobRequest: {
        authPlatformUserId: ids.authPlatformUserId,
        orgId: ids.organizationId,
        tenantId: ids.tenantId,
        workspaceId: ids.workspaceId,
        ...request,
      },
    })
    const result = await leadScraperSdkResponse(response)
    return withLeadScraperMetadata(result, {
      cost: buildLeadScraperCost('create_job'),
      quota: decrementLeadScraperJobQuota(quota),
    })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperListJobsTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_list_jobs',
  name: 'Lead Scraper List Jobs',
  description: 'List scraping jobs',
  version: '1.0.0',
  params: withBaseParams({
    query: {
      type: 'object',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional query filters',
    },
  }),
  request: {
    url: (params) => {
      const qs = buildQueryString(params.query, 'query')
      return buildLeadScraperUrl(params, `/jobs${qs}`)
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const query = normalizeJsonInput<Record<string, unknown>>(params.query, 'query') || {}
    const response = await client.listScrapingJobsRaw({
      authPlatformUserId: ids.authPlatformUserId,
      orgId: ids.organizationId,
      tenantId: ids.tenantId,
      ...(query as Record<string, any>),
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperGetJobTool: ToolConfig<LeadScraperRequestParams, LeadScraperResponse> = {
  id: 'lead_scraper_get_job',
  name: 'Lead Scraper Get Job',
  description: 'Get a scraping job by ID',
  version: '1.0.0',
  params: withBaseParams({
    jobId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Scraping job ID',
    },
  }),
  request: {
    url: (params) => {
      const jobId = requireStringParam(params.jobId, 'jobId')
      return buildLeadScraperUrl(params, `/jobs/${encodeURIComponent(jobId)}`)
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const jobId = requireStringParam(params.jobId, 'jobId')
    const response = await client.getScrapingJobRaw({
      jobId,
      userId: ids.userId,
      orgId: ids.organizationId,
      tenantId: ids.tenantId,
      workspaceId: ids.workspaceId,
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperDeleteJobTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_delete_job',
  name: 'Lead Scraper Delete Job',
  description: 'Delete a scraping job by ID',
  version: '1.0.0',
  params: withBaseParams({
    jobId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Scraping job ID',
    },
  }),
  request: {
    url: (params) => {
      const jobId = requireStringParam(params.jobId, 'jobId')
      return buildLeadScraperUrl(params, `/jobs/${encodeURIComponent(jobId)}`)
    },
    method: 'DELETE',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const jobId = requireStringParam(params.jobId, 'jobId')
    const response = await client.deleteScrapingJobRaw({
      jobId,
      userId: ids.userId,
      orgId: ids.organizationId,
      tenantId: ids.tenantId,
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperDownloadJobResultsTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_download_job_results',
  name: 'Lead Scraper Download Job Results',
  description: 'Download scraping job results',
  version: '1.0.0',
  params: withBaseParams({
    jobId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Scraping job ID',
    },
  }),
  request: {
    url: (params) => {
      const jobId = requireStringParam(params.jobId, 'jobId')
      return buildLeadScraperUrl(params, `/jobs/${encodeURIComponent(jobId)}/download`)
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const quota = await fetchLeadScraperAccountUsage(client, ids.accountId)
    const jobId = requireStringParam(params.jobId, 'jobId')
    const response = await client.downloadScrapingResultsRaw({
      jobId,
      userId: ids.userId,
      orgId: ids.organizationId,
      tenantId: ids.tenantId,
    })
    const result = await leadScraperSdkResponse(response)
    return withLeadScraperMetadata(result, {
      cost: buildLeadScraperCost('download_results'),
      quota,
    })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

// Leads
export const leadScraperListLeadsTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_list_leads',
  name: 'Lead Scraper List Leads',
  description: 'List leads with optional filters',
  version: '1.0.0',
  params: withBaseParams({
    query: {
      type: 'object',
      required: false,
      visibility: 'user-or-llm',
      description: 'Lead list filters and pagination options',
    },
  }),
  request: {
    url: (params) => {
      const qs = buildQueryString(params.query, 'query')
      return buildLeadScraperUrl(params, `/leads${qs}`)
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const query = normalizeJsonInput<Record<string, unknown>>(params.query, 'query') || {}
    const response = await client.listLeadsRaw({
      organizationId: ids.organizationId,
      tenantId: ids.tenantId,
      ...(query as Record<string, any>),
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperGetLeadTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_get_lead',
  name: 'Lead Scraper Get Lead',
  description: 'Get lead details by ID',
  version: '1.0.0',
  params: withBaseParams({
    leadId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Lead ID',
    },
  }),
  request: {
    url: (params) => {
      const leadId = requireStringParam(params.leadId, 'leadId')
      return buildLeadScraperUrl(params, `/leads/${encodeURIComponent(leadId)}`)
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const leadId = requireStringParam(params.leadId, 'leadId')
    const response = await client.getLeadRaw({
      leadId,
      organizationId: ids.organizationId,
      tenantId: ids.tenantId,
      workspaceId: ids.workspaceId,
      accountId: ids.accountId,
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperGetLeadStatsTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_get_lead_stats',
  name: 'Lead Scraper Get Lead Stats',
  description: 'Get aggregated lead statistics for a workspace',
  version: '1.0.0',
  params: withBaseParams({
    query: {
      type: 'object',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional filters such as time range or location',
    },
  }),
  request: {
    url: (params) => {
      const { organizationId } = resolveLeadScraperContext(params, {
        requireOrganizationId: true,
        requireTenantId: true,
      })
      const qs = buildQueryString(params.query, 'query')
      return buildLeadScraperUrl(
        params,
        `/workspaces/${encodeURIComponent(String(organizationId))}/stats/leads${qs}`
      )
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const query = normalizeJsonInput<Record<string, unknown>>(params.query, 'query') || {}
    const response = await client.getLeadStatsRaw({
      workspaceId: ids.workspaceId,
      organizationId: ids.organizationId,
      tenantId: ids.tenantId,
      accountId: ids.accountId,
      ...(query as Record<string, any>),
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

// Lead Lists
export const leadScraperCreateLeadListTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_create_lead_list',
  name: 'Lead Scraper Create Lead List',
  description: 'Create a lead list',
  version: '1.0.0',
  params: withBaseParams({
    request: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Lead list creation payload',
    },
  }),
  request: {
    url: (params) => {
      const { organizationId, tenantId } = resolveLeadScraperContext(params, {
        requireOrganizationId: true,
        requireTenantId: true,
      })
      return buildLeadScraperUrl(
        params,
        `/workspaces/${encodeURIComponent(String(organizationId))}/accounts/${encodeURIComponent(
          String(tenantId)
        )}/lead-lists`
      )
    },
    method: 'POST',
    headers: requiredHeaders,
    body: (params) => requireJsonInput(params.request, 'request'),
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const request = requireJsonInput<Record<string, any>>(params.request, 'request')
    const response = await leadScraperSdkRequest(client, {
      path: buildLeadScraperSdkPath(
        params,
        `/workspaces/${encodeURIComponent(ids.organizationId)}/accounts/${encodeURIComponent(
          ids.tenantId
        )}/lead-lists`
      ),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: request,
    })
    return leadScraperSdkResponse({ raw: response })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperListLeadListsTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_list_lead_lists',
  name: 'Lead Scraper List Lead Lists',
  description: 'List lead lists for a workspace account',
  version: '1.0.0',
  params: withBaseParams({
    query: {
      type: 'object',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional filters and pagination',
    },
  }),
  request: {
    url: (params) => {
      const { organizationId, tenantId } = resolveLeadScraperContext(params, {
        requireOrganizationId: true,
        requireTenantId: true,
      })
      const qs = buildQueryString(params.query, 'query')
      return buildLeadScraperUrl(
        params,
        `/workspaces/${encodeURIComponent(String(organizationId))}/accounts/${encodeURIComponent(
          String(tenantId)
        )}/lead-lists${qs}`
      )
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const query = normalizeJsonInput<Record<string, unknown>>(params.query, 'query') || {}
    const response = await leadScraperSdkRequest(client, {
      path: buildLeadScraperSdkPath(
        params,
        `/workspaces/${encodeURIComponent(ids.organizationId)}/accounts/${encodeURIComponent(
          ids.tenantId
        )}/lead-lists`
      ),
      method: 'GET',
      query: query as Record<string, any>,
    })
    return leadScraperSdkResponse({ raw: response })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperGetLeadListTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_get_lead_list',
  name: 'Lead Scraper Get Lead List',
  description: 'Get a lead list by ID',
  version: '1.0.0',
  params: withBaseParams({
    leadListId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Lead list ID',
    },
  }),
  request: {
    url: (params) => {
      const { organizationId, tenantId } = resolveLeadScraperContext(params, {
        requireOrganizationId: true,
        requireTenantId: true,
      })
      const leadListId = requireStringParam(params.leadListId, 'leadListId')
      return buildLeadScraperUrl(
        params,
        `/workspaces/${encodeURIComponent(String(organizationId))}/accounts/${encodeURIComponent(
          String(tenantId)
        )}/lead-lists/${encodeURIComponent(leadListId)}`
      )
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const leadListId = requireStringParam(params.leadListId, 'leadListId')
    const response = await leadScraperSdkRequest(client, {
      path: buildLeadScraperSdkPath(
        params,
        `/workspaces/${encodeURIComponent(ids.organizationId)}/accounts/${encodeURIComponent(
          ids.tenantId
        )}/lead-lists/${encodeURIComponent(leadListId)}`
      ),
      method: 'GET',
    })
    return leadScraperSdkResponse({ raw: response })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperUpdateLeadListTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_update_lead_list',
  name: 'Lead Scraper Update Lead List',
  description: 'Update a lead list',
  version: '1.0.0',
  params: withBaseParams({
    update: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Lead list update payload',
    },
  }),
  request: {
    url: (params) => buildLeadScraperUrl(params, '/workspaces/accounts/lead-lists'),
    method: 'PUT',
    headers: requiredHeaders,
    body: (params) => requireJsonInput(params.update, 'update'),
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const update = requireJsonInput<Record<string, any>>(params.update, 'update')
    const response = await leadScraperSdkRequest(client, {
      path: buildLeadScraperSdkPath(params, '/workspaces/accounts/lead-lists'),
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: update,
    })
    return leadScraperSdkResponse({ raw: response })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperDeleteLeadListTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_delete_lead_list',
  name: 'Lead Scraper Delete Lead List',
  description: 'Delete a lead list',
  version: '1.0.0',
  params: withBaseParams({
    leadListId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Lead list ID',
    },
  }),
  request: {
    url: (params) => {
      const { organizationId, tenantId } = resolveLeadScraperContext(params, {
        requireOrganizationId: true,
        requireTenantId: true,
      })
      const leadListId = requireStringParam(params.leadListId, 'leadListId')
      return buildLeadScraperUrl(
        params,
        `/workspaces/${encodeURIComponent(String(organizationId))}/accounts/${encodeURIComponent(
          String(tenantId)
        )}/lead-lists/${encodeURIComponent(leadListId)}`
      )
    },
    method: 'DELETE',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const leadListId = requireStringParam(params.leadListId, 'leadListId')
    const response = await leadScraperSdkRequest(client, {
      path: buildLeadScraperSdkPath(
        params,
        `/workspaces/${encodeURIComponent(ids.organizationId)}/accounts/${encodeURIComponent(
          ids.tenantId
        )}/lead-lists/${encodeURIComponent(leadListId)}`
      ),
      method: 'DELETE',
    })
    return leadScraperSdkResponse({ raw: response })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperAddLeadsToListTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_add_leads_to_list',
  name: 'Lead Scraper Add Leads To List',
  description: 'Add leads to a list',
  version: '1.0.0',
  params: withBaseParams({
    leadListId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Lead list ID',
    },
    request: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Payload containing lead IDs to add',
    },
  }),
  request: {
    url: (params) => {
      const { organizationId, tenantId } = resolveLeadScraperContext(params, {
        requireOrganizationId: true,
        requireTenantId: true,
      })
      const leadListId = requireStringParam(params.leadListId, 'leadListId')
      return buildLeadScraperUrl(
        params,
        `/workspaces/${encodeURIComponent(String(organizationId))}/accounts/${encodeURIComponent(
          String(tenantId)
        )}/lead-lists/${encodeURIComponent(leadListId)}/leads`
      )
    },
    method: 'POST',
    headers: requiredHeaders,
    body: (params) => requireJsonInput(params.request, 'request'),
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const leadListId = requireStringParam(params.leadListId, 'leadListId')
    const request = requireJsonInput<Record<string, any>>(params.request, 'request')
    const response = await leadScraperSdkRequest(client, {
      path: buildLeadScraperSdkPath(
        params,
        `/workspaces/${encodeURIComponent(ids.organizationId)}/accounts/${encodeURIComponent(
          ids.tenantId
        )}/lead-lists/${encodeURIComponent(leadListId)}/leads`
      ),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: request,
    })
    return leadScraperSdkResponse({ raw: response })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperRemoveLeadsFromListTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_remove_leads_from_list',
  name: 'Lead Scraper Remove Leads From List',
  description: 'Remove leads from a list',
  version: '1.0.0',
  params: withBaseParams({
    leadListId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Lead list ID',
    },
    request: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Payload containing lead IDs to remove',
    },
  }),
  request: {
    url: (params) => {
      const { organizationId, tenantId } = resolveLeadScraperContext(params, {
        requireOrganizationId: true,
        requireTenantId: true,
      })
      const leadListId = requireStringParam(params.leadListId, 'leadListId')
      return buildLeadScraperUrl(
        params,
        `/workspaces/${encodeURIComponent(String(organizationId))}/accounts/${encodeURIComponent(
          String(tenantId)
        )}/lead-lists/${encodeURIComponent(leadListId)}/leads/remove`
      )
    },
    method: 'POST',
    headers: requiredHeaders,
    body: (params) => requireJsonInput(params.request, 'request'),
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const leadListId = requireStringParam(params.leadListId, 'leadListId')
    const request = requireJsonInput<Record<string, any>>(params.request, 'request')
    const response = await leadScraperSdkRequest(client, {
      path: buildLeadScraperSdkPath(
        params,
        `/workspaces/${encodeURIComponent(ids.organizationId)}/accounts/${encodeURIComponent(
          ids.tenantId
        )}/lead-lists/${encodeURIComponent(leadListId)}/leads/remove`
      ),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: request,
    })
    return leadScraperSdkResponse({ raw: response })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperGetLeadsInListTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_get_leads_in_list',
  name: 'Lead Scraper Get Leads In List',
  description: 'List leads in a lead list',
  version: '1.0.0',
  params: withBaseParams({
    leadListId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Lead list ID',
    },
    query: {
      type: 'object',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional filters and pagination',
    },
  }),
  request: {
    url: (params) => {
      const { organizationId, tenantId } = resolveLeadScraperContext(params, {
        requireOrganizationId: true,
        requireTenantId: true,
      })
      const leadListId = requireStringParam(params.leadListId, 'leadListId')
      const qs = buildQueryString(params.query, 'query')
      return buildLeadScraperUrl(
        params,
        `/workspaces/${encodeURIComponent(String(organizationId))}/accounts/${encodeURIComponent(
          String(tenantId)
        )}/lead-lists/${encodeURIComponent(leadListId)}/leads${qs}`
      )
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const leadListId = requireStringParam(params.leadListId, 'leadListId')
    const query = normalizeJsonInput<Record<string, unknown>>(params.query, 'query') || {}
    const response = await leadScraperSdkRequest(client, {
      path: buildLeadScraperSdkPath(
        params,
        `/workspaces/${encodeURIComponent(ids.organizationId)}/accounts/${encodeURIComponent(
          ids.tenantId
        )}/lead-lists/${encodeURIComponent(leadListId)}/leads`
      ),
      method: 'GET',
      query: query as Record<string, any>,
    })
    return leadScraperSdkResponse({ raw: response })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperReorderLeadsInListTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_reorder_leads_in_list',
  name: 'Lead Scraper Reorder Leads In List',
  description: 'Reorder leads within a list',
  version: '1.0.0',
  params: withBaseParams({
    leadListId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Lead list ID',
    },
    request: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Payload defining lead ordering',
    },
  }),
  request: {
    url: (params) => {
      const { organizationId, tenantId } = resolveLeadScraperContext(params, {
        requireOrganizationId: true,
        requireTenantId: true,
      })
      const leadListId = requireStringParam(params.leadListId, 'leadListId')
      return buildLeadScraperUrl(
        params,
        `/workspaces/${encodeURIComponent(String(organizationId))}/accounts/${encodeURIComponent(
          String(tenantId)
        )}/lead-lists/${encodeURIComponent(leadListId)}/leads/reorder`
      )
    },
    method: 'PUT',
    headers: requiredHeaders,
    body: (params) => requireJsonInput(params.request, 'request'),
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const leadListId = requireStringParam(params.leadListId, 'leadListId')
    const request = requireJsonInput<Record<string, any>>(params.request, 'request')
    const response = await leadScraperSdkRequest(client, {
      path: buildLeadScraperSdkPath(
        params,
        `/workspaces/${encodeURIComponent(ids.organizationId)}/accounts/${encodeURIComponent(
          ids.tenantId
        )}/lead-lists/${encodeURIComponent(leadListId)}/leads/reorder`
      ),
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: request,
    })
    return leadScraperSdkResponse({ raw: response })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperBulkAddToListsTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_bulk_add_to_lists',
  name: 'Lead Scraper Bulk Add To Lists',
  description: 'Add multiple leads to multiple lists',
  version: '1.0.0',
  params: withBaseParams({
    request: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Bulk add payload',
    },
  }),
  request: {
    url: (params) => {
      const { organizationId, tenantId } = resolveLeadScraperContext(params, {
        requireOrganizationId: true,
        requireTenantId: true,
      })
      return buildLeadScraperUrl(
        params,
        `/workspaces/${encodeURIComponent(String(organizationId))}/accounts/${encodeURIComponent(
          String(tenantId)
        )}/lead-lists/bulk-add`
      )
    },
    method: 'POST',
    headers: requiredHeaders,
    body: (params) => requireJsonInput(params.request, 'request'),
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const request = requireJsonInput<Record<string, any>>(params.request, 'request')
    const response = await leadScraperSdkRequest(client, {
      path: buildLeadScraperSdkPath(
        params,
        `/workspaces/${encodeURIComponent(ids.organizationId)}/accounts/${encodeURIComponent(
          ids.tenantId
        )}/lead-lists/bulk-add`
      ),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: request,
    })
    return leadScraperSdkResponse({ raw: response })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

// Saved Searches
export const leadScraperCreateSavedSearchTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_create_saved_search',
  name: 'Lead Scraper Create Saved Search',
  description: 'Create a saved search',
  version: '1.0.0',
  params: withBaseParams({
    request: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Saved search creation payload',
    },
  }),
  request: {
    url: (params) => buildLeadScraperUrl(params, '/saved-searches'),
    method: 'POST',
    headers: requiredHeaders,
    body: (params) => requireJsonInput(params.request, 'request'),
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const request = requireJsonInput<Record<string, any>>(params.request, 'request')
    const name = requireStringParam(request?.name, 'name')
    const response = await client.createSavedSearchRaw({
      createSavedSearchRequest: {
        organizationId: ids.organizationId,
        workspaceId: ids.workspaceId,
        tenantId: ids.tenantId,
        accountId: ids.accountId,
        name,
        ...request,
      },
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperListSavedSearchesTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_list_saved_searches',
  name: 'Lead Scraper List Saved Searches',
  description: 'List saved searches',
  version: '1.0.0',
  params: withBaseParams({
    query: {
      type: 'object',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional pagination filters',
    },
  }),
  request: {
    url: (params) => {
      const qs = buildQueryString(params.query, 'query')
      return buildLeadScraperUrl(params, `/saved-searches${qs}`)
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const query = normalizeJsonInput<Record<string, unknown>>(params.query, 'query') || {}
    const response = await client.listSavedSearchesRaw({
      organizationId: ids.organizationId,
      workspaceId: ids.workspaceId,
      tenantId: ids.tenantId,
      accountId: ids.accountId,
      ...(query as Record<string, any>),
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperGetSavedSearchTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_get_saved_search',
  name: 'Lead Scraper Get Saved Search',
  description: 'Get a saved search by ID',
  version: '1.0.0',
  params: withBaseParams({
    savedSearchId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Saved search ID',
    },
  }),
  request: {
    url: (params) => {
      const savedSearchId = requireStringParam(params.savedSearchId, 'savedSearchId')
      return buildLeadScraperUrl(params, `/saved-searches/${encodeURIComponent(savedSearchId)}`)
    },
    method: 'GET',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const savedSearchId = requireStringParam(params.savedSearchId, 'savedSearchId')
    const response = await client.getSavedSearchRaw({
      savedSearchId,
      organizationId: ids.organizationId,
      workspaceId: ids.workspaceId,
      tenantId: ids.tenantId,
      accountId: ids.accountId,
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperUpdateSavedSearchTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_update_saved_search',
  name: 'Lead Scraper Update Saved Search',
  description: 'Update a saved search',
  version: '1.0.0',
  params: withBaseParams({
    update: {
      type: 'object',
      required: true,
      visibility: 'user-or-llm',
      description: 'Saved search update payload',
    },
  }),
  request: {
    url: (params) => buildLeadScraperUrl(params, '/saved-searches'),
    method: 'PUT',
    headers: requiredHeaders,
    body: (params) => requireJsonInput(params.update, 'update'),
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const update = requireJsonInput<Record<string, any>>(params.update, 'update')
    const response = await client.updateSavedSearchRaw({
      updateSavedSearchRequest: update,
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperDeleteSavedSearchTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_delete_saved_search',
  name: 'Lead Scraper Delete Saved Search',
  description: 'Delete a saved search by ID',
  version: '1.0.0',
  params: withBaseParams({
    savedSearchId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Saved search ID',
    },
  }),
  request: {
    url: (params) => {
      const savedSearchId = requireStringParam(params.savedSearchId, 'savedSearchId')
      return buildLeadScraperUrl(params, `/saved-searches/${encodeURIComponent(savedSearchId)}`)
    },
    method: 'DELETE',
    headers: requiredHeaders,
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const savedSearchId = requireStringParam(params.savedSearchId, 'savedSearchId')
    const response = await client.deleteSavedSearchRaw({
      savedSearchId,
      organizationId: ids.organizationId,
      workspaceId: ids.workspaceId,
      tenantId: ids.tenantId,
      accountId: ids.accountId,
    })
    return leadScraperSdkResponse(response)
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}

export const leadScraperExecuteSavedSearchTool: ToolConfig<
  LeadScraperRequestParams,
  LeadScraperResponse
> = {
  id: 'lead_scraper_execute_saved_search',
  name: 'Lead Scraper Execute Saved Search',
  description: 'Execute a saved search',
  version: '1.0.0',
  params: withBaseParams({
    savedSearchId: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Saved search ID',
    },
    query: {
      type: 'object',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional pagination settings',
    },
    request: {
      type: 'object',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional execution payload',
    },
  }),
  request: {
    url: (params) => {
      const savedSearchId = requireStringParam(params.savedSearchId, 'savedSearchId')
      const qs = buildQueryString(params.query, 'query')
      return buildLeadScraperUrl(
        params,
        `/saved-searches/${encodeURIComponent(savedSearchId)}/execute${qs}`
      )
    },
    method: 'POST',
    headers: requiredHeaders,
    body: (params) => {
      const body = normalizeJsonInput(params.request, 'request')
      return body ?? {}
    },
  },
  directExecution: async (params) => {
    const client = createLeadScraperSdkClient(params, {
      requireOrganizationId: true,
      requireTenantId: true,
    })
    const ids = resolveLeadScraperSdkIds(params)
    const quota = await fetchLeadScraperAccountUsage(client, ids.accountId)
    enforceLeadScraperJobQuota(quota)
    const savedSearchId = requireStringParam(params.savedSearchId, 'savedSearchId')
    const query = normalizeJsonInput<Record<string, unknown>>(params.query, 'query') || {}
    const response = await client.executeSavedSearchRaw({
      savedSearchId,
      organizationId: ids.organizationId,
      workspaceId: ids.workspaceId,
      tenantId: ids.tenantId,
      accountId: ids.accountId,
      ...(query as Record<string, any>),
    })
    const result = await leadScraperSdkResponse(response)
    return withLeadScraperMetadata(result, {
      cost: buildLeadScraperCost('execute_saved_search'),
      quota: decrementLeadScraperJobQuota(quota),
    })
  },
  transformResponse: leadScraperResponse,
  outputs: leadScraperOutputs,
}
