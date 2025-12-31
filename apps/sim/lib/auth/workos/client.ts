/**
 * WorkOS SDK Client
 *
 * Initializes and exports the WorkOS SDK client for enterprise authentication features.
 * This module provides a centralized client instance for SSO, Directory Sync, and Audit Logs.
 *
 * @module lib/auth/workos/client
 */

import { WorkOS } from '@workos-inc/node'
import { createLogger } from '@sim/logger'
import { env } from '@/lib/core/config/env'
import { isWorkOSEnabled } from './feature-flags'

const logger = createLogger('WorkOS:Client')

/**
 * WorkOS SDK client instance.
 * Initialized only when WorkOS is properly configured.
 */
let workosClient: WorkOS | null = null

/**
 * Retrieves the WorkOS client instance.
 * Creates a new instance if one doesn't exist and WorkOS is enabled.
 *
 * @returns The WorkOS client instance or null if not configured
 */
export function getWorkOSClient(): WorkOS | null {
  if (!isWorkOSEnabled()) {
    return null
  }

  if (!workosClient) {
    const apiKey = env.WORKOS_API_KEY

    if (!apiKey) {
      logger.warn('WorkOS API key not configured')
      return null
    }

    workosClient = new WorkOS(apiKey, {
      clientId: env.WORKOS_CLIENT_ID,
    })

    logger.info('WorkOS client initialized successfully')
  }

  return workosClient
}

/**
 * Type guard to check if WorkOS client is available.
 *
 * @returns True if WorkOS client is properly configured and available
 */
export function hasWorkOSClient(): boolean {
  return getWorkOSClient() !== null
}

/**
 * Gets the WorkOS client or throws an error if not available.
 * Use this when WorkOS features are required.
 *
 * @throws Error if WorkOS client is not configured
 * @returns The WorkOS client instance
 */
export function requireWorkOSClient(): WorkOS {
  const client = getWorkOSClient()

  if (!client) {
    throw new Error('WorkOS client is not configured. Please set WORKOS_API_KEY and WORKOS_CLIENT_ID.')
  }

  return client
}

export type { WorkOS }

