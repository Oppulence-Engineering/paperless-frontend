/**
 * @fileoverview Step execution pipeline for the onboarding system.
 *
 * The executor handles the runtime execution of onboarding steps,
 * providing:
 *
 * - **Validation**: Validates step data/results against Zod schemas
 * - **Completion Check**: Skips already-completed steps
 * - **Error Handling**: Catches errors and triggers rollback
 * - **Progress Tracking**: Notifies callers of execution progress
 * - **Rollback**: Undoes completed steps if a later step fails
 *
 * ## Single Responsibility
 *
 * The executor is responsible ONLY for executing steps. It does not:
 * - Store step results (that's utils.ts)
 * - Query step definitions (that's registry.ts)
 * - Render UI (that's hooks.ts)
 *
 * @example
 * ```typescript
 * const result = await stepExecutor.executeStep(step, data, context);
 * if (result.success) {
 *   console.log('Step result:', result.result);
 * } else {
 *   console.error('Step failed:', result.error);
 * }
 * ```
 */

import { createLogger } from '@sim/logger'
import { stepRegistry } from './registry'
import type { OnboardingContext, OnboardingStep, StepExecutionResult } from './types'

const logger = createLogger('OnboardingExecutor')

/**
 * Executes onboarding steps with validation, error handling, and rollback.
 *
 * The executor is stateless - it takes a step and context, executes the step,
 * and returns the result. Callers are responsible for updating state.
 */
export class OnboardingExecutor {
  /**
   * Executes a single step with full validation and error handling.
   *
   * Execution flow:
   * 1. Validate input data against step.dataSchema (if present)
   * 2. Check if step is already complete (via checkCompletion)
   * 3. Call step.execute() with validated data
   * 4. Validate result against step.resultSchema (if present)
   * 5. Return success with result, or failure with error
   *
   * On error:
   * - If step has rollback handler, it's called to undo partial work
   * - Error message is extracted and returned
   *
   * @typeParam TStepData - Type of step input data
   * @typeParam TStepResult - Type of step result
   * @param step - The step definition to execute
   * @param data - Input data for the step
   * @param context - Current onboarding context
   * @returns Execution result (success with result, or failure with error)
   *
   * @example
   * ```typescript
   * const result = await executor.executeStep(
   *   myStep,
   *   { email: 'user@example.com' },
   *   context
   * );
   *
   * if (result.success && 'result' in result) {
   *   console.log('Step completed:', result.result);
   * }
   * ```
   */
  async executeStep<TStepData, TStepResult>(
    step: OnboardingStep<TStepData, TStepResult>,
    data: TStepData,
    context: OnboardingContext
  ): Promise<StepExecutionResult<TStepResult>> {
    logger.info(`Executing step: ${step.id}`, {
      workspaceId: context.workspaceId,
      userId: context.userId,
    })

    try {
      // Step 1: Validate input data against schema
      if (step.dataSchema) {
        const parseResult = step.dataSchema.safeParse(data)
        if (!parseResult.success) {
          const errorMessage = parseResult.error.errors.map((e) => e.message).join(', ')
          logger.error(`Step data validation failed: ${step.id}`, {
            errors: parseResult.error.errors,
          })
          return { success: false, error: `Validation failed: ${errorMessage}` }
        }
        // Use validated data (may have been transformed by Zod)
        data = parseResult.data
      }

      // Step 2: Check if step is already complete
      if (step.checkCompletion) {
        const isComplete = await step.checkCompletion(context)
        if (isComplete) {
          logger.info(`Step already complete, skipping: ${step.id}`)
          return { success: true, skipped: true }
        }
      }

      // Step 3: Execute the step
      const result = await step.execute(data, context)

      // Step 4: Validate result against schema
      if (step.resultSchema) {
        const resultParseResult = step.resultSchema.safeParse(result)
        if (!resultParseResult.success) {
          logger.error(`Step result validation failed: ${step.id}`, {
            errors: resultParseResult.error.errors,
          })
          return {
            success: false,
            error: 'Step completed but result validation failed',
          }
        }
      }

      logger.info(`Step completed successfully: ${step.id}`, {
        workspaceId: context.workspaceId,
      })

      return { success: true, result }
    } catch (error) {
      // Extract error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      logger.error(`Step execution failed: ${step.id}`, {
        workspaceId: context.workspaceId,
        error: errorMessage,
      })

      // Attempt rollback if handler exists
      if (step.rollback) {
        try {
          // Pass undefined as result since step didn't complete
          await step.rollback(undefined as TStepResult, context)
          logger.info(`Step rolled back: ${step.id}`)
        } catch (rollbackError) {
          // Log rollback failure but don't throw - original error is more important
          logger.error(`Step rollback failed: ${step.id}`, {
            error: rollbackError,
          })
        }
      }

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Executes all remaining steps in the onboarding flow.
   *
   * Iterates through steps in order, executing each one until:
   * - All applicable steps are complete
   * - A required step fails
   *
   * Progress is reported via the optional callback for UI updates.
   *
   * @param context - Current onboarding context
   * @param onProgress - Optional callback for progress updates
   * @returns Object with success status, completed steps, and results
   *
   * @example
   * ```typescript
   * const result = await executor.executeAllRemainingSteps(
   *   context,
   *   (stepId, status) => {
   *     console.log(`Step ${stepId}: ${status}`);
   *   }
   * );
   *
   * if (result.success) {
   *   console.log('All steps completed!');
   * }
   * ```
   */
  async executeAllRemainingSteps(
    context: OnboardingContext,
    onProgress?: (stepId: string, status: 'started' | 'completed' | 'failed') => void
  ): Promise<{
    success: boolean
    completedStepIds: string[]
    stepResults: Record<string, unknown>
    error?: string
  }> {
    // Track progress locally (don't mutate input context)
    const completedStepIds = [...context.completedStepIds]
    const stepResults = { ...context.stepResults }

    // Execute steps until none remain
    while (true) {
      // Build updated context with current progress
      const updatedContext: OnboardingContext = {
        ...context,
        completedStepIds,
        stepResults,
      }

      // Get next step to execute
      const nextStep = await stepRegistry.getNextStep(updatedContext)

      if (!nextStep) {
        // No more steps - we're done
        break
      }

      // Notify progress
      onProgress?.(nextStep.id, 'started')

      // Execute the step (use empty object for steps without data input)
      const result = await this.executeStep(nextStep, {} as never, updatedContext)

      if (!result.success) {
        onProgress?.(nextStep.id, 'failed')
        return {
          success: false,
          completedStepIds,
          stepResults,
          error: 'error' in result ? result.error : 'Step execution failed',
        }
      }

      // Track completion
      completedStepIds.push(nextStep.id)
      if ('result' in result) {
        stepResults[nextStep.id] = result.result
      }

      onProgress?.(nextStep.id, 'completed')
    }

    return {
      success: true,
      completedStepIds,
      stepResults,
    }
  }

  /**
   * Rolls back completed steps in reverse order.
   *
   * Called when:
   * - A critical step fails and we need to undo previous work
   * - User abandons onboarding
   * - Admin resets workspace state
   *
   * Steps without rollback handlers are skipped.
   * Rollback failures are logged but don't stop the process.
   *
   * @param context - Current onboarding context (with stepResults)
   * @param stepIdsToRollback - IDs of steps to rollback
   */
  async rollbackSteps(context: OnboardingContext, stepIdsToRollback: string[]): Promise<void> {
    // Rollback in reverse order (last completed first)
    const reversedIds = [...stepIdsToRollback].reverse()

    for (const stepId of reversedIds) {
      const step = stepRegistry.getStep(stepId)
      if (!step || !step.rollback) {
        // No rollback handler - skip
        continue
      }

      const stepResult = context.stepResults[stepId]
      try {
        await step.rollback(stepResult, context)
        logger.info(`Rolled back step: ${stepId}`)
      } catch (error) {
        // Log but continue - try to rollback as many steps as possible
        logger.error(`Failed to rollback step: ${stepId}`, { error })
      }
    }
  }
}

/**
 * Singleton instance of the step executor.
 *
 * Use this for executing onboarding steps in application code.
 */
export const stepExecutor = new OnboardingExecutor()
