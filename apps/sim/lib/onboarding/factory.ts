/**
 * @fileoverview Factory functions for creating onboarding steps.
 *
 * Provides reusable templates that eliminate boilerplate when defining
 * new onboarding steps. Each factory handles common patterns:
 *
 * - **createApiStep**: Steps that call an API endpoint
 * - **createOAuthStep**: Steps that use OAuth authentication
 * - **createFormStep**: Steps that collect user input via forms
 *
 * ## Why Factories?
 *
 * 1. **DRY Code**: Common logic (error handling, loading states) in one place
 * 2. **Consistency**: All steps of the same type behave identically
 * 3. **Type Safety**: Generic parameters ensure type-safe step data/results
 * 4. **Maintainability**: Bug fixes apply to all steps using the factory
 *
 * @example
 * ```typescript
 * import { createApiStep } from './factory';
 * import { z } from 'zod';
 *
 * const ResultSchema = z.object({ id: z.string() });
 *
 * export const myStep = createApiStep({
 *   id: 'my-step',
 *   title: 'Create Resource',
 *   description: 'Creates a new resource',
 *   order: 1,
 *   required: true,
 *   resultSchema: ResultSchema,
 *   component: MyStepComponent,
 *   apiEndpoint: '/api/onboarding/[workspaceId]/create',
 * });
 * ```
 */

import { createLogger } from '@sim/logger'
import type {
  ApiStepConfig,
  FormStepConfig,
  OAuthStepConfig,
  OnboardingContext,
  OnboardingStep,
} from './types'

const logger = createLogger('OnboardingFactory')

/**
 * Creates an API-based onboarding step.
 *
 * The resulting step will:
 * 1. Replace [workspaceId] in the endpoint with actual ID
 * 2. Transform request data (if transformer provided)
 * 3. Make POST request to the endpoint
 * 4. Handle errors and parse response
 * 5. Transform response (if transformer provided)
 * 6. Return typed result
 *
 * @typeParam TStepData - Type of data sent to the API
 * @typeParam TStepResult - Type of result from the API
 * @param config - Configuration for the API step
 * @returns Fully configured OnboardingStep
 *
 * @example
 * ```typescript
 * const provisionStep = createApiStep({
 *   id: 'provision-account',
 *   title: 'Setting up account',
 *   description: 'Creating your account...',
 *   order: 1,
 *   required: true,
 *   component: ProvisionComponent,
 *   apiEndpoint: '/api/onboarding/[workspaceId]/provision',
 *   transformRequest: (_, ctx) => ({
 *     workspaceId: ctx.workspaceId,
 *     userId: ctx.userId,
 *   }),
 * });
 * ```
 */
export function createApiStep<TStepData = Record<string, unknown>, TStepResult = unknown>(
  config: ApiStepConfig<TStepData, TStepResult>
): OnboardingStep<TStepData, TStepResult> {
  return {
    id: config.id,
    title: config.title,
    description: config.description,
    order: config.order,
    required: config.required ?? true,
    dependencies: config.dependencies,
    condition: config.condition,
    dataSchema: config.dataSchema,
    resultSchema: config.resultSchema,
    component: config.component,

    /**
     * Executes the API call with error handling and response transformation.
     */
    execute: async (data: TStepData, context: OnboardingContext): Promise<TStepResult> => {
      // Replace [workspaceId] placeholder in endpoint
      const endpoint = config.apiEndpoint.replace('[workspaceId]', context.workspaceId)

      logger.info(`Executing API step: ${config.id}`, {
        endpoint,
        workspaceId: context.workspaceId,
      })

      // Transform request data if transformer provided
      const requestBody = config.transformRequest
        ? config.transformRequest(data, context)
        : data

      // Make the API call
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      // Handle error responses
      if (!response.ok) {
        let errorMessage = 'Step execution failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // Response body wasn't JSON
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        logger.error(`API step failed: ${config.id}`, {
          status: response.status,
          error: errorMessage,
        })
        throw new Error(errorMessage)
      }

      // Parse successful response
      const result = await response.json()

      logger.info(`API step completed: ${config.id}`, {
        workspaceId: context.workspaceId,
      })

      // Transform response if transformer provided
      return config.transformResponse ? config.transformResponse(result) : (result as TStepResult)
    },
  }
}

/**
 * Creates an OAuth-based onboarding step.
 *
 * OAuth steps differ from other steps in that they:
 * 1. Redirect users to an external OAuth provider
 * 2. Handle callback after user authorizes
 * 3. Store tokens and execute success handler
 *
 * The execute() method throws an error because OAuth steps
 * should complete via the OAuth callback, not direct execution.
 *
 * @typeParam TStepResult - Type of result after OAuth success
 * @param config - Configuration for the OAuth step
 * @returns Fully configured OnboardingStep
 *
 * @example
 * ```typescript
 * const gmailStep = createOAuthStep({
 *   id: 'connect-gmail',
 *   title: 'Connect Gmail',
 *   description: 'Connect your Gmail account',
 *   order: 2,
 *   required: false,
 *   provider: 'google',
 *   scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
 *   component: GmailConnectComponent,
 *   onOAuthSuccess: async (tokens, ctx) => {
 *     // Store credentials
 *     return { email: tokens.email };
 *   },
 * });
 * ```
 */
export function createOAuthStep<TStepResult = unknown>(
  config: OAuthStepConfig<TStepResult>
): OnboardingStep<Record<string, never>, TStepResult> {
  return {
    id: config.id,
    title: config.title,
    description: config.description,
    order: config.order,
    required: config.required ?? false, // OAuth steps optional by default
    dependencies: config.dependencies,
    condition: config.condition,
    component: config.component,

    /**
     * OAuth steps don't execute directly - they complete via OAuth callback.
     * This method throws to prevent incorrect usage.
     */
    execute: async (
      _data: Record<string, never>,
      context: OnboardingContext
    ): Promise<TStepResult> => {
      logger.warn(`OAuth step execute() called directly: ${config.id}`, {
        provider: config.provider,
        workspaceId: context.workspaceId,
      })

      // OAuth steps complete via callback, not direct execution
      throw new Error(
        `OAuth step "${config.id}" should be completed via OAuth callback. ` +
          `The step component should initiate the OAuth flow and call onComplete() ` +
          `after the callback is processed.`
      )
    },

    /**
     * Check if OAuth credentials already exist for this provider.
     */
    checkCompletion: async (context: OnboardingContext): Promise<boolean> => {
      // Check if this step has already been completed in a previous session
      return context.completedStepIds.includes(config.id)
    },
  }
}

/**
 * Creates a form-based onboarding step.
 *
 * Form steps collect user input and validate it with Zod.
 * The step:
 * 1. Displays a form using the provided component
 * 2. Validates input against dataSchema
 * 3. Calls onSubmit with validated data
 * 4. Returns the result
 *
 * @typeParam TStepData - Type of form data (validated by Zod)
 * @typeParam TStepResult - Type of result after submission
 * @param config - Configuration for the form step
 * @returns Fully configured OnboardingStep
 *
 * @example
 * ```typescript
 * const ProfileSchema = z.object({
 *   companyName: z.string().min(1),
 *   industry: z.string(),
 * });
 *
 * const profileStep = createFormStep({
 *   id: 'company-profile',
 *   title: 'Company Info',
 *   description: 'Tell us about your company',
 *   order: 3,
 *   required: true,
 *   dataSchema: ProfileSchema,
 *   component: ProfileFormComponent,
 *   onSubmit: async (data, ctx) => {
 *     await saveProfile(ctx.workspaceId, data);
 *     return { saved: true };
 *   },
 * });
 * ```
 */
export function createFormStep<TStepData = Record<string, unknown>, TStepResult = unknown>(
  config: FormStepConfig<TStepData, TStepResult>
): OnboardingStep<TStepData, TStepResult> {
  return {
    id: config.id,
    title: config.title,
    description: config.description,
    order: config.order,
    required: config.required ?? true,
    dependencies: config.dependencies,
    condition: config.condition,
    dataSchema: config.dataSchema,
    resultSchema: config.resultSchema,
    component: config.component,

    /**
     * Validates form data and calls the onSubmit handler.
     */
    execute: async (data: TStepData, context: OnboardingContext): Promise<TStepResult> => {
      logger.info(`Executing form step: ${config.id}`, {
        workspaceId: context.workspaceId,
      })

      // Validate data against schema (should already be validated by caller,
      // but we double-check for safety)
      const parseResult = config.dataSchema.safeParse(data)
      if (!parseResult.success) {
        const errorMessage = parseResult.error.errors.map((e) => e.message).join(', ')
        logger.error(`Form validation failed: ${config.id}`, {
          errors: parseResult.error.errors,
        })
        throw new Error(`Validation failed: ${errorMessage}`)
      }

      // Call the form submission handler with validated data
      const result = await config.onSubmit(parseResult.data, context)

      logger.info(`Form step completed: ${config.id}`, {
        workspaceId: context.workspaceId,
      })

      return result
    },
  }
}
