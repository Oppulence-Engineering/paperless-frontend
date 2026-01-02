/**
 * @fileoverview React Query hooks for workspace email account management.
 *
 * Provides hooks for:
 * - Fetching linked email accounts for a workspace
 * - Linking new OAuth accounts to a workspace
 * - Unlinking accounts from a workspace
 * - Setting an account as primary
 *
 * These hooks manage the workspace_oauth_account junction table
 * that associates OAuth accounts with workspaces for email outreach.
 */

import { createLogger } from '@sim/logger'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const logger = createLogger('WorkspaceEmailAccountsQuery')

// =============================================================================
// Types
// =============================================================================

/**
 * Email account linked to a workspace.
 */
export interface WorkspaceEmailAccount {
  /** Unique ID of the workspace-account link */
  id: string
  /** OAuth account ID from betterAuth's account table */
  accountId: string
  /** Provider identifier (e.g., 'google-email') */
  provider: string
  /** User-friendly display name (typically email) */
  displayName: string | null
  /** Whether this is the primary account for the workspace */
  isPrimary: boolean
  /** When the account was linked */
  createdAt: string
}

/**
 * Response from the email accounts list endpoint.
 */
interface EmailAccountsResponse {
  accounts: WorkspaceEmailAccount[]
}

// =============================================================================
// Query Keys
// =============================================================================

/**
 * Query key factory for workspace email accounts.
 * Follows the pattern from oauth-connections.ts.
 */
export const workspaceEmailAccountsKeys = {
  all: ['workspaceEmailAccounts'] as const,
  list: (workspaceId: string) => [...workspaceEmailAccountsKeys.all, 'list', workspaceId] as const,
  detail: (workspaceId: string, accountId: string) =>
    [...workspaceEmailAccountsKeys.all, 'detail', workspaceId, accountId] as const,
}

// =============================================================================
// Fetch Functions
// =============================================================================

/**
 * Fetches all email accounts linked to a workspace.
 */
async function fetchWorkspaceEmailAccounts(workspaceId: string): Promise<WorkspaceEmailAccount[]> {
  const response = await fetch(`/api/workspaces/${workspaceId}/email-accounts`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to fetch email accounts')
  }

  const data: EmailAccountsResponse = await response.json()
  return data.accounts
}

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Hook to fetch email accounts linked to a workspace.
 *
 * @param workspaceId - The workspace ID to fetch accounts for
 * @param enabled - Whether to enable the query (default: true when workspaceId is provided)
 *
 * @example
 * ```tsx
 * function EmailAccountsList({ workspaceId }) {
 *   const { data: accounts, isLoading, error } = useWorkspaceEmailAccounts(workspaceId);
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <ul>
 *       {accounts?.map(account => (
 *         <li key={account.id}>{account.displayName}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useWorkspaceEmailAccounts(workspaceId?: string, enabled = true) {
  return useQuery({
    queryKey: workspaceEmailAccountsKeys.list(workspaceId || ''),
    queryFn: () => fetchWorkspaceEmailAccounts(workspaceId!),
    enabled: enabled && Boolean(workspaceId),
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  })
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Parameters for linking an email account.
 */
interface LinkEmailAccountParams {
  workspaceId: string
  accountId: string
  isPrimary?: boolean
}

/**
 * Hook to link an OAuth account to a workspace.
 *
 * @example
 * ```tsx
 * function LinkAccountButton({ workspaceId, accountId }) {
 *   const linkAccount = useLinkEmailAccount();
 *
 *   const handleLink = () => {
 *     linkAccount.mutate({ workspaceId, accountId, isPrimary: true });
 *   };
 *
 *   return (
 *     <button onClick={handleLink} disabled={linkAccount.isPending}>
 *       Link Account
 *     </button>
 *   );
 * }
 * ```
 */
export function useLinkEmailAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ workspaceId, accountId, isPrimary }: LinkEmailAccountParams) => {
      const response = await fetch(`/api/workspaces/${workspaceId}/email-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, isPrimary }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to link email account')
      }

      return response.json() as Promise<WorkspaceEmailAccount>
    },
    onSuccess: (_, { workspaceId }) => {
      // Invalidate the accounts list to refetch
      queryClient.invalidateQueries({
        queryKey: workspaceEmailAccountsKeys.list(workspaceId),
      })
    },
    onError: (error) => {
      logger.error('Failed to link email account:', error)
    },
  })
}

/**
 * Parameters for unlinking an email account.
 */
interface UnlinkEmailAccountParams {
  workspaceId: string
  /** The workspace_oauth_account.id (link ID, not the OAuth account ID) */
  linkId: string
}

/**
 * Hook to unlink an email account from a workspace.
 *
 * @example
 * ```tsx
 * function RemoveAccountButton({ workspaceId, linkId }) {
 *   const unlinkAccount = useUnlinkEmailAccount();
 *
 *   const handleRemove = () => {
 *     unlinkAccount.mutate({ workspaceId, linkId });
 *   };
 *
 *   return (
 *     <button onClick={handleRemove} disabled={unlinkAccount.isPending}>
 *       Remove
 *     </button>
 *   );
 * }
 * ```
 */
export function useUnlinkEmailAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ workspaceId, linkId }: UnlinkEmailAccountParams) => {
      const response = await fetch(`/api/workspaces/${workspaceId}/email-accounts/${linkId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to unlink email account')
      }

      return response.json()
    },
    onMutate: async ({ workspaceId, linkId }) => {
      // Optimistically remove the account from the list
      await queryClient.cancelQueries({
        queryKey: workspaceEmailAccountsKeys.list(workspaceId),
      })

      const previousAccounts = queryClient.getQueryData<WorkspaceEmailAccount[]>(
        workspaceEmailAccountsKeys.list(workspaceId)
      )

      if (previousAccounts) {
        queryClient.setQueryData<WorkspaceEmailAccount[]>(
          workspaceEmailAccountsKeys.list(workspaceId),
          previousAccounts.filter((acc) => acc.id !== linkId)
        )
      }

      return { previousAccounts }
    },
    onError: (error, { workspaceId }, context) => {
      // Rollback on error
      if (context?.previousAccounts) {
        queryClient.setQueryData(
          workspaceEmailAccountsKeys.list(workspaceId),
          context.previousAccounts
        )
      }
      logger.error('Failed to unlink email account:', error)
    },
    onSettled: (_, __, { workspaceId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: workspaceEmailAccountsKeys.list(workspaceId),
      })
    },
  })
}

/**
 * Parameters for setting an account as primary.
 */
interface SetPrimaryEmailAccountParams {
  workspaceId: string
  /** The workspace_oauth_account.id (link ID) */
  linkId: string
}

/**
 * Hook to set an email account as the primary for a workspace.
 *
 * @example
 * ```tsx
 * function SetPrimaryButton({ workspaceId, linkId }) {
 *   const setPrimary = useSetPrimaryEmailAccount();
 *
 *   const handleSetPrimary = () => {
 *     setPrimary.mutate({ workspaceId, linkId });
 *   };
 *
 *   return (
 *     <button onClick={handleSetPrimary} disabled={setPrimary.isPending}>
 *       Set as Primary
 *     </button>
 *   );
 * }
 * ```
 */
export function useSetPrimaryEmailAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ workspaceId, linkId }: SetPrimaryEmailAccountParams) => {
      const response = await fetch(`/api/workspaces/${workspaceId}/email-accounts/${linkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to set primary account')
      }

      return response.json() as Promise<WorkspaceEmailAccount>
    },
    onMutate: async ({ workspaceId, linkId }) => {
      // Optimistically update the primary account
      await queryClient.cancelQueries({
        queryKey: workspaceEmailAccountsKeys.list(workspaceId),
      })

      const previousAccounts = queryClient.getQueryData<WorkspaceEmailAccount[]>(
        workspaceEmailAccountsKeys.list(workspaceId)
      )

      if (previousAccounts) {
        queryClient.setQueryData<WorkspaceEmailAccount[]>(
          workspaceEmailAccountsKeys.list(workspaceId),
          previousAccounts.map((acc) => ({
            ...acc,
            isPrimary: acc.id === linkId,
          }))
        )
      }

      return { previousAccounts }
    },
    onError: (error, { workspaceId }, context) => {
      // Rollback on error
      if (context?.previousAccounts) {
        queryClient.setQueryData(
          workspaceEmailAccountsKeys.list(workspaceId),
          context.previousAccounts
        )
      }
      logger.error('Failed to set primary account:', error)
    },
    onSettled: (_, __, { workspaceId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: workspaceEmailAccountsKeys.list(workspaceId),
      })
    },
  })
}

