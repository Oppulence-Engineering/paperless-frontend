/**
 * @fileoverview Core type definitions for the onboarding system.
 *
 * This module defines all types using Zod schemas for runtime validation
 * with TypeScript type inference. All types follow the pattern:
 * 1. Define Zod schema with JSDoc documentation
 * 2. Export inferred TypeScript type using z.infer<>
 *
 * This approach ensures:
 * - Runtime validation at API boundaries
 * - Compile-time type safety in TypeScript
 * - Single source of truth for type definitions
 * - Self-documenting code with embedded validation rules
 */

import type { ComponentType } from 'react'
import { z } from 'zod'

// =============================================================================
// Core Onboarding Schemas
// =============================================================================

/**
 * Schema for onboarding context passed to all step operations.
 *
 * The context provides workspace/user information and tracks progress
 * through the onboarding flow. It is built from database state and
 * passed to step conditions, execution handlers, and components.
 */
export const OnboardingContextSchema = z.object({
  /** Unique identifier of the workspace being onboarded */
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  /** Authenticated user's ID performing the onboarding */
  userId: z.string().min(1, 'User ID is required'),
  /** User's email address (optional, used for account provisioning) */
  userEmail: z.string().email().optional(),
  /** Display name of the workspace */
  workspaceName: z.string().min(1, 'Workspace name is required'),
  /** Array of step IDs that have been completed in order */
  completedStepIds: z.array(z.string()),
  /** Results from completed steps, keyed by step ID for dependent access */
  stepResults: z.record(z.string(), z.unknown()),
})

/** Runtime-validated onboarding context type */
export type OnboardingContext = z.infer<typeof OnboardingContextSchema>

/**
 * Schema for step status enumeration.
 *
 * Represents the lifecycle states a step can be in:
 * - pending: Not yet started
 * - in_progress: Currently executing
 * - completed: Successfully finished
 * - failed: Encountered an error
 * - skipped: Intentionally bypassed (optional steps)
 */
export const StepStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'failed',
  'skipped',
])

/** Step status type */
export type StepStatus = z.infer<typeof StepStatusSchema>

/**
 * Schema for onboarding state returned by API endpoints.
 *
 * Represents a snapshot of the onboarding progress for a workspace,
 * including which steps are complete, current step, and overall status.
 */
export const OnboardingStateSchema = z.object({
  /** Whether all required steps have been completed */
  isComplete: z.boolean(),
  /** ID of the currently active step, or null if complete */
  currentStepId: z.string().nullable(),
  /** Map of step IDs to their current status */
  stepStatuses: z.record(z.string(), StepStatusSchema),
  /** Results from completed steps (for dependent step access) */
  stepResults: z.record(z.string(), z.unknown()),
  /** Ordered array of completed step IDs */
  completedStepIds: z.array(z.string()),
  /** Total number of steps in the onboarding flow */
  totalSteps: z.number().int().nonnegative(),
  /** Number of steps that have been completed */
  completedCount: z.number().int().nonnegative(),
})

/** Runtime-validated onboarding state type */
export type OnboardingState = z.infer<typeof OnboardingStateSchema>

// =============================================================================
// Step Execution Result Schemas
// =============================================================================

/**
 * Schema for successful step execution with a result.
 */
export const StepExecutionSuccessSchema = z.object({
  success: z.literal(true),
  result: z.unknown(),
})

/**
 * Schema for failed step execution.
 */
export const StepExecutionFailureSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})

/**
 * Schema for skipped step execution.
 */
export const StepExecutionSkippedSchema = z.object({
  success: z.literal(true),
  skipped: z.literal(true),
})

/**
 * Schema for step execution result (union type).
 *
 * Represents the outcome of executing an onboarding step:
 * - Success with result data
 * - Failure with error message
 * - Success but skipped (step was already complete)
 *
 * Note: Uses z.union instead of z.discriminatedUnion because both
 * success and skipped cases have `success: true`.
 */
export const StepExecutionResultSchema = z.union([
  StepExecutionSuccessSchema,
  StepExecutionSkippedSchema,
  StepExecutionFailureSchema,
])

/** Step execution result type (generic version for typed results) */
export type StepExecutionResult<TStepResult = unknown> =
  | { success: true; result: TStepResult }
  | { success: false; error: string }
  | { success: true; skipped: true }

// =============================================================================
// Step Props Interface (React Component)
// =============================================================================

/**
 * Props interface for onboarding step React components.
 *
 * Step components receive these props to render UI and interact
 * with the onboarding framework. The generic parameters allow
 * type-safe access to step-specific data and results.
 *
 * @typeParam TStepData - Type of data the step collects (form state)
 * @typeParam TStepResult - Type of result the step produces
 */
export interface OnboardingStepProps<
  TStepData = Record<string, unknown>,
  TStepResult = unknown,
> {
  /** Current step data (form state, user input) */
  data: TStepData
  /** Callback to update step data (partial merge) */
  setData: (data: Partial<TStepData>) => void
  /** Callback to mark step complete with result */
  onComplete: (result: TStepResult) => Promise<void>
  /** Callback to report step failure */
  onError: (error: Error) => void
  /** Callback to skip step (only for optional steps) */
  onSkip?: () => void
  /** Current onboarding context (workspace, user, progress) */
  context: OnboardingContext
  /** Whether step execution is in progress */
  isExecuting: boolean
  /** Results from completed previous steps */
  previousResults: Record<string, unknown>
}

// =============================================================================
// Step Definition Interface
// =============================================================================

/**
 * Interface for onboarding step definitions.
 *
 * Each step in the onboarding flow implements this interface.
 * Steps are self-describing with metadata (title, description, order)
 * and self-executing with their own logic (execute, rollback).
 *
 * The interface uses generics to ensure type safety:
 * - TStepData: Input data the step collects from users
 * - TStepResult: Output data the step produces on completion
 *
 * @typeParam TStepData - Schema type for step input data
 * @typeParam TStepResult - Schema type for step output result
 *
 * @example
 * ```typescript
 * const myStep: OnboardingStep<MyInputData, MyResult> = {
 *   id: 'my-step',
 *   title: 'Configure Settings',
 *   description: 'Set up your preferences',
 *   order: 2,
 *   required: true,
 *   dataSchema: MyInputDataSchema,
 *   resultSchema: MyResultSchema,
 *   component: MyStepComponent,
 *   execute: async (data, context) => {
 *     // Step logic here
 *     return { success: true };
 *   },
 * };
 * ```
 */
export interface OnboardingStep<
  TStepData = Record<string, unknown>,
  TStepResult = unknown,
> {
  /**
   * Unique identifier for the step.
   * Used for dependency resolution, state tracking, and routing.
   * Must be kebab-case and globally unique.
   */
  id: string

  /**
   * Human-readable title displayed in the UI.
   * Should be concise (2-4 words) and action-oriented.
   */
  title: string

  /**
   * Longer description explaining what the step does.
   * Displayed to users during the onboarding flow.
   */
  description: string

  /**
   * Execution order (lower numbers run first).
   * Used to determine step sequence in the onboarding flow.
   * Steps with dependencies are automatically ordered correctly.
   */
  order: number

  /**
   * Whether this step must be completed for onboarding to finish.
   * Optional steps can be skipped by users.
   */
  required: boolean

  /**
   * Optional condition function to determine if step should run.
   * If returns false, step is skipped entirely (not shown to user).
   * Use for conditional steps based on workspace/user state.
   */
  condition?: (context: OnboardingContext) => boolean | Promise<boolean>

  /**
   * IDs of steps that must complete before this step can run.
   * Framework ensures dependencies are satisfied before execution.
   * Empty array or undefined means no dependencies.
   */
  dependencies?: string[]

  /**
   * Zod schema for validating step input data.
   * Applied before execute() is called.
   * Provides runtime validation with TypeScript inference.
   */
  dataSchema?: z.ZodSchema<TStepData>

  /**
   * Zod schema for validating step result.
   * Applied after execute() returns.
   * Ensures result matches expected shape for dependent steps.
   */
  resultSchema?: z.ZodSchema<TStepResult>

  /**
   * React component that renders the step UI.
   * Receives OnboardingStepProps with typed data/result.
   */
  component: ComponentType<OnboardingStepProps<TStepData, TStepResult>>

  /**
   * Async handler that executes the step logic.
   * Called after data validation passes.
   * Should perform API calls, provisioning, etc.
   *
   * @param data - Validated input data from the step form
   * @param context - Current onboarding context
   * @returns Promise resolving to step result
   * @throws Error on failure (caught and displayed to user)
   */
  execute: (data: TStepData, context: OnboardingContext) => Promise<TStepResult>

  /**
   * Optional cleanup handler for step rollback.
   * Called when a dependent step fails or user abandons onboarding.
   * Should undo any side effects from execute().
   *
   * @param result - The result from execute() (if available)
   * @param context - Current onboarding context
   */
  rollback?: (result: TStepResult, context: OnboardingContext) => Promise<void>

  /**
   * Optional handler to check if step is already complete.
   * Called before execute() to skip already-completed steps.
   * Useful for resuming interrupted onboarding flows.
   *
   * @param context - Current onboarding context
   * @returns True if step should be skipped
   */
  checkCompletion?: (context: OnboardingContext) => Promise<boolean>
}

// =============================================================================
// Factory Configuration Schemas
// =============================================================================

/**
 * Schema for OAuth provider configuration.
 * Defines supported OAuth providers for the onboarding flow.
 * Note: Provider IDs should match betterAuth provider configurations
 * (e.g., 'google-email' for Gmail with email scopes).
 */
export const OAuthProviderSchema = z.enum(['google', 'google-email', 'github', 'microsoft', 'slack'])

/** OAuth provider type */
export type OAuthProvider = z.infer<typeof OAuthProviderSchema>

/**
 * Schema for OAuth token response.
 * Represents the data returned after successful OAuth authentication.
 */
export const OAuthTokensSchema = z.object({
  /** Account ID from the OAuth provider */
  accountId: z.string(),
  /** User's email from the OAuth provider */
  email: z.string().email().optional(),
  /** Access token for API calls */
  accessToken: z.string().optional(),
})

/** OAuth tokens type */
export type OAuthTokens = z.infer<typeof OAuthTokensSchema>

/**
 * Configuration interface for API-based onboarding steps.
 *
 * Use with createApiStep() factory to create steps that:
 * - Make POST requests to an API endpoint
 * - Transform request/response data
 * - Handle loading states and errors automatically
 *
 * @typeParam TStepData - Type of data sent to the API
 * @typeParam TStepResult - Type of result from the API
 */
export interface ApiStepConfig<TStepData, TStepResult> {
  /** Unique step identifier */
  id: string
  /** Display title */
  title: string
  /** Description shown to users */
  description: string
  /** Execution order */
  order: number
  /** Whether step is required (default: true) */
  required?: boolean
  /** Step IDs that must complete first */
  dependencies?: string[]
  /** Condition for showing step */
  condition?: (context: OnboardingContext) => boolean | Promise<boolean>
  /** Input data validation schema */
  dataSchema?: z.ZodSchema<TStepData>
  /** Result validation schema */
  resultSchema?: z.ZodSchema<TStepResult>
  /** React component for step UI */
  component: ComponentType<OnboardingStepProps<TStepData, TStepResult>>
  /**
   * API endpoint path.
   * Can include [workspaceId] placeholder which is replaced at runtime.
   * @example '/api/onboarding/[workspaceId]/provision'
   */
  apiEndpoint: string
  /**
   * Transform step data before sending to API.
   * Allows reshaping data to match API expectations.
   */
  transformRequest?: (data: TStepData, context: OnboardingContext) => unknown
  /**
   * Transform API response to step result.
   * Allows extracting specific fields from API response.
   */
  transformResponse?: (response: unknown) => TStepResult
}

/**
 * Configuration interface for OAuth-based onboarding steps.
 *
 * Use with createOAuthStep() factory to create steps that:
 * - Redirect users to OAuth provider
 * - Handle OAuth callback and token storage
 * - Execute custom logic after successful auth
 *
 * @typeParam TStepResult - Type of result after OAuth success
 */
export interface OAuthStepConfig<TStepResult> {
  /** Unique step identifier */
  id: string
  /** Display title */
  title: string
  /** Description shown to users */
  description: string
  /** Execution order */
  order: number
  /** Whether step is required (default: false for OAuth) */
  required?: boolean
  /** Step IDs that must complete first */
  dependencies?: string[]
  /** Condition for showing step */
  condition?: (context: OnboardingContext) => boolean | Promise<boolean>
  /** React component for step UI */
  component: ComponentType<OnboardingStepProps<Record<string, never>, TStepResult>>
  /** OAuth provider to use */
  provider: OAuthProvider
  /** OAuth scopes to request */
  scopes: string[]
  /**
   * Handler called after successful OAuth flow.
   * Receives tokens from the OAuth callback.
   */
  onOAuthSuccess: (tokens: OAuthTokens, context: OnboardingContext) => Promise<TStepResult>
}

/**
 * Configuration interface for form-based onboarding steps.
 *
 * Use with createFormStep() factory to create steps that:
 * - Display a form for user input
 * - Validate form data with Zod schema
 * - Process form submission
 *
 * @typeParam TStepData - Type of form data
 * @typeParam TStepResult - Type of result after submission
 */
export interface FormStepConfig<TStepData, TStepResult> {
  /** Unique step identifier */
  id: string
  /** Display title */
  title: string
  /** Description shown to users */
  description: string
  /** Execution order */
  order: number
  /** Whether step is required (default: true) */
  required?: boolean
  /** Step IDs that must complete first */
  dependencies?: string[]
  /** Condition for showing step */
  condition?: (context: OnboardingContext) => boolean | Promise<boolean>
  /** Form data validation schema (required for form steps) */
  dataSchema: z.ZodSchema<TStepData>
  /** Result validation schema */
  resultSchema?: z.ZodSchema<TStepResult>
  /** React component for step UI */
  component: ComponentType<OnboardingStepProps<TStepData, TStepResult>>
  /**
   * Handler to process form submission.
   * Called after data validation passes.
   */
  onSubmit: (data: TStepData, context: OnboardingContext) => Promise<TStepResult>
}

// =============================================================================
// API Request/Response Schemas
// =============================================================================

/**
 * Schema for completing an onboarding step via API.
 * Used by POST /api/onboarding/[workspaceId]
 */
export const CompleteStepRequestSchema = z.object({
  /** ID of the step to mark as complete */
  stepId: z.string().min(1, 'Step ID is required'),
  /** Optional result data from the step */
  result: z.unknown().optional(),
  /** Whether step was skipped (for optional steps) */
  skipped: z.boolean().optional(),
})

/** Complete step request type */
export type CompleteStepRequest = z.infer<typeof CompleteStepRequestSchema>

/**
 * Schema for executing an onboarding step via API.
 * Used by POST /api/onboarding/[workspaceId]/execute
 */
export const ExecuteStepRequestSchema = z.object({
  /** ID of the step to execute */
  stepId: z.string().min(1, 'Step ID is required'),
  /** Input data for the step */
  data: z.record(z.string(), z.unknown()).optional().default({}),
})

/** Execute step request type */
export type ExecuteStepRequest = z.infer<typeof ExecuteStepRequestSchema>

/**
 * Schema for API success response.
 */
export const ApiSuccessResponseSchema = z.object({
  success: z.literal(true),
})

/**
 * Schema for API error response.
 */
export const ApiErrorResponseSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
})

/** API error response type */
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>
