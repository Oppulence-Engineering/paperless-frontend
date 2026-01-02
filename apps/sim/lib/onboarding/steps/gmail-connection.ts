/**
 * @fileoverview Gmail connection onboarding step.
 *
 * This step enables users to connect their Gmail account during onboarding.
 * It leverages the existing OAuth infrastructure from betterAuth and creates
 * a workspace-account association in the workspace_oauth_account table.
 *
 * ## What This Step Does
 *
 * 1. Initiates OAuth flow via `client.oauth2.link("google-email")`
 * 2. User authorizes Gmail access on Google's consent screen
 * 3. betterAuth handles the callback and stores tokens in the account table
 * 4. The step links the OAuth account to the workspace
 *
 * ## OAuth Flow
 *
 * The step uses betterAuth's built-in OAuth linking functionality:
 * - Provider: `google-email` (defined in lib/oauth/oauth.ts)
 * - Scopes: Gmail send access for email outreach
 * - Tokens: Stored in betterAuth's account table, linked via junction table
 *
 * ## Why Junction Table
 *
 * Multiple email accounts can be connected to a single workspace, enabling:
 * - Team members to use different sender addresses
 * - A/B testing with different email accounts
 * - Backup accounts for high-volume sending
 *
 * @example Result on success:
 * ```typescript
 * {
 *   accountId: 'acc_123',
 *   email: 'user@gmail.com',
 *   workspaceAccountId: 'woa_456',
 * }
 * ```
 */

import { z } from 'zod'
import { createOAuthStep } from '../factory'
import type { OnboardingStep } from '../types'

// =============================================================================
// Schema Definitions
// =============================================================================

/**
 * Schema for the Gmail connection step result.
 *
 * Contains the OAuth account information and the workspace link ID.
 */
export const GmailConnectionResultSchema = z.object({
  /**
   * The OAuth account ID from betterAuth's account table.
   */
  accountId: z.string().min(1, 'Account ID is required'),

  /**
   * The email address of the connected Gmail account.
   */
  email: z.string().email('Invalid email address'),

  /**
   * The workspace_oauth_account record ID linking account to workspace.
   */
  workspaceAccountId: z.string().min(1, 'Workspace account ID is required'),
})

/**
 * Type for Gmail connection result.
 * Inferred from the Zod schema for type safety.
 */
export type GmailConnectionResult = z.infer<typeof GmailConnectionResultSchema>

// =============================================================================
// Step Definition
// =============================================================================

/**
 * Gmail connection onboarding step.
 *
 * This step is:
 * - Required: Must complete for onboarding to finish (enables email outreach)
 * - OAuth-based: Uses Google OAuth for Gmail access
 * - Workspace-linked: Creates a junction record for multi-account support
 *
 * The step uses the OAuth factory pattern, which:
 * - Throws if execute() is called directly (OAuth completes via callback)
 * - Provides checkCompletion() to verify existing connections
 *
 * The component property returns null because this step's UI is defined
 * separately in `app/onboarding/steps/gmail-connection-step.tsx`.
 * This separation avoids circular dependencies between lib and app code.
 */
export const gmailConnectionStep: OnboardingStep<
  Record<string, never>,
  GmailConnectionResult
> = createOAuthStep({
  // Step metadata
  id: 'gmail-connection',
  title: 'Connect Gmail',
  description: 'Connect your Gmail account to send emails from your prospecting campaigns.',
  order: 2,
  required: true,

  // Dependencies
  dependencies: ['lead-scraper-provisioning'],

  // OAuth configuration
  provider: 'google-email',
  scopes: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],

  // UI component (defined separately to avoid circular deps)
  component: () => null,

  /**
   * Handles successful OAuth authorization.
   * Creates the workspace-account link after tokens are stored.
   *
   * This is called by the UI component after the OAuth callback
   * successfully processes the authorization code.
   *
   * @param tokens - OAuth tokens received (stored by betterAuth)
   * @param context - Onboarding context with workspace info
   * @returns The Gmail connection result
   */
  onOAuthSuccess: async (tokens, context): Promise<GmailConnectionResult> => {
    // This handler is invoked by the UI after betterAuth processes the callback.
    // The actual linking happens via the /api/onboarding/.../link-gmail endpoint.
    // This function is here for the factory pattern but won't be directly called;
    // instead, the UI component handles the flow.

    // Return a placeholder - actual implementation in UI component
    return {
      accountId: tokens.accountId || '',
      email: tokens.email || '',
      workspaceAccountId: '',
    }
  },
})

