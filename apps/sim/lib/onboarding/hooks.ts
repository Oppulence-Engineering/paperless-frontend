/**
 * @fileoverview React hooks for onboarding state management.
 *
 * Provides client-side hooks that:
 * - Fetch onboarding state from API
 * - Track step execution progress
 * - Handle step completion and errors
 * - Manage form state for step components
 *
 * ## Usage Pattern
 *
 * The `useOnboarding` hook manages the overall flow:
 * ```tsx
 * function OnboardingPage() {
 *   const { state, completeStep } = useOnboarding(workspaceId);
 *
 *   if (state?.isComplete) {
 *     return <Redirect to="/workspace" />;
 *   }
 *
 *   return <CurrentStep onComplete={completeStep} />;
 * }
 * ```
 *
 * The `useOnboardingStep` hook manages individual step state:
 * ```tsx
 * function MyStepComponent() {
 *   const { data, setData, execute, isExecuting } = useOnboardingStep(workspaceId, step);
 *
 *   return (
 *     <form onSubmit={execute}>
 *       <input value={data.email} onChange={e => setData({ email: e.target.value })} />
 *       <button disabled={isExecuting}>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createLogger } from '@sim/logger'
import type { OnboardingState, OnboardingStep, StepStatus } from './types'

const logger = createLogger('OnboardingHooks')

// =============================================================================
// Types
// =============================================================================

/**
 * Return type for the useOnboarding hook.
 */
export interface UseOnboardingReturn {
  /** Current onboarding state, or null if loading */
  state: OnboardingState | null
  /** Whether initial state is being fetched */
  isLoading: boolean
  /** Error message if fetch failed */
  error: string | null
  /** Function to mark a step as complete */
  completeStep: (stepId: string, result?: unknown) => Promise<void>
  /** Function to finish onboarding entirely */
  finishOnboarding: () => Promise<void>
  /** Function to re-fetch state from API */
  refetch: () => Promise<void>
}

/**
 * Return type for the useOnboardingStep hook.
 */
export interface UseOnboardingStepReturn<TStepData, TStepResult> {
  /** Current step form data */
  data: TStepData
  /** Function to update step data (partial merge) */
  setData: (data: Partial<TStepData>) => void
  /** Whether step is currently executing */
  isExecuting: boolean
  /** Current step status */
  status: StepStatus
  /** Error message if step failed */
  error: string | null
  /** Step result if completed */
  result: TStepResult | null
  /** Function to execute the step */
  execute: () => Promise<void>
  /** Function to skip the step (optional steps only) */
  skip: () => Promise<void>
  /** Function to reset step state */
  reset: () => void
  /** Whether this step can be skipped */
  canSkip: boolean
}

// =============================================================================
// useOnboarding Hook
// =============================================================================

/**
 * Hook for managing overall onboarding state.
 *
 * Provides:
 * - Current onboarding state from API
 * - Loading and error states
 * - Functions to complete steps and finish onboarding
 *
 * @param workspaceId - The workspace ID to manage onboarding for
 * @returns Object with state, loading, error, and action functions
 *
 * @example
 * ```tsx
 * function OnboardingPage({ workspaceId }) {
 *   const { state, isLoading, error, completeStep, finishOnboarding } = useOnboarding(workspaceId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage message={error} />;
 *   if (state?.isComplete) return <CompletionScreen onFinish={finishOnboarding} />;
 *
 *   return (
 *     <StepComponent
 *       stepId={state.currentStepId}
 *       onComplete={(result) => completeStep(state.currentStepId, result)}
 *     />
 *   );
 * }
 * ```
 */
export function useOnboarding(workspaceId: string): UseOnboardingReturn {
  const [state, setState] = useState<OnboardingState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches the current onboarding state from the API.
   * Called on mount and after step completion.
   */
  const fetchState = useCallback(async () => {
    if (!workspaceId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/onboarding/${workspaceId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch onboarding state')
      }

      const data = await response.json()
      setState(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Failed to fetch onboarding state', { workspaceId, error: message })
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [workspaceId])

  /**
   * Marks a step as complete via the API.
   * Automatically refreshes state after completion.
   */
  const completeStep = useCallback(
    async (stepId: string, result?: unknown) => {
      if (!workspaceId) {
        throw new Error('Workspace ID is required')
      }

      try {
        const response = await fetch(`/api/onboarding/${workspaceId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stepId, result }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to complete step')
        }

        // Refresh state to reflect completion
        await fetchState()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        logger.error('Failed to complete step', { workspaceId, stepId, error: message })
        throw err
      }
    },
    [workspaceId, fetchState]
  )

  /**
   * Marks onboarding as complete via the API.
   * Should be called after all required steps are done.
   */
  const finishOnboarding = useCallback(async () => {
    if (!workspaceId) {
      throw new Error('Workspace ID is required')
    }

    try {
      const response = await fetch(`/api/onboarding/${workspaceId}/complete`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to complete onboarding')
      }

      await fetchState()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Failed to complete onboarding', { workspaceId, error: message })
      throw err
    }
  }, [workspaceId, fetchState])

  // Fetch initial state on mount or when workspaceId changes
  useEffect(() => {
    fetchState()
  }, [fetchState])

  return {
    state,
    isLoading,
    error,
    completeStep,
    finishOnboarding,
    refetch: fetchState,
  }
}

// =============================================================================
// useOnboardingStep Hook
// =============================================================================

/**
 * Hook for managing a single onboarding step.
 *
 * Provides:
 * - Step form data management
 * - Step execution with loading state
 * - Error handling
 * - Skip functionality for optional steps
 *
 * @typeParam TStepData - Type of data the step collects
 * @typeParam TStepResult - Type of result the step produces
 * @param workspaceId - The workspace ID
 * @param step - The step definition (or null if loading)
 * @returns Object with data, status, and action functions
 *
 * @example
 * ```tsx
 * function EmailFormStep({ workspaceId, step }) {
 *   const {
 *     data,
 *     setData,
 *     execute,
 *     isExecuting,
 *     status,
 *     error
 *   } = useOnboardingStep(workspaceId, step);
 *
 *   return (
 *     <form onSubmit={(e) => { e.preventDefault(); execute(); }}>
 *       <input
 *         value={data.email || ''}
 *         onChange={(e) => setData({ email: e.target.value })}
 *         disabled={isExecuting}
 *       />
 *       {error && <p className="error">{error}</p>}
 *       <button disabled={isExecuting}>
 *         {isExecuting ? 'Saving...' : 'Continue'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useOnboardingStep<TStepData = Record<string, unknown>, TStepResult = unknown>(
  workspaceId: string,
  step: OnboardingStep<TStepData, TStepResult> | null
): UseOnboardingStepReturn<TStepData, TStepResult> {
  // Form state
  const [data, setDataState] = useState<TStepData>({} as TStepData)

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false)
  const [status, setStatus] = useState<StepStatus>('pending')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TStepResult | null>(null)

  /**
   * Updates step data with partial merge.
   */
  const setData = useCallback((partialData: Partial<TStepData>) => {
    setDataState((prev) => ({ ...prev, ...partialData }))
  }, [])

  /**
   * Executes the step via the API.
   */
  const execute = useCallback(async () => {
    if (!step) {
      logger.warn('Cannot execute: step is null')
      return
    }

    if (!workspaceId) {
      setError('Workspace ID is required')
      return
    }

    try {
      setIsExecuting(true)
      setStatus('in_progress')
      setError(null)

      const response = await fetch(`/api/onboarding/${workspaceId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId: step.id, data }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Step execution failed')
      }

      const resultData = await response.json()
      setResult(resultData.result as TStepResult)
      setStatus('completed')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setStatus('failed')
      logger.error('Step execution failed', {
        workspaceId,
        stepId: step.id,
        error: message,
      })
    } finally {
      setIsExecuting(false)
    }
  }, [step, workspaceId, data])

  /**
   * Skips the step (only for optional steps).
   */
  const skip = useCallback(async () => {
    if (!step) {
      logger.warn('Cannot skip: step is null')
      return
    }

    if (step.required) {
      logger.warn('Cannot skip required step', { stepId: step.id })
      return
    }

    if (!workspaceId) {
      setError('Workspace ID is required')
      return
    }

    try {
      const response = await fetch(`/api/onboarding/${workspaceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId: step.id, skipped: true }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to skip step')
      }

      setStatus('skipped')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      logger.error('Failed to skip step', {
        workspaceId,
        stepId: step.id,
        error: message,
      })
    }
  }, [step, workspaceId])

  /**
   * Resets step state to initial values.
   */
  const reset = useCallback(() => {
    setDataState({} as TStepData)
    setIsExecuting(false)
    setStatus('pending')
    setError(null)
    setResult(null)
  }, [])

  return {
    data,
    setData,
    isExecuting,
    status,
    error,
    result,
    execute,
    skip,
    reset,
    canSkip: step ? !step.required : false,
  }
}
