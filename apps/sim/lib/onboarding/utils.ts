/**
 * @fileoverview Utility functions for onboarding state management.
 *
 * Provides database operations for:
 * - Reading onboarding state for a workspace
 * - Marking steps as completed
 * - Marking onboarding as complete
 * - Building onboarding context from database
 *
 * These utilities are used by:
 * - API routes (to read/update state)
 * - Hooks (via API routes)
 * - Executor (to check completion)
 *
 * ## Data Model
 *
 * Onboarding state is stored in the `workspace` table:
 * - `onboardingCompleted`: boolean - true when all required steps done
 * - `onboardingStep`: string - comma-separated list of completed step IDs
 *
 * @example
 * ```typescript
 * // Get current state
 * const state = await getOnboardingState(workspaceId);
 *
 * // Mark step complete
 * await markStepCompleted(workspaceId, 'lead-scraper-provisioning', result);
 *
 * // Finish onboarding
 * await markOnboardingComplete(workspaceId);
 * ```
 */

import { db } from '@sim/db'
import { workspace } from '@sim/db/schema'
import { createLogger } from '@sim/logger'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { stepRegistry } from './registry'
import {
  OnboardingContextSchema,
  OnboardingStateSchema,
  type OnboardingContext,
  type OnboardingState,
  type StepStatus,
} from './types'

const logger = createLogger('OnboardingUtils')

// =============================================================================
// Input Validation Schemas
// =============================================================================

/**
 * Schema for workspace ID parameter validation.
 */
const WorkspaceIdSchema = z.string().min(1, 'Workspace ID is required')

/**
 * Schema for step ID parameter validation.
 */
const StepIdSchema = z.string().min(1, 'Step ID is required')

// =============================================================================
// State Serialization
// =============================================================================

/**
 * Parses the onboardingStep database field into an array of step IDs.
 *
 * The field stores completed step IDs as a comma-separated string.
 * Returns empty array if null or empty.
 *
 * @param onboardingStep - Raw database field value
 * @returns Array of completed step IDs
 */
function parseCompletedStepIds(onboardingStep: string | null): string[] {
  if (!onboardingStep) {
    return []
  }
  return onboardingStep.split(',').filter(Boolean)
}

/**
 * Serializes an array of step IDs for database storage.
 *
 * @param stepIds - Array of step IDs
 * @returns Comma-separated string
 */
function serializeCompletedStepIds(stepIds: string[]): string {
  return stepIds.join(',')
}

/**
 * Finds the current step ID from step statuses.
 *
 * @param stepStatuses - Map of step IDs to statuses
 * @returns ID of step with 'in_progress' status, or null
 */
function findCurrentStepId(stepStatuses: Record<string, StepStatus>): string | null {
  for (const [stepId, status] of Object.entries(stepStatuses)) {
    if (status === 'in_progress') {
      return stepId
    }
  }
  return null
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Gets the current onboarding state for a workspace.
 *
 * Reads workspace data from the database and combines it with
 * step registry information to build a complete state object.
 *
 * @param workspaceId - The workspace ID to get state for
 * @returns OnboardingState object, or null if workspace not found
 *
 * @example
 * ```typescript
 * const state = await getOnboardingState('workspace-123');
 * if (state?.isComplete) {
 *   console.log('Onboarding done!');
 * } else {
 *   console.log(`Current step: ${state?.currentStepId}`);
 * }
 * ```
 */
export async function getOnboardingState(
  workspaceId: string
): Promise<OnboardingState | null> {
  // Validate input
  const parsedId = WorkspaceIdSchema.safeParse(workspaceId)
  if (!parsedId.success) {
    logger.error('Invalid workspace ID', { workspaceId })
    return null
  }

  // Fetch workspace data
  const [workspaceData] = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      onboardingCompleted: workspace.onboardingCompleted,
      onboardingStep: workspace.onboardingStep,
    })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1)

  if (!workspaceData) {
    return null
  }

  // Build step statuses
  const allSteps = stepRegistry.getStepsSorted()
  const completedStepIds = parseCompletedStepIds(workspaceData.onboardingStep)
  const stepStatuses: Record<string, StepStatus> = {}

  for (const step of allSteps) {
    if (completedStepIds.includes(step.id)) {
      stepStatuses[step.id] = 'completed'
    } else {
      stepStatuses[step.id] = 'pending'
    }
  }

  // Mark current step as in_progress if onboarding is not complete
  if (!workspaceData.onboardingCompleted) {
    const context: OnboardingContext = {
      workspaceId,
      userId: workspaceData.ownerId,
      workspaceName: workspaceData.name,
      completedStepIds,
      stepResults: {},
    }

    const nextStep = await stepRegistry.getNextStep(context)
    if (nextStep) {
      stepStatuses[nextStep.id] = 'in_progress'
    }
  }

  // Build and validate state object
  const state: OnboardingState = {
    isComplete: workspaceData.onboardingCompleted,
    currentStepId: workspaceData.onboardingCompleted ? null : findCurrentStepId(stepStatuses),
    stepStatuses,
    stepResults: {},
    completedStepIds,
    totalSteps: allSteps.length,
    completedCount: completedStepIds.length,
  }

  return state
}

/**
 * Marks a step as completed and updates the workspace record.
 *
 * Appends the step ID to the onboardingStep field if not already present.
 * Step results are logged but not stored in the database (they're transient).
 *
 * @param workspaceId - The workspace ID
 * @param stepId - The step ID to mark as complete
 * @param stepResult - Optional result data (for logging)
 * @throws Error if workspace not found
 *
 * @example
 * ```typescript
 * await markStepCompleted(
 *   'workspace-123',
 *   'lead-scraper-provisioning',
 *   { organizationId: 'org-456', tenantId: 'tenant-789' }
 * );
 * ```
 */
export async function markStepCompleted(
  workspaceId: string,
  stepId: string,
  stepResult?: unknown
): Promise<void> {
  // Validate inputs
  const parsedWorkspaceId = WorkspaceIdSchema.safeParse(workspaceId)
  const parsedStepId = StepIdSchema.safeParse(stepId)

  if (!parsedWorkspaceId.success || !parsedStepId.success) {
    throw new Error('Invalid workspace ID or step ID')
  }

  // Fetch current state
  const [workspaceData] = await db
    .select({
      onboardingStep: workspace.onboardingStep,
    })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1)

  if (!workspaceData) {
    throw new Error(`Workspace not found: ${workspaceId}`)
  }

  // Add step to completed list if not already present
  const completedStepIds = parseCompletedStepIds(workspaceData.onboardingStep)

  if (!completedStepIds.includes(stepId)) {
    completedStepIds.push(stepId)
  }

  // Update workspace
  await db
    .update(workspace)
    .set({
      onboardingStep: serializeCompletedStepIds(completedStepIds),
      updatedAt: new Date(),
    })
    .where(eq(workspace.id, workspaceId))

  logger.info(`Marked step completed: ${stepId}`, {
    workspaceId,
    hasResult: stepResult !== undefined,
  })
}

/**
 * Marks onboarding as complete for a workspace.
 *
 * Sets the onboardingCompleted flag to true. Should be called
 * after all required steps have been completed.
 *
 * @param workspaceId - The workspace ID
 *
 * @example
 * ```typescript
 * // After all steps complete
 * await markOnboardingComplete('workspace-123');
 * // User will now be redirected to workspace
 * ```
 */
export async function markOnboardingComplete(workspaceId: string): Promise<void> {
  const parsedId = WorkspaceIdSchema.safeParse(workspaceId)
  if (!parsedId.success) {
    throw new Error('Invalid workspace ID')
  }

  await db
    .update(workspace)
    .set({
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(workspace.id, workspaceId))

  logger.info('Marked onboarding complete', { workspaceId })
}

/**
 * Checks if onboarding is complete for a workspace.
 *
 * Simple boolean check - use getOnboardingState for full state.
 *
 * @param workspaceId - The workspace ID
 * @returns True if onboarding is complete
 *
 * @example
 * ```typescript
 * if (await isOnboardingComplete('workspace-123')) {
 *   router.push(`/workspace/${workspaceId}/w`);
 * } else {
 *   router.push(`/onboarding?workspaceId=${workspaceId}`);
 * }
 * ```
 */
export async function isOnboardingComplete(workspaceId: string): Promise<boolean> {
  const [workspaceData] = await db
    .select({
      onboardingCompleted: workspace.onboardingCompleted,
    })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1)

  return workspaceData?.onboardingCompleted ?? false
}

/**
 * Gets the next required step for a workspace.
 *
 * Convenience function that builds context and queries the registry.
 *
 * @param workspaceId - The workspace ID
 * @param userId - The user ID
 * @param userEmail - The user's email (optional)
 * @returns The next required step, or null if complete
 */
export async function getNextRequiredStep(
  workspaceId: string,
  userId: string,
  userEmail?: string
) {
  const [workspaceData] = await db
    .select({
      name: workspace.name,
      onboardingStep: workspace.onboardingStep,
      onboardingCompleted: workspace.onboardingCompleted,
    })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1)

  if (!workspaceData) {
    return null
  }

  if (workspaceData.onboardingCompleted) {
    return null
  }

  const completedStepIds = parseCompletedStepIds(workspaceData.onboardingStep)

  const context: OnboardingContext = {
    workspaceId,
    userId,
    userEmail,
    workspaceName: workspaceData.name,
    completedStepIds,
    stepResults: {},
  }

  return stepRegistry.getNextRequiredStep(context)
}

/**
 * Builds an OnboardingContext from workspace data.
 *
 * Used by API routes to construct context for step execution.
 *
 * @param workspaceId - The workspace ID
 * @param userId - The user ID
 * @param userEmail - The user's email (optional)
 * @returns OnboardingContext or null if workspace not found
 */
export async function buildOnboardingContext(
  workspaceId: string,
  userId: string,
  userEmail?: string
): Promise<OnboardingContext | null> {
  const [workspaceData] = await db
    .select({
      name: workspace.name,
      onboardingStep: workspace.onboardingStep,
    })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1)

  if (!workspaceData) {
    return null
  }

  const completedStepIds = parseCompletedStepIds(workspaceData.onboardingStep)

  const context: OnboardingContext = {
    workspaceId,
    userId,
    userEmail,
    workspaceName: workspaceData.name,
    completedStepIds,
    stepResults: {},
  }

  // Validate context shape
  const parsed = OnboardingContextSchema.safeParse(context)
  if (!parsed.success) {
    logger.error('Failed to build valid onboarding context', {
      workspaceId,
      errors: parsed.error.errors,
    })
    return null
  }

  return parsed.data
}
