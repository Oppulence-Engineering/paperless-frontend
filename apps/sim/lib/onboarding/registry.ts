/**
 * @fileoverview Central registry for onboarding step definitions.
 *
 * The registry provides a singleton pattern for managing all onboarding
 * steps in the application. Steps self-register on import, enabling a
 * plugin-like architecture where new steps can be added without modifying
 * existing code.
 *
 * ## How It Works
 *
 * 1. Steps are defined in `./steps/` directory using factory functions
 * 2. Each step file imports the registry and calls `stepRegistry.register()`
 * 3. The main `./steps/index.ts` imports all step files
 * 4. The registry validates step definitions and stores them
 * 5. Runtime code queries the registry for step information
 *
 * ## Thread Safety
 *
 * The registry is initialized at module load time. Since JavaScript is
 * single-threaded, registration is atomic. The registry is immutable
 * after initialization (no dynamic registration at runtime).
 *
 * @example
 * ```typescript
 * // In a step definition file:
 * import { stepRegistry } from './registry';
 * import { myStep } from './my-step';
 *
 * stepRegistry.register(myStep);
 *
 * // Querying the registry:
 * const allSteps = stepRegistry.getStepsSorted();
 * const nextStep = await stepRegistry.getNextStep(context);
 * ```
 */

import { createLogger } from '@sim/logger'
import type { OnboardingContext, OnboardingStep } from './types'

const logger = createLogger('OnboardingRegistry')

/**
 * Central registry for all onboarding steps.
 *
 * Manages step definitions and provides query methods for:
 * - Getting steps by ID
 * - Getting steps sorted by order
 * - Finding the next applicable step for a context
 * - Checking if onboarding is complete
 *
 * The registry validates steps on registration to catch configuration
 * errors early (at application startup rather than runtime).
 */
class OnboardingStepRegistry {
  /**
   * Internal storage for registered steps.
   * Uses Map for O(1) lookups by ID.
   */
  private steps = new Map<string, OnboardingStep>()

  /**
   * Registers a new onboarding step with the registry.
   *
   * Validates the step definition and throws if:
   * - Step ID already exists (duplicate registration)
   * - Required fields are missing or invalid
   * - Step configuration is malformed
   *
   * @param step - The step definition to register
   * @throws Error if step ID is already registered
   * @throws Error if step validation fails
   *
   * @example
   * ```typescript
   * stepRegistry.register({
   *   id: 'my-step',
   *   title: 'My Step',
   *   description: 'Does something',
   *   order: 1,
   *   required: true,
   *   component: MyComponent,
   *   execute: async () => ({ success: true }),
   * });
   * ```
   */
  register<TStepData, TStepResult>(step: OnboardingStep<TStepData, TStepResult>): void {
    // Validate step before storing
    this.validateStep(step as OnboardingStep)

    if (this.steps.has(step.id)) {
      throw new Error(`Onboarding step with ID "${step.id}" already registered`)
    }

    // Store as base type - generics are erased at runtime
    // The type assertion is safe because we only access common properties
    this.steps.set(step.id, step as unknown as OnboardingStep)

    logger.info(`Registered onboarding step: ${step.id}`, {
      order: step.order,
      required: step.required,
      dependencies: step.dependencies,
    })
  }

  /**
   * Retrieves a step by its unique ID.
   *
   * @param id - The step ID to look up
   * @returns The step definition, or undefined if not found
   */
  getStep(id: string): OnboardingStep | undefined {
    return this.steps.get(id)
  }

  /**
   * Returns all registered steps as an array.
   *
   * Order is not guaranteed (use getStepsSorted for ordered access).
   *
   * @returns Array of all registered step definitions
   */
  getAllSteps(): OnboardingStep[] {
    return Array.from(this.steps.values())
  }

  /**
   * Returns all steps sorted by their order property.
   *
   * Steps with lower order numbers come first.
   *
   * @returns Sorted array of step definitions
   */
  getStepsSorted(): OnboardingStep[] {
    return this.getAllSteps().sort((a, b) => a.order - b.order)
  }

  /**
   * Gets all steps applicable for a given onboarding context.
   *
   * Filters steps based on:
   * 1. Condition function (if present, must return true)
   * 2. Dependencies (all must be in completedStepIds)
   *
   * @param context - Current onboarding context
   * @returns Promise resolving to array of applicable steps
   */
  async getApplicableSteps(context: OnboardingContext): Promise<OnboardingStep[]> {
    const sortedSteps = this.getStepsSorted()
    const applicableSteps: OnboardingStep[] = []

    for (const step of sortedSteps) {
      // Check condition if present
      if (step.condition) {
        const conditionResult = await step.condition(context)
        if (!conditionResult) {
          continue
        }
      }

      // Check if dependencies are met
      if (step.dependencies && step.dependencies.length > 0) {
        const dependenciesMet = step.dependencies.every((depId) =>
          context.completedStepIds.includes(depId)
        )
        if (!dependenciesMet) {
          continue
        }
      }

      applicableSteps.push(step)
    }

    return applicableSteps
  }

  /**
   * Gets the next incomplete step for a workspace.
   *
   * Returns the first applicable step that is not in completedStepIds.
   * Returns null if all applicable steps are complete.
   *
   * @param context - Current onboarding context
   * @returns Promise resolving to next step or null
   */
  async getNextStep(context: OnboardingContext): Promise<OnboardingStep | null> {
    const applicableSteps = await this.getApplicableSteps(context)

    for (const step of applicableSteps) {
      if (!context.completedStepIds.includes(step.id)) {
        return step
      }
    }

    return null
  }

  /**
   * Gets the next required incomplete step.
   *
   * Similar to getNextStep but only considers required steps.
   * Returns null if all required steps are complete OR if a
   * required step has unmet dependencies.
   *
   * @param context - Current onboarding context
   * @returns Promise resolving to next required step or null
   */
  async getNextRequiredStep(context: OnboardingContext): Promise<OnboardingStep | null> {
    const sortedSteps = this.getStepsSorted()

    for (const step of sortedSteps) {
      // Skip optional steps
      if (!step.required) {
        continue
      }

      // Skip completed steps
      if (context.completedStepIds.includes(step.id)) {
        continue
      }

      // Check condition if present
      if (step.condition) {
        const conditionResult = await step.condition(context)
        if (!conditionResult) {
          continue
        }
      }

      // Check if dependencies are met
      if (step.dependencies && step.dependencies.length > 0) {
        const dependenciesMet = step.dependencies.every((depId) =>
          context.completedStepIds.includes(depId)
        )
        if (!dependenciesMet) {
          // Required step has unmet dependencies - wait for them
          return null
        }
      }

      return step
    }

    return null
  }

  /**
   * Checks if all required steps are complete.
   *
   * @param context - Current onboarding context
   * @returns Promise resolving to true if onboarding is complete
   */
  async isOnboardingComplete(context: OnboardingContext): Promise<boolean> {
    const nextRequired = await this.getNextRequiredStep(context)
    return nextRequired === null
  }

  /**
   * Gets the count of required steps.
   *
   * @returns Number of steps where required === true
   */
  getRequiredStepCount(): number {
    return this.getAllSteps().filter((step) => step.required).length
  }

  /**
   * Gets the total number of registered steps.
   *
   * @returns Total step count
   */
  getStepCount(): number {
    return this.steps.size
  }

  /**
   * Validates a step definition.
   *
   * Throws descriptive errors for invalid configurations.
   * Called during registration to catch errors early.
   *
   * @param step - Step definition to validate
   * @throws Error if validation fails
   */
  private validateStep(step: OnboardingStep): void {
    if (!step.id || typeof step.id !== 'string') {
      throw new Error('Onboarding step must have a string id')
    }

    if (!step.title || typeof step.title !== 'string') {
      throw new Error(`Onboarding step "${step.id}" must have a title`)
    }

    if (!step.description || typeof step.description !== 'string') {
      throw new Error(`Onboarding step "${step.id}" must have a description`)
    }

    if (typeof step.order !== 'number') {
      throw new Error(`Onboarding step "${step.id}" must have a numeric order`)
    }

    if (typeof step.required !== 'boolean') {
      throw new Error(`Onboarding step "${step.id}" must have a boolean required field`)
    }

    if (!step.component) {
      throw new Error(`Onboarding step "${step.id}" must have a component`)
    }

    if (typeof step.execute !== 'function') {
      throw new Error(`Onboarding step "${step.id}" must have an execute function`)
    }

    // Validate dependency format (can't validate existence at registration time)
    if (step.dependencies) {
      for (const depId of step.dependencies) {
        if (typeof depId !== 'string') {
          throw new Error(`Onboarding step "${step.id}" has invalid dependency: ${depId}`)
        }
      }
    }
  }

  /**
   * Clears all registered steps.
   *
   * Only for testing purposes - should not be called in production.
   */
  clear(): void {
    this.steps.clear()
  }
}

/**
 * Singleton instance of the onboarding step registry.
 *
 * Import this in step definition files to register steps,
 * and in runtime code to query step information.
 */
export const stepRegistry = new OnboardingStepRegistry()
