'use client'

/**
 * @fileoverview Connected Emails settings component.
 *
 * Displays and manages email accounts linked to the current workspace.
 * Features:
 * - List all connected Gmail/email accounts
 * - Connect new email accounts via OAuth
 * - Set primary account for outreach
 * - Disconnect accounts
 *
 * Email accounts are stored in the workspace_oauth_account junction table,
 * allowing multiple accounts per workspace for email outreach campaigns.
 */

import { useCallback, useState } from 'react'
import { createLogger } from '@sim/logger'
import { Check, Crown, Mail, Plus, Trash2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/emcn'
import { Skeleton } from '@/components/ui'
import { cn } from '@/lib/core/utils/cn'
import { client } from '@/lib/auth/auth-client'
import {
  useWorkspaceEmailAccounts,
  useUnlinkEmailAccount,
  useSetPrimaryEmailAccount,
  type WorkspaceEmailAccount,
} from '@/hooks/queries/workspace-email-accounts'

const logger = createLogger('ConnectedEmails')

/**
 * Skeleton loader for the email accounts list.
 */
function ConnectedEmailsSkeleton() {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[4px]">
          <Skeleton className="h-[20px] w-[200px]" />
          <Skeleton className="h-[14px] w-[300px]" />
        </div>
        <Skeleton className="h-[32px] w-[120px] rounded-[6px]" />
      </div>
      <div className="flex flex-col gap-[8px]">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-[8px] border border-[var(--border)] p-[12px]"
          >
            <div className="flex items-center gap-[12px]">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-[4px]">
                <Skeleton className="h-[14px] w-[180px]" />
                <Skeleton className="h-[12px] w-[80px]" />
              </div>
            </div>
            <div className="flex items-center gap-[8px]">
              <Skeleton className="h-[28px] w-[80px] rounded-[6px]" />
              <Skeleton className="h-[28px] w-[28px] rounded-[6px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Empty state when no email accounts are connected.
 */
function EmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-[48px]">
      <div className="mb-[16px] flex h-[64px] w-[64px] items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
        <Mail className="h-[28px] w-[28px] text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="mb-[8px] font-medium text-[16px]">No email accounts connected</h3>
      <p className="mb-[24px] max-w-[320px] text-center text-[13px] text-[var(--text-muted)]">
        Connect your Gmail account to send emails from your prospecting campaigns.
      </p>
      <Button onClick={onConnect}>
        <Plus className="h-4 w-4" />
        <span>Connect Gmail</span>
      </Button>
    </div>
  )
}

/**
 * Single email account row with actions.
 */
interface EmailAccountRowProps {
  account: WorkspaceEmailAccount
  isPending: boolean
  onSetPrimary: (linkId: string) => void
  onRemove: (account: WorkspaceEmailAccount) => void
}

function EmailAccountRow({
  account,
  isPending,
  onSetPrimary,
  onRemove,
}: EmailAccountRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-[8px] border p-[12px]',
        account.isPrimary
          ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-900/10'
          : 'border-[var(--border)]'
      )}
    >
      <div className="flex items-center gap-[12px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <Mail className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-[8px]">
            <span className="font-medium text-[14px]">
              {account.displayName || 'Unknown email'}
            </span>
            {account.isPrimary && (
              <span className="flex items-center gap-[4px] rounded-full bg-blue-100 px-[8px] py-[2px] text-[11px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <Crown className="h-3 w-3" />
                Primary
              </span>
            )}
          </div>
          <span className="text-[12px] text-[var(--text-muted)]">
            Connected {new Date(account.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-[8px]">
        {!account.isPrimary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetPrimary(account.id)}
            disabled={isPending}
          >
            Set as Primary
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(account)}
          disabled={isPending}
          className="text-[var(--text-error)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Connected Emails settings panel.
 * Manages email accounts linked to the workspace for email outreach.
 */
export function ConnectedEmails() {
  const params = useParams()
  const workspaceId = params?.workspaceId as string

  // Fetch email accounts
  const { data: accounts, isLoading, error } = useWorkspaceEmailAccounts(workspaceId)
  const unlinkAccount = useUnlinkEmailAccount()
  const setPrimaryAccount = useSetPrimaryEmailAccount()

  // Disconnect confirmation state
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [accountToRemove, setAccountToRemove] = useState<WorkspaceEmailAccount | null>(null)

  /**
   * Initiate Gmail OAuth connection.
   */
  const handleConnect = useCallback(async () => {
    try {
      logger.info('Initiating Gmail OAuth flow from settings', { workspaceId })

      // Build callback URL that returns to settings
      const callbackUrl = `${window.location.origin}/workspace/${workspaceId}/w?settings=connected-emails&oauth_callback=gmail`

      await client.oauth2.link({
        providerId: 'google-email',
        callbackURL: callbackUrl,
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('OAuth flow failed')
      logger.error('Gmail OAuth initiation failed', { error: error.message })
    }
  }, [workspaceId])

  /**
   * Set an account as primary.
   */
  const handleSetPrimary = useCallback(
    (linkId: string) => {
      setPrimaryAccount.mutate({ workspaceId, linkId })
    },
    [workspaceId, setPrimaryAccount]
  )

  /**
   * Open remove confirmation dialog.
   */
  const handleRemove = useCallback((account: WorkspaceEmailAccount) => {
    setAccountToRemove(account)
    setShowRemoveDialog(true)
  }, [])

  /**
   * Confirm account removal.
   */
  const confirmRemove = useCallback(() => {
    if (!accountToRemove) return

    unlinkAccount.mutate({
      workspaceId,
      linkId: accountToRemove.id,
    })

    setShowRemoveDialog(false)
    setAccountToRemove(null)
  }, [workspaceId, accountToRemove, unlinkAccount])

  // Loading state
  if (isLoading) {
    return <ConnectedEmailsSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-[48px]">
        <p className="text-[var(--text-error)]">Failed to load email accounts</p>
        <p className="text-[13px] text-[var(--text-muted)]">
          {error instanceof Error ? error.message : String(error)}
        </p>
      </div>
    )
  }

  const hasAccounts = accounts && accounts.length > 0
  const isPending = unlinkAccount.isPending || setPrimaryAccount.isPending

  return (
    <>
      <div className="flex h-full flex-col gap-[16px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-medium text-[14px]">Connected Email Accounts</h3>
            <p className="text-[13px] text-[var(--text-muted)]">
              {hasAccounts
                ? `${accounts.length} email account${accounts.length > 1 ? 's' : ''} connected`
                : 'Connect email accounts for outreach campaigns'}
            </p>
          </div>
          {hasAccounts && (
            <Button variant="tertiary" onClick={handleConnect}>
              <Plus className="h-4 w-4" />
              <span>Add Account</span>
            </Button>
          )}
        </div>

        {/* Content */}
        {!hasAccounts ? (
          <EmptyState onConnect={handleConnect} />
        ) : (
          <div className="flex flex-col gap-[8px]">
            {accounts.map((account) => (
              <EmailAccountRow
                key={account.id}
                account={account}
                isPending={isPending}
                onSetPrimary={handleSetPrimary}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {/* Info footer */}
        {hasAccounts && (
          <div className="mt-auto border-t border-[var(--border)] pt-[16px]">
            <div className="flex items-start gap-[12px] rounded-[8px] bg-[var(--surface-5)] p-[12px]">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
              <div className="flex flex-col gap-[4px]">
                <p className="text-[13px] text-[var(--text-secondary)]">
                  The primary account will be used as the default sender in email campaigns.
                </p>
                <p className="text-[12px] text-[var(--text-muted)]">
                  You can connect multiple accounts and switch between them when creating campaigns.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remove confirmation dialog */}
      <Modal open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <ModalContent className="w-[400px]">
          <ModalHeader>Remove Email Account</ModalHeader>
          <ModalBody>
            <p className="text-[12px] text-[var(--text-secondary)]">
              Are you sure you want to disconnect{' '}
              <span className="font-medium text-[var(--text-primary)]">
                {accountToRemove?.displayName || 'this account'}
              </span>
              ?{' '}
              <span className="text-[var(--text-error)]">
                This will remove access and you will need to reconnect to use this account.
              </span>
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="default" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={unlinkAccount.isPending}>
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

