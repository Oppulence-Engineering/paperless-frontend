import { SearchIcon } from '@/components/icons'
import { AuthMode, type BlockConfig } from '@/blocks/types'
import type { LeadScraperResponse } from '@/tools/lead_scraper/types'

const leadScraperOperations = [
  { label: 'Jobs: Create Job', id: 'lead_scraper_create_job' },
  { label: 'Jobs: List Jobs', id: 'lead_scraper_list_jobs' },
  { label: 'Jobs: Get Job', id: 'lead_scraper_get_job' },
  { label: 'Jobs: Delete Job', id: 'lead_scraper_delete_job' },
  { label: 'Jobs: Download Results', id: 'lead_scraper_download_job_results' },
  { label: 'Leads: List Leads', id: 'lead_scraper_list_leads' },
  { label: 'Leads: Get Lead', id: 'lead_scraper_get_lead' },
  { label: 'Leads: Lead Stats', id: 'lead_scraper_get_lead_stats' },
  { label: 'Lead Lists: Create List', id: 'lead_scraper_create_lead_list' },
  { label: 'Lead Lists: List Lists', id: 'lead_scraper_list_lead_lists' },
  { label: 'Lead Lists: Get List', id: 'lead_scraper_get_lead_list' },
  { label: 'Lead Lists: Update List', id: 'lead_scraper_update_lead_list' },
  { label: 'Lead Lists: Delete List', id: 'lead_scraper_delete_lead_list' },
  { label: 'Lead Lists: Add Leads', id: 'lead_scraper_add_leads_to_list' },
  { label: 'Lead Lists: Remove Leads', id: 'lead_scraper_remove_leads_from_list' },
  { label: 'Lead Lists: Get Leads', id: 'lead_scraper_get_leads_in_list' },
  { label: 'Lead Lists: Reorder Leads', id: 'lead_scraper_reorder_leads_in_list' },
  { label: 'Lead Lists: Bulk Add', id: 'lead_scraper_bulk_add_to_lists' },
  { label: 'Saved Searches: Create', id: 'lead_scraper_create_saved_search' },
  { label: 'Saved Searches: List', id: 'lead_scraper_list_saved_searches' },
  { label: 'Saved Searches: Get', id: 'lead_scraper_get_saved_search' },
  { label: 'Saved Searches: Update', id: 'lead_scraper_update_saved_search' },
  { label: 'Saved Searches: Delete', id: 'lead_scraper_delete_saved_search' },
  { label: 'Saved Searches: Execute', id: 'lead_scraper_execute_saved_search' },
]

const leadScraperToolIds = leadScraperOperations.map((operation) => operation.id)

const jobIdOperations = [
  'lead_scraper_get_job',
  'lead_scraper_delete_job',
  'lead_scraper_download_job_results',
]

const leadListIdOperations = [
  'lead_scraper_get_lead_list',
  'lead_scraper_delete_lead_list',
  'lead_scraper_add_leads_to_list',
  'lead_scraper_remove_leads_from_list',
  'lead_scraper_get_leads_in_list',
  'lead_scraper_reorder_leads_in_list',
]

const savedSearchIdOperations = [
  'lead_scraper_get_saved_search',
  'lead_scraper_delete_saved_search',
  'lead_scraper_execute_saved_search',
]

const requiredRequestOperations = [
  'lead_scraper_create_job',
  'lead_scraper_create_lead_list',
  'lead_scraper_add_leads_to_list',
  'lead_scraper_remove_leads_from_list',
  'lead_scraper_reorder_leads_in_list',
  'lead_scraper_bulk_add_to_lists',
  'lead_scraper_create_saved_search',
]

const requestOperations = [
  ...requiredRequestOperations,
  'lead_scraper_execute_saved_search',
]

const updateOperations = ['lead_scraper_update_lead_list', 'lead_scraper_update_saved_search']

const queryOperations = [
  'lead_scraper_list_jobs',
  'lead_scraper_list_leads',
  'lead_scraper_get_lead_stats',
  'lead_scraper_list_lead_lists',
  'lead_scraper_get_leads_in_list',
  'lead_scraper_list_saved_searches',
  'lead_scraper_execute_saved_search',
]

export const LeadScraperBlock: BlockConfig<LeadScraperResponse> = {
  type: 'lead_scraper',
  name: 'Lead Scraper',
  description: 'Create scraping jobs and manage leads',
  authMode: AuthMode.ApiKey,
  longDescription:
    'Integrate Lead Scraper into the workflow. Create scraping jobs, query leads, manage lead lists, and execute saved searches.',
  docsLink: 'https://docs.sim.ai/tools/lead-scraper',
  category: 'tools',
  bgColor: '#E0F2FE',
  icon: SearchIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: leadScraperOperations,
      value: () => 'lead_scraper_create_job',
    },
    {
      id: 'organizationId',
      title: 'Organization ID',
      type: 'short-input',
      placeholder: 'Lead Scraper organization/workspace ID',
      required: false,
    },
    {
      id: 'tenantId',
      title: 'Tenant ID',
      type: 'short-input',
      placeholder: 'Lead Scraper tenant/account ID',
      required: false,
    },
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      placeholder: 'Lead Scraper API key',
      password: true,
      required: true,
    },
    {
      id: 'baseUrl',
      title: 'Base URL',
      type: 'short-input',
      placeholder: 'http://localhost:8081',
    },
    {
      id: 'apiPrefix',
      title: 'API Prefix',
      type: 'short-input',
      placeholder: '/lead-scraper-microservice/api/v1',
    },
    {
      id: 'jobId',
      title: 'Job ID',
      type: 'short-input',
      placeholder: 'Scraping job ID',
      required: {
        field: 'operation',
        value: jobIdOperations,
      },
      condition: { field: 'operation', value: jobIdOperations },
    },
    {
      id: 'leadId',
      title: 'Lead ID',
      type: 'short-input',
      placeholder: 'Lead ID',
      required: {
        field: 'operation',
        value: 'lead_scraper_get_lead',
      },
      condition: { field: 'operation', value: 'lead_scraper_get_lead' },
    },
    {
      id: 'leadListId',
      title: 'Lead List ID',
      type: 'short-input',
      placeholder: 'Lead list ID',
      required: {
        field: 'operation',
        value: leadListIdOperations,
      },
      condition: { field: 'operation', value: leadListIdOperations },
    },
    {
      id: 'savedSearchId',
      title: 'Saved Search ID',
      type: 'short-input',
      placeholder: 'Saved search ID',
      required: {
        field: 'operation',
        value: savedSearchIdOperations,
      },
      condition: { field: 'operation', value: savedSearchIdOperations },
    },
    {
      id: 'request',
      title: 'Request (JSON)',
      type: 'code',
      language: 'json',
      placeholder: '{\n  "name": "Coffee shops in NYC",\n  "keywords": ["coffee"]\n}',
      required: {
        field: 'operation',
        value: requiredRequestOperations,
      },
      condition: { field: 'operation', value: requestOperations },
    },
    {
      id: 'update',
      title: 'Update (JSON)',
      type: 'code',
      language: 'json',
      placeholder: '{\n  "id": "list-id",\n  "name": "Updated list name"\n}',
      required: {
        field: 'operation',
        value: updateOperations,
      },
      condition: { field: 'operation', value: updateOperations },
    },
    {
      id: 'query',
      title: 'Query (JSON)',
      type: 'code',
      language: 'json',
      placeholder: '{\n  "page": 1,\n  "pageSize": 25\n}',
      condition: { field: 'operation', value: queryOperations },
    },
  ],
  tools: {
    access: leadScraperToolIds,
    config: {
      tool: (params) => params.operation,
      params: (params: Record<string, any>) => {
        const {
          apiKey,
          baseUrl,
          apiPrefix,
          organizationId,
          tenantId,
          jobId,
          leadId,
          leadListId,
          savedSearchId,
          request,
          update,
          query,
        } = params

        const result: Record<string, any> = {
          apiKey,
          organizationId,
          tenantId,
        }

        if (baseUrl) result.baseUrl = baseUrl
        if (apiPrefix) result.apiPrefix = apiPrefix
        if (jobId) result.jobId = jobId
        if (leadId) result.leadId = leadId
        if (leadListId) result.leadListId = leadListId
        if (savedSearchId) result.savedSearchId = savedSearchId
        if (request) result.request = request
        if (update) result.update = update
        if (query) result.query = query

        return result
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
    organizationId: { type: 'string', description: 'Lead Scraper organization/workspace ID' },
    tenantId: { type: 'string', description: 'Lead Scraper tenant/account ID' },
    apiKey: { type: 'string', description: 'Lead Scraper API key' },
    baseUrl: { type: 'string', description: 'Lead Scraper base URL override' },
    apiPrefix: { type: 'string', description: 'Lead Scraper API prefix override' },
    jobId: { type: 'string', description: 'Scraping job ID' },
    leadId: { type: 'string', description: 'Lead ID' },
    leadListId: { type: 'string', description: 'Lead list ID' },
    savedSearchId: { type: 'string', description: 'Saved search ID' },
    request: { type: 'json', description: 'Request payload' },
    update: { type: 'json', description: 'Update payload' },
    query: { type: 'json', description: 'Query filters or pagination' },
  },
  outputs: {
    data: { type: 'json', description: 'Lead Scraper response payload' },
    status: { type: 'number', description: 'HTTP status code' },
    headers: { type: 'json', description: 'Response headers' },
  },
}
