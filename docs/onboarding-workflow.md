# Onboarding Workflow Documentation

This document provides a comprehensive visual guide to the onboarding system, detailing every step, API call, database interaction, and data flow.

## Table of Contents

1. [High-Level User Journey](#1-high-level-user-journey)
2. [System Architecture](#2-system-architecture)
3. [Detailed Sequence Diagram](#3-detailed-sequence-diagram)
4. [Database Schema & Records](#4-database-schema--records)
5. [Lead Scraper API Interactions](#5-lead-scraper-api-interactions)
6. [Step-by-Step State Machine](#6-step-by-step-state-machine)
7. [File Structure & Responsibilities](#7-file-structure--responsibilities)
8. [Data Flow Summary](#8-data-flow-summary)

---

## 1. High-Level User Journey

```mermaid
flowchart TD
    subgraph "Authentication Phase"
        A[User Signs Up] --> B[Email Verification]
        B --> C[User Logs In]
    end
    
    subgraph "Workspace Routing"
        C --> D{Has Workspaces?}
        D -->|No| E[Create Default Workspace]
        D -->|Yes| F[Get First Workspace]
        E --> G{onboardingCompleted?}
        F --> G
    end
    
    subgraph "Onboarding Flow"
        G -->|false| H[Redirect to /onboarding]
        G -->|true| I[Redirect to /workspace/:id/w]
        
        H --> J[Lead Scraper Provisioning Step]
        J -->|Success| K[Completion Step]
        J -->|Error| L[Show Retry Button]
        L -->|Retry| J
        
        K --> M[User Clicks 'Enter Workspace']
        M --> N[Mark onboardingCompleted = true]
        N --> I
    end
    
    style A fill:#e1f5fe
    style I fill:#c8e6c9
    style J fill:#fff3e0
    style K fill:#c8e6c9
```

---

## 2. System Architecture

```mermaid
flowchart TB
    subgraph "Frontend (React)"
        UI[Onboarding Page<br/>/app/onboarding/page.tsx]
        STEP[LeadScraperProvisioningStep<br/>/app/onboarding/steps/]
        COMP[CompletionStep<br/>/app/onboarding/steps/]
        HOOKS[useOnboarding Hook<br/>/lib/onboarding/hooks.ts]
    end
    
    subgraph "API Layer (Next.js)"
        API1[GET /api/onboarding/:id<br/>Get State]
        API2[POST /api/onboarding/:id<br/>Complete Step]
        API3[POST /api/onboarding/:id/complete<br/>Finish Onboarding]
        API4[POST /api/onboarding/:id/provision-lead-scraper<br/>Provision Account]
        API5[POST /api/onboarding/:id/execute<br/>Execute Step]
    end
    
    subgraph "Onboarding Framework"
        REG[Step Registry<br/>/lib/onboarding/registry.ts]
        EXEC[Step Executor<br/>/lib/onboarding/executor.ts]
        UTILS[DB Utilities<br/>/lib/onboarding/utils.ts]
        FACTORY[Step Factories<br/>/lib/onboarding/factory.ts]
    end
    
    subgraph "External Services"
        LS[Lead Scraper Service<br/>:8081]
    end
    
    subgraph "Database (PostgreSQL)"
        WS[(workspace table)]
        WE[(workspace_environment table)]
        PERM[(permissions table)]
    end
    
    UI --> HOOKS
    HOOKS --> API1
    HOOKS --> API2
    HOOKS --> API3
    
    STEP --> API4
    
    API1 --> UTILS
    API2 --> UTILS
    API3 --> UTILS
    API4 --> PROV[provisioning.ts]
    API5 --> EXEC
    
    UTILS --> REG
    UTILS --> WS
    
    PROV --> LS
    PROV --> WE
    
    API1 --> PERM
    API2 --> PERM
    API3 --> PERM
    API4 --> PERM
```

---

## 3. Detailed Sequence Diagram

### 3.1 Complete Onboarding Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as User Browser
    participant WP as /workspace Page
    participant OP as /onboarding Page
    participant LSS as LeadScraperProvisioningStep
    participant API as API Routes
    participant PROV as provisioning.ts
    participant LS as Lead Scraper Service
    participant DB as PostgreSQL
    
    Note over U,DB: Phase 1: Initial Redirect
    
    U->>WP: Navigate to /workspace
    WP->>API: GET /api/workspaces
    API->>DB: SELECT from workspace, permissions
    DB-->>API: [workspace records]
    
    alt No workspaces exist
        API->>DB: INSERT workspace (onboardingCompleted=false)
        API->>DB: INSERT permissions (admin)
        API->>DB: INSERT workflow (default-agent)
        DB-->>API: Created
    end
    
    API-->>WP: { workspaces: [...] }
    WP->>WP: Check workspace.onboardingCompleted
    
    alt onboardingCompleted === false
        WP->>U: Redirect to /onboarding?workspaceId=xxx
    else onboardingCompleted === true
        WP->>U: Redirect to /workspace/xxx/w
    end
    
    Note over U,DB: Phase 2: Load Onboarding State
    
    U->>OP: Navigate to /onboarding?workspaceId=xxx
    OP->>API: GET /api/onboarding/{workspaceId}
    API->>DB: SELECT onboardingCompleted, onboardingStep FROM workspace
    API->>API: Parse completedStepIds from onboardingStep
    API->>API: Build stepStatuses from registry
    API-->>OP: OnboardingState { isComplete, currentStepId, stepStatuses, ... }
    
    OP->>OP: Render LeadScraperProvisioningStep
    
    Note over U,DB: Phase 3: Lead Scraper Provisioning
    
    OP->>LSS: Mount component
    LSS->>LSS: Auto-start provisioning (useEffect)
    LSS->>API: POST /api/onboarding/{workspaceId}/provision-lead-scraper
    
    API->>DB: Verify permissions
    API->>DB: SELECT workspace details
    
    API->>PROV: provisionLeadScraperAccountForWorkspaceOwner()
    
    Note over PROV,LS: Lead Scraper API Calls
    
    PROV->>PROV: Resolve config from env vars
    
    alt LEAD_SCRAPER_API_KEY not set
        PROV-->>API: { success: false, skipped: true }
        API->>DB: UPDATE workspace SET onboardingStep = 'lead-scraper-provisioning'
        API-->>LSS: { success: true, skipped: true }
    else API Key configured
        PROV->>LS: POST /organization { id: workspaceId, name: workspaceName }
        LS-->>PROV: 201 Created | 409 Conflict
        
        PROV->>LS: POST /organizations/{id}/tenants { name: workspaceId }
        LS-->>PROV: 201 Created { tenantId } | 409 Conflict
        
        alt tenantId not in response
            PROV->>LS: GET /organization/tenants/{organizationId}
            LS-->>PROV: { tenants: [...] }
            PROV->>PROV: Find matching tenant by name
        end
        
        PROV->>LS: POST /accounts { organizationId, authPlatformUserId, email }
        LS-->>PROV: 201 Created | 409 Conflict
        
        PROV->>PROV: encrypt(organizationId), encrypt(tenantId)
        PROV->>DB: UPSERT workspace_environment SET variables = { LEAD_SCRAPER_ORGANIZATION_ID, LEAD_SCRAPER_TENANT_ID }
        
        PROV-->>API: { success: true, organizationId, tenantId, organizationStatus, tenantStatus, accountStatus }
    end
    
    API->>DB: UPDATE workspace SET onboardingStep = 'lead-scraper-provisioning'
    API-->>LSS: ProvisioningResponse
    
    Note over U,DB: Phase 4: Step Completion
    
    LSS->>LSS: setStatus('success')
    LSS->>LSS: Wait 1500ms (show success state)
    LSS->>OP: onComplete(result)
    OP->>API: POST /api/onboarding/{workspaceId} { stepId, result }
    API->>DB: UPDATE workspace SET onboardingStep = 'lead-scraper-provisioning'
    API-->>OP: { success: true, ...newState }
    
    OP->>OP: Render CompletionStep
    
    Note over U,DB: Phase 5: Finish Onboarding
    
    U->>OP: Click "Enter Workspace"
    OP->>API: POST /api/onboarding/{workspaceId}/complete
    API->>DB: UPDATE workspace SET onboardingCompleted = true
    API-->>OP: { success: true }
    
    OP->>U: Redirect to /workspace/{workspaceId}/w
```

### 3.2 Error & Retry Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as User Browser
    participant LSS as LeadScraperProvisioningStep
    participant API as API Routes
    participant LS as Lead Scraper Service
    
    LSS->>API: POST /api/onboarding/{workspaceId}/provision-lead-scraper
    API->>LS: POST /organization
    LS-->>API: 500 Internal Server Error
    API-->>LSS: { error: "Lead Scraper organization provisioning failed" }
    
    LSS->>LSS: setStatus('error')
    LSS->>LSS: setErrorMessage(error.message)
    LSS->>U: Display error + "Retry Setup" button
    
    U->>LSS: Click "Retry Setup"
    LSS->>LSS: hasStartedRef.current = false
    LSS->>LSS: setStatus('idle')
    
    Note over LSS: useEffect triggers
    
    LSS->>LSS: runProvisioning()
    LSS->>API: POST /api/onboarding/{workspaceId}/provision-lead-scraper
    API->>LS: POST /organization
    LS-->>API: 201 Created
    
    Note over LSS,API: Continue with tenant and account creation...
```

---

## 4. Database Schema & Records

### 4.1 Tables Involved

```mermaid
erDiagram
    user {
        text id PK
        text name
        text email UK
        boolean email_verified
        timestamp created_at
        timestamp updated_at
    }
    
    workspace {
        text id PK
        text name
        text owner_id FK
        text billed_account_user_id FK
        boolean allow_personal_api_keys
        boolean onboarding_completed
        text onboarding_step
        timestamp created_at
        timestamp updated_at
    }
    
    workspace_environment {
        text id PK
        text workspace_id FK
        jsonb variables
        timestamp created_at
        timestamp updated_at
    }
    
    permissions {
        text id PK
        text entity_type
        text entity_id
        text user_id FK
        text permission_type
        timestamp created_at
        timestamp updated_at
    }
    
    workflow {
        text id PK
        text user_id FK
        text workspace_id FK
        text name
        text description
        timestamp created_at
        timestamp updated_at
    }
    
    user ||--o{ workspace : "owns"
    user ||--o{ permissions : "has"
    workspace ||--o| workspace_environment : "has"
    workspace ||--o{ workflow : "contains"
    workspace ||--o{ permissions : "grants"
```

### 4.2 Record States During Onboarding

```mermaid
stateDiagram-v2
    [*] --> WorkspaceCreated: POST /api/workspaces
    
    state WorkspaceCreated {
        [*] --> Initial
        
        state "workspace table" as WT1 {
            Initial: id = uuid
            Initial: name = "User's Workspace"
            Initial: owner_id = user.id
            Initial: onboarding_completed = false
            Initial: onboarding_step = null
        }
        
        state "permissions table" as PT1 {
            PermCreated: entity_type = 'workspace'
            PermCreated: entity_id = workspace.id
            PermCreated: user_id = user.id
            PermCreated: permission_type = 'admin'
        }
        
        Initial --> PermCreated
    }
    
    WorkspaceCreated --> ProvisioningComplete: Lead Scraper Step
    
    state ProvisioningComplete {
        state "workspace table" as WT2 {
            StepDone: onboarding_step = 'lead-scraper-provisioning'
        }
        
        state "workspace_environment table" as WE1 {
            EnvSet: variables = {
            EnvSet: "LEAD_SCRAPER_ORGANIZATION_ID": encrypted(orgId)
            EnvSet: "LEAD_SCRAPER_TENANT_ID": encrypted(tenantId)
            EnvSet: }
        }
    }
    
    ProvisioningComplete --> OnboardingComplete: Finish Onboarding
    
    state OnboardingComplete {
        state "workspace table" as WT3 {
            Complete: onboarding_completed = true
        }
    }
    
    OnboardingComplete --> [*]
```

### 4.3 Sample Data at Each Stage

#### Stage 1: After Workspace Creation

```sql
-- workspace table
INSERT INTO workspace VALUES (
    'ws_abc123',                    -- id
    'John''s Workspace',            -- name
    'user_xyz789',                  -- owner_id
    'user_xyz789',                  -- billed_account_user_id
    true,                           -- allow_personal_api_keys
    false,                          -- onboarding_completed ← KEY FIELD
    null,                           -- onboarding_step ← No steps completed yet
    '2026-01-01 10:00:00',         -- created_at
    '2026-01-01 10:00:00'          -- updated_at
);

-- permissions table
INSERT INTO permissions VALUES (
    'perm_111',
    'workspace',
    'ws_abc123',
    'user_xyz789',
    'admin',
    '2026-01-01 10:00:00',
    '2026-01-01 10:00:00'
);
```

#### Stage 2: After Lead Scraper Provisioning

```sql
-- workspace table (updated)
UPDATE workspace SET
    onboarding_step = 'lead-scraper-provisioning',  -- Step ID added
    updated_at = '2026-01-01 10:00:15'
WHERE id = 'ws_abc123';

-- workspace_environment table (new or updated)
INSERT INTO workspace_environment VALUES (
    'env_222',
    'ws_abc123',
    '{
        "LEAD_SCRAPER_ORGANIZATION_ID": "encrypted:abc123...",
        "LEAD_SCRAPER_TENANT_ID": "encrypted:def456..."
    }',
    '2026-01-01 10:00:15',
    '2026-01-01 10:00:15'
) ON CONFLICT (workspace_id) DO UPDATE SET
    variables = EXCLUDED.variables,
    updated_at = EXCLUDED.updated_at;
```

#### Stage 3: After Onboarding Complete

```sql
-- workspace table (final state)
UPDATE workspace SET
    onboarding_completed = true,  -- ← NOW TRUE
    updated_at = '2026-01-01 10:00:30'
WHERE id = 'ws_abc123';
```

---

## 5. Lead Scraper API Interactions

### 5.1 API Call Sequence

```mermaid
sequenceDiagram
    autonumber
    participant SIM as Sim Studio
    participant LS as Lead Scraper Service
    
    Note over SIM,LS: Step 1: Create Organization
    
    SIM->>LS: POST /lead-scraper-microservice/api/v1/organization
    Note right of SIM: Headers: x-api-key: ${LEAD_SCRAPER_API_KEY}
    Note right of SIM: Body: { organization: { id, name, displayName } }
    
    alt New Organization
        LS-->>SIM: 201 Created
    else Already Exists
        LS-->>SIM: 409 Conflict (OK - idempotent)
    end
    
    Note over SIM,LS: Step 2: Create Tenant
    
    SIM->>LS: POST /lead-scraper-microservice/api/v1/organizations/{orgId}/tenants
    Note right of SIM: Body: { tenant: { name, displayName } }
    
    alt New Tenant
        LS-->>SIM: 201 Created { tenantId: "..." }
    else Already Exists
        LS-->>SIM: 409 Conflict (tenantId may be missing)
    end
    
    opt tenantId not in response
        Note over SIM,LS: Step 2b: Lookup Tenant
        SIM->>LS: GET /lead-scraper-microservice/api/v1/organization/tenants/{orgId}
        LS-->>SIM: { tenants: [{ id, name, displayName }, ...] }
        SIM->>SIM: Find tenant by name match
    end
    
    Note over SIM,LS: Step 3: Create Account
    
    SIM->>LS: POST /lead-scraper-microservice/api/v1/accounts
    Note right of SIM: Body: { organizationId, account: { authPlatformUserId, email }, tenantId }
    
    alt New Account
        LS-->>SIM: 201 Created { account: {...}, tenantId }
    else Already Exists
        LS-->>SIM: 409 Conflict (OK - idempotent)
    end
```

### 5.2 Request/Response Details

#### Create Organization

```
POST /lead-scraper-microservice/api/v1/organization
Headers:
  Content-Type: application/json
  x-api-key: sk_live_xxxx

Request Body:
{
  "organization": {
    "id": "ws_abc123",           // Workspace ID as org ID
    "name": "John's Workspace",
    "displayName": "John's Workspace"
  }
}

Response (201 Created):
{}  // Empty body on success

Response (409 Conflict):
{
  "error": "Organization already exists"
}
```

#### Create Tenant

```
POST /lead-scraper-microservice/api/v1/organizations/{orgId}/tenants
Headers:
  Content-Type: application/json
  x-api-key: sk_live_xxxx

Request Body:
{
  "tenant": {
    "name": "ws_abc123",
    "displayName": "John's Workspace"
  }
}

Response (201 Created):
{
  "tenantId": "tenant_xyz789"
}
```

#### Create Account

```
POST /lead-scraper-microservice/api/v1/accounts
Headers:
  Content-Type: application/json
  x-api-key: sk_live_xxxx

Request Body:
{
  "organizationId": "ws_abc123",
  "account": {
    "authPlatformUserId": "user_xyz789",
    "email": "john@example.com"
  },
  "initialWorkspaceName": "John's Workspace",
  "tenantId": "tenant_xyz789"
}

Response (201 Created):
{
  "account": {
    "id": "acc_111",
    "authPlatformUserId": "user_xyz789"
  },
  "tenantId": "tenant_xyz789"
}
```

### 5.3 Data Mapping

```mermaid
flowchart LR
    subgraph "Sim Studio"
        WS[Workspace]
        U[User]
    end
    
    subgraph "Lead Scraper"
        ORG[Organization]
        TEN[Tenant]
        ACC[Account]
    end
    
    WS -->|id → id| ORG
    WS -->|name → name| ORG
    WS -->|name → displayName| ORG
    
    WS -->|id → name| TEN
    WS -->|name → displayName| TEN
    
    WS -->|id → organizationId| ACC
    U -->|id → authPlatformUserId| ACC
    U -->|email → email| ACC
    TEN -->|id → tenantId| ACC
```

---

## 6. Step-by-Step State Machine

### 6.1 Onboarding Step States

```mermaid
stateDiagram-v2
    [*] --> pending: Step registered
    
    pending --> in_progress: User reaches step
    
    in_progress --> completed: Step executes successfully
    in_progress --> failed: Step throws error
    in_progress --> skipped: Step skipped (optional or condition false)
    
    failed --> in_progress: User retries
    
    completed --> [*]
    skipped --> [*]
    
    note right of pending
        stepStatuses[stepId] = 'pending'
        Not yet reached in flow
    end note
    
    note right of in_progress
        stepStatuses[stepId] = 'in_progress'
        Currently executing
    end note
    
    note right of completed
        stepStatuses[stepId] = 'completed'
        Added to onboardingStep field
    end note
    
    note right of failed
        stepStatuses[stepId] = 'failed'
        Error shown to user
    end note
```

### 6.2 Lead Scraper Provisioning Step Internals

```mermaid
stateDiagram-v2
    [*] --> idle: Component mounts
    
    idle --> provisioning: useEffect auto-triggers
    
    provisioning --> success: API returns success
    provisioning --> error: API returns error
    
    success --> parent_notified: After 1500ms delay
    parent_notified --> [*]: onComplete() called
    
    error --> idle: User clicks Retry
    
    state provisioning {
        [*] --> create_org
        create_org --> create_tenant: 201 or 409
        create_tenant --> lookup_tenant: 409 without tenantId
        lookup_tenant --> create_account
        create_tenant --> create_account: 201 with tenantId
        create_account --> store_env: 201 or 409
        store_env --> [*]
    }
```

### 6.3 OnboardingState Object Structure

```mermaid
classDiagram
    class OnboardingState {
        +boolean isComplete
        +string|null currentStepId
        +Record~string, StepStatus~ stepStatuses
        +Record~string, unknown~ stepResults
        +string[] completedStepIds
        +number totalSteps
        +number completedCount
    }
    
    class StepStatus {
        <<enumeration>>
        pending
        in_progress
        completed
        failed
        skipped
    }
    
    OnboardingState --> StepStatus
    
    note for OnboardingState "Example:\n{\n  isComplete: false,\n  currentStepId: 'lead-scraper-provisioning',\n  stepStatuses: {\n    'lead-scraper-provisioning': 'in_progress'\n  },\n  stepResults: {},\n  completedStepIds: [],\n  totalSteps: 1,\n  completedCount: 0\n}"
```

---

## 7. File Structure & Responsibilities

```mermaid
flowchart TB
    subgraph "lib/onboarding/ - Framework Core"
        types[types.ts<br/>━━━━━━━━━━━━━<br/>• Zod schemas<br/>• TypeScript types<br/>• API request/response shapes]
        
        registry[registry.ts<br/>━━━━━━━━━━━━━<br/>• Step storage Map<br/>• Step validation<br/>• Step queries]
        
        factory[factory.ts<br/>━━━━━━━━━━━━━<br/>• createApiStep()<br/>• createOAuthStep()<br/>• createFormStep()]
        
        executor[executor.ts<br/>━━━━━━━━━━━━━<br/>• Step execution<br/>• Data validation<br/>• Error handling<br/>• Rollback support]
        
        utils[utils.ts<br/>━━━━━━━━━━━━━<br/>• getOnboardingState()<br/>• markStepCompleted()<br/>• markOnboardingComplete()<br/>• DB queries]
        
        hooks[hooks.ts<br/>━━━━━━━━━━━━━<br/>• useOnboarding()<br/>• useOnboardingStep()<br/>• Client-side state]
        
        access[access.ts<br/>━━━━━━━━━━━━━<br/>• verifyWorkspaceAccess()<br/>• Permission checks]
    end
    
    subgraph "lib/onboarding/steps/ - Step Definitions"
        lsp[lead-scraper-provisioning.ts<br/>━━━━━━━━━━━━━<br/>• Step config<br/>• Result schema<br/>• API endpoint]
        
        idx[index.ts<br/>━━━━━━━━━━━━━<br/>• Step registration<br/>• stepRegistry.register()]
    end
    
    subgraph "app/onboarding/ - UI"
        page[page.tsx<br/>━━━━━━━━━━━━━<br/>• Main page<br/>• Step rendering<br/>• Navigation]
        
        layout[components/onboarding-layout.tsx<br/>━━━━━━━━━━━━━<br/>• Page layout<br/>• Header/footer]
        
        indicator[components/step-indicator.tsx<br/>━━━━━━━━━━━━━<br/>• Progress display<br/>• Step status icons]
        
        lsui[steps/lead-scraper-provisioning-step.tsx<br/>━━━━━━━━━━━━━<br/>• Provisioning UI<br/>• Auto-execute<br/>• Retry handling]
        
        compui[steps/completion-step.tsx<br/>━━━━━━━━━━━━━<br/>• Success message<br/>• Enter Workspace button]
    end
    
    subgraph "app/api/onboarding/ - API Routes"
        route[route.ts<br/>━━━━━━━━━━━━━<br/>• GET state<br/>• POST complete step]
        
        complete[complete/route.ts<br/>━━━━━━━━━━━━━<br/>• POST finish onboarding]
        
        provision[provision-lead-scraper/route.ts<br/>━━━━━━━━━━━━━<br/>• POST provision account]
        
        execute[execute/route.ts<br/>━━━━━━━━━━━━━<br/>• POST execute step]
    end
    
    subgraph "lib/lead-scraper/"
        prov[provisioning.ts<br/>━━━━━━━━━━━━━<br/>• Lead Scraper API calls<br/>• Env var storage<br/>• Encryption]
    end
    
    types --> registry
    types --> factory
    types --> executor
    types --> utils
    types --> hooks
    
    registry --> utils
    registry --> executor
    
    factory --> lsp
    
    lsp --> idx
    idx --> registry
    
    hooks --> page
    page --> lsui
    page --> compui
    
    route --> utils
    complete --> utils
    provision --> prov
    execute --> executor
```

---

## 8. Data Flow Summary

### 8.1 Complete Data Flow Diagram

```mermaid
flowchart TB
    subgraph "User Actions"
        UA1[Sign Up / Login]
        UA2[Visit /workspace]
        UA3[Auto-redirect to /onboarding]
        UA4[Watch provisioning]
        UA5[Click Enter Workspace]
    end
    
    subgraph "API Calls"
        A1[GET /api/workspaces]
        A2[POST /api/workspaces - if needed]
        A3[GET /api/onboarding/:id]
        A4[POST /api/onboarding/:id/provision-lead-scraper]
        A5[POST /api/onboarding/:id]
        A6[POST /api/onboarding/:id/complete]
    end
    
    subgraph "Database Operations"
        D1[SELECT workspace, permissions]
        D2[INSERT workspace, permissions, workflow]
        D3[SELECT workspace onboarding state]
        D4[INSERT/UPDATE workspace_environment]
        D5[UPDATE workspace.onboardingStep]
        D6[UPDATE workspace.onboardingCompleted = true]
    end
    
    subgraph "External APIs"
        L1[POST /organization]
        L2[POST /organizations/:id/tenants]
        L3[GET /organization/tenants/:id]
        L4[POST /accounts]
    end
    
    subgraph "Data Stored"
        S1[workspace.id<br/>workspace.name<br/>workspace.onboardingCompleted = false]
        S2[permissions.entity_id = workspace.id<br/>permissions.permission_type = 'admin']
        S3[workspace.onboardingStep = 'lead-scraper-provisioning']
        S4[workspace_environment.variables = {<br/>  LEAD_SCRAPER_ORGANIZATION_ID,<br/>  LEAD_SCRAPER_TENANT_ID<br/>}]
        S5[workspace.onboardingCompleted = true]
    end
    
    UA1 --> UA2
    UA2 --> A1
    A1 --> D1
    D1 -->|No workspace| A2
    A2 --> D2
    D2 --> S1
    D2 --> S2
    
    D1 -->|onboardingCompleted=false| UA3
    A2 -->|onboardingCompleted=false| UA3
    
    UA3 --> A3
    A3 --> D3
    
    UA4 --> A4
    A4 --> L1
    A4 --> L2
    L2 -->|No tenantId| L3
    A4 --> L4
    A4 --> D4
    D4 --> S4
    
    A4 --> A5
    A5 --> D5
    D5 --> S3
    
    UA5 --> A6
    A6 --> D6
    D6 --> S5
```

### 8.2 Environment Variables Required

| Variable | Purpose | Example |
|----------|---------|---------|
| `LEAD_SCRAPER_API_KEY` | API key for Lead Scraper service authentication | `sk_live_abc123...` |
| `LEAD_SCRAPER_BASE_URL` | Base URL of Lead Scraper service | `http://localhost:8081` |
| `LEAD_SCRAPER_API_PREFIX` | API path prefix | `/lead-scraper-microservice/api/v1` |

### 8.3 Encrypted Environment Variables Stored

| Key | Value | Purpose |
|-----|-------|---------|
| `LEAD_SCRAPER_ORGANIZATION_ID` | Encrypted workspace ID | Required for all Lead Scraper API calls |
| `LEAD_SCRAPER_TENANT_ID` | Encrypted tenant ID from Lead Scraper | Required for all Lead Scraper API calls |

---

## Appendix: Adding New Onboarding Steps

To add a new step (e.g., Gmail connection):

1. **Create step definition** in `lib/onboarding/steps/gmail-connection.ts`
2. **Create UI component** in `app/onboarding/steps/gmail-connection-step.tsx`
3. **Register step** in `lib/onboarding/steps/index.ts`
4. **Add to page UI** in `app/onboarding/page.tsx`

The framework handles:
- ✅ Step ordering
- ✅ Dependency resolution
- ✅ Condition checking
- ✅ State persistence
- ✅ Error handling
- ✅ Retry logic

---

*Last updated: January 1, 2026*

