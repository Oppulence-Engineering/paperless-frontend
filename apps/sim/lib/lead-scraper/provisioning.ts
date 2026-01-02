import { db } from '@sim/db'
import { workspaceEnvironment } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { encryptSecret } from '@/lib/core/security/encryption'

const logger = createLogger('LeadScraperProvisioning')

const DEFAULT_BASE_URL = 'http://localhost:8081'
const DEFAULT_API_PREFIX = '/lead-scraper-microservice/api/v1'

/** Environment variable key for storing the Lead Scraper organization ID (required for API auth) */
export const LEAD_SCRAPER_ORGANIZATION_ID_ENV_KEY = 'LEAD_SCRAPER_ORGANIZATION_ID'

/** Environment variable key for storing the Lead Scraper tenant ID (required for API auth) */
export const LEAD_SCRAPER_TENANT_ID_ENV_KEY = 'LEAD_SCRAPER_TENANT_ID'

// Keep old constant for backwards compatibility
const LEAD_SCRAPER_TENANT_ENV_KEY = LEAD_SCRAPER_TENANT_ID_ENV_KEY
const leadScraperEnvSchema = z.object({
  apiKey: z.string().min(1),
  baseUrl: z.string().url(),
  apiPrefix: z.string().min(1),
})

const provisionInputSchema = z.object({
  userId: z.string().min(1),
  userEmail: z.string().email().optional(),
  workspaceId: z.string().min(1),
  workspaceName: z.string().min(1),
})

const createOrganizationPayloadSchema = z.object({
  organization: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    displayName: z.string().min(1).optional(),
  }),
})

const createAccountPayloadSchema = z.object({
  organizationId: z.string().min(1),
  account: z.object({
    authPlatformUserId: z.string().min(1),
    email: z.string().email().optional(),
  }),
  initialWorkspaceName: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
})

const createTenantPayloadSchema = z.object({
  tenant: z
    .object({
      name: z.string().min(1).optional(),
      displayName: z.string().min(1).optional(),
    })
    .optional(),
})

const createTenantResponseSchema = z
  .object({
    tenantId: z.string().optional(),
  })
  .passthrough()

const listTenantsResponseSchema = z
  .object({
    tenants: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z.string().optional(),
          displayName: z.string().optional(),
        })
      )
      .optional(),
  })
  .passthrough()

const createAccountResponseSchema = z
  .object({
    account: z
      .object({
        id: z.string().optional(),
        authPlatformUserId: z.string().optional(),
      })
      .optional(),
    tenantId: z.string().optional(),
    tenant: z
      .object({
        id: z.string().optional(),
      })
      .optional(),
  })
  .passthrough()

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '')

const normalizeApiPrefix = (prefix: string) => {
  const trimmed = prefix.trim()
  if (!trimmed) return ''
  const cleaned = trimmed.replace(/^\/+|\/+$/g, '')
  return cleaned ? `/${cleaned}` : ''
}

const buildLeadScraperUrl = (baseUrl: string, apiPrefix: string, path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizeBaseUrl(baseUrl)}${normalizeApiPrefix(apiPrefix)}${normalizedPath}`
}

const resolveLeadScraperConfig = () => {
  const configInput = {
    apiKey: process.env.LEAD_SCRAPER_API_KEY,
    baseUrl: process.env.LEAD_SCRAPER_BASE_URL || DEFAULT_BASE_URL,
    apiPrefix: process.env.LEAD_SCRAPER_API_PREFIX || DEFAULT_API_PREFIX,
  }

  const parsed = leadScraperEnvSchema.safeParse(configInput)
  if (!parsed.success) {
    if (configInput.apiKey) {
      logger.warn('Lead Scraper config is invalid; skipping provisioning', {
        errors: parsed.error.flatten().fieldErrors,
      })
    }
    return null
  }

  return parsed.data
}

const readErrorResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      const data = await response.json()
      return typeof data === 'string' ? data : JSON.stringify(data)
    }
    return await response.text()
  } catch {
    return response.statusText
  }
}

const postLeadScraper = async (
  config: { apiKey: string; baseUrl: string; apiPrefix: string },
  path: string,
  body: unknown
) => {
  const url = buildLeadScraperUrl(config.baseUrl, config.apiPrefix, path)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    },
    body: JSON.stringify(body),
  })

  if (response.ok) {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return { ok: true, status: response.status, data: await response.json() }
    }
    return { ok: true, status: response.status }
  }

  return {
    ok: false,
    status: response.status,
    error: await readErrorResponse(response),
  }
}

const getLeadScraper = async (
  config: { apiKey: string; baseUrl: string; apiPrefix: string },
  path: string
) => {
  const url = buildLeadScraperUrl(config.baseUrl, config.apiPrefix, path)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    },
  })

  if (response.ok) {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return { ok: true, status: response.status, data: await response.json() }
    }
    return { ok: true, status: response.status }
  }

  return {
    ok: false,
    status: response.status,
    error: await readErrorResponse(response),
  }
}

const resolveTenantIdFromList = async (
  config: { apiKey: string; baseUrl: string; apiPrefix: string },
  organizationId: string,
  tenantName: string,
  tenantDisplayName?: string
) => {
  const listResult = await getLeadScraper(config, `/organization/tenants/${organizationId}`)
  if (!listResult.ok || !listResult.data) {
    return undefined
  }

  const parsedList = listTenantsResponseSchema.safeParse(listResult.data)
  if (!parsedList.success) {
    return undefined
  }

  const match = parsedList.data.tenants?.find((tenant) => {
    if (tenant.name === tenantName) return true
    if (tenantDisplayName && tenant.displayName === tenantDisplayName) return true
    return false
  })
  return match?.id
}

/**
 * Stores Lead Scraper organization ID and tenant ID in workspace environment variables.
 * Both values are encrypted before storage as they are required for API authentication.
 *
 * @param workspaceId - The workspace to store the IDs for
 * @param organizationId - The Lead Scraper organization ID
 * @param tenantId - The Lead Scraper tenant ID
 */
const upsertWorkspaceLeadScraperEnv = async (
  workspaceId: string,
  organizationId: string,
  tenantId: string
) => {
  const existingRows = await db
    .select()
    .from(workspaceEnvironment)
    .where(eq(workspaceEnvironment.workspaceId, workspaceId))
    .limit(1)

  const existingEncrypted = (existingRows[0]?.variables as Record<string, string>) || {}

  // Encrypt both organization ID and tenant ID
  const { encrypted: encryptedOrgId } = await encryptSecret(organizationId)
  const { encrypted: encryptedTenantId } = await encryptSecret(tenantId)

  const merged = {
    ...existingEncrypted,
    [LEAD_SCRAPER_ORGANIZATION_ID_ENV_KEY]: encryptedOrgId,
    [LEAD_SCRAPER_TENANT_ID_ENV_KEY]: encryptedTenantId,
  }

  await db
    .insert(workspaceEnvironment)
    .values({
      id: existingRows[0]?.id || crypto.randomUUID(),
      workspaceId,
      variables: merged,
      createdAt: existingRows[0]?.createdAt || new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [workspaceEnvironment.workspaceId],
      set: { variables: merged, updatedAt: new Date() },
    })
}

/**
 * @deprecated Use upsertWorkspaceLeadScraperEnv instead which stores both org ID and tenant ID
 */
const upsertWorkspaceTenantEnv = async (workspaceId: string, tenantId: string) => {
  // For backwards compatibility, also store the organization ID (which is the workspace ID)
  await upsertWorkspaceLeadScraperEnv(workspaceId, workspaceId, tenantId)
}

export type LeadScraperProvisioningResult =
  | {
      success: true
      organizationStatus: number
      tenantStatus: number
      accountStatus: number
      /** The organization ID used for Lead Scraper API authentication */
      organizationId: string
      /** The tenant ID used for Lead Scraper API authentication */
      tenantId?: string
    }
  | { success: false; skipped: true }
  | { success: false; error: string }

export const provisionLeadScraperAccountForWorkspaceOwner = async (
  input: z.input<typeof provisionInputSchema>
): Promise<LeadScraperProvisioningResult> => {
  const config = resolveLeadScraperConfig()
  if (!config) {
    return { success: false, skipped: true }
  }

  const parsedInput = provisionInputSchema.parse(input)

  const organizationPayload = createOrganizationPayloadSchema.parse({
    organization: {
      id: parsedInput.workspaceId,
      name: parsedInput.workspaceName,
      displayName: parsedInput.workspaceName,
    },
  })

  const organizationResult = await postLeadScraper(config, '/organization', organizationPayload)
  if (!organizationResult.ok && organizationResult.status !== 409) {
    const message = organizationResult.error || 'Lead Scraper organization provisioning failed'
    logger.error('Lead Scraper organization provisioning failed', {
      workspaceId: parsedInput.workspaceId,
      status: organizationResult.status,
      error: message,
    })
    return { success: false, error: message }
  }

  const tenantPayload = createTenantPayloadSchema.parse({
    tenant: {
      name: parsedInput.workspaceId,
      displayName: parsedInput.workspaceName,
    },
  })

  const tenantResult = await postLeadScraper(
    config,
    `/organizations/${parsedInput.workspaceId}/tenants`,
    tenantPayload
  )
  if (!tenantResult.ok && tenantResult.status !== 409) {
    const message = tenantResult.error || 'Lead Scraper tenant provisioning failed'
    logger.error('Lead Scraper tenant provisioning failed', {
      workspaceId: parsedInput.workspaceId,
      status: tenantResult.status,
      error: message,
    })
    return { success: false, error: message }
  }

  let tenantId: string | undefined
  if (tenantResult.ok && tenantResult.data) {
    const parsedResponse = createTenantResponseSchema.safeParse(tenantResult.data)
    tenantId = parsedResponse.success ? parsedResponse.data.tenantId : undefined
  }

  if (!tenantId) {
    tenantId = await resolveTenantIdFromList(
      config,
      parsedInput.workspaceId,
      parsedInput.workspaceId,
      parsedInput.workspaceName
    )
  }

  const accountPayload = createAccountPayloadSchema.parse({
    organizationId: parsedInput.workspaceId,
    account: {
      authPlatformUserId: parsedInput.userId,
      ...(parsedInput.userEmail ? { email: parsedInput.userEmail } : {}),
    },
    initialWorkspaceName: parsedInput.workspaceName,
    ...(tenantId ? { tenantId } : {}),
  })

  const accountResult = await postLeadScraper(config, '/accounts', accountPayload)
  if (!accountResult.ok && accountResult.status !== 409) {
    const message = accountResult.error || 'Lead Scraper account provisioning failed'
    logger.error('Lead Scraper account provisioning failed', {
      workspaceId: parsedInput.workspaceId,
      userId: parsedInput.userId,
      status: accountResult.status,
      error: message,
    })
    return { success: false, error: message }
  }

  if (!tenantId && accountResult.ok && accountResult.data) {
    const parsedResponse = createAccountResponseSchema.safeParse(accountResult.data)
    tenantId = parsedResponse.success
      ? parsedResponse.data.tenantId || parsedResponse.data.tenant?.id
      : undefined
  }

  // The organization ID is the workspace ID (used during provisioning)
  const organizationId = parsedInput.workspaceId

  if (tenantId) {
    try {
      // Store both organization ID and tenant ID in workspace environment
      await upsertWorkspaceLeadScraperEnv(parsedInput.workspaceId, organizationId, tenantId)
    } catch (error) {
      logger.warn('Failed to persist Lead Scraper IDs to workspace env', {
        workspaceId: parsedInput.workspaceId,
        organizationId,
        tenantId,
        error,
      })
    }
  }

  if (tenantId) {
    logger.info('Lead Scraper provisioning complete', {
      workspaceId: parsedInput.workspaceId,
      userId: parsedInput.userId,
      organizationId,
      tenantId,
    })
  }

  return {
    success: true,
    organizationStatus: organizationResult.status,
    tenantStatus: tenantResult.status,
    accountStatus: accountResult.status,
    organizationId,
    ...(tenantId ? { tenantId } : {}),
  }
}
