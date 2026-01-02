# Paperless — 2026 Product Roadmap

**From Data Infrastructure to Relationship Operating System**

This roadmap defines Paperless's evolution across three strategic phases, each building on the previous to create compounding value and defensibility. Every feature is specified to production-ready detail.

---

# Strategic Vision

## The Three Phases

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          PAPERLESS PRODUCT EVOLUTION                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   PHASE 1: DATA INFRASTRUCTURE           Q1-Q2 2026                             │
│   ─────────────────────────────────────────────────────────                     │
│   • Real-time lead scraping                                                      │
│   • Partner database integration (200M+ contacts)                               │
│   • Verification-first architecture                                              │
│   • Visual workflow builder for outreach                                         │
│   • Engagement tracking (opens, clicks)                                          │
│   • Data flywheel foundation                                                     │
│                                                                                  │
│   VALUE: Best data, unified outreach pipeline                                   │
│   ARPU TARGET: $100-150/mo                                                      │
│   KEY METRICS: <3% bounce rate, 5-min time-to-first-lead                        │
│                                                                                  │
│   ────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│   PHASE 2: UNIFIED SALES INBOX           Q3-Q4 2026                             │
│   ─────────────────────────────────────────────────────────                     │
│   • All replies from all campaigns in one place                                 │
│   • Full context sidebar (who they are, engagement history)                     │
│   • Team collaboration (assignments, notes, threads)                            │
│   • Smart prioritization and queue management                                    │
│   • Conversation threading                                                       │
│   • Real-time notifications                                                      │
│                                                                                  │
│   VALUE: Never lose context on a prospect again                                 │
│   ARPU TARGET: $150-250/mo                                                      │
│   KEY METRICS: 60% daily active, <2 min avg response time                       │
│                                                                                  │
│   ────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│   PHASE 3: RELATIONSHIP OS               2027 (Foundation in Q4 2026)           │
│   ─────────────────────────────────────────────────────────                     │
│   • Lightweight CRM-lite (stages, pipelines)                                    │
│   • Relationship intelligence and signals                                        │
│   • Full lifecycle: stranger → lead → prospect → customer                       │
│   • Team reporting and forecasting                                               │
│   • Integrations and ecosystem                                                   │
│                                                                                  │
│   VALUE: Complete system for converting strangers to customers                  │
│   ARPU TARGET: $250-400/mo                                                      │
│   KEY METRICS: 75% daily active, 130% net retention                             │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Market Timing Analysis

### Why 2026 Is the Inflection Point

The convergence of multiple market forces creates a unique window of opportunity for Paperless to establish category leadership. This analysis examines the key timing indicators that validate our strategic approach.

#### Macro-Level Market Shifts

| Factor | 2023-2024 State | 2025-2026 Trajectory | Impact on Paperless |
|--------|-----------------|---------------------|---------------------|
| **Email Deliverability Regulation** | Google/Yahoo authentication optional | DMARC enforcement mandatory; SPF/DKIM required | Verification-first architecture becomes table stakes |
| **AI SDR Saturation** | Early hype cycle; massive VC investment | Market correction; ROI scrutiny | Infrastructure wins over features |
| **Data Decay Awareness** | Low; accepted as normal | High; driving tool decisions | Fresh data becomes key differentiator |
| **SMB Tool Fatigue** | Growing frustration | Active consolidation seeking | Unified platforms win over point solutions |
| **Privacy Regulation** | GDPR established; CCPA implemented | State-by-state US privacy laws expanding | Compliant-by-design platforms favored |

#### Technology Trend Analysis

**1. Email Authentication Evolution (Critical)**

```
TIMELINE: EMAIL AUTHENTICATION REQUIREMENTS

2023 Q4: Google announces Feb 2024 requirements
    │
    ▼
2024 Feb: SPF/DKIM required for bulk senders (5,000+/day)
    │
    ▼
2024 Q3: Yahoo aligns with Google requirements
    │
    ▼
2025 Q1: One-click unsubscribe enforcement begins
    │
    ▼
2025 Q2: DMARC p=quarantine becomes default recommendation
    │
    ▼
2026 Q1: DMARC p=reject expected for enterprise senders
    │
    ▼
2026+: Predictive spam filtering using sender reputation scoring
```

**Impact Analysis:**
- Bounce rates directly impact sender reputation
- Unverified emails become liability, not just inefficiency
- Verification shifts from "nice-to-have" to "must-have"
- Our pre-verification architecture becomes competitive moat

**2. AI in Sales Technology**

| AI Capability | Current Maturity | 2026 Projection | Our Strategy |
|---------------|-----------------|-----------------|--------------|
| **Email Copy Generation** | Commodity (GPT-4, Claude) | Table stakes | Not our focus |
| **Personalization at Scale** | Emerging | Standard feature | Enable via clean data |
| **Lead Scoring** | Basic ML models | Sophisticated signals | Build on engagement data |
| **Conversation Intelligence** | Enterprise only | SMB accessible | Phase 3 feature |
| **Data Quality AI** | Nascent | Differentiator | Core competency |

**3. Data Infrastructure Evolution**

The sales data industry is undergoing fundamental restructuring:

| Era | Time Period | Dominant Model | Example Players |
|-----|-------------|----------------|-----------------|
| **Static Databases** | 2010-2020 | Annual refresh; bulk licensing | ZoomInfo, D&B |
| **Crowdsourced Data** | 2015-2022 | User contributions; LinkedIn scraping | Apollo, Lusha |
| **API Aggregation** | 2020-2024 | Waterfall enrichment; multi-source | Clay, Clearbit |
| **Real-Time Generation** | 2024+ | On-demand scraping; verification-first | **Paperless** |

#### Regulatory Environment Deep-Dive

**Email Regulations by Jurisdiction**

| Regulation | Jurisdiction | Key Requirements | Paperless Compliance |
|------------|--------------|------------------|---------------------|
| **CAN-SPAM** | United States | Unsubscribe mechanism; physical address; no deceptive headers | Auto-inserted unsubscribe; header validation |
| **CASL** | Canada | Express consent; sender identification; unsubscribe | Consent tracking; identity verification |
| **GDPR Article 6** | European Union | Lawful basis for processing; legitimate interest | Documentation framework; data minimization |
| **PECR** | United Kingdom | Prior consent for marketing | Consent management integration |
| **California CPRA** | California | Right to opt-out; data access rights | Self-service data export; deletion workflows |

**Scraping Legality Framework**

Our scraping operations are designed with legal defensibility:

| Principle | Implementation | Legal Basis |
|-----------|----------------|-------------|
| **Public Data Only** | Only scrape publicly accessible business information | First Amendment; HiQ v. LinkedIn precedent |
| **No Login Required** | Never bypass authentication | CFAA compliance |
| **Rate Limiting** | Respectful request patterns | No tortious interference |
| **Robots.txt Respect** | Honor opt-out signals | Industry standard; good faith |
| **Opt-Out Mechanism** | Businesses can request removal | Self-regulatory compliance |
| **Business Data Focus** | B2B only; no consumer PII | Reduced privacy exposure |

#### Customer Acquisition Funnel Analysis by Phase

**Phase 1 Funnel (Data Infrastructure)**

```
PHASE 1 ACQUISITION FUNNEL

┌─────────────────────────────────────────────────────────────────────────────────┐
│ AWARENESS                                                                        │
│ ├── SEO: "Apollo alternative", "email verification tool", "Google Maps scraper" │
│ ├── Content: Blog posts, YouTube tutorials, comparison articles                 │
│ ├── Community: Indie Hackers, Reddit, Twitter/X                                 │
│ └── Referrals: Design partner network                                           │
│                                                                                  │
│ Target: 10,000 unique visitors/month by Q2 2026                                 │
│ Cost: $0.50-2.00 per visitor                                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ INTEREST (Signup)                                                                │
│ ├── Free tier: 100 leads/month, database only                                  │
│ ├── Interactive demo: Try before signup                                         │
│ └── Case studies: ROI proof from early adopters                                 │
│                                                                                  │
│ Target: 15% visitor-to-signup conversion                                        │
│ Expected: 1,500 signups/month by Q2 2026                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ CONSIDERATION (Activation)                                                       │
│ ├── First scrape: <5 minutes to first leads                                    │
│ ├── Verification demo: See quality difference immediately                       │
│ └── Workflow template: Pre-built sequences for common use cases                 │
│                                                                                  │
│ Target: 40% signup-to-activation (first successful scrape)                      │
│ Expected: 600 activated users/month                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│ CONVERSION (Trial → Paid)                                                        │
│ ├── 14-day trial: Full Pro features                                            │
│ ├── Usage nudges: "You've used 80% of trial credits"                           │
│ └── Success check-in: Day 7 automated email                                     │
│                                                                                  │
│ Target: 25% activation-to-paid conversion                                       │
│ Expected: 150 new paying customers/month by Q2 2026                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│ RETENTION (Month 2+)                                                             │
│ ├── Onboarding sequence: 7-day drip campaign                                   │
│ ├── Feature discovery: In-app guidance                                          │
│ └── Customer success: Proactive outreach at risk signals                        │
│                                                                                  │
│ Target: 96% Month 1 retention; 92% Month 3 retention                            │
│ Expected: <4% monthly churn by end of Phase 1                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Acquisition Channel Mix by Phase**

| Channel | Phase 1 (%) | Phase 2 (%) | Phase 3 (%) | Rationale |
|---------|-------------|-------------|-------------|-----------|
| **Organic Search (SEO)** | 40% | 35% | 30% | Long-term; compounds over time |
| **Content Marketing** | 25% | 20% | 15% | Thought leadership; education |
| **Product-Led Growth** | 15% | 25% | 30% | Free tier; word-of-mouth |
| **Paid Ads** | 10% | 15% | 20% | Scale after unit economics proven |
| **Partnerships/Affiliates** | 10% | 5% | 5% | Agency network; integrators |

---

## Competitive Landscape Evolution Timeline

### 2024-2027 Market Dynamics

```
COMPETITIVE LANDSCAPE EVOLUTION

2024 ─────────────────────────────────────────────────────────────────────────────
     │
     ├── Clay raises $500M+ (API aggregation model)
     ├── 11x raises $50M (AI SDR hype peak)
     ├── Instantly/Smartlead gain traction (cheap volume)
     ├── Apollo reaches $100M ARR (incumbent scale)
     │
     ▼
2025 Q1-Q2 ───────────────────────────────────────────────────────────────────────
     │
     ├── AI SDR backlash begins (domain damage reports)
     ├── Google/Yahoo enforcement causes bounce spikes
     ├── Apollo adds verification (reactive, add-on pricing)
     ├── ** Paperless launches Phase 1 **
     │
     ▼
2025 Q3-Q4 ───────────────────────────────────────────────────────────────────────
     │
     ├── AI SDR consolidation (M&A activity)
     ├── Verification becomes table stakes
     ├── SMB migration from point solutions accelerates
     ├── Paperless gains traction in agency segment
     │
     ▼
2026 Q1-Q2 ───────────────────────────────────────────────────────────────────────
     │
     ├── First AI SDR failures become public
     ├── Data freshness becomes buying criterion
     ├── ** Paperless Phase 1 mature; Phase 2 launches **
     │
     ▼
2026 Q3-Q4 ───────────────────────────────────────────────────────────────────────
     │
     ├── Inbox becomes new battleground
     ├── CRM-lite features emerge across tools
     ├── ** Paperless Phase 2 complete; Phase 3 foundation **
     │
     ▼
2027 ─────────────────────────────────────────────────────────────────────────────
     │
     ├── Market consolidation (3-5 dominant players)
     ├── Relationship OS category established
     ├── ** Paperless positioned as category leader **
```

### Competitor Response Scenarios

| Competitor | Likely Response | Our Counter-Strategy |
|------------|-----------------|---------------------|
| **Apollo** | Add verification as paid add-on; improve workflows | Verification included; better UX; flywheel moat |
| **Clay** | Expand to outreach; add verification API | Full pipeline vs. enrichment-only; SMB focus |
| **11x/Artisan** | Partner with data providers; add verification | We ARE the data provider they need |
| **Instantly** | Add data sourcing; improve deliverability | Quality over quantity; reputation protection |
| **HubSpot** | Improve Sales Hub data quality | SMB agility; no enterprise complexity |

---

# User Personas & Segments

## Primary Personas

### Persona 1: Agency Owner Alex

**Demographics:**
- Runs a marketing/lead gen agency (5-25 employees)
- Manages outreach for 5-20 clients simultaneously
- Age 28-45, tech-savvy, growth-focused
- Located in US/UK/Canada

**Current Stack:**
- Apollo or ZoomInfo (data) — $200-500/mo
- Lemlist or Instantly (outreach) — $100-200/mo
- NeverBounce (verification) — $50-100/mo
- HubSpot or Pipedrive (CRM) — $200-500/mo
- Google Sheets (glue between everything)

**Pain Points:**
1. "I manage 15 client campaigns. That's 15 different exports, 15 verification runs, 15 uploads. Every. Single. Week."
2. "When a lead replies, I have to remember which client they're for and what campaign they were in."
3. "One bad campaign with bounces can ruin our domain reputation for months."
4. "I'm paying $800/month for tools that still don't talk to each other."

**Jobs To Be Done:**
- Generate fresh leads for diverse client industries
- Ensure high deliverability to protect agency reputation
- Manage multiple campaigns without losing context
- Report ROI to clients with clear attribution

**Success Metrics:**
- <3% bounce rate across all campaigns
- <15 min to build and launch a new campaign
- Zero context-switching between tools for day-to-day work

**Willingness to Pay:** $249-499/mo for a solution that consolidates their stack

#### Alex's User Journey Map

**Day 1: Discovery & Signup**
```
9:00 AM  - Alex sees "Apollo alternative" article while researching tools
         - Clicks through, reads about verification-first approach
         - Resonates with burned domain story (happened to them)
         
9:15 AM  - Signs up for 14-day Pro trial
         - Creates workspace "Apex Marketing Agency"
         - Completes quick onboarding survey (agency, 10 clients, 12 employees)
         
9:25 AM  - First scrape: "dentists in Miami, FL"
         - Watches real-time progress (novel experience)
         - 67 leads in 2:34 minutes
         
9:28 AM  - Examines lead list
         - Notices: All emails have verification badges
         - No ❌ Invalid emails visible (filtered by default)
         - "This is already better than Apollo"
         
9:35 AM  - Exports 10 leads as test
         - Sends through existing Lemlist setup
         - Zero bounces
         
9:40 AM  - Explores workflow builder
         - Sees pre-built templates
         - Bookmarks for later
```

**Week 1: First Campaign**
```
Day 2    - Builds first workflow using template
         - "New Lead Introduction" (3-step sequence)
         - Customizes templates with agency branding
         
Day 3    - Connects existing Resend account
         - Verifies sender domain (SPF/DKIM guidance helps)
         - Tests workflow with personal email
         
Day 4    - Activates workflow for Miami Dentists list
         - First 50 leads enter sequence
         - Real-time tracking shows sends/opens
         
Day 5-7  - Monitors engagement dashboard
         - 23% open rate (above industry average)
         - 3 replies by end of week
         - Zero bounces
         - "I could get used to this"
```

**Month 1: Multi-Client Adoption**
```
Week 2   - Onboards second client (SaaS company)
         - Creates separate list and workflow
         - Different template, same process
         - Both campaigns visible in unified dashboard
         
Week 3   - Third client: Local contractors
         - Uses Google Maps scraping (perfect fit)
         - Realizes: "This is my competitive advantage"
         
Week 4   - Reviews trial usage
         - 3 active campaigns
         - 0 bounced emails (vs 12% historical)
         - Clients impressed with reporting
         - Converts to Business tier ($349/mo)
         - "Already saving $400/month on other tools"
```

**Month 3: Full Adoption**
```
         - 8 clients running through Paperless
         - Cancelled Apollo ($299), NeverBounce ($79), Lemlist ($99)
         - Net savings: $128/month
         - Time savings: 10+ hours/week
         - Zero burned domains in 3 months
         
         - Considers Enterprise for API access
         - Refers 2 other agency owners
```

#### Alex's Detailed Scenarios

**Scenario 1: New Client Onboarding**
```
CONTEXT: Alex just signed a new client—a roofing company targeting homeowners 
         in Houston who recently bought older homes.

BEFORE PAPERLESS:
├── 2 hours: Manual Google Maps searching, copy-paste to spreadsheet
├── 30 min: Upload to Hunter for email finding
├── 30 min: Download, re-upload to NeverBounce
├── 45 min: Wait for verification
├── 20 min: Download, filter, re-upload to Lemlist
├── 30 min: Build sequence
└── Total: 5+ hours

WITH PAPERLESS:
├── 5 min: Search "roofing contractors" + "real estate agents" in Houston
├── 3 min: 120 leads scraped and verified
├── 10 min: Build workflow from template
├── 2 min: Activate with first 50 leads
└── Total: 20 minutes

RESULT: 15x time savings; client campaign live same day as signing
```

**Scenario 2: Domain Reputation Protection**
```
CONTEXT: Alex's team accidentally sent to an old list (happens when 
         new team member doesn't know the process).

BEFORE PAPERLESS:
├── Sent 500 emails from client's domain
├── 127 bounced (25% bounce rate)
├── Domain reputation tanked
├── 6 weeks to recover deliverability
├── Client nearly churned
└── Impact: $4,000/month revenue at risk

WITH PAPERLESS:
├── All emails pre-verified before visible in list
├── Workflow refuses to send to ❌ Invalid
├── Warning prompt for ⚠️ Risky (catch-all) emails
├── Even "old" lists are re-verified on access
└── Impact: Scenario cannot happen

LESSON: Verification-first architecture prevents category of failure
```

**Scenario 3: Client Reporting**
```
CONTEXT: Alex needs to present monthly results to a demanding client.

BEFORE PAPERLESS:
├── Export data from Lemlist
├── Export data from Apollo
├── Export data from Hunter
├── Combine in Google Sheets
├── Create manual pivot tables
├── Build slides in Google Slides
└── Time: 3+ hours per client, monthly

WITH PAPERLESS:
├── Navigate to Analytics → Client filter
├── View unified dashboard with all metrics
├── One-click export to PDF report
├── White-label ready (Business tier)
└── Time: 15 minutes per client

RESULT: 12 clients × 2.75 hours saved = 33 hours/month recovered
```

---

### Persona 2: SMB Sales Rep Sarah

**Demographics:**
- Works at a B2B company (10-100 employees)
- Part of a 2-5 person sales team
- Age 24-35, quota-carrying
- Title: SDR, BDR, Account Executive, or Sales Rep

**Current Stack:**
- Apollo (free or $99 tier) — $0-99/mo
- LinkedIn Sales Navigator — $80-150/mo
- Company-provided email (Gmail/Outlook)
- HubSpot CRM (often underused)
- Personal spreadsheets for tracking

**Pain Points:**
1. "I spend 3 hours a day on admin work that isn't selling."
2. "Half the contacts in our CRM are outdated. I don't trust the data."
3. "When I get a reply, I have to dig through my sent folder to remember what I said."
4. "My manager wants activity metrics, but I can't easily show what's working."

**Jobs To Be Done:**
- Find qualified leads in their territory
- Send personalized outreach at scale
- Track who's engaging and prioritize follow-up
- Hit quota without burning out

**Success Metrics:**
- 50+ personalized emails sent per day
- Know within 24 hours who to prioritize
- Clear visibility into what converts

**Willingness to Pay:** $49-149/mo (often expensed)

#### Sarah's User Journey Map

**Day 1: Team Onboarding**
```
10:00 AM - Manager sends Paperless workspace invite
         - "We're consolidating our stack. Check this out."
         
10:05 AM - Sarah accepts invite, joins team workspace
         - Sees existing team leads and workflows
         - Quick orientation (5 min in-app tutorial)
         
10:15 AM - Explores assigned territory (Southwest region)
         - Filters leads by location: Arizona, Nevada, New Mexico
         - Sees 450 leads already scraped by team
         
10:25 AM - Clones team workflow "Enterprise Intro Sequence"
         - Customizes email templates with her voice
         - Adds personal calendar link for meetings
         
10:40 AM - Activates workflow for 50 leads
         - First campaign live in 35 minutes
         - "That usually takes me a full afternoon"
```

**Week 1: Building Habits**
```
Day 2    - Morning check: Dashboard shows 12 opens, 2 clicks
         - Identifies hot leads (multiple engagements)
         - Prioritizes follow-up calls based on data
         
Day 3    - First reply comes in
         - Full context visible: what was sent, when opened
         - Replies with confidence (no digging through sent folder)
         
Day 4-5  - Adds 30 new leads from database search
         - Filters: "VP Sales" + "SaaS" + "50-200 employees"
         - All pre-verified, ready to sequence
         
Day 6-7  - Reviews week performance
         - 3 meetings booked from outreach
         - Zero bounces (vs typical 8-10 per week)
         - Manager impressed with clean metrics
```

**Month 1: Power User Emergence**
```
Week 2   - Creates custom saved search for ICP
         - "Director+" + "Marketing" + "B2B" + "Series A-C"
         - Becomes go-to for team lead sourcing
         
Week 3   - Starts using tags for lead organization
         - "Hot", "Call Scheduled", "Nurture", "Not Now"
         - Pipeline visibility improves dramatically
         
Week 4   - Shares workflow with new team member
         - Onboards colleague in 20 minutes
         - "This is so much easier than our old stack"
         
         - Quota: 150% of target
         - Attribution: 60% from Paperless outreach
```

#### Sarah's Detailed Scenarios

**Scenario 1: Territory Prospecting**
```
CONTEXT: Sarah is assigned a new territory (Colorado) and needs to 
         build pipeline from scratch.

BEFORE PAPERLESS:
├── 4 hours: Research companies in territory via LinkedIn
├── 2 hours: Find decision-makers, copy emails to spreadsheet
├── 1 hour: Verify emails through free Hunter credits
├── 1 hour: Upload to Lemlist, build sequence
└── Total: 8+ hours to get first outreach sent

WITH PAPERLESS:
├── 10 min: Search database with filters
│           └── "VP/Director Sales" + "Colorado" + "50-200 employees"
├── Immediate: 85 verified leads ready
├── 15 min: Customize workflow template
├── 5 min: Activate for 50 leads
└── Total: 30 minutes to first outreach

RESULT: 16x time savings; 7+ hours recovered for actual selling
```

**Scenario 2: Hot Lead Follow-Up**
```
CONTEXT: A lead opened Sarah's email 4 times in 2 hours but hasn't 
         replied. This is a buying signal.

BEFORE PAPERLESS:
├── Email notification goes to Gmail (if tracking even works)
├── Sarah doesn't see it until checking email later
├── Has to look up who this person is
├── Moment passes; lead goes cold
└── Opportunity lost

WITH PAPERLESS:
├── Dashboard surfaces "High Engagement" leads automatically
├── Lead shows: 4 opens, 2 clicks on pricing page
├── Full context: Company info, emails sent, engagement timeline
├── Sarah calls within 30 minutes of engagement
└── Meeting booked while interest is hot

RESULT: Real-time prioritization converts interest to meetings
```

**Scenario 3: Team Handoff**
```
CONTEXT: Sarah is going on vacation for 2 weeks. She has 15 active 
         conversations that need continued engagement.

BEFORE PAPERLESS:
├── Create spreadsheet of active conversations
├── Forward email threads to colleague
├── Verbal briefing on each lead (30 min)
├── Hope colleague checks spreadsheet
├── Return to find dropped balls
└── 3 opportunities went cold

WITH PAPERLESS:
├── Bulk assign 15 conversations to colleague
├── All context transfers automatically
│   └── Engagement history, notes, company info, thread history
├── Colleague sees "Assigned to Me" queue
├── Clear priority indicators
├── Sarah returns to updated notes and continued conversations
└── Zero dropped opportunities

RESULT: Seamless handoffs; no context loss during transitions
```

---

### Persona 3: Startup Founder Finn

**Demographics:**
- Technical founder doing founder-led sales
- Pre-seed to Series A company
- Age 25-40
- Wears many hats, time-constrained

**Current Stack:**
- Free tools cobbled together
- Personal Gmail or Google Workspace
- Notion for everything
- Maybe tried Apollo, found it "too much"

**Pain Points:**
1. "I don't have time to learn 6 different sales tools."
2. "I tried outreach tools but they're built for full-time sales teams, not founders."
3. "I need to validate my market, not build a sales operation."
4. "I want control and transparency—not a black box."

**Jobs To Be Done:**
- Quickly test if a market segment responds
- Send personalized outreach without dedicated sales infrastructure
- Learn what messaging resonates before hiring sales

**Success Metrics:**
- First campaign live within 30 minutes of signup
- Clear signal on which segments respond
- < 1 hour/week on outreach operations

**Willingness to Pay:** $49-99/mo initially, upgrades as validation happens

#### Finn's User Journey Map

**Day 1: Hypothesis Testing**
```
2:00 PM  - Finn has a hypothesis: "Enterprise CFOs might need our expense tool"
         - Has 2 hours before investor call prep
         
2:05 PM  - Signs up for Paperless Starter ($49/mo)
         - Quick onboarding: "Founder" + "Testing market" + "<100 emails/month"
         
2:15 PM  - Database search: "CFO" + "Series B-C" + "100-500 employees"
         - 127 verified leads returned instantly
         - "Wait, that's it? No export-import dance?"
         
2:25 PM  - Selects 50 leads (good variety of industries)
         - Uses template: "Founder Cold Intro"
         - Personalizes with {{company}} and {{first_name}}
         
2:40 PM  - Workflow activated
         - Emails sending over next 2 hours
         - Back to investor prep
         
5:00 PM  - Quick check: 47 sent, 8 opened (17% open rate)
         - No bounces (surprising based on past experience)
         - "Interesting. Let's see what happens."
```

**Week 1: Signal Collection**
```
Day 2    - 15 opens, 3 clicks on product page
         - 1 reply: "Interesting. Not right now, but keep me posted."
         - Tagged as "Future Nurture"
         
Day 3    - Breakthrough reply: "This is exactly what we've been looking for. Demo?"
         - Finn books meeting same day
         - Tags lead as "Hot"
         
Day 4-5  - 2 more positive replies
         - 1 negative: "We use Expensify"
         - Tagged for competitive analysis
         
Day 6-7  - Weekly analysis:
         - Open rate: 23% (above average)
         - Reply rate: 8% (very good for cold)
         - 3 demo requests from 50 emails
         - Hypothesis: Validated. CFOs are interested.
```

**Month 1: Iteration and Expansion**
```
Week 2   - Tests second segment: "VP Finance" at same company sizes
         - Results: Lower open rate (18%), fewer replies (4%)
         - Conclusion: CFO targeting is correct
         
Week 3   - Tests messaging variants
         - Version A: Pain-focused ("expense reports are broken")
         - Version B: Outcome-focused ("close books 3 days faster")
         - Result: Version B wins (12% reply vs 6%)
         
Week 4   - Has enough signal to:
         - Define ICP: CFO, Series B-C, 100-500 employees
         - Create pitch deck with customer language
         - Start hiring process for first sales rep
         
         - Upgrades to Pro ($149) for more volume
         - "Best $49 I've spent. Validated in 3 weeks."
```

#### Finn's Detailed Scenarios

**Scenario 1: Rapid Market Validation**
```
CONTEXT: Finn needs to test 3 different customer segments to decide 
         which to focus the startup on. Has 2 weeks and no budget.

BEFORE PAPERLESS:
├── Segment 1: 3 days to manually find/verify 50 contacts
├── Send via personal Gmail (deliverability unknown)
├── Segment 2: Another 3 days
├── Segment 3: Another 3 days
├── Total: 9+ days of work, inconclusive data
└── Result: Decision delayed; runway consumed

WITH PAPERLESS:
├── Day 1: All 3 segments searched, 150 leads ready
├── Day 1: 3 separate workflows created (1 hour total)
├── Days 2-14: Collect engagement data
├── Day 14: Clear comparison across segments
└── Result: Decision made; 8 days and $147 saved

QUANTIFIED VALUE: 8 engineering days × $800/day = $6,400 opportunity cost avoided
```

**Scenario 2: Founder-to-Sales Handoff**
```
CONTEXT: Finn is hiring first sales rep. Needs to hand off 
         everything learned about outreach.

BEFORE PAPERLESS:
├── Spreadsheet of "what worked"
├── Forwarded email threads
├── Verbal knowledge transfer (hours of meetings)
├── New rep rebuilds from scratch anyway
└── 2+ weeks to productivity

WITH PAPERLESS:
├── New rep joins workspace
├── Sees all historical workflows, results, engagement data
├── Clones "best performing" workflow
├── Accesses lead lists with engagement history
├── Full context on every conversation
└── 2 days to productivity

RESULT: 10x faster onboarding; institutional knowledge preserved
```

---

### Persona 4: Recruiting Firm Rachel

**Demographics:**
- Owner or lead recruiter at staffing agency
- 3-15 employees
- Specialized in 1-3 industries
- High email volume, relationship-driven

**Current Stack:**
- LinkedIn Recruiter — $500-1000/mo
- Bullhorn or similar ATS — $100-300/mo
- Various email tools
- Spreadsheets for candidate/client tracking

**Pain Points:**
1. "LinkedIn limits my InMails. I need email outreach to supplement."
2. "I need to keep track of relationships with both candidates AND hiring managers."
3. "Every bad email hurts my personal brand in the industry."

**Jobs To Be Done:**
- Source candidates outside LinkedIn
- Reach hiring managers at target companies
- Maintain long-term relationships (candidates become clients)

**Success Metrics:**
- Expand reach beyond LinkedIn's limits
- Protect personal brand with clean outreach
- Track relationships over months/years

**Willingness to Pay:** $149-349/mo

#### Rachel's User Journey Map

**Day 1: Supplementing LinkedIn**
```
8:00 AM  - Rachel hits weekly InMail limit (150 messages)
         - Still has 200 candidates to reach
         - Searches "LinkedIn alternative recruiting outreach"
         
8:30 AM  - Finds Paperless; "email outreach for recruiters"
         - Signs up for Pro trial ($149/mo)
         - Onboarding: "Recruiting" + "Candidate sourcing" + "Tech industry"
         
9:00 AM  - Database search: Engineers in Austin area
         - "Software Engineer" + "Austin, TX" + "3-7 years experience"
         - 340 verified contacts returned
         - "These are the people I can't reach on LinkedIn"
         
9:30 AM  - Creates workflow: "Candidate Introduction"
         - Personalized template mentioning specific skills
         - Softer approach than sales (relationship-focused)
         
10:00 AM - Activates for first 100 candidates
          - Emails go out over 2 hours
          - Back to LinkedIn for InMail recipients
```

**Week 1: Dual-Channel Recruiting**
```
Day 2    - 18 opens, 5 clicks to job description
         - 2 replies: "Tell me more about the role"
         - Responds with full details
         
Day 3    - Breakthrough: Passive candidate who never checks LinkedIn
         - "Thanks for emailing directly. I'm interested."
         - Books screening call
         
Day 4-5  - Reaches hiring managers at target companies
         - Separate workflow: "Business Development"
         - Opens relationship for future placements
         
Day 6-7  - Reviews results:
         - 5 candidate conversations started
         - 2 hiring manager relationships opened
         - All from email (wouldn't have reached via LinkedIn)
         - "This is the channel I was missing"
```

**Month 1: Full Integration**
```
Week 2   - Sets up relationship tracking tags
         - "Active Candidate", "Passive", "Hiring Manager", "Past Placement"
         - Tracks long-term relationship lifecycle
         
Week 3   - Re-engages past candidates (placed 2 years ago)
         - Many have moved companies; now decision-makers
         - "Want to hire for your new team?"
         
Week 4   - Quantifies impact:
         - 3 placements sourced via Paperless
         - Average placement fee: $15,000
         - ROI: $45,000 / $149 = 302x return
         
         - Upgrades to Business for API (ATS integration)
```

#### Rachel's Detailed Scenarios

**Scenario 1: Passive Candidate Sourcing**
```
CONTEXT: Rachel needs senior engineers for a hard-to-fill role. 
         Best candidates don't actively job search.

LINKEDIN ONLY:
├── 150 InMails/month limit
├── 30% never log in (miss message entirely)
├── Competing with 50+ other recruiters
├── Response rate: 5-8%
└── Senior engineers: Maybe 10 responses/month

WITH PAPERLESS + LINKEDIN:
├── LinkedIn: Best for active job seekers
├── Paperless: Catches passive candidates
├── Direct inbox (everyone checks email)
├── Less recruiter competition in email
├── Response rate: 12-15%
└── Senior engineers: 25+ responses/month

RESULT: 2.5x more senior candidate conversations
```

**Scenario 2: Long-Term Relationship Management**
```
CONTEXT: Rachel placed a software engineer 3 years ago. 
         That person is now VP Engineering at growing startup.

BEFORE PAPERLESS:
├── Contact info in old spreadsheet somewhere
├── Email probably outdated
├── No record of past conversations
├── Awkward cold re-introduction
└── Missed opportunity

WITH PAPERLESS:
├── Contact in system with full history
├── Email verified and current
├── Timeline shows: placement 2018, check-in 2020
├── Warm re-engagement: "Congrats on VP role! Hiring?"
├── Full context preserved over years
└── Relationship maintained → 2 placements for their team

RESULT: Past placements become future clients (compounding relationships)
```

---

## Customer Segments

| Segment | % of Users | Primary Persona | Key Features | Tier |
|---------|------------|-----------------|--------------|------|
| **Agencies** | 40% | Alex | Multi-campaign, client management, white-label | Business/Enterprise |
| **SMB Sales** | 35% | Sarah | Simple workflow, team features, CRM sync | Pro |
| **Founders** | 15% | Finn | Quick start, simplicity, control | Starter |
| **Recruiting** | 10% | Rachel | Relationship tracking, volume | Pro/Business |

### Segment Deep-Dive

**Agencies (40% of Revenue)**
```
CHARACTERISTICS:
├── Company size: 5-50 employees
├── Clients per agency: 5-25
├── Email volume: 10,000-100,000/month
├── Key decision-maker: Agency owner or VP Operations
├── Sales cycle: 1-2 weeks (understand value immediately)
├── Expansion path: Additional team seats + API access

VALUE DRIVERS:
├── 1. Multi-client management (separate workspaces)
├── 2. Deliverability protection (reputation = business)
├── 3. White-label reporting (client-facing)
├── 4. Time savings (operational efficiency)
└── 5. Competitive differentiation (fresh data)

TYPICAL DEAL:
├── Initial: Business tier ($349/mo)
├── 6-month: Add 2 seats + upgrade to Enterprise
├── 12-month: $600-1,000/mo with usage overages
└── LTV: $8,000-15,000
```

**SMB Sales Teams (35% of Revenue)**
```
CHARACTERISTICS:
├── Company size: 10-200 employees
├── Sales team size: 2-15 people
├── Email volume: 1,000-20,000/month
├── Key decision-maker: Sales Manager or VP Sales
├── Sales cycle: 2-4 weeks (need manager approval)
├── Expansion path: Team seats + usage tiers

VALUE DRIVERS:
├── 1. Team collaboration (assignments, handoffs)
├── 2. CRM integration (Salesforce, HubSpot)
├── 3. Activity visibility (manager dashboards)
├── 4. Fresh data for territory prospecting
└── 5. Unified workflow (reduce tool count)

TYPICAL DEAL:
├── Initial: Pro tier ($149/mo) for 2-3 users
├── 6-month: Expand to 5+ users
├── 12-month: $500-750/mo with team growth
└── LTV: $4,000-8,000
```

---

## Anti-Personas (Who We're NOT Building For)

Understanding who we **won't** serve is as important as knowing our target customers. These anti-personas help maintain focus and prevent scope creep.

### Anti-Persona 1: Enterprise Sales Ops Lead "Ellen"

**Profile:**
- Fortune 500 company
- 200+ person sales team
- $50K+ annual budget for sales tools
- Requires SOC 2 Type II, HIPAA, extensive compliance

**Why NOT a fit:**
| Requirement | Ellen Needs | We Provide (2026) |
|-------------|-------------|-------------------|
| Compliance | SOC 2 Type II, HIPAA | SOC 2 Type II planned (2027) |
| SLA | 99.99% uptime, 24/7 support | 99.9% uptime, business hours |
| Customization | Extensive API, custom fields | Standard API, limited customization |
| Integration | Deep Salesforce integration | Basic CRM sync |
| Implementation | Dedicated CSM, professional services | Self-serve + docs |

**What Ellen should use:** ZoomInfo, 6sense, Outreach, Gong

**Future consideration:** Enterprise segment becomes viable in Phase 3+ with dedicated Enterprise tier

---

### Anti-Persona 2: Spam Sender "Steve"

**Profile:**
- Buys bulk email lists
- Sends 100K+ unsolicited emails/month
- No regard for consent or reputation
- Looking for cheapest possible solution

**Why NOT a fit:**
| Requirement | Steve Wants | We Provide |
|-------------|-------------|------------|
| Volume | Unlimited sending | Rate-limited, throttled |
| Verification | Skip it (costs money) | Mandatory, built-in |
| Cost | <$0.001/email | $0.01-0.05/lead |
| Compliance | Don't care | CAN-SPAM, GDPR enforced |
| Reputation | Burn and churn domains | Protect sender reputation |

**Technical blockers we implement:**
- Mandatory verification (can't send to unverified)
- Rate limiting (max emails/hour/day)
- Bounce monitoring (auto-pause at 5% bounce rate)
- Spam complaint tracking (auto-pause at threshold)
- List quality requirements (no purchased lists)

**What Steve should use:** Nothing. This behavior damages the email ecosystem.

---

### Anti-Persona 3: One-Time List Buyer "Olivia"

**Profile:**
- Needs leads for one-off campaign
- No recurring need
- Looking to buy a list and disappear
- Price-sensitive, no relationship intent

**Why NOT a fit:**
| Requirement | Olivia Wants | We Provide |
|-------------|-------------|------------|
| Pricing model | One-time purchase | Recurring subscription |
| Data export | Unlimited export | Export limits by tier |
| Relationship | Transactional | Ongoing partnership |
| Support | None needed | Included in subscription |
| Freshness | Doesn't matter | Core value prop |

**Why we avoid this segment:**
- Low LTV (single transaction vs. recurring)
- High CAC relative to value
- Data resale risk (they re-sell our leads)
- No flywheel contribution
- Brand association risk

**What Olivia should use:** Fiverr scrapers, data brokers

---

### Anti-Persona 4: Phone-Only Sales "Phil"

**Profile:**
- Inside sales team focused on cold calling
- Email is afterthought (5% of outreach)
- Needs dialer, call recording, voicemail drop
- Measures success in dials, not emails

**Why NOT a fit:**
| Requirement | Phil Needs | We Provide |
|-------------|-------------|------------|
| Dialer | Power dialer, auto-dial | No dialer |
| Call recording | Conversation intelligence | Not yet |
| Voicemail | Pre-recorded drops | No |
| Phone verification | Carrier validation | No |
| Primary channel | Phone | Email |

**What Phil should use:** Orum, VanillaSoft, Salesloft, Outreach

**Future consideration:** Phone channel may be explored in 2027+ if demand emerges

| Segment | % of Users | Primary Persona | Key Features | Tier |
|---------|------------|-----------------|--------------|------|
| **Agencies** | 40% | Alex | Multi-campaign, client management, white-label | Business/Enterprise |
| **SMB Sales** | 35% | Sarah | Simple workflow, team features, CRM sync | Pro |
| **Founders** | 15% | Finn | Quick start, simplicity, control | Starter |
| **Recruiting** | 10% | Rachel | Relationship tracking, volume | Pro/Business |

---

# Document Conventions

- **[MUST]** — Required for feature to ship. No exceptions.
- **[SHOULD]** — Expected. Defer only if technically blocked.
- **[COULD]** — Nice to have. Implement if time permits.
- **[WONT]** — Explicitly out of scope for this version.

**States:** Every UI component defines: Empty, Loading, Error, Success, Partial  
**Edge Cases:** Listed explicitly. Never discover them during implementation.  
**Acceptance Criteria:** Testable statements using Given/When/Then format.

---

# Phase 1: Data Infrastructure

**Timeline:** Q1-Q2 2026 (Weeks 1-26)  
**Goal:** Establish Paperless as the best data source for outbound sales  
**Theme:** "Fresh data, verified by default, full pipeline"

---

## Feature 1.1: Google Maps Real-Time Scraping

**Priority:** P0 (Critical Path)  
**Effort:** 10 days  
**Sprint:** 1-2  
**Status:** 🔄 In Progress

### Product Definition

**One-Sentence Description:**  
Users search for businesses (e.g., "plumbers in Austin, TX") and receive verified leads scraped from Google Maps in real-time—the freshest possible data for local business prospecting.

**Why This Feature Matters:**

| Stakeholder | Value Delivered |
|-------------|-----------------|
| **User (Alex - Agency)** | Fresh leads for any client industry without buying stale lists |
| **User (Sarah - SMB)** | Find local businesses not in traditional databases |
| **User (Finn - Founder)** | Validate a market segment in minutes, not weeks |
| **Business (Paperless)** | Core value prop; differentiation from static databases; feeds data flywheel |

**Strategic Alignment:**
- Phase 1 Core: This IS the infrastructure. Without fresh data generation, we're just another database.
- Enables data flywheel: Every scrape enriches shared database
- Justifies verification-first architecture

### User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-1.1.1 | Agency owner | Scrape leads for any client industry | I can deliver fresh data to diverse clients | MUST |
| US-1.1.2 | Sales rep | Find businesses in specific locations | I can prospect my assigned territory | MUST |
| US-1.1.3 | User | See real-time scraping progress | I know the job is working and can estimate completion | MUST |
| US-1.1.4 | User | Cancel a running job | I can stop wasting credits on wrong searches | SHOULD |
| US-1.1.5 | Power user | Run multiple scraping jobs simultaneously | I can maximize efficiency | COULD |
| US-1.1.6 | User | Get notified when scraping completes | I don't have to watch the screen | SHOULD |

### Functional Requirements

#### FR-1.1.1: Job Creation Form

**Input Fields:**

| Field | Type | Validation | Default | Required |
|-------|------|------------|---------|----------|
| **Search Query** | Text | 2-100 chars, alphanumeric + `& - '` | None | MUST |
| **Location** | Autocomplete | Must resolve via geocoding | None | MUST |
| **Radius** | Select | 5, 10, 25, 50, 100 miles | 25 miles | MUST |
| **Depth** | Slider (1-5) | Integer | 3 | MUST |

**Location Autocomplete:**
- [MUST] Show suggestions after 2 characters
- [MUST] Use Google Places API or equivalent
- [MUST] Display as "City, State, Country"
- [SHOULD] Remember last 5 locations in workspace
- [COULD] Show mini-map preview of selected location

**Depth Selector:**
- [MUST] Show estimated leads, time, and credits for each level
- Estimates (95th percentile):
  - Depth 1: ~20 leads, ~30 sec, 1 credit
  - Depth 2: ~40 leads, ~1 min, 2 credits
  - Depth 3: ~60 leads, ~2 min, 3 credits
  - Depth 4: ~80 leads, ~3 min, 4 credits
  - Depth 5: ~100+ leads, ~5 min, 5 credits

#### FR-1.1.2: Job Execution

**Job States:**

| State | Icon | Description | Transitions |
|-------|------|-------------|-------------|
| Queued | ⏳ | Waiting in queue | → Running, → Cancelled |
| Running | 🔄 | Actively scraping | → Completed, → Failed, → Cancelled, → Partial |
| Completed | ✅ | Finished successfully | Terminal |
| Failed | ❌ | Error occurred | Terminal (can Retry) |
| Cancelled | ⏹️ | User cancelled | Terminal (can Retry) |
| Partial | ⚠️ | Some pages succeeded | Terminal (can Retry Failed) |

**Progress Updates:**
- [MUST] Update via WebSocket every 5 seconds minimum
- [MUST] Show: pages completed, leads found, elapsed time, estimated remaining
- [MUST] Fallback to polling if WebSocket disconnects
- [SHOULD] Animate progress bar smoothly between updates
- [COULD] Show confetti on completion

#### FR-1.1.3: Lead Data Extraction

**Captured Fields:**

| Field | Type | Always Present | Example |
|-------|------|----------------|---------|
| place_id | String | ✅ | "ChIJ2eUgeAK6j4ARbn5u_wAGqWA" |
| name | String | ✅ | "Austin Plumbing Pros" |
| address | String | ✅ | "1234 Main St, Austin, TX 78701" |
| phone | String | Usually | "+15125551234" |
| website | URL | Sometimes | "https://austinplumbing.com" |
| google_rating | Float | Usually | 4.7 |
| review_count | Integer | Usually | 234 |
| category | String | ✅ | "Plumber" |
| hours | JSON | Sometimes | {"monday": "8am-6pm", ...} |
| latitude | Float | ✅ | 30.2672 |
| longitude | Float | ✅ | -97.7431 |

**Post-Processing:**
1. [MUST] Deduplicate against existing leads (by place_id)
2. [MUST] Scrape website for contact emails
3. [MUST] Queue discovered emails for verification
4. [MUST] Normalize phone to E.164 format
5. [MUST] Feed into shared database (data flywheel)

### Non-Functional Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Scraping latency | 90th: <3 min (Depth 3) | Server-side timing |
| Success rate | >95% of jobs | Jobs completing without error |
| Lead accuracy | >98% correct data | Sample verification |
| Concurrent jobs per user | 3 | System enforcement |

### UI Specifications

**Job Creation Form:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         🔍 Find Fresh Leads                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  What are you looking for?                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ plumbers                                                                     ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│  Examples: "dentists", "italian restaurants", "personal injury lawyers"         │
│                                                                                  │
│  Where?                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ 📍 Austin, TX                                                           ▼   ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  Search radius: [●────────────●] 25 miles                                       │
│                 5            100                                                 │
│                                                                                  │
│  How thorough?                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │  1        2        3        4        5                                      ││
│  │  ○        ○        ●        ○        ○                                      ││
│  │ Quick   Fast   Standard  Deep   Exhaustive                                  ││
│  │ ~20     ~40      ~60     ~80     ~100+                                      ││
│  │ leads   leads   leads   leads    leads                                      ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ────────────────────────────────────────────────────────────────────────────── │
│                                                                                  │
│  📊 Estimate: ~60 leads • ~2 min • 3 credits                                    │
│  💳 Your balance: 847 credits                                                   │
│                                                                                  │
│                                           [Cancel]  [🔍 Start Scraping]         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Progress View:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   🔄 Scraping "plumbers" in Austin, TX                                          │
│                                                                                  │
│   ████████████████░░░░░░░░░░░░░░░░ 53%                                          │
│                                                                                  │
│   Pages:        3 of 5 completed                                                 │
│   Leads found:  47                                                               │
│   Time elapsed: 1:34                                                             │
│   Remaining:    ~45 seconds                                                      │
│                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ Show Details ▼                                                           │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│   [Cancel Job]                                                                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Expanded Details:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│   📍 Page 1: ✅ Complete — 18 leads                                             │
│   📍 Page 2: ✅ Complete — 15 leads                                             │
│   📍 Page 3: ✅ Complete — 14 leads                                             │
│   📍 Page 4: 🔄 In progress...                                                  │
│   📍 Page 5: ⏳ Pending                                                          │
│                                                                                  │
│   Duplicates skipped: 3                                                          │
│   Errors: 0                                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### States

| State | Trigger | UI | User Actions |
|-------|---------|----|--------------| 
| **Empty** | First visit | Job creation form | Fill form, submit |
| **Loading** | Form submit | Button spinner "Starting..." | Wait |
| **Success (Running)** | Job started | Progress view | Cancel |
| **Success (Complete)** | Job finished | Summary + CTA | View leads, run again |
| **Partial** | Some pages failed | Warning + partial leads | View partial, retry failed |
| **Error (Validation)** | Invalid input | Inline field errors | Fix and retry |
| **Error (Quota)** | Out of credits | Modal with upgrade CTA | Upgrade or wait |
| **Error (Server)** | Backend failure | Toast + retry option | Retry |

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No results for search | Complete with 0 leads, message: "No businesses found. Try broader search." |
| All results are duplicates | Complete with: "67 found, 67 already in your database" |
| User refreshes during job | Job continues server-side; page reconnects, shows current progress |
| User closes browser | Job continues; notification sent on completion |
| Job exceeds 10 minutes | Auto-cancel, save partial results, notify user |
| Rate limit from Google | Queue job, auto-retry after cooldown, notify user |
| Proxy blocked | Rotate proxy, retry automatically (up to 3 times) |
| Same search twice | Allow (user choice); dedupe at lead level |
| Concurrent job limit | Soft block: "You have 3 jobs running. Wait or upgrade." |

### Acceptance Criteria

```gherkin
Feature: Google Maps Real-Time Scraping

  Scenario: Successful scraping job
    Given I am logged in as a user with available credits
    When I submit a scraping job for "plumbers" in "Austin, TX" with depth 3
    Then the job should start within 5 seconds
    And I should see real-time progress updates
    And the job should complete within 5 minutes
    And I should have at least 40 new leads in my workspace
    And all leads should have place_id, name, address, and category

  Scenario: Credit enforcement
    Given I have 0 credits remaining
    When I try to submit a scraping job
    Then I should see a modal explaining I'm out of credits
    And I should see upgrade options
    And the job should not be submitted

  Scenario: Job cancellation
    Given I have a running scraping job
    When I click "Cancel Job"
    Then I should see a confirmation dialog
    When I confirm cancellation
    Then the job should stop
    And any leads found should be saved
    And I should see "Cancelled after X pages. Y leads saved."

  Scenario: Deduplication
    Given I have previously scraped "plumbers" in "Austin, TX"
    When I run the same search again
    Then new/updated leads should be merged with existing
    And I should see "X new, Y updated, Z unchanged"
```

### API Contracts

**Create Job Request:**

```typescript
interface CreateScrapingJobRequest {
  query: string;          // "plumbers"
  location: {
    display: string;      // "Austin, TX"
    latitude: number;     // 30.2672
    longitude: number;    // -97.7431
  };
  radiusMiles: number;    // 25
  depth: number;          // 1-5
}
```

**Create Job Response:**

```typescript
interface CreateScrapingJobResponse {
  jobId: string;
  status: "queued";
  estimatedLeads: number;
  estimatedSeconds: number;
  creditsUsed: number;
  createdAt: string;      // ISO 8601
}
```

**Job Progress (WebSocket):**

```typescript
interface ScrapingJobProgress {
  jobId: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled" | "partial";
  pagesCompleted: number;
  pagesTotal: number;
  leadsFound: number;
  elapsedSeconds: number;
  estimatedSecondsRemaining: number;
  error?: string;
}
```

**Job Completion:**

```typescript
interface ScrapingJobResult {
  jobId: string;
  status: "completed" | "partial" | "failed";
  summary: {
    leadsFound: number;
    leadsNew: number;
    leadsUpdated: number;
    leadsDuplicate: number;
    pagesCompleted: number;
    pagesTotal: number;
    elapsedSeconds: number;
    creditsUsed: number;
  };
  error?: {
    code: string;
    message: string;
    retriable: boolean;
  };
}
```

### Technical Deep-Dive

#### Database Schema

```sql
-- Scraping Jobs Table
CREATE TABLE scraping_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Job Parameters
    query VARCHAR(255) NOT NULL,
    location_display VARCHAR(255) NOT NULL,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    radius_miles INTEGER NOT NULL DEFAULT 25,
    depth INTEGER NOT NULL CHECK (depth >= 1 AND depth <= 5),
    
    -- Job State
    status VARCHAR(20) NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled', 'partial')),
    
    -- Progress Tracking
    pages_total INTEGER NOT NULL,
    pages_completed INTEGER NOT NULL DEFAULT 0,
    leads_found INTEGER NOT NULL DEFAULT 0,
    leads_new INTEGER NOT NULL DEFAULT 0,
    leads_updated INTEGER NOT NULL DEFAULT 0,
    leads_duplicate INTEGER NOT NULL DEFAULT 0,
    
    -- Resource Usage
    credits_estimated INTEGER NOT NULL,
    credits_used INTEGER NOT NULL DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    elapsed_seconds INTEGER,
    
    -- Error Handling
    error_code VARCHAR(50),
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE INDEX idx_scraping_jobs_workspace ON scraping_jobs(workspace_id);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_created ON scraping_jobs(created_at DESC);
CREATE INDEX idx_scraping_jobs_user_status ON scraping_jobs(user_id, status);

-- Scraping Job Pages (individual pages within a job)
CREATE TABLE scraping_job_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    
    -- Page State
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    
    -- Results
    leads_found INTEGER NOT NULL DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Error Handling
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(job_id, page_number)
);

CREATE INDEX idx_job_pages_job ON scraping_job_pages(job_id);
CREATE INDEX idx_job_pages_status ON scraping_job_pages(status);
```

#### System Architecture

```
SCRAPING SYSTEM ARCHITECTURE

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Next.js)                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Job Creation Form ──────► POST /api/scraping/jobs                             │
│                                      │                                           │
│   Progress View ◄──────────────────WebSocket (/api/scraping/jobs/{id}/ws)       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER (Go)                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ScrapingController                                                             │
│   ├── CreateJob() ────────► Validate ──► Check Credits ──► Enqueue              │
│   ├── GetJob()                                                                   │
│   ├── CancelJob()                                                                │
│   └── WebSocketHandler() ◄─────────────── Redis PubSub                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              JOB QUEUE (Redis + Asynq)                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Queue: scraping:jobs                                                          │
│   ├── Priority: High (paid users), Medium (trial), Low (free)                  │
│   ├── Max concurrent per user: 3                                                │
│   ├── Retry policy: 3 attempts, exponential backoff                            │
│   └── Dead letter queue: scraping:jobs:failed                                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              WORKER POOL (Kubernetes Pods)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ScrapingWorker (3-10 pods, auto-scaling)                                      │
│   ├── ProcessJob()                                                               │
│   │   ├── Initialize browser (Playwright)                                       │
│   │   ├── For each page:                                                        │
│   │   │   ├── Navigate to Google Maps                                           │
│   │   │   ├── Execute search with scroll pagination                            │
│   │   │   ├── Extract business data                                             │
│   │   │   ├── Publish progress via Redis PubSub                                │
│   │   │   └── Handle rate limits / anti-bot                                    │
│   │   └── Post-process leads                                                    │
│   └── Resource limits: 1 CPU, 2GB RAM per pod                                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PROXY LAYER (BrightData)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Residential Proxy Pool                                                        │
│   ├── Rotation: Per-request                                                     │
│   ├── Geo-targeting: US, UK, CA (match search location)                        │
│   ├── Session management: Sticky sessions for pagination                       │
│   └── Fallback: Data center proxies for retries                                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Error Handling Matrix

| Error Type | Detection | Handling | User Communication |
|------------|-----------|----------|-------------------|
| **Rate Limited** | HTTP 429, CAPTCHA | Rotate proxy, backoff 30s, retry | "Temporarily slowed. Retrying..." |
| **Blocked** | HTTP 403, empty response | Rotate proxy, retry up to 3x | "Encountered access issue. Retrying..." |
| **No Results** | Empty result set | Complete successfully with 0 leads | "No businesses found for this search." |
| **Timeout** | >60s per page | Cancel page, move to next | "Some results may be incomplete." |
| **Proxy Error** | Connection refused | Retry with different proxy | Hidden (automatic recovery) |
| **Quota Exceeded** | Pre-flight check | Block job creation | "Insufficient credits. Upgrade or wait." |
| **Server Error** | HTTP 5xx, exception | Retry with backoff | "Temporary issue. Retrying..." |
| **Job Timeout** | >10 minutes total | Cancel job, save partial | "Job exceeded time limit. Partial results saved." |

#### Performance Optimization

**Caching Strategy:**
```
CACHE LAYERS

┌──────────────────────────────────────────────────────────────────────────┐
│ Layer 1: Location Geocoding Cache (Redis)                                 │
│ ├── Key: geocode:{location_display_normalized}                           │
│ ├── TTL: 7 days                                                          │
│ ├── Hit rate: 90%+ (repeated locations)                                  │
│ └── Saves: Google Geocoding API calls ($0.005 each)                      │
├──────────────────────────────────────────────────────────────────────────┤
│ Layer 2: Recent Search Results (PostgreSQL + Redis)                      │
│ ├── Key: search:{query_hash}:{location_hash}:{radius}                    │
│ ├── TTL: 24 hours                                                        │
│ ├── Check before scraping: "Fresh results available?"                   │
│ └── Offer: "Use cached (instant) or fresh scrape (2 min)?"              │
├──────────────────────────────────────────────────────────────────────────┤
│ Layer 3: Lead Deduplication (PostgreSQL)                                 │
│ ├── Key: place_id (unique constraint)                                    │
│ ├── Before insert: Check if lead exists                                  │
│ └── If exists: Update freshness timestamp, skip duplicate processing    │
└──────────────────────────────────────────────────────────────────────────┘
```

**Rate Limiting:**
```go
// Per-user rate limiting
type UserRateLimiter struct {
    // Concurrent jobs per user
    MaxConcurrentJobs int           // 3 for paid, 1 for free
    
    // Jobs per time period
    MaxJobsPerHour    int           // 20 for paid, 5 for free
    MaxJobsPerDay     int           // 100 for paid, 10 for free
    
    // Credit-based limiting
    CreditCheckBeforeJob bool       // Always true
    CreditReservation    bool       // Reserve credits on job start
}

// Global rate limiting (platform protection)
type GlobalRateLimiter struct {
    // Proxy pool management
    MaxRequestsPerSecond  int       // 50 across all users
    MaxConcurrentBrowsers int       // 100 total
    
    // Google Maps specific
    SearchesPerProxyPerMinute int   // 5 (avoid detection)
    ProxyRotationAfterBlocks  int   // 3 (rotate after 3 blocks)
}
```

#### Monitoring & Observability

**Key Metrics:**
```yaml
# Prometheus metrics exposed by scraping service

scraping_jobs_total:
  type: counter
  labels: [status, workspace_tier]
  description: Total scraping jobs by status and tier

scraping_job_duration_seconds:
  type: histogram
  buckets: [30, 60, 120, 180, 300, 600]
  labels: [depth, status]
  description: Job duration by depth and final status

scraping_leads_per_job:
  type: histogram
  buckets: [10, 25, 50, 75, 100, 150, 200]
  labels: [depth]
  description: Leads found per job by depth

scraping_proxy_errors_total:
  type: counter
  labels: [error_type, proxy_provider]
  description: Proxy errors by type and provider

scraping_page_success_rate:
  type: gauge
  description: Rolling success rate of page scrapes (1h window)

scraping_queue_depth:
  type: gauge
  labels: [priority]
  description: Current jobs waiting in queue by priority

scraping_worker_utilization:
  type: gauge
  description: Percentage of worker capacity in use
```

**Alerting Rules:**
```yaml
# Critical alerts (page immediately)
- alert: ScrapingSuccessRateLow
  expr: scraping_page_success_rate < 0.80
  for: 5m
  severity: critical
  description: Scraping success rate below 80% for 5+ minutes

- alert: ScrapingQueueBacklog
  expr: scraping_queue_depth > 500
  for: 10m
  severity: critical
  description: Scraping queue depth exceeds 500 jobs

# Warning alerts (Slack notification)
- alert: ScrapingLatencyHigh
  expr: histogram_quantile(0.95, scraping_job_duration_seconds) > 300
  for: 15m
  severity: warning
  description: 95th percentile job duration exceeds 5 minutes

- alert: ProxyBlockRateHigh
  expr: rate(scraping_proxy_errors_total{error_type="blocked"}[1h]) > 10
  for: 30m
  severity: warning
  description: Elevated proxy block rate
```

#### Testing Requirements

**Unit Tests:**
```go
// Required test coverage for scraping service
TestCreateScrapingJob_ValidInput()
TestCreateScrapingJob_InvalidQuery()
TestCreateScrapingJob_InvalidLocation()
TestCreateScrapingJob_InsufficientCredits()
TestCreateScrapingJob_ConcurrentJobLimit()
TestCancelScrapingJob_Running()
TestCancelScrapingJob_NotOwner()
TestScrapingProgress_WebSocket()
TestDeduplication_ExistingLead()
TestDeduplication_NewLead()
TestRateLimiting_PerUser()
TestRateLimiting_Global()
```

**Integration Tests:**
```go
// End-to-end scraping tests (run in staging with mock Google Maps)
TestFullScrapingFlow_Success()
TestFullScrapingFlow_PartialFailure()
TestFullScrapingFlow_Cancellation()
TestScrapingWithVerification_Pipeline()
TestScrapingToFlywheel_DataFlow()
```

**Load Tests:**
```yaml
# k6 load test configuration
scenarios:
  sustained_load:
    executor: constant-arrival-rate
    rate: 10               # 10 jobs per second
    duration: 10m
    preAllocatedVUs: 50
    
  spike_test:
    executor: ramping-arrival-rate
    startRate: 5
    stages:
      - target: 50, duration: 2m  # Ramp up
      - target: 50, duration: 5m  # Sustained spike
      - target: 5, duration: 2m   # Ramp down

thresholds:
  http_req_duration: ['p(95)<5000']   # 95% of requests under 5s
  http_req_failed: ['rate<0.01']      # Less than 1% failure rate
```

---

## Feature 1.2: Partner Database Integration

**Priority:** P0 (Critical Path)  
**Effort:** 15 days  
**Sprint:** 2-4  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
Access to 200M+ B2B contacts from partner databases, giving users instant results for company and decision-maker searches—complementing real-time scraping with broad coverage.

**Why This Feature Matters:**

| Stakeholder | Value Delivered |
|-------------|-----------------|
| **User (Alex)** | Find decision-makers at target companies, not just local businesses |
| **User (Sarah)** | Access company contacts for territory, with emails included |
| **User (Rachel)** | Find HR contacts for recruiting outreach |
| **Business** | Competitive parity with Apollo/ZoomInfo; enables B2B use cases |

**Strategic Alignment:**
- Phase 1 Core: Complements scraping with coverage for non-local businesses
- Data strategy: Three sources (scraping + partners + flywheel)
- Differentiation: We verify partner data; they charge extra for verification

### User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-1.2.1 | Sales rep | Search for contacts by company name | I can find decision-makers at target accounts | MUST |
| US-1.2.2 | Agency | Filter contacts by job title | I can find marketing directors for my client | MUST |
| US-1.2.3 | User | See verification status on database contacts | I know which emails are safe to use | MUST |
| US-1.2.4 | User | Search by industry and company size | I can target my ICP | SHOULD |
| US-1.2.5 | Power user | Combine database search with saved filters | I can build complex targeting | SHOULD |

### Functional Requirements

#### FR-1.2.1: Search Interface

**Search Modes:**
1. **Company Search:** Find contacts at specific companies
2. **People Search:** Find contacts by title, seniority, department
3. **Combined Search:** Company + People filters together

**Available Filters:**

| Filter | Type | Options |
|--------|------|---------|
| Company Name | Text | Autocomplete with suggestions |
| Industry | Multi-select | 100+ industries |
| Company Size | Range | 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+ |
| Job Title | Text | Free text with suggestions |
| Seniority | Multi-select | C-Level, VP, Director, Manager, Individual Contributor |
| Department | Multi-select | Sales, Marketing, Engineering, HR, Finance, Operations, etc. |
| Location | Autocomplete | Country, State, City |
| Has Email | Checkbox | Verified emails only |

#### FR-1.2.2: Data Quality

**Contact Fields:**

| Field | Coverage | Verification |
|-------|----------|--------------|
| Full Name | 100% | N/A |
| Email | 85% | Verified on display |
| Phone | 60% | Not verified |
| Title | 95% | N/A |
| Company | 100% | N/A |
| LinkedIn | 70% | N/A |

**Freshness Commitment:**
- Partner data refreshed monthly
- We verify emails on first access
- Verification status cached 7 days

#### FR-1.2.3: Credits and Limits

| Tier | Database Credits/Month | Cost per Contact |
|------|------------------------|------------------|
| Starter | 1,000 | $0.049 |
| Pro | 10,000 | $0.015 |
| Business | 50,000 | $0.007 |
| Enterprise | Unlimited | Negotiated |

**Reveal Behavior:**
- Search results show teaser (name, company, title)
- Full contact (email, phone) requires "reveal"
- Reveal consumes credits
- Revealed contacts saved to workspace permanently

### UI Specifications

**Database Search Interface:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🏢 Search Contacts                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                                │
│  │ 🏢 Company  │ │ 👤 People   │ │ 🎯 Combined │                                │
│  └─────────────┘ └─────────────┘ └─────────────┘                                │
│                                                                                  │
│  Company Name (optional)                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ Acme Corp                                                                    ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  Job Title Contains                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ Marketing Director                                                           ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─ More Filters ──────────────────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  Industry:        [Technology ▼]     Company Size: [50-200 ▼]               ││
│  │  Seniority:       [Director, VP ▼]   Location:     [United States ▼]        ││
│  │  Department:      [Marketing ▼]      ☑ Has verified email                   ││
│  │                                                                              ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│                                                          [🔍 Search Contacts]   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Search Results with Reveal:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📊 2,847 contacts match your search                    Credits: 847 remaining  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ☐ │ Sarah Chen           │ VP Marketing        │ Acme Corp   │ [Reveal]       │
│  ☐ │ John Miller          │ Director of Growth  │ BigCo Inc   │ [Reveal]       │
│  ☑ │ Emily Davis          │ Marketing Director  │ StartupXYZ  │ ✅ Revealed    │
│     │ emily@startupxyz.com │ (555) 123-4567     │ LinkedIn ↗  │ ✅ Verified    │
│  ☐ │ Michael Brown        │ CMO                 │ MediumCo    │ [Reveal]       │
│                                                                                  │
│  ────────────────────────────────────────────────────────────────────────────── │
│                                                                                  │
│  3 selected                          [Reveal Selected - 3 credits] [Add to List]│
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

```gherkin
Feature: Partner Database Integration

  Scenario: Basic contact search
    Given I am a Pro user with 1000 credits
    When I search for "Marketing Director" at companies with 50-200 employees
    Then I should see at least 100 matching contacts
    And each result should show name, title, and company
    And email/phone should be hidden until revealed

  Scenario: Reveal contact
    Given I see a contact in search results
    When I click "Reveal"
    Then I should see the full email address
    And the email should show verification status
    And 1 credit should be deducted
    And the contact should be added to my workspace

  Scenario: Verification on reveal
    Given I reveal a contact with email
    Then the email should be verified automatically
    And I should see ✅ Verified, ⚠️ Risky, or ❌ Invalid badge
    And invalid emails should still be revealed (user's choice to use)
```

---

## Feature 1.3: Email Verification Pipeline

**Priority:** P0 (Critical Path)  
**Effort:** 8 days  
**Sprint:** 3-4  
**Status:** 🔄 In Progress

### Product Definition

**One-Sentence Description:**  
Every email in Paperless is automatically verified for deliverability before it appears in the user's lead list—our key differentiator that prevents bounce-induced reputation damage.

**Why This Feature Matters:**

| Stakeholder | Value Delivered |
|-------------|-----------------|
| **User (Alex)** | Protects agency's sender reputation across all clients |
| **User (Sarah)** | Never worry about bounces damaging company domain |
| **User (All)** | Confidence that emails will reach inbox |
| **Business** | Key differentiator vs Apollo, ZoomInfo (verification is add-on for them) |

**Strategic Alignment:**
- Phase 1 Core: This is the "verification-first architecture" we sell
- Competitive moat: Others charge extra; we include by default
- Flywheel enabler: Verified data is more valuable in shared database

### User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-1.3.1 | User | See verification status on every email | I know which leads are safe to contact | MUST |
| US-1.3.2 | Agency | Never see unverified emails in my lists | I can guarantee quality to clients | MUST |
| US-1.3.3 | User | Understand why an email is risky | I can make informed decisions | SHOULD |
| US-1.3.4 | Power user | Re-verify emails before a campaign | I ensure freshness for important sends | SHOULD |
| US-1.3.5 | User | Filter leads by verification status | I only work with verified contacts | MUST |

### Functional Requirements

#### FR-1.3.1: Verification States

| State | Icon | Meaning | Can Send? |
|-------|------|---------|-----------|
| **Verified** | ✅ | Email exists and accepts mail | Yes |
| **Invalid** | ❌ | Mailbox doesn't exist | No (blocked) |
| **Risky** | ⚠️ | Catch-all domain | Yes (with warning) |
| **Unknown** | ❓ | Couldn't determine | Yes (no guarantee) |
| **Pending** | ⏳ | Verification in progress | No (wait) |

#### FR-1.3.2: Automatic Verification

**Trigger:** Email discovered (via scraping, database reveal, or import)

**Process:**
1. Check cache (verified in last 7 days?)
2. If cache hit: Use cached result
3. If cache miss: Queue for verification
4. Call verification API (ZeroBounce primary, NeverBounce backup)
5. Store result in cache + update lead record
6. Update UI in real-time

**Timing:**
- 95th percentile: <30 seconds from discovery to result
- Pending state shown during verification
- User can view lead but sees ⏳ for email

#### FR-1.3.3: Verification Details

**What We Check:**

| Check | Description | Impact |
|-------|-------------|--------|
| Syntax | Valid email format | Invalid if wrong |
| Domain | MX records exist | Invalid if none |
| Disposable | Not temporary email | Flagged if true |
| Role-based | Not info@, support@ | Flagged if true |
| SMTP | Mailbox exists | Invalid if no |
| Catch-all | Domain accepts all | Risky if true |

**Detail Display:**
```
📧 john@austinplumbing.com
✅ Verified • Checked Jan 15, 2025

Verification Details:
├── Syntax: ✓ Valid
├── Domain: ✓ MX records found
├── Provider: Google Workspace
├── Mailbox: ✓ Exists
├── Catch-all: ✓ No (safe)
└── Type: Business email

[Copy Email] [Re-verify]
```

### UI Specifications

**Email Status in Lead List:**

```
│ Austin Plumbing Pros │ Austin, TX │ ⭐ 4.8 │ ✅ Verified │ john@... │
│ Joe's Drain Service  │ Austin, TX │ ⭐ 4.5 │ ⚠️ Risky    │ info@... │
│ AAA Emergency Plumb  │ Austin, TX │ ⭐ 4.2 │ ❌ Invalid  │ old@...  │
│ Precision Plumbing   │ Austin, TX │ ⭐ 4.9 │ ⏳ Pending  │ ...      │
```

**Invalid Email Detail:**

```
┌─────────────────────────────────────────────────────────────────┐
│ 📧 Email                                                         │
│                                                                  │
│ john@oldcompany.com                                              │
│ ❌ Invalid • Checked Jan 15, 2025                                │
│                                                                  │
│ Reason: Mailbox not found                                        │
│                                                                  │
│ ⚠️ Sending to this email will bounce and hurt your reputation.  │
│                                                                  │
│ Consider:                                                        │
│ • Finding an alternate contact at this company                   │
│ • Removing from your outreach list                               │
│                                                                  │
│ [Find Other Emails] [Remove from List] [Re-verify Anyway]       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

```gherkin
Feature: Email Verification

  Scenario: Automatic verification on scrape
    Given I run a scraping job that finds leads with emails
    When the scraping job completes
    Then each email should be queued for verification
    And verification should complete within 60 seconds
    And I should see verification status on each lead

  Scenario: Block sending to invalid emails
    Given I have a lead with an ❌ Invalid email
    When I try to add them to an email workflow
    Then I should see a warning that the email is invalid
    And I should have to explicitly confirm to proceed

  Scenario: Re-verification
    Given I have a lead that was verified 30 days ago
    When I click "Re-verify"
    Then a new verification should be triggered
    And the status should update when complete
    And 1 verification credit should be consumed
```

---

## Feature 1.4: Data Flywheel (Shared Database)

**Priority:** P0 (Critical Architecture)  
**Effort:** 15 days  
**Sprint:** 4-6  
**Status:** 📋 Design Phase

### Product Definition

**One-Sentence Description:**  
Every lead scraped by any user enriches a shared database that powers instant search results for all users—creating network effects where the product improves as more people use it.

**Why This Feature Matters:**

| Stakeholder | Value Delivered |
|-------------|-----------------|
| **User (Starter)** | Instant results without waiting for scrapes |
| **User (Pro/Business)** | Fresh data from their scrapes benefits everyone (good karma) |
| **Business** | Unit economics improve dramatically; competitive moat |

**Strategic Alignment:**
- Phase 1 Architecture: This IS the infrastructure moat we're building
- Enables tiered pricing (lower tiers = database only)
- Creates network effects AI SDRs can't replicate

### User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| US-1.4.1 | Starter user | Get instant results when I search | I can evaluate the product immediately | MUST |
| US-1.4.2 | Pro user | Know if fresh data exists before scraping | I don't waste credits on common searches | SHOULD |
| US-1.4.3 | User | See how fresh the data is | I can decide if I need a new scrape | MUST |
| US-1.4.4 | User | Force a fresh scrape even if cached | I get real-time data when I need it | MUST |
| US-1.4.5 | Business | All scrapes contribute to shared DB | Our data asset grows with usage | MUST |

### Functional Requirements

#### FR-1.4.1: Tiered Data Access

| Tier | Fresh Scrapes | Database Access | Max Data Age |
|------|---------------|-----------------|--------------|
| Free | 0 | 100 leads/mo | 90 days |
| Starter | 500/mo | 1,000/mo | 30 days |
| Pro | 5,000/mo | 10,000/mo | 7 days |
| Business | 25,000/mo | Unlimited | Real-time |
| Enterprise | Unlimited | Unlimited + API | All history |

#### FR-1.4.2: Database Search

**Search Flow (Starter/Free Tier):**
1. User enters search query
2. Database is queried immediately
3. Results displayed with freshness badges
4. No scraping option (or upgrade prompt)

**Search Flow (Pro/Business Tier):**
1. User enters search query
2. Database results shown immediately
3. "Refresh with real-time scrape" option displayed
4. If clicked: Fresh scrape runs, results merged
5. New data updates shared database

#### FR-1.4.3: Freshness Indicators

| Age | Badge | Color | Display |
|-----|-------|-------|---------|
| <24 hours | "Fresh" | 🟢 Green | "Verified today" |
| 1-7 days | "Recent" | 🟢 Green | "Verified 3 days ago" |
| 8-30 days | "Good" | 🟡 Yellow | "Verified 2 weeks ago" |
| 31-90 days | "Aging" | 🟠 Orange | "Verified 45 days ago" |
| >90 days | "Stale" | 🔴 Red | "Verified 4 months ago" |

### Database Architecture

```sql
-- Global lead database (shared across all workspaces)
CREATE TABLE global_leads (
  id UUID PRIMARY KEY,
  place_id VARCHAR(255) UNIQUE,  -- Deduplication key
  
  -- Business data
  name VARCHAR(500) NOT NULL,
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(100),
  country VARCHAR(100),
  phone VARCHAR(50),
  website VARCHAR(500),
  
  -- Google data
  google_rating DECIMAL(2,1),
  review_count INTEGER,
  category VARCHAR(255),
  
  -- Contact data
  primary_email VARCHAR(255),
  email_status VARCHAR(20),
  email_verified_at TIMESTAMPTZ,
  
  -- Freshness
  first_scraped_at TIMESTAMPTZ,
  last_scraped_at TIMESTAMPTZ,
  scrape_count INTEGER DEFAULT 1,
  
  -- Search optimization
  search_vector TSVECTOR,
  geo_point GEOGRAPHY(POINT, 4326),
  
  CONSTRAINT idx_place_id UNIQUE (place_id)
);

-- Workspace-specific data (private)
CREATE TABLE workspace_leads (
  workspace_id UUID,
  global_lead_id UUID REFERENCES global_leads(id),
  
  -- Private data
  tags TEXT[],
  notes TEXT,
  custom_fields JSONB,
  
  -- Engagement (private)
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  
  PRIMARY KEY (workspace_id, global_lead_id)
);
```

### UI Specifications

**Database Search Results (Starter Tier):**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🔍 "plumbers" in Austin, TX                                    [Search]        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  📊 Database Results                                   47 leads found           │
│                                                                                  │
│  ────────────────────────────────────────────────────────────────────────────── │
│                                                                                  │
│  Data freshness: 🟢 85% verified within 7 days                                  │
│  Last community update: 3 days ago                                               │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ ☐ │ Austin Plumbing Pros │ Austin, TX │ ⭐ 4.8 │ ✅ Email │ 🟢 3 days     │ ││
│  │ ☐ │ Joe's Drain Service  │ Austin, TX │ ⭐ 4.5 │ ⚠️ Risky │ 🟢 5 days     │ ││
│  │ ☐ │ Precision Plumbing   │ Austin, TX │ ⭐ 4.9 │ ✅ Email │ 🟡 12 days    │ ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ────────────────────────────────────────────────────────────────────────────── │
│                                                                                  │
│  💡 Want real-time data scraped just for you?                                   │
│     Upgrade to Pro for fresh scrapes + 10x more leads                           │
│     [Upgrade to Pro →]                                                          │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Database + Scrape Option (Pro Tier):**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🔍 "plumbers" in Austin, TX                                    [Search]        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  📊 Database Results                                   47 leads found           │
│                                                                                  │
│  Data freshness: 🟢 85% verified within 7 days                                  │
│                                                                                  │
│  [🔄 Refresh with Real-Time Scrape] (Uses 3 credits)                            │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │ Lead results...                                                              ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Technical Deep-Dive: Data Flywheel Architecture

#### Flywheel Algorithm

The data flywheel operates on a simple but powerful principle: every user action enriches a shared asset that benefits all users.

```
DATA FLYWHEEL FLOW

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATA CONTRIBUTION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   User Scrapes "dentists in Austin, TX"                                         │
│                │                                                                 │
│                ▼                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 1: Execute Scrape                                                  │   │
│   │  └── 67 businesses found from Google Maps                               │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                │                                                                 │
│                ▼                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 2: Deduplication Check                                             │   │
│   │  └── Check place_id against global_leads table                          │   │
│   │  └── 45 new, 22 existing                                                 │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                │                                                                 │
│                ▼                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 3: Merge Strategy                                                  │   │
│   │  ├── NEW: Insert into global_leads (anonymized)                         │   │
│   │  └── EXISTING: Update last_scraped_at, increment scrape_count           │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                │                                                                 │
│                ▼                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 4: Verification Pipeline                                           │   │
│   │  └── Queue all emails for verification (new and existing)               │   │
│   │  └── Update email_status and email_verified_at                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                │                                                                 │
│                ▼                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  STEP 5: User Access                                                     │   │
│   │  └── Create workspace_leads records (private per-workspace)             │   │
│   │  └── User sees leads in their workspace                                  │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│   RESULT: User gets leads; global database grows; future searches faster        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Freshness Scoring Algorithm

```python
def calculate_freshness_score(lead: GlobalLead) -> FreshnessScore:
    """
    Calculate freshness score for a lead.
    Score: 0-100 (higher = fresher)
    
    Factors:
    1. Time since last verification (40% weight)
    2. Time since last scrape (30% weight)
    3. Verification result consistency (20% weight)
    4. Scrape frequency signal (10% weight)
    """
    now = datetime.utcnow()
    
    # Factor 1: Verification recency (40%)
    days_since_verification = (now - lead.email_verified_at).days
    if days_since_verification <= 1:
        verification_score = 100
    elif days_since_verification <= 7:
        verification_score = 90 - (days_since_verification * 2)
    elif days_since_verification <= 30:
        verification_score = 76 - ((days_since_verification - 7) * 2)
    elif days_since_verification <= 90:
        verification_score = 30 - ((days_since_verification - 30) * 0.5)
    else:
        verification_score = max(0, 15 - (days_since_verification - 90) * 0.1)
    
    # Factor 2: Scrape recency (30%)
    days_since_scrape = (now - lead.last_scraped_at).days
    if days_since_scrape <= 7:
        scrape_score = 100
    elif days_since_scrape <= 30:
        scrape_score = 80 - ((days_since_scrape - 7) * 2)
    elif days_since_scrape <= 90:
        scrape_score = 40 - ((days_since_scrape - 30) * 0.5)
    else:
        scrape_score = max(0, 10)
    
    # Factor 3: Verification consistency (20%)
    # If email status has been stable across multiple verifications
    if lead.verification_history_consistent:
        consistency_score = 100
    else:
        consistency_score = 50  # Email status has changed
    
    # Factor 4: Scrape frequency (10%)
    # More scrapes = more demand = likely still active
    if lead.scrape_count >= 10:
        frequency_score = 100
    elif lead.scrape_count >= 5:
        frequency_score = 80
    elif lead.scrape_count >= 2:
        frequency_score = 60
    else:
        frequency_score = 40
    
    # Weighted total
    total_score = (
        verification_score * 0.40 +
        scrape_score * 0.30 +
        consistency_score * 0.20 +
        frequency_score * 0.10
    )
    
    return FreshnessScore(
        score=round(total_score),
        grade=get_grade(total_score),  # Fresh, Recent, Good, Aging, Stale
        factors={
            'verification': verification_score,
            'scrape': scrape_score,
            'consistency': consistency_score,
            'frequency': frequency_score
        }
    )

def get_grade(score: float) -> str:
    if score >= 80:
        return 'Fresh'      # 🟢 Green
    elif score >= 60:
        return 'Recent'     # 🟢 Green  
    elif score >= 40:
        return 'Good'       # 🟡 Yellow
    elif score >= 20:
        return 'Aging'      # 🟠 Orange
    else:
        return 'Stale'      # 🔴 Red
```

#### Data Isolation & Privacy Architecture

```
DATA ISOLATION MODEL

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SHARED (Global)                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   global_leads table                                                            │
│   ├── place_id (deduplication key)                                              │
│   ├── Business name, address, phone, website                                    │
│   ├── Google rating, review count, category                                     │
│   ├── Primary email, verification status                                        │
│   ├── Freshness timestamps                                                      │
│   └── Geographic coordinates                                                    │
│                                                                                  │
│   PRIVACY: All data is publicly available business information.                │
│   NO USER DATA: No information about which users scraped what.                  │
│   NO ENGAGEMENT: No email send/open/click data in shared layer.                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ (foreign key reference)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PRIVATE (Per-Workspace)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   workspace_leads table (workspace_id, global_lead_id)                          │
│   ├── Tags (user-defined organization)                                          │
│   ├── Notes (internal comments)                                                 │
│   ├── Custom fields (user-defined data)                                         │
│   ├── Engagement metrics (emails sent, opens, clicks)                           │
│   ├── List memberships                                                          │
│   └── Workflow participation                                                    │
│                                                                                  │
│   ISOLATION: Workspace A cannot see Workspace B's data.                         │
│   COMPETITIVE: User notes, tags, engagement = competitive advantage.           │
│   GDPR: Deletion removes workspace_leads, not global_leads.                     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Query Performance Optimization

```sql
-- Optimized indexes for common flywheel queries

-- 1. Search by location (most common)
CREATE INDEX idx_global_leads_geo ON global_leads USING GIST (geo_point);

-- 2. Full-text search on business name and category
CREATE INDEX idx_global_leads_search ON global_leads USING GIN (search_vector);

-- 3. Freshness filtering
CREATE INDEX idx_global_leads_freshness ON global_leads (last_scraped_at DESC);
CREATE INDEX idx_global_leads_verification ON global_leads (email_verified_at DESC);

-- 4. Composite index for common filter combinations
CREATE INDEX idx_global_leads_location_fresh 
    ON global_leads (email_status, last_scraped_at DESC)
    WHERE email_status = 'verified';

-- 5. Deduplication lookup (used during scraping)
CREATE UNIQUE INDEX idx_global_leads_place_id ON global_leads (place_id);

-- Materialized view for search (refreshed every 5 minutes)
CREATE MATERIALIZED VIEW mv_searchable_leads AS
SELECT 
    gl.id,
    gl.name,
    gl.address,
    gl.city,
    gl.state,
    gl.category,
    gl.google_rating,
    gl.email_status,
    gl.last_scraped_at,
    gl.email_verified_at,
    gl.geo_point,
    COALESCE(
        EXTRACT(EPOCH FROM (NOW() - gl.email_verified_at)) / 86400,
        999
    ) AS days_since_verification,
    gl.scrape_count
FROM global_leads gl
WHERE gl.email_status IN ('verified', 'risky');

CREATE INDEX idx_mv_searchable_geo ON mv_searchable_leads USING GIST (geo_point);
CREATE INDEX idx_mv_searchable_text ON mv_searchable_leads USING GIN (
    to_tsvector('english', name || ' ' || COALESCE(category, ''))
);

-- Refresh schedule
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh_searchable_leads', '*/5 * * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_searchable_leads');
```

#### Flywheel Economics Model

```
UNIT ECONOMICS IMPROVEMENT OVER TIME

┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                   │
│   Month 1: 100 users, 50K leads in database                                      │
│   ├── Cache hit rate: 0%                                                         │
│   ├── Fresh scrapes: 100% of queries                                            │
│   ├── Cost per lead: $0.023                                                      │
│   └── Gross margin: 77%                                                          │
│                                                                                   │
│   Month 6: 1,000 users, 500K leads in database                                   │
│   ├── Cache hit rate: 40%                                                        │
│   ├── Fresh scrapes: 60% of queries                                             │
│   ├── Blended cost per lead: $0.014                                              │
│   └── Gross margin: 86%                                                          │
│                                                                                   │
│   Year 1: 5,000 users, 2M leads in database                                      │
│   ├── Cache hit rate: 80%                                                        │
│   ├── Fresh scrapes: 20% of queries                                             │
│   ├── Blended cost per lead: $0.006                                              │
│   └── Gross margin: 94%                                                          │
│                                                                                   │
│   Year 3: 25,000 users, 50M leads in database                                    │
│   ├── Cache hit rate: 95%                                                        │
│   ├── Fresh scrapes: 5% of queries (rare/niche only)                            │
│   ├── Blended cost per lead: $0.003                                              │
│   └── Gross margin: 97%                                                          │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘

COST BREAKDOWN:
├── Fresh scrape: $0.023/lead
│   ├── Proxy bandwidth: $0.015
│   ├── Compute (scraping workers): $0.005
│   └── Verification API: $0.003
│
└── Database query: $0.002/lead
    ├── Database compute: $0.001
    └── Verification re-check (if stale): $0.001
```

---

## Feature 1.5: Lead Management Core

**Priority:** P0  
**Effort:** 12 days  
**Sprint:** 3-5  
**Status:** 🔄 In Progress

### Product Definition

**One-Sentence Description:**  
A powerful lead list with advanced filtering, bulk actions, and organization into named lists—where users spend 80% of their time finding and organizing leads to contact.

**Components:**
1. Lead List View with Filtering
2. Lead Detail View
3. Lead Lists (Collections)
4. Bulk Actions
5. Search & Saved Searches

### Functional Requirements

*[Detailed specs for lead list, filtering, bulk actions, lists, search—see original Feature 2-5 specs]*

---

## Feature 1.6: Visual Workflow Builder

**Priority:** P0  
**Effort:** 20 days  
**Sprint:** 6-10  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
A drag-and-drop canvas for designing email outreach sequences—conditions, delays, branching logic—without writing code.

**Why This Feature Matters:**

| Stakeholder | Value Delivered |
|-------------|-----------------|
| **User (Alex)** | Build sophisticated multi-step campaigns for clients |
| **User (Sarah)** | Automate follow-ups without manual tracking |
| **User (Finn)** | Set up outreach once, focus on product |
| **Business** | Differentiator from basic sequencers; enables automation use cases |

**Strategic Alignment:**
- Phase 1: Completes the "full pipeline" value prop
- Phase 2 Foundation: Workflows generate the replies that fill the Inbox
- Competitor differentiation: Visual builder vs text-based sequences

### Node Types

| Node | Icon | Description | Phase |
|------|------|-------------|-------|
| **Trigger** | ▶️ | Start workflow (manual, schedule, event) | 1 |
| **Send Email** | 📧 | Compose and send email | 1 |
| **Delay** | ⏱️ | Wait hours/days | 1 |
| **Condition** | ◇ | Branch based on engagement | 1 |
| **Filter** | 🔍 | Narrow leads by criteria | 1 |
| **Add to List** | 📂 | Add lead to a list | 1 |
| **Remove from List** | ➖ | Remove from list | 1 |
| **Add Tag** | 🏷️ | Tag lead | 1 |
| **Webhook** | 🔗 | Send data to external URL | 2 |
| **CRM Sync** | 🔄 | Update CRM record | 2 |
| **Notify Team** | 🔔 | Send internal notification | 2 |
| **Human Task** | 👤 | Pause for human action | 3 |

### UI Specification

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ← Workflows    New Lead Introduction                    [Test ▼] [Activate]    │
├────────────────────────────┬────────────────────────────────────────────────────┤
│                            │                                                     │
│   NODE LIBRARY             │                   CANVAS                            │
│                            │                                                     │
│   ┌────────────────┐       │     ┌─────────────────┐                            │
│   │ ▶️ Trigger      │       │     │   ▶️ Trigger     │                            │
│   ├────────────────┤       │     │   When added    │                            │
│   │ 📧 Send Email  │       │     │   to workflow   │                            │
│   ├────────────────┤       │     └────────┬────────┘                            │
│   │ ⏱️ Delay        │       │              │                                     │
│   ├────────────────┤       │              ▼                                     │
│   │ ◇ Condition    │       │     ┌─────────────────┐                            │
│   ├────────────────┤       │     │ 🔍 Filter       │                            │
│   │ 🔍 Filter      │       │     │ Has verified    │                            │
│   ├────────────────┤       │     │ email           │                            │
│   │ 📂 Add to List │       │     └────────┬────────┘                            │
│   ├────────────────┤       │              │                                     │
│   │ 🏷️ Add Tag     │       │              ▼                                     │
│   └────────────────┘       │     ┌─────────────────┐                            │
│                            │     │ 📧 Send Email   │                            │
│                            │     │ "Introduction"  │                            │
│                            │     └────────┬────────┘                            │
│                            │              │                                     │
│                            │              ▼                                     │
│                            │     ┌─────────────────┐                            │
│                            │     │ ⏱️ Delay        │                            │
│                            │     │ Wait 3 days     │                            │
│                            │     └────────┬────────┘                            │
│                            │              │                                     │
│                            │              ▼                                     │
│                            │     ┌─────────────────┐                            │
│                            │     │ ◇ Condition     │                            │
│                            │     │ Opened email?   │                            │
│                            │     └──┬──────────┬───┘                            │
│                            │        │ Yes      │ No                             │
│                            │        ▼          ▼                                │
│                            │   ┌────────┐  ┌────────┐                           │
│                            │   │📧 Case │  │📧 Bump │                           │
│                            │   │ Study  │  │ Email  │                           │
│                            │   └────────┘  └────────┘                           │
│                            │                                                     │
└────────────────────────────┴────────────────────────────────────────────────────┘
```

---

## Feature 1.7: Email Sending Infrastructure

**Priority:** P0  
**Effort:** 10 days  
**Sprint:** 8-10  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
Integration with email sending providers (Resend, Postmark, custom SMTP) so workflows can actually send emails—with built-in link tracking and open tracking.

### Functional Requirements

**Supported Providers:**

| Provider | Type | Setup Complexity |
|----------|------|------------------|
| Resend | API | Easy (API key) |
| Postmark | API | Easy (API key) |
| SendGrid | API | Easy (API key) |
| AWS SES | API | Medium (credentials) |
| Custom SMTP | SMTP | Advanced (host, port, auth) |

**Email Features:**

| Feature | Description | Phase |
|---------|-------------|-------|
| HTML + Plain Text | Both versions sent | 1 |
| Personalization | {{first_name}}, {{company}}, etc. | 1 |
| Link Tracking | Wrapped links, click attribution | 1 |
| Open Tracking | Invisible pixel | 1 |
| Unsubscribe Link | Auto-inserted | 1 |
| Reply Detection | Identify replies in inbox | 2 |

---

## Feature 1.8: Engagement Tracking

**Priority:** P0  
**Effort:** 8 days  
**Sprint:** 10-12  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
Track every email open, link click, and reply—attributing engagement back to specific leads and campaigns to measure what's working.

### Tracking Events

| Event | How Detected | Data Captured |
|-------|--------------|---------------|
| **Open** | Tracking pixel | Lead ID, timestamp, device, location |
| **Click** | Link wrapper redirect | Lead ID, timestamp, URL, device |
| **Reply** | Email parsing | Lead ID, timestamp, full reply text |
| **Bounce** | Provider webhook | Lead ID, bounce type, reason |
| **Unsubscribe** | Link click | Lead ID, timestamp |

### UI: Lead Engagement Timeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          📊 Engagement Timeline                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Today                                                                           │
│  ├── 2:34 PM   💬 Replied to email                                              │
│  │              "Thanks for reaching out! I'd be interested in..."               │
│  │              → MOVED TO INBOX                                                │
│  │                                                                               │
│  ├── 2:30 PM   👁️ Opened email (3rd time)                                       │
│  │              📍 Austin, TX • 📱 iPhone                                        │
│  │                                                                               │
│  ├── 10:15 AM  🔗 Clicked link: "View our portfolio"                            │
│  │              📍 Austin, TX • 💻 Chrome on Mac                                 │
│  │                                                                               │
│  Yesterday                                                                       │
│  ├── 4:22 PM   👁️ Opened email                                                  │
│  │                                                                               │
│  ├── 11:00 AM  📧 Email sent: "Quick question about Austin Plumbing"           │
│  │                                                                               │
│  Jan 14                                                                          │
│  ├── 3:45 PM   ➕ Added to workflow "New Lead Nurture"                          │
│  │                                                                               │
│  ├── 3:42 PM   ✅ Email verified                                                 │
│  │                                                                               │
│  ├── 3:40 PM   📍 Scraped from Google Maps                                      │
│  │                                                                               │
│  [Load More...]                                                                  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# Phase 2: Unified Sales Inbox

**Timeline:** Q3-Q4 2026 (Weeks 27-52)  
**Goal:** Make Paperless a daily-use product by capturing the post-outreach conversation  
**Theme:** "Never lose context on a prospect again"

---

## Feature 2.1: Reply Detection & Routing

**Priority:** P0 (Phase 2)  
**Effort:** 12 days  
**Sprint:** 27-29  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
Automatically detect when prospects reply to outreach emails and route those replies into the Paperless Inbox with full context attached.

**Why This Feature Matters:**

| Stakeholder | Value Delivered |
|-------------|-----------------|
| **User (Alex)** | All client campaign replies in one place, not scattered in Gmail |
| **User (Sarah)** | Know immediately when a hot lead replies |
| **All Users** | Never miss a reply; never lose context |

### Functional Requirements

#### FR-2.1.1: Reply Detection Methods

**Method 1: Webhook from Email Provider**
- Resend, Postmark, SendGrid support "inbound" webhooks
- Highest reliability, real-time

**Method 2: Reply-To Address Parsing**
- Unique reply-to per campaign: `reply+{campaign_id}+{lead_id}@mail.paperless.app`
- Full routing info encoded in address

**Method 3: Email Polling (Fallback)**
- Connect user's email via IMAP/OAuth
- Poll for replies to sent emails
- Match by In-Reply-To / References headers

#### FR-2.1.2: Reply Matching

**Match Logic (in order):**
1. Reply-to address contains lead_id → Direct match
2. In-Reply-To header matches sent Message-ID → Thread match
3. From address matches lead email → Fuzzy match (confirm via content)
4. No match → Manual assignment in inbox

#### FR-2.1.3: Context Attachment

Every reply is tagged with:
- Lead record (full context)
- Campaign/workflow it came from
- Previous emails in thread
- Engagement history (opens, clicks before reply)

---

## Feature 2.2: Unified Inbox View

**Priority:** P0 (Phase 2)  
**Effort:** 20 days  
**Sprint:** 29-33  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
A single inbox showing all replies from all campaigns, with full context sidebar and team collaboration features—the "Plain.com for sales."

**Why This Feature Matters:**

This is the product evolution that transforms Paperless from a campaign tool (episodic use) into a daily workflow tool (habitual use).

| Metric | Without Inbox | With Inbox |
|--------|---------------|------------|
| Daily active users | 20% | 60% |
| Session length | 15 min | 45 min |
| Team accounts | 15% | 40% |
| Switching cost | Low | High |

### UI Specification

**Inbox Layout:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📬 Inbox                                    [Compose] [Filters ▼] [Settings]   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─ CONVERSATION LIST ─────────────────┐ ┌─ CONVERSATION VIEW ────────────────┐ │
│  │                                      │ │                                    │ │
│  │ 🔴 Sarah Chen                        │ │ Sarah Chen                         │ │
│  │    VP Marketing @ Acme Corp          │ │ VP Marketing @ Acme Corp           │ │
│  │    "Thanks for reaching out! I'd..." │ │                                    │ │
│  │    Today 2:34 PM                     │ │ ────────────────────────────────── │ │
│  │                                      │ │                                    │ │
│  │ ○ John Miller                        │ │ Today 2:34 PM                      │ │
│  │    Director @ BigCo Inc              │ │                                    │ │
│  │    "Can you send more info?"         │ │ Thanks for reaching out! I'd be    │ │
│  │    Today 11:22 AM                    │ │ interested in learning more about  │ │
│  │                                      │ │ your services. Can you tell me     │ │
│  │ ○ Emily Davis [Assigned: @mike]      │ │ more about pricing?                │ │
│  │    Marketing @ StartupXYZ            │ │                                    │ │
│  │    "Let's schedule a call"           │ │ Best,                              │ │
│  │    Yesterday                         │ │ Sarah                              │ │
│  │                                      │ │                                    │ │
│  │ ○ Michael Brown                      │ │ ────────────────────────────────── │ │
│  │    CMO @ MediumCo                    │ │                                    │ │
│  │    "Not interested right now"        │ │ You (Yesterday 4:00 PM):           │ │
│  │    2 days ago                        │ │                                    │ │
│  │                                      │ │ Hi Sarah,                          │ │
│  │                                      │ │                                    │ │
│  │ [Load more conversations...]         │ │ I noticed Acme Corp is expanding   │ │
│  │                                      │ │ its marketing team. I wanted to    │ │
│  │                                      │ │ reach out because...               │ │
│  │                                      │ │                                    │ │
│  │                                      │ │ ────────────────────────────────── │ │
│  │                                      │ │                                    │ │
│  │                                      │ │ ┌────────────────────────────────┐ │ │
│  │                                      │ │ │ Write a reply...               │ │ │
│  │                                      │ │ │                                │ │ │
│  │                                      │ │ │                     [Send] ▶️  │ │ │
│  │                                      │ │ └────────────────────────────────┘ │ │
│  │                                      │ │                                    │ │
│  └──────────────────────────────────────┘ └────────────────────────────────────┘ │
│                                                                                  │
├─ CONTEXT SIDEBAR ───────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Sarah Chen                                                                      │
│  VP Marketing @ Acme Corp                                                        │
│                                                                                  │
│  📧 sarah@acmecorp.com  ✅ Verified                                             │
│  📞 (555) 123-4567                                                              │
│  🔗 LinkedIn ↗                                                                  │
│                                                                                  │
│  ── ENGAGEMENT ──────────────────────                                           │
│  Campaign: SaaS Marketing Directors Q1                                          │
│  Emails sent: 2                                                                  │
│  Opens: 4                                                                        │
│  Clicks: 1 (pricing page)                                                        │
│                                                                                  │
│  ── COMPANY ─────────────────────────                                           │
│  🏢 Acme Corp                                                                    │
│  👥 150 employees                                                                │
│  💰 Series B ($20M raised)                                                       │
│  📍 Austin, TX                                                                   │
│                                                                                  │
│  ── TEAM NOTES ──────────────────────                                           │
│  @mike (2h ago): "Interested in Q2"                                             │
│  [Add Note...]                                                                   │
│                                                                                  │
│  ── ACTIONS ─────────────────────────                                           │
│  [📂 Add to List] [📋 Move Stage]                                               │
│  [⏰ Snooze] [👤 Assign]                                                        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Functional Requirements

#### FR-2.2.1: Conversation List

**Sorting:**
1. Unread first (🔴 indicator)
2. Within unread: Most recent first
3. Read conversations: Most recent first

**Filtering:**
- All / Unread / Assigned to me
- By campaign
- By date range
- By tag/stage

**Quick Actions (on hover):**
- ⏰ Snooze
- 📂 Add to List
- ✅ Mark Done
- 👤 Assign

#### FR-2.2.2: Conversation View

**Thread Display:**
- Full email thread, newest first or oldest first (user preference)
- Clear visual separation between messages
- Inline reply composer at bottom

**Reply Composer:**
- Rich text or plain text toggle
- Personalization tokens available
- Attachment support
- "Send" or "Schedule" options

#### FR-2.2.3: Context Sidebar

**Sections:**
1. **Contact Info:** Name, title, company, email, phone, social links
2. **Engagement:** Campaign, emails sent, opens, clicks
3. **Company:** Size, industry, funding, location
4. **Team Notes:** Internal notes from teammates
5. **Actions:** Quick actions (stage, list, assign, snooze)

**Data Sources:**
- Lead record from Paperless
- Engagement events from tracking
- Company enrichment from database/partners
- Team notes from collaboration

#### FR-2.2.4: Keyboard Navigation

| Key | Action |
|-----|--------|
| j / ↓ | Next conversation |
| k / ↑ | Previous conversation |
| r | Reply |
| e | Archive |
| s | Snooze |
| a | Assign |
| / | Search |
| ? | Show shortcuts |

---

## Feature 2.3: Team Collaboration

**Priority:** P0 (Phase 2)  
**Effort:** 15 days  
**Sprint:** 33-36  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
Assign conversations to team members, leave internal notes, hand off context—so sales teams can collaborate without stepping on each other's toes.

### Functional Requirements

#### FR-2.3.1: Assignments

**Assign Conversation:**
- Click "Assign" → Select team member
- Assignee sees conversation in "Assigned to me" filter
- Notification sent to assignee

**Auto-Assignment Rules (optional):**
- Round-robin among team
- By territory (location-based)
- By campaign (campaign owner)

#### FR-2.3.2: Internal Notes

**Adding Notes:**
- Visible only to team, not prospect
- @mention teammates for notification
- Markdown supported
- Pinned notes stay at top

**Note Display:**
- In context sidebar
- In conversation timeline (flagged as internal)

#### FR-2.3.3: Activity Log

Per-conversation log showing:
- Who replied when
- Who assigned to whom
- Who added notes
- Stage changes

---

## Feature 2.4: Smart Prioritization

**Priority:** P1 (Phase 2)  
**Effort:** 10 days  
**Sprint:** 36-38  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
Automatically surface the hottest conversations first based on engagement signals—so reps focus on leads most likely to convert.

### Priority Scoring

| Signal | Weight | Logic |
|--------|--------|-------|
| Reply recency | +50 | Replied in last hour |
| Multiple engagements | +30 | 3+ opens/clicks before reply |
| Company size | +20 | Larger company = higher value |
| Explicit interest | +40 | Positive sentiment in reply |
| Negative sentiment | -30 | "Not interested" phrases |
| Days waiting | -10/day | Penalty for old conversations |

**Display:**
- 🔥 Hot (score > 80)
- 🌡️ Warm (score 50-80)
- ❄️ Cold (score < 50)

---

## Feature 2.5: Snooze & Reminders

**Priority:** P1 (Phase 2)  
**Effort:** 5 days  
**Sprint:** 38-39  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
Snooze conversations to a future date/time—they disappear from inbox and reappear when action is needed.

### Snooze Options

| Option | When Reappears |
|--------|----------------|
| Later today | 4 hours from now |
| Tomorrow | 9am tomorrow |
| Next week | 9am next Monday |
| Custom | User-selected date/time |
| If they reply | Immediately on reply |

---

# Phase 3: Relationship Operating System

**Timeline:** Q4 2026 + 2027  
**Goal:** Become the complete system for managing sales relationships  
**Theme:** "From stranger to customer, all in one place"

---

## Feature 3.1: Pipeline & Stages

**Priority:** P0 (Phase 3)  
**Effort:** 15 days  
**Sprint:** 45-48  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
A lightweight CRM-style pipeline to track where each lead is in the sales process—without the complexity of Salesforce.

### Default Stages

| Stage | Description | Color |
|-------|-------------|-------|
| New | Just added, not contacted | Gray |
| Contacted | Outreach sent | Blue |
| Engaged | Opened/clicked/replied | Yellow |
| Qualified | Confirmed interest | Orange |
| Meeting Booked | Call/demo scheduled | Purple |
| Proposal Sent | Quote/proposal delivered | Pink |
| Negotiating | Active discussion | Red |
| Won | Closed, customer | Green |
| Lost | Closed, not customer | Dark gray |

### UI: Pipeline View

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📊 Pipeline                              [Customize Stages] [Export] [Settings] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │ New         │ │ Contacted   │ │ Engaged     │ │ Qualified   │ │ Won        ││
│  │ 45 leads    │ │ 128 leads   │ │ 34 leads    │ │ 12 leads    │ │ 8 leads    ││
│  ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤ ├────────────┤│
│  │             │ │             │ │             │ │             │ │            ││
│  │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌────────┐ ││
│  │ │Sarah C. │ │ │ │John M.  │ │ │ │Emily D. │ │ │ │Mike B.  │ │ │ │Anna K. │ ││
│  │ │Acme Corp│ │ │ │BigCo    │ │ │ │StartupX │ │ │ │MediumCo │ │ │ │WinCo   │ ││
│  │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │ └────────┘ ││
│  │             │ │             │ │             │ │             │ │            ││
│  │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌────────┐ ││
│  │ │Tom W.   │ │ │ │Lisa P.  │ │ │ │David R. │ │ │ │Jane S.  │ │ │ │Bob T.  │ ││
│  │ │NewCo    │ │ │ │OldCo    │ │ │ │TechCo   │ │ │ │SalesCo  │ │ │ │HappyCo │ ││
│  │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │ └────────┘ ││
│  │             │ │             │ │             │ │             │ │            ││
│  │ [+12 more]  │ │ [+108 more] │ │ [+24 more]  │ │ [+4 more]   │ │ [+2 more]  ││
│  │             │ │             │ │             │ │             │ │            ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘│
│                                                                                  │
│  Drag cards between stages to update                                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Feature 3.2: Relationship Intelligence

**Priority:** P1 (Phase 3)  
**Effort:** 12 days  
**Sprint:** 48-50  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
AI-powered signals that identify which relationships need attention—"This lead went cold," "This company engaged 5x without reply," etc.

### Signals

| Signal | Trigger | Suggested Action |
|--------|---------|------------------|
| Gone Cold | No activity in 14 days | "Re-engage with value add" |
| High Engagement, No Reply | 5+ opens, 0 replies | "Try phone call" |
| Competitor Mention | Reply mentions competitor | "Address objection" |
| Ready to Close | Positive sentiment + pricing question | "Send proposal" |
| At Risk | Was engaged, now silent | "Check in" |

---

## Feature 3.3: Team Analytics & Reporting

**Priority:** P1 (Phase 3)  
**Effort:** 15 days  
**Sprint:** 50-53  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
Dashboards showing team performance, pipeline health, and campaign effectiveness—so managers can coach and forecast.

### Reports

| Report | Metrics | Audience |
|--------|---------|----------|
| Pipeline Summary | Leads by stage, conversion rates | Managers |
| Activity Report | Emails sent, replies, meetings | Managers |
| Rep Leaderboard | By replies, meetings, wins | Team |
| Campaign Performance | Open/click/reply rates by campaign | All |
| Response Time | Avg time to reply to inbound | Managers |

---

## Feature 3.4: CRM Integrations

**Priority:** P1 (Phase 3)  
**Effort:** 20 days  
**Sprint:** 40-44 (Parallel)  
**Status:** 📋 Planned

### Product Definition

**One-Sentence Description:**  
Two-way sync with Salesforce, HubSpot, and Pipedrive—so Paperless enriches existing CRM data rather than replacing it.

### Sync Behavior

| Data | Paperless → CRM | CRM → Paperless |
|------|-----------------|-----------------|
| Contacts | Create/update on reveal | Sync for enrichment |
| Activities | Log emails, calls | N/A |
| Stages | Update opportunity stage | Sync deal stages |
| Notes | Sync team notes | Sync CRM notes |
| Custom Fields | Map to CRM fields | Map from CRM fields |

---

# Priority Matrix

## P0: Must Ship (Launch Blockers)

| Phase | Feature | Why Critical |
|-------|---------|--------------|
| 1 | Google Maps Scraping | Core value prop |
| 1 | Partner Database | B2B coverage |
| 1 | Email Verification | Key differentiator |
| 1 | Data Flywheel | Moat + unit economics |
| 1 | Lead Management | Where users spend time |
| 1 | Workflow Builder | Automation = product |
| 1 | Email Sending | Workflows must send |
| 1 | Engagement Tracking | Measure success |
| 2 | Reply Detection | Enables inbox |
| 2 | Unified Inbox | Daily use transformation |
| 2 | Team Collaboration | Multi-user accounts |

## P1: High Value

| Phase | Feature | Why Important |
|-------|---------|---------------|
| 2 | Smart Prioritization | Focus on hot leads |
| 2 | Snooze & Reminders | Workflow efficiency |
| 3 | Pipeline & Stages | CRM-lite functionality |
| 3 | Team Analytics | Manager value |
| 3 | CRM Integrations | Enterprise adoption |

## P2: Differentiation

| Phase | Feature | Why Differentiating |
|-------|---------|---------------------|
| 3 | Relationship Intelligence | AI-powered insights |
| 3 | Advanced Reporting | Data-driven sales |
| 3 | API Access | Platform play |
| 3 | White Label | Agency revenue |

---

# Success Metrics by Phase

## Phase 1 Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Bounce rate | <3% | Aggregate across all sends |
| Time to first lead | <5 min | From signup to first scraped lead |
| Verification coverage | 100% | All leads with email verified |
| Database query time | <200ms | 95th percentile |
| Workflow activation | 50% of users | Users who activate a workflow |

## Phase 2 Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily active users | 60% | DAU / Total users |
| Avg response time | <2 hours | Time from reply to user response |
| Inbox adoption | 80% | Users checking inbox weekly |
| Team accounts | 40% | Accounts with 2+ users |
| Reply capture rate | 95% | Replies successfully routed |

## Phase 3 Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Net retention | 130% | Revenue retention including expansion |
| ARPU | $280 | Average revenue per account |
| Pipeline visibility | 100% | Leads with stage assigned |
| CRM integration | 30% | Accounts with CRM connected |

---

*This roadmap is the single source of truth for Paperless product development. Features are specified to production-ready detail. Engineers build from this spec. Designers validate against this spec. PMs update this spec as requirements evolve.*

*Last Updated: December 2025*
