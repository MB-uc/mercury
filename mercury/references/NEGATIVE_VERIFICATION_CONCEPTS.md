# NEGATIVE_VERIFICATION_CONCEPTS.md
# Mercury Strategy — Negative verification concepts
# Version 0.1 | March 2026

---

## Purpose

Before the ms-findings skill may assert that a page, section, or
content type is absent from a site, the ms-crawl phase must have
actively attempted to locate it. Passive absence — failing to
encounter a page during crawl — is not sufficient to assert it does
not exist.

This file defines the verification procedure and lists every page
concept that requires active negative verification, with the URL
path variants to check and the fallback site search query to run if
path checks are inconclusive.

---

## Verification procedure

For each concept below, the crawl phase runs in this order:

### Step 1 — Path matching against crawl map
Check whether any URL returned by `firecrawl_map` matches one or
more of the listed path patterns. Match is case-insensitive, partial
match on path segment (e.g. `/about/leadership` matches pattern
`/leadership`).

If a match is found → concept is **present**. Record the URL.
Proceed to next concept.

### Step 2 — Direct URL probe
If no match in the crawl map, attempt `firecrawl_scrape` on the
top three candidate URLs from the path variants list. A 200 response
with substantive content (>200 words) confirms presence.

If confirmed → concept is **present**. Record the URL.
Proceed to next concept.

### Step 3 — Site search fallback
If direct probes fail or return 404/redirect, run a site-scoped
search using the listed search query via `firecrawl_search`.

If a result is found that resolves to a live page → concept is
**present**. Record the URL.
Proceed to next concept.

### Step 4 — Absence confirmed
Only if all three steps fail may the concept be recorded as
**absent** in the evidence manifest.

### Recording format

Each concept verification result is recorded in the evidence manifest
as:
```json
{
  "concept": "investment_case",
  "status": "absent | present",
  "verified_by": "path_match | direct_probe | site_search",
  "url": "https://... (if present)",
  "checked_paths": ["...", "..."],
  "search_query": "...",
  "notes": "..."
}
```

---

## Concept library

The concepts are grouped by the archetype criteria they support.
Each group references the archetype codes from ARCHETYPE_LIBRARY.md
that depend on these absence checks.

---

### Group 1 — Investor relations content
*Supports: A01, A02, A04, A05, A10*

---

#### CONCEPT: investment_case

**What it is:** A dedicated page articulating the investment proposition
— why an investor should hold or buy the stock. Distinct from the IR
landing page.

**Path variants to check:**
```
/investment-case
/why-invest
/equity-story
/investor-proposition
/investment-proposition
/why-[company]
/investors/investment-case
/investors/why-invest
/investors/equity-story
/ir/investment-case
```

**Site search query:**
`site:[domain] "investment case" OR "why invest" OR "equity story"`

**Common false positives to exclude:**
- Annual report PDF pages that contain the phrase "investment case"
- Generic about pages that mention "investment" in passing
- IR landing pages — this concept is specifically a dedicated sub-page

---

#### CONCEPT: results_highlights

**What it is:** A page or section surfacing headline KPIs from the
latest results period — not just a document download list. Must have
on-page content, not only PDF links.

**Path variants to check:**
```
/results
/financial-results
/results-centre
/investors/results
/investors/financial-results
/ir/results
/half-year-results
/full-year-results
/quarterly-results
/investors/results-centre
```

**Site search query:**
`site:[domain] "results" "revenue" OR "profit" OR "earnings"`

**Absence confirmed only if:** No page found with on-page headline
KPIs. A page that only links to PDF documents does NOT constitute
results highlights — record as `present_documents_only` rather than
`absent`, as this distinction matters for A01 archetype matching.

---

#### CONCEPT: financial_calendar

**What it is:** A forward-looking calendar of upcoming results dates,
AGM, capital markets events, and investor conferences.

**Path variants to check:**
```
/financial-calendar
/investor-calendar
/events
/ir/events
/investors/events
/investors/calendar
/investors/financial-calendar
/shareholder-events
/ir/calendar
```

**Site search query:**
`site:[domain] "financial calendar" OR "results date" OR "AGM" date`

**Absence confirmed only if:** No forward-looking event schedule found.
A page showing only past events counts as `present_stale` — record
this distinction as it is relevant to A02 archetype matching.

---

#### CONCEPT: cmd_materials

**What it is:** A dedicated section or page for Capital Markets Day,
Investor Day, or Strategy Day materials — presentations, webcasts,
transcripts from past events.

**Path variants to check:**
```
/capital-markets-day
/investor-day
/strategy-day
/cmd
/investors/capital-markets-day
/investors/investor-day
/ir/capital-markets-day
/investors/events/capital-markets-day
/investors/strategy-day
```

**Site search query:**
`site:[domain] "capital markets day" OR "investor day" OR "strategy day"`

---

#### CONCEPT: results_archive

**What it is:** An accessible archive of results from previous periods,
navigable by year or period type. Distinct from the current results page.

**Path variants to check:**
```
/results-archive
/results-history
/investors/archive
/ir/archive
/financial-archive
/investors/results/archive
/investors/historical-results
```

**Site search query:**
`site:[domain] results archive OR historical results OR "FY2023" OR "FY2022"`

---

### Group 2 — Strategy and narrative content
*Supports: A02, A05, A07, A11*

---

#### CONCEPT: strategy_page

**What it is:** A dedicated page articulating the company's strategic
direction, priorities, and value creation model. Not the homepage hero
or an annual report chapter — a standalone navigable strategy section.

**Path variants to check:**
```
/strategy
/our-strategy
/strategic-priorities
/strategy-and-performance
/about/strategy
/about-us/strategy
/investors/strategy
/strategic-framework
/strategy-overview
/growth-strategy
```

**Site search query:**
`site:[domain] "our strategy" OR "strategic priorities" OR "strategic framework"`

**Common false positives:**
- PDF annual report chapters titled "Strategy"
- Sustainability strategy pages (separate concept below)
- Homepage strategy summary blocks without a dedicated URL

---

#### CONCEPT: purpose_values

**What it is:** A dedicated page for the company's purpose, mission,
vision, and/or values. Often under About.

**Path variants to check:**
```
/purpose
/our-purpose
/mission
/vision
/values
/our-values
/about/purpose
/about/values
/about-us/purpose
/about-us/values
/who-we-are/purpose
```

**Site search query:**
`site:[domain] "our purpose" OR "our values" OR "mission and vision"`

---

#### CONCEPT: business_model

**What it is:** An explicit description of how the company creates and
captures value — segments, revenue model, value chain. Often part of
the About or Strategy section.

**Path variants to check:**
```
/business-model
/how-we-create-value
/value-creation
/our-business-model
/about/business-model
/investors/business-model
/strategy/business-model
/our-model
```

**Site search query:**
`site:[domain] "business model" OR "how we create value" OR "value creation model"`

---

#### CONCEPT: at_a_glance

**What it is:** A rapid company overview page with key facts, metrics,
and geographic presence in scannable format.

**Path variants to check:**
```
/at-a-glance
/company-at-a-glance
/key-facts
/facts-and-figures
/about/at-a-glance
/about-us/at-a-glance
/who-we-are/at-a-glance
/our-company/at-a-glance
/overview
/company-overview
/about/key-facts
```

**Site search query:**
`site:[domain] "at a glance" OR "key facts" OR "facts and figures"`

---

### Group 3 — Leadership and governance
*Supports: A03, A05*

---

#### CONCEPT: leadership_team

**What it is:** A page listing executive leadership with names, roles,
and bios. May be the Executive Committee, Management Team, or Senior
Leadership Team.

**Path variants to check:**
```
/leadership
/our-leadership
/management
/management-team
/executive-team
/executive-committee
/senior-leadership
/about/leadership
/about-us/leadership
/our-company/leadership
/who-we-are/leadership
/about/management-team
```

**Site search query:**
`site:[domain] "management team" OR "executive committee" OR "leadership team"`

**Note:** This is one of the highest-risk false-absence concepts.
Always run the site search step even if path probes return 404,
as leadership content is frequently nested under About with
non-standard URL patterns.

---

#### CONCEPT: board_of_directors

**What it is:** A page listing non-executive board members with roles,
independence status, committee memberships, and bios.

**Path variants to check:**
```
/board
/board-of-directors
/our-board
/directors
/governance/board
/corporate-governance/board
/investors/board
/investors/governance/board
/about/board
/about/board-of-directors
```

**Site search query:**
`site:[domain] "board of directors" OR "non-executive" OR "board members"`

---

#### CONCEPT: governance_overview

**What it is:** A corporate governance landing page covering board
structure, committees, code compliance, and governance framework.

**Path variants to check:**
```
/governance
/corporate-governance
/investors/governance
/ir/governance
/about/governance
/investors/corporate-governance
/governance-overview
/governance-framework
```

**Site search query:**
`site:[domain] "corporate governance" OR "governance framework" OR "UK Corporate Governance Code"`

---

#### CONCEPT: committee_details

**What it is:** Pages detailing board committee composition and terms
of reference — Audit, Remuneration, Nomination, Risk.

**Path variants to check:**
```
/governance/committees
/governance/audit-committee
/governance/remuneration-committee
/governance/nomination-committee
/corporate-governance/committees
/investors/governance/committees
/board-committees
```

**Site search query:**
`site:[domain] "audit committee" OR "remuneration committee" OR "nomination committee"`

---

### Group 4 — Sustainability and ESG
*Supports: A01, A02, A05, A08, A11*

---

#### CONCEPT: sustainability_strategy

**What it is:** A dedicated sustainability or ESG strategy page —
not just a landing page with links to reports. Must articulate
commitments, pillars, and targets on-page.

**Path variants to check:**
```
/sustainability
/esg
/responsibility
/csr
/sustainability/strategy
/sustainability/our-approach
/esg/strategy
/about/sustainability
/responsible-business
/net-zero
/climate
```

**Site search query:**
`site:[domain] "sustainability strategy" OR "ESG strategy" OR "our approach to sustainability"`

**Absence confirmed only if:** No page found with on-page strategic
content. A page that only links to the sustainability report PDF is
recorded as `present_documents_only`.

---

#### CONCEPT: esg_data_download

**What it is:** A downloadable ESG data pack — Excel or CSV format —
separate from the narrative sustainability report PDF.

**Path variants to check:**
```
/sustainability/data
/esg/data
/sustainability/reporting/data
/sustainability-data
/esg-data
/sustainability/downloads
/esg/downloads
/responsibility/data
```

**Site search query:**
`site:[domain] "ESG data" filetype:xlsx OR filetype:csv OR "data download"`

---

#### CONCEPT: tcfd_disclosure

**What it is:** A TCFD-aligned climate disclosure — either a dedicated
page or a clearly labelled TCFD report/section.

**Path variants to check:**
```
/tcfd
/climate/tcfd
/sustainability/tcfd
/esg/tcfd
/investors/tcfd
/sustainability/reporting/tcfd
/climate-disclosure
/climate-related-disclosures
```

**Site search query:**
`site:[domain] "TCFD" OR "Task Force on Climate-related Financial Disclosures"`

---

#### CONCEPT: sustainability_reporting_centre

**What it is:** A centralised hub for sustainability reports, climate
reports, data packs, and framework indices — not just a single PDF link.

**Path variants to check:**
```
/sustainability/reporting
/sustainability/reports
/esg/reporting
/esg/reports
/responsibility/reporting
/sustainability-reporting
/esg-reporting
/sustainability/downloads
/sustainability/library
```

**Site search query:**
`site:[domain] "sustainability report" OR "ESG report" OR "GRI index" OR "SASB"`

---

### Group 5 — Careers and employer brand
*Supports: A09, A03*

---

#### CONCEPT: careers_hub

**What it is:** A dedicated careers section with structured content —
not merely a link to an external ATS. Must have on-site content about
the employer brand, culture, or role types.

**Path variants to check:**
```
/careers
/jobs
/work-with-us
/join-us
/join-our-team
/working-here
/life-at-[company]
/opportunities
/vacancies
```

**Also check subdomains:**
```
careers.[domain]
jobs.[domain]
talent.[domain]
```

**Site search query:**
`site:[domain] "careers" OR "join us" OR "work with us"`

**Absence confirmed only if:** No on-site careers content found AND
any careers link routes directly to an external ATS platform
(Workday, Taleo, Greenhouse, Lever, iCIMS, SuccessFactors) with no
native content. Record ATS platform name in the evidence manifest.

---

#### CONCEPT: graduate_programme

**What it is:** A dedicated section for graduate, early careers,
apprenticeship, or internship programmes.

**Path variants to check:**
```
/careers/graduates
/careers/graduate-programme
/careers/early-careers
/graduate-programme
/graduates
/early-careers
/apprenticeships
/internships
/careers/apprenticeships
/careers/internships
```

**Site search query:**
`site:[domain] "graduate programme" OR "early careers" OR "apprenticeship"`

---

#### CONCEPT: employee_stories

**What it is:** Employee case studies, testimonials, or "life at"
content — personal narratives from current employees.

**Path variants to check:**
```
/careers/our-people
/careers/stories
/careers/employee-stories
/careers/life-at
/our-people
/life-at-[company]
/careers/meet-our-people
/people
/careers/people
```

**Site search query:**
`site:[domain] "employee stories" OR "meet our people" OR "life at" careers`

---

### Group 6 — News, media, and thought leadership
*Supports: A05, A10, A11*

---

#### CONCEPT: newsroom

**What it is:** A dedicated news or media centre with press releases,
company announcements, and media contact information.

**Path variants to check:**
```
/news
/newsroom
/media
/press
/media-centre
/press-room
/news-and-media
/media-and-news
/investor-news
/about/news
```

**Site search query:**
`site:[domain] "press release" OR "newsroom" OR "media centre"`

---

#### CONCEPT: thought_leadership

**What it is:** Authored articles, research reports, whitepapers, or
opinion pieces from senior leadership or company subject matter
experts. Distinct from press releases.

**Path variants to check:**
```
/insights
/perspectives
/thought-leadership
/research
/articles
/views
/blog
/opinion
/publications
/knowledge
/resources
```

**Site search query:**
`site:[domain] "insights" OR "perspectives" OR "thought leadership" OR "whitepaper"`

---

#### CONCEPT: media_contact

**What it is:** A named press contact with direct email or phone —
not just a generic contact form.

**Path variants to check:**
```
/media/contact
/press/contact
/newsroom/contact
/media-contacts
/press-contact
/contact/media
/for-journalists
```

**Site search query:**
`site:[domain] "media contact" OR "press contact" OR "for journalists"`

---

### Group 7 — Commercial and B2B content
*Supports: A07, A13*

---

#### CONCEPT: products_services

**What it is:** A dedicated commercial section describing the company's
products, services, or solutions for customers. Distinct from the
investor-facing business description.

**Path variants to check:**
```
/products
/services
/solutions
/what-we-do
/our-products
/our-services
/our-solutions
/capabilities
/offerings
/products-and-services
/technology
```

**Site search query:**
`site:[domain] "products" OR "services" OR "solutions" -inurl:investors -inurl:sustainability`

---

#### CONCEPT: case_studies

**What it is:** Customer case studies, success stories, or project
references demonstrating commercial outcomes. Filterable by sector
or application type is the ideal but any case study content counts.

**Path variants to check:**
```
/case-studies
/case-study
/success-stories
/customer-stories
/client-stories
/references
/projects
/work
/our-work
/portfolio
```

**Site search query:**
`site:[domain] "case study" OR "case studies" OR "success story" OR "customer story"`

---

#### CONCEPT: commercial_contact

**What it is:** A commercial or sales enquiry route — not just a
generic contact form. May be a named contact, a region-specific
contact page, or an enquiry form routed by type.

**Path variants to check:**
```
/contact
/contact-us
/get-in-touch
/enquire
/enquiries
/sales
/contact/sales
/contact/commercial
/find-a-distributor
/find-a-dealer
```

**Site search query:**
`site:[domain] "contact us" "sales" OR "commercial" OR "enquiry"`

**Note:** Generic contact pages exist on almost every site. This
concept is absent only if no commercial routing or sales-specific
contact mechanism is present — a single generic form counts as
`present_generic`. Record this distinction.

---

### Group 8 — Technical and AEO signals
*Supports: A06, A11*

---

#### CONCEPT: schema_markup

**What it is:** Structured data (JSON-LD or microdata) present on
key pages — Organisation, FinancialProduct, Event schemas in
particular.

**Verification method:** This concept is NOT verified by URL path
checking. Instead:
1. Scrape the homepage and IR landing page
2. Check for `<script type="application/ld+json">` blocks in the
   page source
3. Check for `itemtype` attributes in HTML

If schema blocks are found → `present`. Record schema types found.
If none found on either page → `absent`.

---

#### CONCEPT: xml_sitemap

**What it is:** A machine-readable XML sitemap at the standard
location.

**Path variants to check:**
```
/sitemap.xml
/sitemap_index.xml
/sitemap/sitemap.xml
/sitemaps/sitemap.xml
```

**Note:** If the sitemap is found but covers fewer than 30% of URLs
discovered by `firecrawl_map`, record as `present_incomplete` rather
than `absent`. This distinction matters for A06 archetype matching.

---

#### CONCEPT: robots_txt

**What it is:** A robots.txt file at the standard location,
potentially excluding sections from crawl.

**Path to check:** `/robots.txt` only.

Record the content — specifically note any `Disallow` rules that
may explain absent sections during crawl. This context is surfaced
in the appendix, not the main findings.

---

## Absence claim rules

The following rules govern how absence findings flow into the
evidence manifest and subsequently into the Findings skill.

### Rule 1 — Verified absence only
A concept may only be recorded as `absent` after completing all
three verification steps. `path_match_failed` alone is not
sufficient.

### Rule 2 — Qualified presence beats absence
If any step finds a page that partially addresses the concept —
even if the content is thin, stale, or document-only — the concept
is `present` with a qualifier. The Findings skill uses the qualifier,
not the raw present/absent binary. Qualifiers:

| Qualifier | Meaning |
|-----------|---------|
| `present` | Full content, accessible, meets concept definition |
| `present_thin` | Page exists but content is minimal (<200 words) |
| `present_stale` | Page exists but content is clearly outdated |
| `present_documents_only` | Page exists but only links to PDFs with no on-page content |
| `present_external` | Concept served via an external platform (e.g. ATS, IR portal) |
| `present_generic` | Present but not specifically configured for the expected audience |
| `absent` | All three verification steps failed to locate the concept |
| `not_assessed` | Verification not run — page type excluded or crawl blocked |

### Rule 3 — Block high-risk absence claims
The following concepts are designated **high-risk** because they
are frequently present but missed by partial crawls. If verification
is inconclusive (i.e. step 2 fails but step 3 is untried), the
concept must be recorded as `not_assessed` rather than `absent`:

- `leadership_team`
- `board_of_directors`
- `strategy_page`
- `sustainability_strategy`
- `careers_hub`

### Rule 4 — No absence claim without manifest entry
The Findings skill checks the evidence manifest before generating
any absence-based finding. If a concept has no manifest entry, the
skill must not assert absence — it must flag the gap as
`not_assessed` in the evidence gap section.

---

## Coverage by archetype

Quick reference: which concepts support which archetype confidence
checks.

| Concept | Archetypes supported |
|---------|---------------------|
| investment_case | A01, A02, A05 |
| results_highlights | A01, A04 |
| financial_calendar | A02, A04 |
| cmd_materials | A10 |
| results_archive | A01, A10 |
| strategy_page | A02, A05, A07 |
| purpose_values | A05 |
| business_model | A05, A07 |
| at_a_glance | A05, A07, A11 |
| leadership_team | A03, A05 |
| board_of_directors | A03 |
| governance_overview | A03 |
| committee_details | A03 |
| sustainability_strategy | A01, A02, A05, A11 |
| esg_data_download | A01, A08, A11 |
| tcfd_disclosure | A01, A11 |
| sustainability_reporting_centre | A01, A05 |
| careers_hub | A03, A09 |
| graduate_programme | A09 |
| employee_stories | A09 |
| newsroom | A05, A10 |
| thought_leadership | A05, A11 |
| media_contact | A04, A10 |
| products_services | A07, A13 |
| case_studies | A07, A13 |
| commercial_contact | A04, A07, A13 |
| schema_markup | A06, A11 |
| xml_sitemap | A06 |
| robots_txt | A06 |