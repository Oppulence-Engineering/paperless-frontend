/**
 * WorkOS Webhook Handler
 *
 * Handles incoming webhooks from WorkOS for Directory Sync (SCIM) events.
 * Validates webhook signatures and dispatches events to appropriate handlers.
 *
 * @module api/webhooks/workos
 */

import { createLogger } from '@sim/logger'
import { type NextRequest, NextResponse } from 'next/server'
import {
  verifyWebhookSignature,
  handleDirectorySyncEvent,
  isWorkOSDirectorySyncEnabled,
  isWorkOSEnabled,
} from '@/lib/auth/workos'
import {
  DirectorySyncEventTypeSchema,
  WorkOSWebhookPayloadSchema,
  type DirectorySyncEvent,
} from '@/lib/auth/workos/types'

const logger = createLogger('WorkOS:Webhook')

/**
 * POST /api/webhooks/workos
 *
 * Handles incoming webhooks from WorkOS.
 * Headers required:
 * - workos-signature: Webhook signature for verification
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isWorkOSEnabled()) {
    return NextResponse.json(
      { error: 'WorkOS is not enabled' },
      { status: 503 }
    )
  }

  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('workos-signature')
    const timestamp = request.headers.get('x-workos-timestamp') ?? ''

    if (!signature) {
      logger.warn('Webhook received without signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature, timestamp)

    if (!isValid) {
      logger.warn('Webhook signature verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse and validate the webhook payload with Zod
    const rawPayload = JSON.parse(rawBody)
    const parseResult = WorkOSWebhookPayloadSchema.safeParse(rawPayload)

    if (!parseResult.success) {
      logger.error('Invalid webhook payload', { errors: parseResult.error.flatten() })
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }

    const payload = parseResult.data

    logger.info('Received WorkOS webhook', {
      eventId: payload.id,
      eventType: payload.event,
    })

    // Check if this is a directory sync event
    const eventTypeResult = DirectorySyncEventTypeSchema.safeParse(payload.event)

    if (eventTypeResult.success) {
      if (!isWorkOSDirectorySyncEnabled()) {
        logger.warn('Directory sync event received but feature is disabled', {
          eventType: payload.event,
        })
        // Return 200 to acknowledge receipt (prevents retries)
        return NextResponse.json({ received: true })
      }

      // Extract directory and organization IDs from the data
      const data = payload.data
      const directoryId = (data.directory_id as string) ??
        (data.directory as { id: string } | undefined)?.id ?? ''
      const organizationId = data.organization_id as string | undefined

      const event: DirectorySyncEvent = {
        id: payload.id,
        event: eventTypeResult.data,
        data: data as unknown as DirectorySyncEvent['data'],
        directoryId,
        organizationId,
        createdAt: new Date(payload.created_at),
      }

      await handleDirectorySyncEvent(event)

      return NextResponse.json({ received: true })
    }

    // Handle other event types as needed
    logger.info('Unhandled webhook event type', { eventType: payload.event })
    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Webhook processing failed', { error })
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, workos-signature, x-workos-timestamp',
    },
  })
}
