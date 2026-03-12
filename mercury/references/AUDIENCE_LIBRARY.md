# AUDIENCE_LIBRARY.md
# Mercury Strategy — Audience library
# Version 0.1 | March 2026

---

## Purpose

This library defines 29 audience types across 10 tiers that corporate
websites must serve. The ms-findings skill uses this library to assess
which audiences are served, underserved, or absent on the client site,
and to frame findings in terms of specific audience impact rather than
generic gap language.

### How to use this library

1. Based on the company type established in the ms-brief artefact,
   select the relevant tiers (see FINDINGS_TEMPLATE.md for selection
   rules by company type)
2. For each selected tier, check whether the site supports the
   access pattern and key content needs described below
3. Check whether the failure signals listed are present or absent
4. Classify each audience tier as Served, Underserved, or Absent

Each entry contains:
- **Who they are** — role and context
- **What they're looking for** — primary intent when visiting
- **Access pattern** — how they typically navigate the site
- **Key content needs** — what must be present to serve them
- **Failure signals** — observable indicators that the site is failing them

---

## Tier 1 — Capital markets

### 1.1 Institutional investor (long-only active)

**Who they are:** Fund managers at asset management firms holding or
evaluating an equity position. Typically managing significant AUM;
conducting their own primary research alongside broker support.

**What they're looking for:** Evidence that the investment thesis holds.
Delivery against stated strategy. Capital allocation signals. ESG
integration into the business model rather than as a separate report.

**Access pattern:** Enters directly via IR landing page or deep-links
from Bloomberg/Refinitiv. Follows a non-linear path — strategy,
then results, then sustainability, then governance, then back to
results. Returns to the site repeatedly over months as a position
develops.

**Key content needs:**
- Investment case with quantified value drivers
- Results archive with presentations and webcasts (not PDFs only)
- Strategy page with medium-term targets and progress tracking
- ESG data integrated with financial narrative
- Board composition and governance quality signals

**Failure signals:**
- No dedicated investment case page
- Results are PDF downloads with no accompanying highlights or key messages
- Strategy page is more than 18 months old
- ESG content is entirely separate from the investor section
- No financial calendar or stale calendar showing only past events

---

### 1.2 Institutional investor (passive/index)

**Who they are:** Fund managers at index-tracking firms. Holding
the stock because index membership requires it, not through active
selection. Primary engagement is governance and stewardship rather
than investment thesis evaluation.

**What they're looking for:** Governance quality, board accountability,
executive remuneration rationale, ESG policy compliance, and proxy
voting guidance.

**Access pattern:** Goes directly to governance section. Checks board
composition, committee structure, remuneration report, and ESG ratings
disclosure. Rarely reads strategy or commercial content.

**Key content needs:**
- Governance section with board bios, photos, and committee membership
- Remuneration policy clearly stated
- AGM materials easily accessible
- ESG ratings and index membership disclosed
- Proxy voting guidance or AGM voting results

**Failure signals:**
- Governance section nested inside About rather than as a dedicated section
- Board bios without photos or with photos only (no independence or tenure detail)
- AGM materials not archived beyond current year
- ESG ratings not disclosed or not current

---

### 1.3 Buy-side analyst

**Who they are:** Research analysts at asset managers supporting
portfolio managers. Builds detailed financial models and sector views.
Often the first person to read new publications from a company.

**What they're looking for:** Data for modelling. Specific numbers,
breakdown of revenue and costs, capital expenditure guidance, and
divisional performance. Increasingly uses AI summarisation tools
for initial orientation before going deeper.

**Access pattern:** Targets specific data pages — results, financial
supplements, divisional data. Uses search or deep-links rather than
navigating from the homepage. Downloads financial supplements and data
packs. Returns after each results event.

**Key content needs:**
- Financial supplement or data pack available alongside results presentations
- Divisional performance data (not just group-level)
- Capital markets day materials archived and accessible
- Consensus or analyst coverage section
- Clean, downloadable data (not just PDF tables)

**Failure signals:**
- Only group-level financials available; no divisional breakdown
- CMD materials not archived post-event
- Financial supplement absent or only available inside the PDF annual report
- No analyst coverage section or stale analyst list

---

### 1.4 Sell-side analyst (equity research)

**Who they are:** Research analysts at investment banks publishing
notes to institutional investor clients. Covers the company as part of
a sector coverage universe. Writes initiation reports, updates, and
sector-wide comparisons.

**What they're looking for:** The company's own framing of its
investment thesis, management's language on strategy, and current-state
data to verify their own modelling. Also: anything that represents a
change in tone or direction from the last published guidance.

**Access pattern:** Reads strategy and investment case narrative closely.
Downloads results presentations and supplements. Checks sustainability
content for ESG-related investment risks. Looks for any language that
diverges from previous messaging.

**Key content needs:**
- Investment case with management's own framing of the equity story
- Consistent, accessible language on strategy and medium-term targets
- Results presentations with management commentary (not data only)
- Sustainability content that addresses material ESG risks by name
- Contact details for IR team

**Failure signals:**
- Investment case absent; equity story scattered across multiple pages
- Strategy language inconsistent between the strategy page and the
  investment case page
- No named IR contact or contact details buried
- Sustainability content addresses neither the financial materiality
  of ESG risks nor the company's specific exposures

---

### 1.5 Retail / private investor

**Who they are:** Individual shareholders investing directly, often
holding for income (dividends) or as part of a broader portfolio.
Typically less financially sophisticated than institutional audiences
but engaged and motivated.

**What they're looking for:** Share price, dividends, basic financial
performance, and a sense of whether the company is well-run. Also:
reassurance that the company they hold is a responsible business.

**Access pattern:** Enters via IR landing page or homepage. Looks for
share price first. Then dividend history. Then recent news. Rarely
reads governance in depth but may check board composition if something
has triggered concern.

**Key content needs:**
- Share price widget (live or delayed)
- Dividend history and payment dates
- Latest results summary in plain language
- Email alert registration
- Basic company description that does not assume financial literacy

**Failure signals:**
- No share price tool on the IR section
- Dividend information buried inside the annual report only
- Results section is entirely PDF-based with no summary for non-specialists
- No email alert registration visible

---

### 1.6 Debt investor / credit analyst

**Who they are:** Analysts and fund managers evaluating the company's
creditworthiness for bond investment or lending decisions. Focused on
cash flow, leverage, covenant compliance, and refinancing risk.

**What they're looking for:** Balance sheet strength, debt maturity
profile, cash generation, and liquidity. Also: any early warning signals
on covenant breaches or strategic decisions that affect credit quality.

**Access pattern:** Goes to results and annual report. Looks for debt
maturity schedule, refinancing activity, and credit rating. Checks
governance for any signals of management instability.

**Key content needs:**
- Debt maturity schedule or net debt / leverage ratios accessible
- Credit rating disclosed (if rated)
- Cash flow statement accessible not just inside PDF
- Capital allocation policy stated clearly

**Failure signals:**
- No credit rating disclosed despite being a rated issuer
- Debt structure information only available inside the 300-page annual report
- No capital allocation framework or policy stated on the site

---

### 1.7 Proxy adviser (ISS, Glass Lewis, PIRC)

**Who they are:** Specialist research firms providing voting
recommendations to institutional investors ahead of AGMs. Analyse
governance quality, board composition, remuneration structure, and
ESG commitments to make pass/fail voting recommendations.

**What they're looking for:** Structured, accessible governance
information. Board independence, committee composition, executive
pay rationale, say-on-pay history, and climate/ESG targets with
quantified commitments.

**Access pattern:** Systematic and mechanical. Checks governance
section against a checklist. If a required document or data point
is not clearly accessible within a reasonable number of clicks,
it is treated as not disclosed.

**Key content needs:**
- Board composition table with independence, tenure, and skills matrix
- Remuneration policy in full (not just summary)
- AGM notice and voting results published promptly
- TCFD-aligned climate disclosure
- Modern slavery statement and gender pay gap report accessible

**Failure signals:**
- Board skills matrix absent or not updated for current board
- Remuneration report only inside the full annual report with no standalone access
- AGM notice not published until days before the meeting
- Modern slavery statement or gender pay report requires multiple clicks to find

---

### 1.8 Private equity / M&A acquirer

**Who they are:** Corporate development teams and PE firms evaluating
the company as a potential acquisition or merger target. Conducting
initial desk research before approaching management.

**What they're looking for:** Business model clarity, divisional
structure, asset quality signals, management depth, and any signals
of strategic optionality or operational vulnerability.

**Access pattern:** Reads the about, strategy, and leadership sections
carefully. Downloads the most recent annual report. Reviews the
sustainability content for liability signals. Checks the careers
section as a proxy for culture and management philosophy.

**Key content needs:**
- Business model clearly described with divisional or segment breakdown
- Leadership team with depth beyond the CEO and CFO
- Strategy that articulates where the business is going and why
- Any disclosed JV or partnership structures

**Failure signals:**
- Business model described only in generic terms with no specifics
- Leadership section shows only the top three to four people
- No strategy content beyond a brief mission statement
- No segment or divisional information surfaced outside the annual report

---

## Tier 2 — ESG and governance

### 2.1 ESG rating agency (MSCI, Sustainalytics, ISS ESG, FTSE Russell, CDP)

**Who they are:** Third-party organisations that score and rank
companies on ESG criteria. Their ratings directly affect whether
ESG-mandated funds can hold the stock and at what weight.

**What they're looking for:** Structured, quantified, machine-readable
ESG data. Policy commitments with specific scope and timeline. GHG
emissions data (scope 1, 2, and 3). TCFD-aligned disclosure. Any data
that can be systematically extracted and scored without requiring a
human analyst to read through PDF documents.

**Access pattern:** Systematic extraction. If data is not on the page
in a structured, extractable format, it is treated as not disclosed
regardless of whether it exists in a PDF. Uses site search and
document downloads for supplementary data.

**Key content needs:**
- On-page ESG data (not PDF only) — key metrics, targets, baselines
- GHG data (scope 1, 2, 3) with year-on-year comparison
- TCFD report or aligned disclosure
- Net zero commitment with scope, pathway, and interim targets
- GRI or SASB index accessible
- CDP submission reference or score disclosed

**Failure signals:**
- ESG data exists only inside PDF sustainability report — not on the page
- GHG data is present but scope 3 is omitted or described as "not calculated"
- No TCFD report or TCFD-aligned section
- Net zero commitment stated without a pathway, interim targets, or methodology
- Sustainability section last updated more than 12 months ago

---

### 2.2 Responsible investment / stewardship team

**Who they are:** Specialists within asset managers focused on ESG
engagement, active ownership, and voting. Distinct from the equity
analysis team — more focused on long-term systemic risks and corporate
behaviour than financial modelling.

**What they're looking for:** Evidence of genuine integration of ESG
into strategy and governance, not just reporting compliance. Board
diversity. Climate transition credibility. Supply chain accountability.

**Access pattern:** Reads sustainability strategy and governance deeply.
Cross-references sustainability commitments with the strategy page to
assess integration. Checks leadership section for board-level
sustainability oversight.

**Key content needs:**
- Sustainability strategy that connects to the business model, not separate from it
- Board-level sustainability committee or named board member accountable for ESG
- Supply chain policy and Scope 3 data
- Evidence of progress against stated ESG targets (not targets only)
- Human rights and modern slavery content with specific commitments

**Failure signals:**
- Sustainability strategy reads as a compliance document rather than a
  strategic narrative
- No named board-level accountability for sustainability
- Progress against ESG targets not visible — targets stated but no
  update on delivery

---

### 2.3 Regulator / statutory body

**Who they are:** Government regulators, stock exchange compliance
teams, and statutory bodies checking that the company has made required
disclosures. Also includes journalists investigating regulatory
compliance.

**What they're looking for:** Specific regulatory disclosures accessible
in the standard locations. Modern slavery statement, gender pay gap
report, tax strategy, accessibility statement, TCFD disclosure, and
any sector-specific regulatory requirements.

**Access pattern:** Direct URL access or footer links. Looking for
specific documents in standard locations. Absence of a required document
in an expected location is treated as non-compliance regardless of
whether it exists elsewhere.

**Key content needs:**
- Modern slavery statement (linked from footer or legal section)
- Gender pay gap report (current year)
- Tax strategy (for large UK companies)
- Accessibility statement
- TCFD disclosure (for premium-listed UK companies)
- Regulatory news accessible (RNS feed or equivalent)

**Failure signals:**
- Modern slavery statement dated more than 12 months ago
- Gender pay gap report absent or for a prior reporting year
- Accessibility statement absent or links to a broken page
- Required disclosures not findable from the footer

---

## Tier 3 — B2B engineering and industrial procurement

### 3.1 Senior procurement director / category manager

**Who they are:** Head of procurement or category manager at a large
corporate or government organisation. Evaluating suppliers for a
significant contract. Holds budget authority and is accountable for
supplier selection.

**What they're looking for:** Evidence that the supplier can deliver
at scale, has a track record, meets compliance requirements, and aligns
with the buying organisation's own ESG commitments. Also: a clear
understanding of how to engage commercially — who to speak to and
how.

**Access pattern:** Starts with the homepage or a branded search.
Reads about, strategy, and products/services in that order. Then
checks sustainability credentials (for own ESG compliance requirements).
Then checks the case studies section. Then looks for a contact route.
Returns to the site at multiple points across a procurement cycle
that may last 12–18 months.

**Key content needs:**
- Products and services described with sufficient specificity for evaluation
- Case studies filterable by sector, scale, or outcome — not a single generic page
- Sustainability credentials addressing Scope 3 and supply chain
- Named commercial contact or contact routing by enquiry type
- Evidence of delivery at the relevant scale

**Failure signals:**
- Products and services described in generic language with no technical depth
- Case studies absent, or single page with no filtering capability
- No Scope 3 data — procurement teams face their own Scope 3 obligations
- Generic contact form with no routing by enquiry type
- No evidence of contracts at the relevant scale

---

### 3.2 Engineering and technical specification team

**Who they are:** Engineers, technical directors, and specification
writers evaluating whether a product or technology meets technical
requirements. Their recommendation feeds into the commercial procurement
decision.

**What they're looking for:** Technical specifications, certifications,
compatibility data, and engineering documentation. Evidence that the
product will perform to requirement. References from comparable
technical applications.

**Access pattern:** Bypasses commercial content. Goes directly to
product or technical pages. Downloads technical datasheets.
Looks for technical case studies and application references.
May contact technical pre-sales directly.

**Key content needs:**
- Product technical specifications with measurable parameters
- Certifications and compliance standards listed explicitly
- Technical case studies with application-specific detail
- Technical documentation downloadable without registration
- Technical contact route (not just commercial enquiry form)

**Failure signals:**
- Product pages describe benefits rather than specifications
- No certifications listed on product pages
- No technical case studies — only commercial success stories
- Technical documentation gated or absent
- Only one generic contact form for all enquiry types

---

### 3.3 MRO buyer (maintenance, repair and overhaul)

**Who they are:** Procurement professionals buying replacement parts,
consumables, and maintenance services for ongoing operational requirements.
Less strategic than capital procurement but high-frequency and
operationally critical.

**What they're looking for:** Aftermarket part availability, lead
times, service contract options, and local support. Needs to find
information quickly under time pressure.

**Access pattern:** Uses search — either site search or direct search
engine — looking for a specific part number or service type. Expects
to find information or a contact in under two clicks.

**Key content needs:**
- Aftermarket or spare parts section clearly signposted
- Service contract or maintenance offering described
- Regional service centre locations or contacts
- Fast route to a relevant contact — not a global enquiry form

**Failure signals:**
- No aftermarket or service section — all content is new equipment/new contract
- Site search returns irrelevant results for part numbers or service terms
- Only a global headquarters contact with no regional routing

---

### 3.4 Defence and government procurement team

**Who they are:** Procurement professionals and programme managers in
government departments, defence ministries, and defence primes
evaluating suppliers for regulated procurement programmes.

**What they're looking for:** Security and compliance credentials,
export control status, government contracting experience, and
appropriate security clearances or certifications. Also: evidence
of domestic content or local industrial participation.

**Access pattern:** Checks credentials and compliance sections.
Looks for specific certifications (e.g. ISO, ITAR compliance, cyber
security standards). May look for a dedicated government or defence
sector section.

**Key content needs:**
- Relevant certifications and compliance standards explicitly listed
- Defence or government sector section (if applicable)
- Export control and ITAR status (where relevant)
- Local content or industrial participation commitment (where relevant)
- Government-facing contact route

**Failure signals:**
- Certifications listed only in the annual report, not on the site
- No defence or government sector section despite significant defence revenue
- Generic contact form with no government or defence routing

---

## Tier 4 — B2B commercial and marketing buyers

### 4.1 Marketing director / CMO evaluating agency partners

**Who they are:** Senior marketing leaders at large organisations
evaluating digital, communications, or marketing agency partners.
Typically operating at brand or group level, with responsibility
for significant marketing budgets.

**What they're looking for:** Evidence of strategic capability (not
just executional skill), relevant sector experience, approach to
measurement and accountability, and cultural fit with a sophisticated
in-house marketing team.

**Access pattern:** Reads case studies carefully. Looks for evidence
of senior thinking — thought leadership, point of view, named senior
team members. Checks the about and team page. May look at the IDX
own site as a proxy for the quality of work they'd do for a client.

**Key content needs:**
- Case studies with named clients, specific challenges, and measurable outcomes
- Senior team profiles with expertise and track record
- A clear point of view on the market — not generic positioning
- Credentials or expertise specific to their sector or brief
- A website that itself demonstrates the quality being sold

**Failure signals:**
- Case studies are generic capability descriptions with no named client
  outcomes
- No senior team profiles beyond a brief bio
- No thought leadership or published point of view
- The agency's own site does not demonstrate the digital quality it sells

---

### 4.2 Digital marketing manager seeking specialist services

**Who they are:** Mid-senior marketing professionals with a specific
brief — CRO, SEO, AEO, content strategy, analytics, or paid media.
Often the day-to-day client lead on an agency engagement and the
person who will recommend (or not recommend) renewal.

**What they're looking for:** Specific evidence of expertise in the
area of their brief. Case studies from comparable companies. A team
they can work with at a peer level. Practical evidence of the approach
rather than broad positioning claims.

**Access pattern:** Searches for the specific capability first — "SEO
agency", "AEO consultancy", or equivalent. Reads the relevant
specialist page. Then reads 2–3 case studies. Then looks at the team.

**Key content needs:**
- Dedicated page for each specialist capability area
- Case studies with measurable outcomes specific to the capability
- Team profiles demonstrating expertise in the relevant area
- Practical content demonstrating the methodology (not just the claim)
- Client references or named engagements

**Failure signals:**
- All capabilities described on a single generic services page with no depth
- Case studies do not break down by capability — only by client type
- No evidence of the specific methodology used
- Team profiles are absent or do not reference relevant expertise

---

### 4.3 IR and corporate communications director evaluating consultancies

**Who they are:** Heads of IR or corporate communications at listed
companies. Evaluating specialist consultancies for website strategy,
content, or digital IR support. Sophisticated buyers who understand
the market and can quickly identify generic positioning.

**What they're looking for:** Evidence that the consultancy understands
their specific context — their sector, investor base, regulatory
environment, and the specific problems they face. Named references
from comparable companies. Senior involvement (not just a senior pitch
followed by junior delivery).

**Access pattern:** Reads the sector expertise or client list page
first. Then reads a relevant case study. Then looks at the team.
May search for the consultancy by name to see what comes up — press
coverage, LinkedIn presence, published point of view.

**Key content needs:**
- Sector expertise articulated by named sectors with specific examples
- Case studies from IR or corporate communications engagements (not just
  general digital)
- Named senior consultants with visible IR or communications expertise
- A point of view on current IR and communications challenges
- Client references from comparable organisations (FTSE, listed, etc.)

**Failure signals:**
- No IR or corporate communications specialisation visible on the site
- Case studies are general digital or UX work without IR context
- Senior consultants not named or profiled
- No published perspective on the issues the client is facing

---

## Tier 5 — Financial and professional services clients

### 5.1 Corporate banking and lending relationship

**Who they are:** Relationship managers and credit analysts at banks
and financial institutions with an existing or potential lending
relationship. Monitoring the company's financial health and strategic
direction as part of relationship management.

**What they're looking for:** Financial stability signals, strategic
direction clarity, and ESG performance (increasingly relevant to
lending covenants). Looking for anything that represents a change in
the risk profile of the relationship.

**Access pattern:** Periodic check rather than deep research. Reads
results summary. Checks strategy for any direction change. Looks at
ESG section for any commitment that might create a covenant or
reporting obligation.

**Key content needs:**
- Results summary with key financial metrics accessible quickly
- Strategy page with medium-term financial targets
- ESG commitment level (for sustainability-linked lending purposes)
- Any disclosed guidance or financial outlook

**Failure signals:**
- Results section requires downloading a full PDF to get key metrics
- No financial outlook or guidance visible on the site
- ESG content does not address specific, quantified commitments

---

## Tier 6 — Talent and employer brand

### 6.1 Graduate / early careers candidate

**Who they are:** Students and recent graduates researching employers
for graduate programmes, internships, or entry-level roles. Making
a career-defining choice and conducting significant research before
applying. Highly attuned to employer brand authenticity.

**What they're looking for:** Evidence that the company is a place
they would want to work — culture, values, development opportunities,
and a sense of what their career could look like. Peer testimonials
carry more weight than corporate messaging.

**Access pattern:** Enters via a branded search for "[Company] graduate
programme" or through a job board. Reads the graduate programme page.
Then looks for employee stories. Then checks the about and values
sections. Often cross-checks against Glassdoor and LinkedIn before
or after visiting the corporate site.

**Key content needs:**
- Dedicated graduate programme page with structure, rotation, and development detail
- Employee case studies — specifically from graduates or early careers employees
- Culture and values content that feels authentic rather than corporate
- Benefits and development pathway described specifically
- Clear application process and timeline

**Failure signals:**
- Graduate programme is a single paragraph with a link to an ATS
- No employee stories from graduates or early careers employees
- Culture content is a generic values statement with no specificity
- Careers section uses different design and branding from the main site
  (signals underinvestment in employer brand)
- Application journey exits the main site immediately on "Apply now"

---

### 6.2 Experienced professional hire

**Who they are:** Mid-career to senior professional considering a
move to the company. Typically approached through a headhunter or
direct application. Conducting due diligence on the company before
committing to a conversation.

**What they're looking for:** Evidence that the company is a credible
place to build the next stage of their career. Strategy and leadership
quality are assessed alongside employer brand. Cross-references the
strategy page with the careers section to assess whether the company's
ambition matches its internal narrative.

**Access pattern:** Reads the strategy and leadership pages as well
as the careers section. Looks for role-area pages or function-specific
content. Checks news for any strategic changes, restructuring, or
financial instability signals.

**Key content needs:**
- Strategy that articulates where the company is going and creates a
  sense of ambition and momentum
- Leadership team depth beyond the top three to four executives
- Function or role area pages describing what working in that area looks like
- Employee stories from experienced hires (not only graduates)
- Absence of negative signals — restructuring, profit warnings, senior
  leadership instability

**Failure signals:**
- Strategy page is stale or generic with no sense of direction
- Careers section has no role area pages — all experience levels directed
  to a single jobs list
- No employee stories from experienced professionals
- Leadership section shows only the most senior executives with no depth

---

### 6.3 Executive / senior hire

**Who they are:** C-suite and senior leadership candidates — typically
identified through executive search. Assessing the company as a
potential employer at the most senior level. The website is used
as part of a broader due diligence process that includes direct
conversations with the board or search firm.

**What they're looking for:** Quality of governance, strategic clarity,
board composition, and cultural signals. The website itself is assessed
as a proxy for management's attention to corporate presentation — a
poorly maintained or low-quality site is a negative signal about
management priorities.

**Access pattern:** Reads the strategy and board pages in depth.
May read the sustainability section as a proxy for management's
long-term thinking. Checks the newsroom for recent developments.
Uses the site as context-setting for conversations rather than
as a primary research source.

**Key content needs:**
- Board page with quality bios and a sense of the board's experience and character
- Strategy that makes a clear, confident argument for the company's direction
- A site that is itself well-designed and well-maintained as a proxy for
  management quality
- No visible maintenance failures — broken links, stale dates, outdated
  leadership photos

**Failure signals:**
- Board page with low-quality photos or minimal bios
- Strategy page is stale or reads as a generic purpose statement
- Visible site maintenance failures (wrong year in copyright, broken links)
- The site feels like it has not received any investment or attention

---

## Tier 7 — Media and reputation

### 7.1 Financial journalist (FT, Bloomberg, Reuters, WSJ)

**Who they are:** Journalists covering listed companies for major
financial publications. Working to tight deadlines. Need accurate,
attributable, current information quickly. Will use the website as
a first stop before contacting IR or press office.

**What they're looking for:** Latest results, latest strategy
announcements, leadership photos, company description, and a named
press contact. On a breaking story, they need information within
minutes — not after navigating a complex site.

**Access pattern:** Direct search or bookmarked IR/press page.
Downloads the most recent results announcement and presentation.
Looks for a named press contact with direct line or email.
Checks leadership page for photos and bios.

**Key content needs:**
- Press contact with name, email, and direct phone — not a generic press@
  address
- Latest results and announcements in one click from the newsroom homepage
- Leadership photos downloadable in high resolution
- Company description (boilerplate) accurate and current
- Press release archive searchable by date and topic

**Failure signals:**
- No named press contact — only a generic enquiries form
- Leadership photos are low-resolution or out of date
- Results announcements not accessible from the newsroom
- Newsroom last updated more than two weeks ago (signals low maintenance)

---

### 7.2 Specialist trade and sector press

**Who they are:** Journalists and editors at sector-specific
publications covering the company's industry. Less deadline-driven
than financial press but more focused on sector dynamics, technology
developments, and customer stories.

**What they're looking for:** Company's position on sector trends,
technology or innovation announcements, sustainability progress in
the context of their industry, and customer or partner stories.

**Access pattern:** Reads the newsroom and insights sections. Looks
for authored content from senior executives. Downloads sustainability
report for sector-relevant data.

**Key content needs:**
- Sector-relevant news and announcements in the newsroom
- Authored thought leadership from senior executives
- Sustainability data specific to sector KPIs (not just general ESG)
- A press contact with sector-relevant knowledge (not just a central
  press office)
- Images and assets for editorial use

**Failure signals:**
- Newsroom is entirely regulatory announcements with no editorial content
- No thought leadership or authored articles
- No sector-specific framing of the company's sustainability position
- Image library absent or restricted

---

## Tier 8 — Digital services and technology buyers

### 8.1 CIO / CTO evaluating technology platforms

**Who they are:** Chief information officers and technology leaders
at large organisations evaluating technology suppliers or platform
partners. Assessing both technical capability and organisational
stability.

**What they're looking for:** Evidence of technical depth, integration
capability, security credentials, and a credible product roadmap.
The website itself is assessed as a proxy for the organisation's
digital maturity — a technically poor site is a negative signal for
a technology company.

**Access pattern:** Goes directly to the product or technology
section. Looks for integration documentation, API references, and
security credentials. Checks the leadership and about sections for
organisational stability signals. May look at the careers section
as a proxy for technical talent quality and scale.

**Key content needs:**
- Technical depth on the product pages — not just feature lists
- Integration and API documentation (or a link to developer documentation)
- Security credentials, certifications, and compliance standards listed
- Product roadmap or innovation signals
- Technical team profiles or R&D section

**Failure signals:**
- Product pages describe benefits with no technical specificity
- No security certifications listed
- The website itself has visible technical quality issues (slow load,
  broken elements) — particularly damaging for a technology company
- No technical contact route

---

### 8.2 SaaS subscription buyer

**Who they are:** Mid-senior buyers at organisations evaluating
SaaS solutions. Typically a combination of business owner (the budget
holder) and technical evaluator (the IT team). Conducting research
across multiple competing solutions simultaneously.

**What they're looking for:** Evidence that the product solves their
specific problem, pricing transparency, ease of implementation, and
customer references. Wants to reach a decision quickly.

**Access pattern:** Lands on a product or solution page from a
search result or ad. Looks for a pricing page. Then reads case
studies. Then looks for a demo or trial option.

**Key content needs:**
- Clear product description at the level of the specific problem it solves
- Pricing page (or at least pricing structure)
- Customer case studies with named outcomes
- Demo or free trial option with a low-friction signup
- Integration capabilities clearly listed

**Failure signals:**
- No pricing information — "contact us for pricing" as the only option
  is a conversion barrier at the evaluation stage
- No free trial or demo option
- Case studies not available without registration
- No integration information

---

## Tier 9 — Policy, government and public affairs

### 9.1 Government official / policy adviser

**Who they are:** Civil servants, special advisers, and policy
officials at government departments or regulatory bodies. Researching
the company's position on a policy issue, its sector's dynamics, or
its compliance with a specific regulatory requirement.

**What they're looking for:** The company's stated position on
regulatory and policy topics, its sustainability and societal
commitments, employment and economic contribution data, and evidence
of responsible business practice.

**Access pattern:** Uses search to find specific policy-relevant
content. Reads the sustainability section for regulatory compliance.
Looks at the newsroom for any relevant announcements. Checks the
about and at-a-glance section for economic contribution data.

**Key content needs:**
- Sustainability content that addresses regulatory priorities (climate,
  modern slavery, gender pay, human rights)
- Economic contribution data — employment numbers, UK/domestic investment
- Any position statements on sector policy issues
- Named public affairs or government relations contact (where applicable)
- TCFD disclosure and climate commitments

**Failure signals:**
- Sustainability content does not address the specific regulatory
  requirements relevant to the company's sector
- No economic contribution data — employment figures, investment,
  tax contribution
- Policy positions not stated even where the company is a significant
  actor in a regulated sector

---

## Tier 10 — Strategic and corporate development

### 10.1 Potential strategic partner / alliance target

**Who they are:** Business development and corporate development
professionals at companies evaluating a strategic partnership, joint
venture, or commercial alliance with the client company.

**What they're looking for:** Strategic direction alignment, complementary
capabilities, and organisational credibility. Looking for evidence that
the company would be a capable and stable partner.

**Access pattern:** Reads strategy, about, and products/services
pages carefully. Checks leadership quality. May look at the sustainability
section for alignment with their own ESG commitments.

**Key content needs:**
- Strategy that articulates where the company is going with enough clarity
  to assess alignment
- Products and capabilities described specifically enough to identify
  complementarity
- Leadership quality signals — depth, experience, stability
- Any existing partnership or alliance examples

**Failure signals:**
- Strategy is too generic to assess alignment
- No description of partnership or alliance capability
- Leadership section shows only the CEO and CFO — no depth

---

### 10.2 Industry analyst (Gartner, Forrester, IDC)

**Who they are:** Research analysts at major technology and business
research firms. Writing reports and assessments that are read by
large enterprise buyers. Their view of a company directly influences
enterprise procurement decisions.

**What they're looking for:** Technical depth, product differentiation,
customer references, and market positioning. Increasingly uses AI
tools for initial orientation research — if a company is not
AI-quotable, it may not appear in AI-generated briefings that
influence analyst pre-research.

**Access pattern:** Reads the product and technology sections.
Downloads white papers and technical content. Looks for customer
reference programmes or analyst relations contacts. Cross-references
against the company's own claimed positioning.

**Key content needs:**
- Technical content with sufficient depth for a sophisticated analyst audience
- Customer references or case studies with named outcomes
- Analyst relations contact or programme (where applicable)
- White papers or research publications
- Specific, quotable claims about the product's differentiation —
  not generic positioning language

**Failure signals:**
- Product content is at the level of a marketing brochure rather than
  an analyst briefing
- No customer references accessible without engagement with the sales team
- Generic positioning claims with no specificity or proof points
- No analyst relations programme or contact visible
