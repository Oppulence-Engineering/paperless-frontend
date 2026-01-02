'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createLogger } from '@sim/logger'
import { AlertCircle, Check, Loader2, Server } from 'lucide-react'
import { cn } from '@/lib/core/utils/cn'

const logger = createLogger('LeadScraperProvisioningStep')

interface LeadScraperProvisioningStepProps {
  workspaceId: string
  onComplete: (result: unknown) => void
  onError: (error: Error) => void
}

type ProvisioningStatus = 'idle' | 'provisioning' | 'success' | 'error'

/**
 * Lead Scraper provisioning step component.
 * Automatically provisions the Lead Scraper organization and tenant records.
 */
export function LeadScraperProvisioningStep({
  workspaceId,
  onComplete,
  onError,
}: LeadScraperProvisioningStepProps) {
  const [status, setStatus] = useState<ProvisioningStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<{
    organizationId?: string
    tenantId?: string
    skipped?: boolean
  } | null>(null)

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)
  // Track if provisioning has started to prevent duplicate calls
  const hasStartedRef = useRef(false)
  // Track timeout for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Execute the provisioning API call.
   * Uses refs to prevent duplicate calls and state updates after unmount.
   */
  const runProvisioning = useCallback(async () => {
    // Prevent duplicate calls
    if (hasStartedRef.current) {
      return
    }
    hasStartedRef.current = true

    setStatus('provisioning')
    setErrorMessage(null)

    try {
      logger.info('Starting Lead Scraper provisioning', { workspaceId })

      const response = await fetch(
        `/api/onboarding/${workspaceId}/provision-lead-scraper`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Provisioning failed')
      }

      const data = await response.json()

      logger.info('Lead Scraper provisioning completed', {
        workspaceId,
        organizationId: data.organizationId,
        tenantId: data.tenantId,
        skipped: data.skipped,
      })

      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      setResult(data)
      setStatus('success')

      // Notify parent after a brief delay to show success state
      // Store in ref for cleanup on unmount
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onComplete(data)
        }
      }, 1500)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      logger.error('Lead Scraper provisioning failed', {
        workspaceId,
        error: error.message,
      })

      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      setErrorMessage(error.message)
      setStatus('error')
      onError(error)
    }
  }, [workspaceId, onComplete, onError])

  // Auto-start provisioning on mount
  useEffect(() => {
    // Set mounted ref
    isMountedRef.current = true

    // Start provisioning only once on mount
    if (status === 'idle' && !hasStartedRef.current) {
      runProvisioning()
    }

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false
      // Clear any pending timeout to prevent memory leaks
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [status, runProvisioning])

  /**
   * Handle retry button click.
   * Resets the started flag and status to trigger a new provisioning attempt.
   */
  const handleRetry = useCallback(() => {
    hasStartedRef.current = false
    setStatus('idle')
    // Don't call runProvisioning directly - let the useEffect handle it
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Icon */}
      <div
        className={cn(
          'mb-6 flex h-20 w-20 items-center justify-center rounded-full',
          status === 'provisioning' && 'bg-primary/10',
          status === 'success' && 'bg-green-100 dark:bg-green-900/20',
          status === 'error' && 'bg-red-100 dark:bg-red-900/20',
          status === 'idle' && 'bg-muted'
        )}
      >
        {status === 'provisioning' && (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        )}
        {status === 'success' && (
          <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
        )}
        {status === 'error' && (
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        )}
        {status === 'idle' && (
          <Server className="h-10 w-10 text-muted-foreground" />
        )}
      </div>

      {/* Title */}
      <h2 className="mb-2 font-semibold text-2xl">
        {status === 'provisioning' && 'Setting up your account...'}
        {status === 'success' && 'Account ready!'}
        {status === 'error' && 'Setup failed'}
        {status === 'idle' && 'Preparing setup...'}
      </h2>

      {/* Description */}
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        {status === 'provisioning' && (
          <>We&apos;re configuring your Lead Scraper integration. This only takes a moment.</>
        )}
        {status === 'success' && result?.skipped && (
          <>Setup skipped. You can configure Lead Scraper later in settings.</>
        )}
        {status === 'success' && !result?.skipped && (
          <>Your Lead Scraper account is ready. Let&apos;s get started!</>
        )}
        {status === 'error' && errorMessage}
        {status === 'idle' && <>Initializing account setup...</>}
      </p>

      {/* Retry button for errors */}
      {status === 'error' && (
        <button
          onClick={handleRetry}
          className="rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Retry Setup
        </button>
      )}

      {/* Success details */}
      {status === 'success' && result && !result.skipped && (
        <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="h-4 w-4 text-green-600" />
            <span>Organization configured</span>
          </div>
          {result.tenantId && (
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" />
              <span>Tenant configured</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

