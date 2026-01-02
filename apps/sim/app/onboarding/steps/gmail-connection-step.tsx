'use client'

/**
 * @fileoverview Gmail connection step UI component for onboarding.
 *
 * This component handles the Gmail OAuth connection flow during onboarding:
 * 1. Checks if Gmail is already connected via the check-gmail API
 * 2. If not connected, displays a "Connect Gmail" button
 * 3. Initiates OAuth via betterAuth's client.oauth2.link()
 * 4. After OAuth callback, calls link-gmail API to associate with workspace
 * 5. Marks the step as complete
 *
 * The component handles:
 * - Initial connection status check
 * - OAuth flow initiation
 * - Callback detection via URL params
 * - Error states and retries
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { createLogger } from '@sim/logger'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Check, Loader2, Mail } from 'lucide-react'
import { cn } from '@/lib/core/utils/cn'
import { client } from '@/lib/auth/auth-client'

const logger = createLogger('GmailConnectionStep')

interface GmailConnectionStepProps {
  /** Workspace ID to link the Gmail account to */
  workspaceId: string
  /** Callback when step completes successfully */
  onComplete: (result: unknown, alreadyMarkedComplete?: boolean) => void
  /** Callback when step fails */
  onError: (error: Error) => void
}

type ConnectionStatus = 'checking' | 'not_connected' | 'connecting' | 'linking' | 'connected' | 'error'

interface ConnectedAccount {
  id: string
  displayName: string | null
  isPrimary: boolean
}

/**
 * Gmail connection step component.
 * Handles the OAuth flow for connecting Gmail accounts.
 */
export function GmailConnectionStep({
  workspaceId,
  onComplete,
  onError,
}: GmailConnectionStepProps) {
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [connectedAccount, setConnectedAccount] = useState<ConnectedAccount | null>(null)
  const searchParams = useSearchParams()

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)
  // Track if initial check has been done
  const hasCheckedRef = useRef(false)
  // Track if OAuth callback has been processed
  const hasProcessedCallbackRef = useRef(false)
  // Track timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Check if Gmail is already connected to the workspace.
   */
  const checkExistingConnection = useCallback(async () => {
    if (hasCheckedRef.current) return
    hasCheckedRef.current = true

    try {
      logger.info('Checking existing Gmail connection', { workspaceId })

      const response = await fetch(`/api/onboarding/${workspaceId}/check-gmail`)

      if (!response.ok) {
        throw new Error('Failed to check Gmail status')
      }

      const data = await response.json()

      if (!isMountedRef.current) return

      if (data.connected && data.accounts.length > 0) {
        const primaryAccount = data.accounts.find((acc: ConnectedAccount) => acc.isPrimary) || data.accounts[0]
        setConnectedAccount(primaryAccount)
        setStatus('connected')

        // Complete the step
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            onComplete({
              accountId: primaryAccount.id,
              email: primaryAccount.displayName,
              workspaceAccountId: primaryAccount.id,
            }, true) // Already marked complete by previous session
          }
        }, 1000)
      } else {
        setStatus('not_connected')
      }
    } catch (err) {
      if (!isMountedRef.current) return

      const error = err instanceof Error ? err : new Error('Unknown error')
      logger.error('Failed to check Gmail connection', { error: error.message })
      setErrorMessage(error.message)
      setStatus('error')
    }
  }, [workspaceId, onComplete])

  /**
   * Link the Gmail account to the workspace after OAuth callback.
   */
  const linkGmailAccount = useCallback(async () => {
    if (hasProcessedCallbackRef.current) return
    hasProcessedCallbackRef.current = true

    setStatus('linking')

    try {
      logger.info('Linking Gmail account to workspace', { workspaceId })

      const response = await fetch(`/api/onboarding/${workspaceId}/link-gmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to link Gmail account')
      }

      const data = await response.json()

      if (!isMountedRef.current) return

      setConnectedAccount({
        id: data.workspaceAccountId,
        displayName: data.email,
        isPrimary: true,
      })
      setStatus('connected')

      logger.info('Gmail account linked successfully', {
        workspaceId,
        email: data.email,
      })

      // Complete the step after showing success state
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onComplete({
            accountId: data.accountId,
            email: data.email,
            workspaceAccountId: data.workspaceAccountId,
          }, true) // Already marked complete by link-gmail API
        }
      }, 1500)
    } catch (err) {
      if (!isMountedRef.current) return

      const error = err instanceof Error ? err : new Error('Unknown error')
      logger.error('Failed to link Gmail account', { error: error.message })
      setErrorMessage(error.message)
      setStatus('error')
      onError(error)
    }
  }, [workspaceId, onComplete, onError])

  /**
   * Initiate the OAuth flow.
   */
  const handleConnect = useCallback(async () => {
    try {
      setStatus('connecting')
      setErrorMessage(null)

      logger.info('Initiating Gmail OAuth flow', { workspaceId })

      // Build callback URL that includes workspace context
      const callbackUrl = `${window.location.origin}/onboarding?workspaceId=${workspaceId}&oauth_callback=gmail`

      await client.oauth2.link({
        providerId: 'google-email',
        callbackURL: callbackUrl,
      })

      // Note: client.oauth2.link redirects to Google, so this line
      // won't be reached unless there's an error
    } catch (err) {
      if (!isMountedRef.current) return

      const error = err instanceof Error ? err : new Error('OAuth flow failed')
      logger.error('Gmail OAuth initiation failed', { error: error.message })
      setErrorMessage(error.message)
      setStatus('error')
      onError(error)
    }
  }, [workspaceId, onError])

  // Check for OAuth callback on mount
  useEffect(() => {
    isMountedRef.current = true

    // Check if we're returning from OAuth
    const oauthCallback = searchParams.get('oauth_callback')

    if (oauthCallback === 'gmail' && !hasProcessedCallbackRef.current) {
      // We're returning from OAuth - link the account
      linkGmailAccount()
    } else if (!hasCheckedRef.current) {
      // Initial load - check existing connection
      checkExistingConnection()
    }

    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [searchParams, checkExistingConnection, linkGmailAccount])

  /**
   * Handle retry button click.
   */
  const handleRetry = useCallback(() => {
    hasCheckedRef.current = false
    hasProcessedCallbackRef.current = false
    setErrorMessage(null)
    setStatus('checking')
    checkExistingConnection()
  }, [checkExistingConnection])

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Icon */}
      <div
        className={cn(
          'mb-6 flex h-20 w-20 items-center justify-center rounded-full',
          (status === 'checking' || status === 'connecting' || status === 'linking') && 'bg-primary/10',
          status === 'connected' && 'bg-green-100 dark:bg-green-900/20',
          status === 'error' && 'bg-red-100 dark:bg-red-900/20',
          status === 'not_connected' && 'bg-blue-100 dark:bg-blue-900/20'
        )}
      >
        {(status === 'checking' || status === 'connecting' || status === 'linking') && (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        )}
        {status === 'connected' && (
          <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
        )}
        {status === 'error' && (
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        )}
        {status === 'not_connected' && (
          <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        )}
      </div>

      {/* Title */}
      <h2 className="mb-2 font-semibold text-2xl">
        {status === 'checking' && 'Checking connection...'}
        {status === 'not_connected' && 'Connect your Gmail'}
        {status === 'connecting' && 'Redirecting to Google...'}
        {status === 'linking' && 'Linking account...'}
        {status === 'connected' && 'Gmail connected!'}
        {status === 'error' && 'Connection failed'}
      </h2>

      {/* Description */}
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        {status === 'checking' && (
          <>Checking if you already have a Gmail account connected...</>
        )}
        {status === 'not_connected' && (
          <>Connect your Gmail account to enable email outreach from your prospecting campaigns.</>
        )}
        {status === 'connecting' && (
          <>Please authorize access in the Google popup window.</>
        )}
        {status === 'linking' && (
          <>Linking your Gmail account to your workspace...</>
        )}
        {status === 'connected' && connectedAccount && (
          <>
            Successfully connected <strong>{connectedAccount.displayName}</strong>
          </>
        )}
        {status === 'error' && (
          <span className="text-red-600 dark:text-red-400">{errorMessage}</span>
        )}
      </p>

      {/* Connect button */}
      {status === 'not_connected' && (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Mail className="h-5 w-5" />
          Connect Gmail
        </button>
      )}

      {/* Retry button for errors */}
      {status === 'error' && (
        <button
          onClick={handleRetry}
          className="rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
      )}

      {/* Success details */}
      {status === 'connected' && connectedAccount && (
        <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="h-4 w-4 text-green-600" />
            <span>Gmail account linked to workspace</span>
          </div>
          {connectedAccount.isPrimary && (
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" />
              <span>Set as primary email account</span>
            </div>
          )}
        </div>
      )}

      {/* Info about additional accounts */}
      {(status === 'not_connected' || status === 'connected') && (
        <p className="mt-8 text-center text-muted-foreground text-sm">
          You can connect additional email accounts later from workspace settings.
        </p>
      )}
    </div>
  )
}

