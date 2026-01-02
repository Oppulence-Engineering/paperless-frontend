'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/core/utils/cn'

interface OnboardingLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * Layout wrapper for onboarding pages.
 * Provides consistent styling and structure for the onboarding flow.
 */
export function OnboardingLayout({ children, className }: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-5 w-5 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-semibold text-lg">Sim Studio</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={cn('flex-1', className)}>
        <div className="mx-auto h-full max-w-3xl">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-8 py-4">
          <p className="text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Sim Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

