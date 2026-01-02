'use client'

import { Check, Circle, Loader2 } from 'lucide-react'
import type { StepStatus } from '@/lib/onboarding/types'
import { cn } from '@/lib/core/utils/cn'

interface Step {
  id: string
  title: string
  status: StepStatus
}

interface StepIndicatorProps {
  steps: Step[]
  currentStepId: string
}

/**
 * Visual indicator showing progress through onboarding steps.
 * Displays step titles with icons indicating completion status.
 */
export function StepIndicator({ steps, currentStepId }: StepIndicatorProps) {
  return (
    <nav aria-label="Onboarding progress">
      <ol className="flex items-center justify-center gap-8">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStepId
          const isCompleted = step.status === 'completed'
          const isInProgress = step.status === 'in_progress'

          return (
            <li key={step.id} className="flex items-center gap-3">
              {/* Step number/icon */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isInProgress && 'border-primary bg-primary/10 text-primary',
                  isCurrent && !isCompleted && !isInProgress && 'border-primary bg-primary/10 text-primary',
                  !isCompleted && !isInProgress && !isCurrent && 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : isInProgress ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <span className="font-medium text-sm">{index + 1}</span>
                )}
              </div>

              {/* Step title */}
              <span
                className={cn(
                  'font-medium text-sm transition-colors',
                  (isCompleted || isCurrent) && 'text-foreground',
                  !isCompleted && !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>

              {/* Connector line (except for last step) */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'ml-2 h-0.5 w-12 transition-colors',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

