'use client'

import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'

interface CompletionStepProps {
  workspaceId: string
  onFinish: () => void
}

/**
 * Completion step component.
 * Shows a success message and button to enter the workspace.
 */
export function CompletionStep({ workspaceId, onFinish }: CompletionStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Success icon */}
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute -right-1 -top-1">
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
      </div>

      {/* Title */}
      <h2 className="mb-2 font-semibold text-2xl">You&apos;re all set!</h2>

      {/* Description */}
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Your workspace is ready. Start creating workflows, connecting tools, and automating
        your prospecting pipeline.
      </p>

      {/* Features list */}
      <div className="mb-8 grid max-w-lg gap-4 md:grid-cols-2">
        <Feature
          title="Build Workflows"
          description="Create automated pipelines with our visual editor"
        />
        <Feature
          title="Connect Tools"
          description="Integrate with your favorite apps and services"
        />
        <Feature
          title="Scrape Leads"
          description="Find and enrich prospects automatically"
        />
        <Feature
          title="Automate Outreach"
          description="Schedule and personalize your campaigns"
        />
      </div>

      {/* CTA button */}
      <button
        onClick={onFinish}
        className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
      >
        Enter Workspace
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  )
}

/**
 * Feature card component for the completion step.
 */
function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="mb-1 font-medium text-sm">{title}</h3>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  )
}

