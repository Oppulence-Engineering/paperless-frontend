# Paperless — Product Requirements Document

**Status:** Active  
**Owner:** Product  
**Last Updated:** December 2024  
**Version:** 2.0

---

# Executive Summary

## What We're Building

**Paperless is the data infrastructure layer for outbound sales—not another AI email writer.**

While the market floods with AI SDRs, agentic outreach tools, and "autonomous prospecting," we're building the foundation they all need: **fresh data, verified by default, with a full pipeline to actually use it.**

### The Three-Phase Vision

| Phase | Name | Timeline | Value Prop | ARPU Target |
|-------|------|----------|------------|-------------|
| **1** | Data Infrastructure | Q1-Q2 2025 | Best data, unified outreach pipeline | $100-150 |
| **2** | Unified Sales Inbox | Q3-Q4 2025 | Never lose context on a prospect | $150-250 |
| **3** | Relationship OS | 2026 | Complete system for converting strangers | $250-400 |

### The Contrarian Thesis

Everyone is building AI features on top of the same decaying databases. Clay raised $500M for "waterfall enrichment." 11x raised $50M for "AI SDR Ava." But they all pull from Apollo and ZoomInfo—databases with 25-35% annual decay rates.

**AI can write better emails. It cannot fix bad data.**

We're building the infrastructure layer that makes outbound actually work:
- Real-time scraping (fresh data, not cached lists)
- Partner database access (200M+ contacts for coverage)
- Verification-first architecture (not an add-on)
- Data flywheel (every user's scrapes make the product better)

---

# Why This Matters

## The Problem in 2025

### The Fragmented Stack

Every SMB sales team and agency runs the same broken playbook:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      THE 2025 SMB SALES STACK (BROKEN)                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   STEP 1: Find Leads                                                            │
│   └── Apollo, ZoomInfo, or manual Google searching                              │
│   └── Export to CSV, import somewhere else                                      │
│   └── Cost: $100-500/mo  •  Data decay: 30%/year                               │
│                                                                                  │
│   STEP 2: Verify Emails                                                         │
│   └── NeverBounce, ZeroBounce, Bouncer                                         │
│   └── Upload CSV, wait, download, re-upload                                    │
│   └── Cost: $30-100/mo  •  Time: 30 min/batch                                  │
│                                                                                  │
│   STEP 3: Send Outreach                                                         │
│   └── Lemlist, Instantly, Smartlead, Mailshake                                 │
│   └── Build sequences, import leads again                                       │
│   └── Cost: $50-200/mo  •  Another CSV upload                                  │
│                                                                                  │
│   STEP 4: Track Engagement                                                      │
│   └── Bitly for links, open tracking maybe works                               │
│   └── Check in separate dashboards                                              │
│   └── Cost: $20-50/mo  •  Zero attribution                                     │
│                                                                                  │
│   STEP 5: Manage Replies                                                        │
│   └── Gmail, Outlook—scattered across inboxes                                  │
│   └── No context on who replied or what campaign                               │
│   └── Cost: $0  •  Context lost: 100%                                          │
│                                                                                  │
│   STEP 6: Track Relationships                                                   │
│   └── HubSpot, Salesforce, or spreadsheets                                     │
│   └── Manual data entry, half the fields missing                               │
│   └── Cost: $50-300/mo  •  Compliance theater                                  │
│                                                                                  │
│   ────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│   TOTAL COST: $250-1,200/month per rep                                          │
│   TOTAL TIME WASTED: 10-15 hours/week on admin                                  │
│   CSV FILES CREATED: 4-8 per campaign                                           │
│   TOOLS WITH LOGINS: 5-8                                                        │
│   DATA LOSS PER HANDOFF: 20-30%                                                 │
│   CONTEXT WHEN REPLY COMES: None                                                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### The AI SDR Mirage

The 2024-2025 wave of AI sales tools promises to fix this. They're wrong.

**What AI SDR companies claim:**
> "AI that prospects, researches, and emails like a human, 24/7, at 1/10th the cost."

**What actually happens:**

| Step | Reality |
|------|---------|
| AI pulls from Apollo/ZoomInfo | 30% of contacts are stale |
| AI writes personalized email | To the wrong person (they changed jobs) |
| Email bounces or hits spam | Domain reputation tanks |
| Warm-up tools try to recover | Gaming deliverability, not earning it |
| Campaign "succeeds" at 2% | Survivorship bias, not AI magic |

**The fundamental flaw:** AI can write better emails. It cannot fix bad data.

### The Deliverability Crisis

Email has gotten dramatically harder in 2024:

| Factor | Before | Now | Impact |
|--------|--------|-----|--------|
| Authentication | Optional | Required (Google/Yahoo Feb 2024) | Unauthenticated = spam folder |
| AI email volume | Low | Exploding | Inboxes saturated |
| Spam detection | Basic | AI-powered | Patterns detected instantly |
| Recovery time | Days | Weeks/months | One bad campaign = long pain |

**The result:** 15-25% bounce rates are "normal." Sender reputations crater. Domains burn.

### What This Means for Us

**The opportunity is infrastructure, not features.**

Everyone's fighting over who writes better prompts. We're fixing the foundation:

1. **Fresh data** — Real-time scraping, not 6-month-old lists
2. **Verification by default** — Not an add-on, not extra cost
3. **Full pipeline** — Find → Verify → Automate → Track → Manage
4. **Data flywheel** — Every user's searches make the product better

---

# Who We're Building For

## Primary Personas

### Persona 1: Alex — The Agency Owner

**Profile:**
- Runs a marketing/lead gen agency (5-25 employees)
- Manages outreach for 5-20 clients simultaneously
- Age 28-45, tech-savvy, growth-focused
- Location: US, UK, Canada

**Current Reality:**
```
Monthly Tool Spend:
├── Apollo (data): $299/mo
├── NeverBounce (verification): $79/mo
├── Lemlist (sequences): $99/mo
├── HubSpot (CRM): $200/mo
└── Miscellaneous: $100/mo
────────────────────
Total: $777/month

Weekly Time Waste:
├── Managing 15 client exports/imports: 5 hours
├── Debugging failed campaigns: 3 hours
├── Building reports across tools: 2 hours
└── Context-switching between dashboards: 4 hours
────────────────────
Total: 14 hours/week (35% of work time)
```

**Pain Points (In Their Words):**
> "I manage 15 client campaigns. That's 15 different exports, 15 verification runs, 15 uploads. Every. Single. Week."

> "One client's campaign bounced badly last month. Took 6 weeks to recover the domain. They almost left us."

> "When a prospect replies, I have to remember which client they're for, which campaign they were in, and what we even said. It's chaos."

**Jobs To Be Done:**
1. Generate fresh leads for diverse client industries
2. Guarantee deliverability (burned domain = lost client)
3. Manage multiple campaigns without losing context
4. Prove ROI with clear attribution

**Success Metrics:**
- <3% bounce rate across all campaigns (currently 12%)
- <15 min to set up and launch a new campaign (currently 90 min)
- Zero context-switching for day-to-day campaign management

**Willingness to Pay:** $249-499/month for consolidated stack

**Tier Target:** Business ($349) or Enterprise

---

### Persona 2: Sarah — The SMB Sales Rep

**Profile:**
- Works at a B2B company (10-100 employees)
- Part of a 2-5 person sales team
- Age 24-35, quota-carrying
- Title: SDR, BDR, Account Executive

**Current Reality:**
```
Monthly Tool Spend:
├── Apollo (free or $99): $50 avg
├── LinkedIn Sales Navigator: $100/mo
├── Company email (Gmail/Outlook): $0
├── HubSpot (often underused): $50/mo
└── Personal spreadsheets: $0
────────────────────
Total: $200/month

Weekly Time Waste:
├── Building lists and researching: 6 hours
├── Dealing with bounces and bad data: 2 hours
├── Manual logging in CRM: 3 hours
└── Finding context when prospects reply: 2 hours
────────────────────
Total: 13 hours/week (33% of work time)
```

**Pain Points (In Their Words):**
> "I spend 3 hours a day on admin work that isn't selling. My quota doesn't care about my admin time."

> "Half the contacts in Apollo are wrong. People changed jobs, emails bounce. I don't trust any of it."

> "When I get a reply, I have to dig through my sent folder to remember what I said. By the time I piece it together, the moment's passed."

**Jobs To Be Done:**
1. Find qualified leads in assigned territory
2. Send personalized outreach at scale
3. Know immediately when hot leads engage
4. Hit quota without burning out

**Success Metrics:**
- 50+ personalized emails sent per day
- Know within 1 hour who to prioritize
- Clear visibility into what converts

**Willingness to Pay:** $49-149/month (often expensed)

**Tier Target:** Starter ($49) or Pro ($149)

---

### Persona 3: Finn — The Startup Founder

**Profile:**
- Technical founder doing founder-led sales
- Pre-seed to Series A company
- Age 25-40
- Wears many hats, time-constrained

**Current Reality:**
```
Monthly Tool Spend:
├── Free tools cobbled together: $0-50
├── Personal Gmail or Google Workspace: $0
├── Notion for everything: $10/mo
├── Tried Apollo, found it "too much": $0
────────────────────
Total: $10-60/month

Weekly Time on Sales:
├── Available time for outreach: 3-5 hours
├── Time spent on tool management: 2-3 hours
└── Actual selling: 1-2 hours
────────────────────
Efficiency: 30-40%
```

**Pain Points (In Their Words):**
> "I don't have time to learn 6 different sales tools. I have a product to build."

> "I tried Apollo and Lemlist. Too complicated, too many features I don't need. I just want to test if a market responds."

> "I need to validate my market, not build a sales operation. Give me something simple that works."

**Jobs To Be Done:**
1. Quickly test if a market segment responds
2. Send personalized outreach without dedicated infrastructure
3. Learn what messaging resonates before hiring sales
4. Spend <1 hour/week on sales operations

**Success Metrics:**
- First campaign live within 30 minutes of signup
- Clear signal on which segments respond
- < 1 hour/week on outreach operations

**Willingness to Pay:** $49-99/month initially, upgrades with traction

**Tier Target:** Starter ($49)

---

### Persona 4: Rachel — The Recruiting Firm Owner

**Profile:**
- Owner or lead recruiter at staffing agency
- 3-15 employees
- Specialized in 1-3 industries
- High email volume, relationship-driven

**Current Reality:**
```
Monthly Tool Spend:
├── LinkedIn Recruiter: $600/mo
├── Bullhorn or similar ATS: $150/mo
├── Various email tools: $100/mo
└── Spreadsheets for tracking: $0
────────────────────
Total: $850/month

Weekly Time Waste:
├── Hitting LinkedIn InMail limits: Constant
├── Manual candidate/client tracking: 5 hours
├── Switching between hiring manager outreach tools: 4 hours
└── Relationship context lookup: 3 hours
────────────────────
Total: 12 hours/week
```

**Pain Points (In Their Words):**
> "LinkedIn limits my InMails. I need email outreach to supplement, but it's a whole other stack to manage."

> "I need to track relationships with both candidates AND hiring managers. That's two different worlds with different tools."

> "Every bad email hurts my personal brand in the industry. I've been doing this 15 years—reputation is everything."

**Jobs To Be Done:**
1. Source candidates outside LinkedIn's limits
2. Reach hiring managers at target companies
3. Track relationships over months/years (candidates become clients)
4. Protect personal brand with clean outreach

**Success Metrics:**
- Expand reach 3x beyond LinkedIn limits
- Never send to invalid emails
- Track relationship history across years

**Willingness to Pay:** $149-349/month

**Tier Target:** Pro ($149) or Business ($349)

---

## Customer Segments

| Segment | % of TAM | Primary Persona | Key Needs | Tier |
|---------|----------|-----------------|-----------|------|
| **Agencies** | 40% | Alex | Multi-client, deliverability, reporting | Business/Enterprise |
| **SMB Sales** | 35% | Sarah | Simple, fast, team features | Starter/Pro |
| **Founders** | 15% | Finn | Quick start, validation, control | Starter |
| **Recruiting** | 10% | Rachel | Volume, relationships, reputation | Pro/Business |

## Anti-Personas (Who We're NOT Building For)

| Anti-Persona | Why Not | What They Should Use |
|--------------|---------|---------------------|
| **Enterprise (500+ employees)** | Need customization, compliance, SLAs we can't provide yet | ZoomInfo, 6sense, Outreach |
| **Spam senders** | Damage platform reputation, attract legal risk | Nothing—they shouldn't exist |
| **One-time list buyers** | No recurring need, low LTV | Fiverr scrapers |
| **Cold call only** | Phone-first motion, email is afterthought | VanillaSoft, Orum |

---

# Success Metrics

## Phase 1: Data Infrastructure (Q1-Q2 2025)

### Product Metrics

| Metric | Target | Why It Matters | How Measured |
|--------|--------|----------------|--------------|
| **Bounce rate** | <3% | Our core differentiator | Aggregate across all sends |
| **Time to first lead** | <5 min | Onboarding friction killer | Signup → first scrape complete |
| **Verification coverage** | 100% | Trust and reliability | Leads with verified email / total leads |
| **Scrape success rate** | >95% | Core value delivery | Successful jobs / total jobs |
| **Database query time** | <200ms | Flywheel UX | p95 query latency |
| **Workflow activation** | 50% of users | Full pipeline adoption | Users with active workflow / total users |

### Business Metrics

| Metric | Target | Timeline | How Measured |
|--------|--------|----------|--------------|
| **MRR** | $20K | End of Q2 | Stripe |
| **Paying Customers** | 200 | End of Q2 | Active subscriptions |
| **ARPU** | $100 | Ongoing | MRR / customers |
| **Monthly Active Workspaces** | 80% | Ongoing | Active workspaces / paid workspaces |
| **NPS** | >40 | Quarterly | Survey |

## Phase 2: Unified Sales Inbox (Q3-Q4 2025)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Daily Active Users** | 60% | Inbox creates daily habit |
| **Avg Response Time** | <2 hours | Measure of inbox utility |
| **Inbox Adoption** | 80% | Users checking inbox weekly |
| **Team Accounts** | 40% | Multi-user = higher LTV |
| **Reply Capture Rate** | 95% | Replies routed correctly |
| **ARPU** | $180 | Inbox justifies premium |

## Phase 3: Relationship OS (2026)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Net Revenue Retention** | 130% | Expansion > churn |
| **ARPU** | $280 | Full platform value |
| **Pipeline Visibility** | 100% | All leads have stage |
| **CRM Integration** | 30% | Enterprise adoption signal |
| **Daily Active Users** | 75% | Habitual use |

---

# What We're Building

## Phase 1: Data Infrastructure

### Core Capabilities

| Capability | Description | Priority |
|------------|-------------|----------|
| **Real-Time Scraping** | Google Maps scraped on-demand for user's exact query | P0 |
| **Partner Database** | 200M+ B2B contacts from data partners | P0 |
| **Data Flywheel** | Shared database enriched by all user activity | P0 |
| **Verification Pipeline** | Every email verified before display | P0 |
| **Lead Management** | List, filter, organize, bulk actions | P0 |
| **Visual Workflow Builder** | Drag-and-drop email sequences | P0 |
| **Email Sending** | Resend, Postmark, SMTP integration | P0 |
| **Engagement Tracking** | Opens, clicks, attribution | P0 |

### Data Sources

| Source | What It Provides | Freshness | Phase |
|--------|------------------|-----------|-------|
| **Google Maps Scraping** | Local businesses, contact info | Real-time | 1 |
| **Partner Databases** | 200M+ B2B contacts, decision makers | Monthly refresh | 1 |
| **Paperless Flywheel** | All previously scraped leads | Continuous | 1 |
| **Website Crawling** | Contact emails, social links | On-demand | 1 |

### Verification Architecture

```
Lead Discovered (any source)
         │
         ▼
┌─────────────────────────┐
│  Check Cache            │──── Hit ────▶ Return Cached Status
│  (verified in 7 days?)  │
└─────────┬───────────────┘
          │ Miss
          ▼
┌─────────────────────────┐
│  Verification Queue     │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  SMTP Validation        │
│  ├── Syntax check       │
│  ├── Domain MX lookup   │
│  ├── Mailbox probe      │
│  └── Catch-all detection│
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Result: ✅ ⚠️ ❌ ❓     │
│  ├── Update lead        │
│  ├── Cache result       │
│  └── Update flywheel    │
└─────────────────────────┘

Time: <30 seconds (95th percentile)
Coverage: 100% of leads with email
```

### Workflow Engine

**Node Types (Phase 1):**

| Node | Icon | Function | Config Options |
|------|------|----------|----------------|
| **Trigger** | ▶️ | Start workflow | Manual, schedule, on-event |
| **Filter** | 🔍 | Narrow leads | Location, rating, verification, tags |
| **Send Email** | 📧 | Compose and send | Template, provider, throttling |
| **Delay** | ⏱️ | Wait period | Hours, days, business days only |
| **Condition** | ◇ | Branch on event | Opened, clicked, replied |
| **Add to List** | 📂 | Organize lead | Select list |
| **Add Tag** | 🏷️ | Label lead | Select/create tag |

**Execution Guarantees:**
- Idempotent: Retries don't double-send
- Audit trail: Every step logged
- Retry logic: 3 attempts with exponential backoff
- Real-time updates: WebSocket push to UI

## Phase 2: Unified Sales Inbox

### Core Capabilities

| Capability | Description | Priority |
|------------|-------------|----------|
| **Reply Detection** | Identify replies to outreach, route to inbox | P0 |
| **Unified Inbox** | All conversations, all campaigns, one view | P0 |
| **Context Sidebar** | Full lead context alongside conversation | P0 |
| **Team Collaboration** | Assignments, notes, handoffs | P0 |
| **Smart Prioritization** | Hot leads surfaced first | P1 |
| **Snooze & Reminders** | Manage conversation timing | P1 |

### The Inbox Experience

**Why This Transforms the Product:**

| Behavior | Without Inbox | With Inbox |
|----------|---------------|------------|
| Daily usage | When running campaigns | Every day |
| Session length | 15 min (campaign setup) | 45 min (conversation management) |
| Team accounts | 15% | 40% |
| Switching cost | Low | High (history, context) |
| ARPU | $120 | $180 |

**The Context Sidebar:**
```
┌─────────────────────────────────────────┐
│ Sarah Chen                              │
│ VP Marketing @ Acme Corp                │
├─────────────────────────────────────────┤
│                                         │
│ 📧 sarah@acmecorp.com ✅ Verified       │
│ 📞 (555) 123-4567                       │
│ 🔗 LinkedIn ↗                           │
│                                         │
│ ── ENGAGEMENT ──────────────────────    │
│ Campaign: SaaS Directors Q1             │
│ Emails sent: 2                          │
│ Opens: 4                                │
│ Clicks: 1 (pricing page)                │
│                                         │
│ ── COMPANY ─────────────────────────    │
│ 🏢 Acme Corp                            │
│ 👥 150 employees                        │
│ 💰 Series B ($20M)                      │
│ 📍 Austin, TX                           │
│                                         │
│ ── TEAM NOTES ──────────────────────    │
│ @mike (2h ago): "Interested in Q2"      │
│ [Add Note...]                           │
│                                         │
│ ── ACTIONS ─────────────────────────    │
│ [📂 Add to List] [📋 Move Stage]        │
│ [⏰ Snooze] [👤 Assign]                 │
│                                         │
└─────────────────────────────────────────┘
```

## Phase 3: Relationship Operating System

### Core Capabilities

| Capability | Description | Priority |
|------------|-------------|----------|
| **Pipeline & Stages** | Kanban view of lead lifecycle | P0 |
| **Relationship Intelligence** | AI signals for engagement | P1 |
| **Team Analytics** | Manager dashboards, forecasting | P1 |
| **CRM Integrations** | Salesforce, HubSpot, Pipedrive sync | P1 |
| **Advanced Reporting** | Custom reports, attribution | P2 |

### The Anti-CRM Philosophy

**We are NOT building Salesforce.**

| Salesforce | Paperless |
|------------|-----------|
| Enterprise-first | SMB-first |
| Record-centric | Conversation-centric |
| Infinite customization | Opinionated defaults |
| 6-month implementation | 10-minute onboarding |
| $150/user/month | $49-349/month total |

**What we ARE building:**
- Lightweight pipeline for tracking deals
- Relationship context that surfaces automatically
- Team visibility without configuration overhead
- CRM sync for those who need records of truth

---

# What We're NOT Building

Being explicit about scope prevents scope creep and team confusion.

## Never (Philosophical)

| Feature | Why Not |
|---------|---------|
| **Full CRM** | We sync to CRMs, not replace them. Different muscle. |
| **AI-generated copy** | Everyone's doing this. We win on data, not prompts. |
| **Dialer/phone** | Phone is a different GTM motion. Focus. |
| **Data brokerage** | We don't resell lists. We help you build yours. |

## Not Yet (Timing)

| Feature | Why Not Now | When |
|---------|-------------|------|
| **SMS outreach** | Compliance complexity | Maybe 2026 |
| **LinkedIn automation** | TOS risk, saturation | Watching closely |
| **Video messaging** | Nice-to-have, not core | If demand emerges |
| **Mobile app** | Web-first, validate there | If daily use warrants |

## Explicitly Out of Scope for 2025

| Feature | Reason |
|---------|--------|
| **Multi-language support** | US/UK/Canada focus first |
| **Custom domains for tracking** | Added complexity, low ROI initially |
| **White-label / reseller** | 2026 agency play |
| **Self-hosted on-prem** | Cloud-first, enterprise later |

---

# Technical Requirements

## Non-Functional Requirements

| Area | Requirement | Target | Priority |
|------|-------------|--------|----------|
| **Uptime** | API and UI availability | 99.9% | P0 |
| **API Latency** | Read endpoints | p95 < 300ms | P0 |
| **Scraping Latency** | Job completion (depth 3) | p95 < 3 min | P0 |
| **Database Query** | Flywheel search | p95 < 200ms | P0 |
| **Verification Latency** | Email check | p95 < 30 sec | P0 |
| **Concurrent Users** | Simultaneous active | 1,000+ | P1 |
| **Workflow Execution** | Concurrent workflows | 100+ per account | P1 |

## Security Requirements

| Requirement | Implementation | Priority |
|-------------|----------------|----------|
| **Encryption in Transit** | TLS 1.3 everywhere | P0 |
| **Encryption at Rest** | AES-256 for sensitive data | P0 |
| **Authentication** | OAuth 2.0, MFA available | P0 |
| **Authorization** | RBAC with workspace isolation | P0 |
| **Audit Logging** | All sensitive actions logged | P1 |
| **Data Retention** | 90 days execution logs, leads indefinite | P1 |

## Compliance Requirements

| Regulation | Requirement | Implementation |
|------------|-------------|----------------|
| **GDPR** | Data export and deletion | Export all data as JSON/CSV; delete on request |
| **CCPA** | Do not sell, right to know | No data sales; provide data access |
| **CAN-SPAM** | Unsubscribe mechanism | Auto-insert unsubscribe link |
| **Email Authentication** | SPF, DKIM, DMARC | Required for custom domains |

## Observability

| Component | Tool | Purpose |
|-----------|------|---------|
| **Logging** | Structured JSON logs | Debug and audit |
| **Metrics** | Prometheus + Grafana | System health, SLOs |
| **Tracing** | OpenTelemetry | Request flow, latency |
| **Error Tracking** | Sentry | Exception capture |
| **Uptime Monitoring** | Pingdom/UptimeRobot | Availability alerts |

---

# Risks & Mitigations

## Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Google blocks scraping** | Medium | High | Multi-provider proxies; rate limiting; legal review; fallback to database-only |
| **Verification API limits** | Medium | Medium | Multi-provider (ZeroBounce + NeverBounce); aggressive caching |
| **Database scaling** | Low | High | PostgreSQL with read replicas; partition by geography at scale |
| **Email deliverability issues** | Medium | High | Verification-first; throttling; bounce monitoring; warm-up guidance |

## Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Slow customer acquisition** | Medium | High | Multiple channels; founder sales; aggressive content; pricing flexibility |
| **High churn** | Medium | High | Onboarding optimization; customer success; product improvements |
| **Competitor response** | Medium | Medium | Move fast; own SMB niche; build data flywheel moat |
| **AI SDR wave commoditizes us** | Medium | Medium | Stay infrastructure, not features; they need us, not vice versa |

## Legal/Regulatory Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Scraping legality** | Low | Medium | Public data only; rate limiting; opt-out mechanism; legal counsel |
| **GDPR/CCPA compliance** | Medium | Medium | Data deletion on request; clear privacy policy; EU hosting option |
| **Email spam complaints** | Medium | High | Verification; throttling; unsubscribe enforcement; education |

---

# Open Questions

## Requiring Decision

| Question | Options | Leaning | Decision Needed By |
|----------|---------|---------|-------------------|
| **Email verification provider** | ZeroBounce vs NeverBounce vs multi | Multi-provider | Week 2 |
| **CRM priority** | HubSpot vs Salesforce first | HubSpot (more SMB) | Week 16 |
| **Self-host offering** | Yes/No for Enterprise | Yes (differentiation) | Week 20 |

## Requiring Research

| Question | Why It Matters | Owner |
|----------|----------------|-------|
| **Scraping legal guardrails** | What opt-out mechanisms do we need? | Legal |
| **Data freshness SLA** | Can we promise "scraped within X days"? | Product |
| **GDPR data residency** | Do we need EU hosting? | Engineering |

## Parking Lot (Future Consideration)

| Topic | Notes |
|-------|-------|
| **LinkedIn integration** | Watching TOS changes; high demand but high risk |
| **AI personalization** | Table stakes by 2026; not differentiation now |
| **Agency white-label** | Strong demand from Alex persona; 2026 roadmap |

---

# Appendix A: User Journeys

## Journey 1: Alex's First Week (Agency Owner)

**Day 1: Discovery & Signup**
```
Alex finds Paperless via "Apollo alternative" Google search
├── Lands on homepage, sees "verification-first" messaging
├── Resonates with pain of burned domains
├── Signs up for Pro trial ($149/mo)
└── Creates first workspace "My Agency"
```

**Day 1-2: First Value**
```
Alex starts first scrape for existing client
├── Searches "dentists in Miami, FL"
├── Sees 67 leads in 3 minutes (vs 2 hours manual research)
├── Notes: All emails show verification status
├── Exports to test—all verified, none bounce
└── "This is what I've been looking for"
```

**Day 3-5: Workflow Adoption**
```
Alex builds first workflow
├── Creates 3-step sequence for client
├── Adds leads from scrape
├── Activates workflow
├── Sees sends, opens, clicks in real-time
└── Reports to client with actual metrics
```

**Day 5-7: Second Client**
```
Alex onboards second client
├── Creates new list for client #2
├── Different industry, different location
├── Same workflow, adjusted templates
├── Both campaigns visible in one dashboard
└── "I can actually scale this"
```

**Success Signal:** Alex upgrades to Business tier by end of trial.

## Journey 2: Sarah's First Campaign (SMB Sales Rep)

**Day 1: Quick Start**
```
Sarah's manager sends Paperless invite
├── Joins workspace (10 min onboarding)
├── Sees team's existing leads and workflows
├── Clones a workflow that's working
├── Adjusts for her territory
└── Campaign live in 30 minutes
```

**Day 2-7: Daily Workflow**
```
Sarah checks Paperless each morning
├── Dashboard shows: 12 opens, 3 clicks, 1 reply
├── Click on reply → sees full context
├── Reply in thread, log notes
├── Knows exactly who to call first
└── "I'm not guessing anymore"
```

**Day 14: Team Collaboration**
```
Sarah gets a reply she can't handle
├── Assigns to senior rep with context
├── Notes visible to entire team
├── Handoff takes 30 seconds
└── No "let me catch you up" call needed
```

**Success Signal:** Sarah's daily active use; team expands usage.

## Journey 3: Finn's Validation Sprint (Founder)

**Day 1: Hypothesis Testing**
```
Finn has 3 hours to test a market hypothesis
├── Signs up for Starter ($49/mo)
├── Scrapes 200 leads in target segment
├── Uses template, personalized with {{company}}
├── Sends to 100 leads
└── Time spent: 45 minutes (vs 5 hours before)
```

**Day 2-5: Signal Collection**
```
Finn checks metrics daily
├── 23% open rate (good sign)
├── 5% click rate (interested)
├── 2 replies asking for demos
└── "This segment might work"
```

**Day 7: Pivot or Persevere**
```
Finn tests second hypothesis
├── Different segment, different message
├── Compares metrics side-by-side
├── One clear winner
├── Focuses go-to-market on winner
└── "Validated in a week, not a quarter"
```

**Success Signal:** Finn upgrades when hiring first sales rep.

---

# Appendix B: Competitive Positioning

## Feature Comparison

| Capability | Paperless | Apollo | Clay | 11x/Artisan | Instantly |
|------------|-----------|--------|------|-------------|-----------|
| **Fresh data generation** | ✅ Real-time | ❌ Stale DB | ❌ API aggregator | ❌ Dependent | ❌ None |
| **Verification built-in** | ✅ Pre-show | Add-on | Add-on | External | ❌ |
| **Full pipeline** | ✅ | Basic | ❌ | ✅ | Email only |
| **Data flywheel** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Unified inbox** | Phase 2 | ❌ | ❌ | ❌ | ❌ |
| **SMB pricing** | $49-349 | $99+ | $149+ | Enterprise | $37+ |
| **Self-host** | ✅ | ❌ | ❌ | ❌ | ❌ |

## Positioning by Competitor

**vs Apollo:** "Apollo's data is 30% stale. We scrape fresh. Apollo's verification is add-on. Ours is default."

**vs Clay:** "Clay is an API aggregator—they call the same stale sources 10 ways. We generate fresh data."

**vs 11x/Artisan:** "They're AI features on bad data. We're the infrastructure they'll need to actually work."

**vs Instantly:** "They optimize sending. We optimize whether you should send at all."

---

# Appendix C: Pricing Tiers

| Tier | Price | Database Leads | Fresh Scrapes | Key Features | Target Persona |
|------|-------|----------------|---------------|--------------|----------------|
| **Starter** | $49/mo | 1,000/mo | 500/mo | Core pipeline, 3 workflows | Finn |
| **Pro** | $149/mo | 10,000/mo | 5,000/mo | Unlimited workflows, team | Sarah |
| **Business** | $349/mo | 50,000/mo | 25,000/mo | API, priority support | Alex |
| **Enterprise** | Custom | Unlimited | Unlimited | Self-host, SLAs, CSM | Large Alex |

**All tiers include:**
- Email verification (built-in)
- Visual workflow builder
- Engagement tracking
- CRM sync
- Support

**Overage pricing:**
- Additional leads: $0.03 (Starter), $0.02 (Pro), $0.01 (Business)
- Additional verifications: $0.005

---

# Appendix D: Glossary

| Term | Definition |
|------|------------|
| **Bounce rate** | Percentage of emails that fail to deliver |
| **Catch-all domain** | Email domain that accepts all addresses (risky) |
| **Data decay** | Rate at which contact data becomes stale |
| **Flywheel** | Product dynamic where usage improves the product |
| **Verification** | Process of checking if an email is deliverable |
| **Workflow** | Automated sequence of actions (emails, delays, conditions) |
| **Warm-up** | Process of building sender reputation for new domains |
| **ARPU** | Average Revenue Per User (monthly) |
| **MRR** | Monthly Recurring Revenue |
| **NPS** | Net Promoter Score (customer satisfaction) |

---

*This PRD is the source of truth for what Paperless is building and why. Product decisions should align with this document. Update as requirements evolve.*

*Last Updated: December 2024*
