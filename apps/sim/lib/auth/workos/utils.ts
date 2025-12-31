/**
 * WorkOS Utility Functions
 *
 * Helper functions for WorkOS integration including URL validation
 * and security utilities.
 *
 * @module lib/auth/workos/utils
 */

import { getBaseUrl } from '@/lib/core/utils/urls'

/**
 * Validates that a callback URL is safe to redirect to.
 * Only allows relative paths or same-origin URLs to prevent open redirect attacks.
 *
 * @param url - The URL to validate
 * @returns The validated URL, or a safe default if invalid
 */
export function validateCallbackUrl(url: string | undefined | null): string {
  const defaultUrl = '/workspace'

  if (!url) {
    return defaultUrl
  }

  // Allow relative paths starting with /
  if (url.startsWith('/') && !url.startsWith('//')) {
    // Prevent path traversal and ensure it's a simple path
    const sanitized = url.split('?')[0]?.split('#')[0] ?? ''
    if (!sanitized.includes('..') && !sanitized.includes('\\')) {
      return url
    }
    return defaultUrl
  }

  // Check if it's a same-origin URL
  try {
    const baseUrl = getBaseUrl()
    const targetUrl = new URL(url, baseUrl)
    const base = new URL(baseUrl)

    // Only allow same origin
    if (targetUrl.origin === base.origin) {
      return targetUrl.pathname + targetUrl.search + targetUrl.hash
    }
  } catch {
    // Invalid URL format
  }

  return defaultUrl
}

/**
 * Validates a return URL for the Admin Portal.
 * Only allows same-origin URLs.
 *
 * @param url - The URL to validate
 * @returns The validated URL or undefined if invalid
 */
export function validateReturnUrl(url: string | undefined | null): string | undefined {
  if (!url) {
    return undefined
  }

  try {
    const baseUrl = getBaseUrl()
    const targetUrl = new URL(url, baseUrl)
    const base = new URL(baseUrl)

    // Only allow same origin
    if (targetUrl.origin === base.origin) {
      return url
    }
  } catch {
    // Invalid URL format
  }

  return undefined
}

/**
 * Validates the CSRF state token.
 * Checks that the timestamp is within an acceptable window (5 minutes).
 * Rejects tokens with future timestamps (potential replay attack).
 *
 * @param state - The base64url encoded state string
 * @returns The parsed state data if valid, null otherwise
 */
export function validateStateToken(
  state: string | null
): { callbackUrl: string; timestamp: number } | null {
  if (!state) {
    return null
  }

  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())

    // Validate structure
    if (typeof stateData.timestamp !== 'number') {
      return null
    }

    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    const clockSkewAllowance = 30 * 1000 // 30 seconds for clock skew

    // Reject timestamps in the future (with small allowance for clock skew)
    if (stateData.timestamp > now + clockSkewAllowance) {
      return null
    }

    // Check timestamp is not too old (expired)
    if (now - stateData.timestamp > fiveMinutes) {
      return null
    }

    // Validate callbackUrl
    const callbackUrl = validateCallbackUrl(stateData.callbackUrl)

    return {
      callbackUrl,
      timestamp: stateData.timestamp,
    }
  } catch {
    return null
  }
}

