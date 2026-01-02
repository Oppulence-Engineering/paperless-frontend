'use client'

import { Suspense, useEffect, useState } from 'react'
import { createLogger } from '@sim/logger'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from '@/lib/auth/auth-client'
import { useOnboarding } from '@/lib/onboarding/hooks'
import { OnboardingLayout } from './components/onboarding-layout'
import { StepIndicator } from './components/step-indicator'
import { CompletionStep } from './steps/completion-step'
import { LeadScraperProvisioningStep } from './steps/lead-scraper-provisioning-step'
import { GmailConnectionStep } from './steps/gmail-connection-step'

const logger = createLogger('OnboardingPage')

/**
 * Main onboarding page component.
 * Wraps the content in Suspense because useSearchParams requires it.
 */
export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <OnboardingLayout>
          <div className="flex h-full items-center justify-center">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
              role="status"
              aria-label="Loading"
            />
          </div>
        </OnboardingLayout>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  )
}

/**
 * Inner component that uses useSearchParams.
 * Separated to allow Suspense boundary for SSR hydration.
 */
function OnboardingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get('workspaceId')
  const { data: session, isPending: sessionPending } = useSession()
  const [isInitializing, setIsInitializing] = useState(true)

  // Fetch onboarding state for the workspace
  const {
    state: onboardingState,
    isLoading,
    error,
    completeStep,
    finishOnboarding,
    refetch,
  } = useOnboarding(workspaceId || '')

  // Redirect if no workspaceId
  useEffect(() => {
    if (!workspaceId && !sessionPending) {
      logger.warn('No workspaceId in onboarding URL, redirecting to workspace')
      router.replace('/workspace')
    }
    setIsInitializing(false)
  }, [workspaceId, sessionPending, router])

  // Redirect if not authenticated
  useEffect(() => {
    if (!sessionPending && !session?.user) {
      logger.info('User not authenticated, redirecting to login')
      router.replace('/login')
    }
  }, [session, sessionPending, router])

  // Redirect if onboarding is complete
  useEffect(() => {
    if (onboardingState?.isComplete && workspaceId) {
      logger.info('Onboarding complete, redirecting to workspace', { workspaceId })
      router.replace(`/workspace/${workspaceId}/w`)
    }
  }, [onboardingState?.isComplete, workspaceId, router])

  /**
   * Handle step completion.
   *
   * For steps that mark themselves complete on the server (like Lead Scraper provisioning),
   * we just need to refresh state. For steps that require client-side completion notification,
   * we call the completeStep API.
   *
   * @param stepId - The step that completed
   * @param result - The step result (optional)
   * @param alreadyMarkedComplete - If true, skip the API call and just refresh state
   */
  const handleStepComplete = async (
    stepId: string,
    result?: unknown,
    alreadyMarkedComplete = false
  ) => {
    try {
      if (alreadyMarkedComplete) {
        // Step was already marked complete by its API route - just refresh state
        await refetch()
      } else {
        // Mark step complete via API (for steps that don't self-complete)
        await completeStep(stepId, result)
      }
    } catch (err) {
      logger.error('Failed to complete step', { stepId, error: err })
    }
  }

  // Handle onboarding completion
  const handleFinishOnboarding = async () => {
    try {
      await finishOnboarding()
      if (workspaceId) {
        router.replace(`/workspace/${workspaceId}/w`)
      }
    } catch (err) {
      logger.error('Failed to finish onboarding', { error: err })
    }
  }

  // Loading state
  if (sessionPending || isInitializing || isLoading || !workspaceId) {
    return (
      <OnboardingLayout>
        <div className="flex h-full items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label="Loading"
          />
        </div>
      </OnboardingLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <OnboardingLayout>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-destructive">Failed to load onboarding: {error}</p>
          <button
            onClick={() => refetch()}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </OnboardingLayout>
    )
  }

  // Determine current step
  // If currentStepId is null, all registered steps are complete - show completion UI
  const currentStepId = onboardingState?.currentStepId
  const isComplete = onboardingState?.isComplete || false
  // Check if all registered steps are done (currentStepId is null) but onboarding not finalized
  const allStepsDone = currentStepId === null && !isComplete

  return (
    <OnboardingLayout>
      <div className="flex h-full flex-col">
        {/* Step indicator */}
        <div className="border-b px-8 py-6">
          <StepIndicator
            steps={[
              {
                id: 'lead-scraper-provisioning',
                title: 'Account Setup',
                status: onboardingState?.stepStatuses?.['lead-scraper-provisioning'] || 'pending',
              },
              {
                id: 'gmail-connection',
                title: 'Connect Gmail',
                status: onboardingState?.stepStatuses?.['gmail-connection'] || 'pending',
              },
              {
                id: 'completion',
                title: 'Get Started',
                status: isComplete ? 'completed' : allStepsDone ? 'in_progress' : 'pending',
              },
            ]}
            currentStepId={isComplete || allStepsDone ? 'completion' : currentStepId || 'lead-scraper-provisioning'}
          />
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-auto px-8 py-8">
          {currentStepId === 'lead-scraper-provisioning' && !isComplete && !allStepsDone && (
            <LeadScraperProvisioningStep
              workspaceId={workspaceId}
              onComplete={(result) =>
                // Pass true because the provision-lead-scraper API already marks the step complete
                handleStepComplete('lead-scraper-provisioning', result, true)
              }
              onError={(err) => logger.error('Lead Scraper step error', { error: err })}
            />
          )}

          {currentStepId === 'gmail-connection' && !isComplete && !allStepsDone && (
            <GmailConnectionStep
              workspaceId={workspaceId}
              onComplete={(result, alreadyMarkedComplete) =>
                handleStepComplete('gmail-connection', result, alreadyMarkedComplete)
              }
              onError={(err) => logger.error('Gmail connection step error', { error: err })}
            />
          )}

          {(isComplete || allStepsDone) && (
            <CompletionStep
              workspaceId={workspaceId}
              onFinish={handleFinishOnboarding}
            />
          )}
        </div>
      </div>
    </OnboardingLayout>
  )
}

