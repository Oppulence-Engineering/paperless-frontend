/**
 * @fileoverview Onboarding System Module
 *
 * This module provides an extensible, type-safe framework for user onboarding.
 * It uses a plugin-based architecture where steps are self-registering and
 * can be easily added without modifying core logic.
 *
 * ## Architecture Overview
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                          Onboarding System                          │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  Types      │ Zod schemas + TypeScript types for type safety       │
 * │  Registry   │ Central store for step definitions                   │
 * │  Factory    │ Helper functions to create common step patterns      │
 * │  Executor   │ Runtime execution with validation and rollback       │
 * │  Utils      │ Database operations for state management             │
 * │  Hooks      │ React hooks for client-side state                    │
 * │  Access     │ Authorization utilities for API routes               │
 * │  Steps      │ Actual step implementations                          │
 * └─────────────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Adding a New Step
 *
 * 1. Create a step file in `./steps/` using a factory function
 * 2. Create a UI component in `app/onboarding/steps/`
 * 3. Register the step in `./steps/index.ts`
 *
 * ## Example
 *
 * ```typescript
 * // 1. Define the step (lib/onboarding/steps/my-step.ts)
 * import { createApiStep } from '../factory';
 * import { z } from 'zod';
 *
 * const ResultSchema = z.object({ id: z.string() });
 *
 * export const myStep = createApiStep({
 *   id: 'my-step',
 *   title: 'My Step',
 *   description: 'Description shown to users',
 *   order: 2,
 *   required: true,
 *   resultSchema: ResultSchema,
 *   component: MyStepComponent,
 *   apiEndpoint: '/api/onboarding/[workspaceId]/my-step',
 * });
 *
 * // 2. Register (lib/onboarding/steps/index.ts)
 * import { stepRegistry } from '../registry';
 * import { myStep } from './my-step';
 * stepRegistry.register(myStep);
 * ```
 *
 * ## Key Design Decisions
 *
 * 1. **Zod for Types**: All types are defined as Zod schemas first, then
 *    inferred to TypeScript types. This ensures runtime validation at API
 *    boundaries while maintaining compile-time type safety.
 *
 * 2. **Self-Registering Steps**: Steps register themselves when imported.
 *    This allows adding new steps without modifying core framework code.
 *
 * 3. **Factory Pattern**: Common step patterns (API, OAuth, Form) are
 *    abstracted into factories to reduce boilerplate and ensure consistency.
 *
 * 4. **Separation of Concerns**: Each module has a single responsibility.
 *    Types don't know about database. Executor doesn't know about UI.
 *
 * @module onboarding
 */

// =============================================================================
// Core Types (Zod schemas + inferred types)
// =============================================================================

export type {
  ApiStepConfig,
  ApiErrorResponse,
  CompleteStepRequest,
  ExecuteStepRequest,
  FormStepConfig,
  OAuthProvider,
  OAuthStepConfig,
  OAuthTokens,
  OnboardingContext,
  OnboardingState,
  OnboardingStep,
  OnboardingStepProps,
  StepExecutionResult,
  StepStatus,
} from './types'

export {
  ApiErrorResponseSchema,
  ApiSuccessResponseSchema,
  CompleteStepRequestSchema,
  ExecuteStepRequestSchema,
  OAuthProviderSchema,
  OAuthTokensSchema,
  OnboardingContextSchema,
  OnboardingStateSchema,
  StepStatusSchema,
} from './types'

// =============================================================================
// Registry (Step storage and query)
// =============================================================================

export { stepRegistry } from './registry'

// =============================================================================
// Factories (Step creation helpers)
// =============================================================================

export { createApiStep, createFormStep, createOAuthStep } from './factory'

// =============================================================================
// Executor (Step execution pipeline)
// =============================================================================

export { OnboardingExecutor, stepExecutor } from './executor'

// =============================================================================
// Hooks (React state management)
// =============================================================================

export { useOnboarding, useOnboardingStep } from './hooks'
export type { UseOnboardingReturn, UseOnboardingStepReturn } from './hooks'

// =============================================================================
// Utilities (Database operations)
// =============================================================================

export {
  buildOnboardingContext,
  getNextRequiredStep,
  getOnboardingState,
  isOnboardingComplete,
  markOnboardingComplete,
  markStepCompleted,
} from './utils'

// =============================================================================
// Access Control (Authorization)
// =============================================================================

export { verifyWorkspaceAccess } from './access'

// =============================================================================
// Step Registration (Side effect import)
// =============================================================================

// Import steps module to trigger registration
// This must be last to ensure all dependencies are loaded
import './steps'
