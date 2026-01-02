/**
 * @fileoverview Onboarding step registration.
 *
 * This file imports all onboarding step definitions and registers them
 * with the central step registry. Steps are self-registering through
 * the registry's `register()` method.
 *
 * ## Adding a New Step
 *
 * 1. Create the step definition file in this directory
 * 2. Import the step in this file
 * 3. Call `stepRegistry.register(yourStep)`
 *
 * Steps are automatically sorted by their `order` property when queried.
 * Dependencies are resolved at runtime based on the `dependencies` array.
 *
 * ## Current Steps
 *
 * | ID                          | Order | Required | Description                    |
 * |-----------------------------|-------|----------|--------------------------------|
 * | lead-scraper-provisioning   | 1     | Yes      | Provisions Lead Scraper org    |
 *
 * ## Future Steps (planned)
 *
 * | ID                  | Order | Required | Description                    |
 * |---------------------|-------|----------|--------------------------------|
 * | gmail-connection    | 2     | No       | Connect Gmail via OAuth        |
 * | company-profile     | 3     | No       | Collect company information    |
 */

import { stepRegistry } from '../registry'
import {
  leadScraperProvisioningStep,
  type LeadScraperProvisioningResult,
} from './lead-scraper-provisioning'

// =============================================================================
// Step Registration
// =============================================================================

// Register the Lead Scraper provisioning step
// This is the first and currently only required step
stepRegistry.register(leadScraperProvisioningStep)

// Future steps would be registered here:
// stepRegistry.register(gmailConnectionStep)
// stepRegistry.register(companyProfileStep)

// =============================================================================
// Exports
// =============================================================================

// Export step definitions for external access
export { leadScraperProvisioningStep }

// Export step result types for type-safe access
export type { LeadScraperProvisioningResult }
