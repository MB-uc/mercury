---
name: ms-crawl
description: >
  Five-pass site discovery for Mercury Strategy. Takes the ms-brief evidence manifest and
  runs a structured crawl of the company's corporate website, building a page-level evidence
  pack organised by section and content type. This is a pure collection skill — it gathers
  and classifies page evidence. It does not synthesise findings or produce recommendations.
  Invoke via /ms-crawl <company name>.
---

# MS-Crawl — five-pass site discovery

## Role in the Mercury Strategy pipeline

MS-Crawl is the second stage of the Mercury Strategy pipeline. It runs after `ms-brief` and before `ms-findings`.

**Two-agent separation is the foundational design principle.** MS-Crawl is a collection agent. MS-Findings is a reasoning agent. These two never run simultaneously. MS-Crawl finishes and saves its output before MS-Findings begins. This boundary is not a convention — it is a hard constraint. Mixing collection and reasoning degrades both.

**What this skill does:**
- Takes the `ms-brief` evidence manifest as its primary input
- Runs five structured passes over the corporate website, each with a specific focus
- Builds a page-level evidence pack: one JSON evidence file per page crawled
- Classifies each page against the section taxonomy in `CLASSIFICATION_RULES.md`
- Applies Firecrawl domain overrides from `CRAWL_CONFIG.md`
- Saves a complete crawl manifest on completion

**What this skill does not do:**
- It does not evaluate pages against archetypes or playbook criteria
- It does not generate findings, claims, or recommendations
- It does not synthesise across pages
- It does not score content quality

---

## Reference files

- `CRAWL_CONFIG.md` — Firecrawl parameters, domain overrides, and scrape configuration rules
- `CLASSIFICATION_RULES.md` — taxonomy for classifying pages and documents by section and type
- `NEGATIVE_VERIFICATION_CONCEPTS.md` — how to record absence without over-claiming

---

## Prerequisites

- `{company}-ms-brief-evidence.json` must exist and contain a `site_map` evidence item
- If the brief evidence manifest is missing, surface a clear message and halt. Do not attempt to collect site structure independently.

---

## Core principles

**1. Collection only.** No findings, no synthesis, no evaluation. Everything is raw evidence.

**2. Provenance on every page.** Every page evidence file records: URL, tool used, timestamp, raw content (or extraction summary), word count, and classification tags.

**3. Cost discipline.** `firecrawl_map` has already been run in `ms-brief`. Do not re-run it. Use the URL inventory from the brief evidence manifest. Escalate from `web_fetch` to `firecrawl_scrape` only when needed.

**4. ⚠️ PROHIBITED: `firecrawl_crawl`.** Never use it. See the escalation protocol below.

**5. Scope discipline.** Only crawl the primary corporate domain identified in the brief manifest. No regional subdomains unless the consultant explicitly adds them to scope.

**6. Bounded absence.** When a page or section is not found, record what was checked and where. See `NEGATIVE_VERIFICATION_CONCEPTS.md`.

---

## Capability detection

At the start of every run, silently probe each tool and record in the crawl manifest.

| Capability | Required | Impact if missing |
|------------|----------|-------------------|
| `web_fetch` | Yes (Level 0) | Escalate all fetches to firecrawl_scrape |
| `firecrawl_scrape` | Recommended | Cannot extract PDFs or JS-rendered pages |
| `firecrawl_browser` | Optional | Gated and JS-interactive content inaccessible |
| `bash` | Recommended | Cannot save page evidence files |

### Collection escalation protocol

```
Level 0: web_fetch          — free, always try first for HTML pages
Level 1: firecrawl_scrape   — 1 credit, when web_fetch fails or returns JS shell
Level 2: firecrawl_browser  — 1+ credits, when scrape fails (gated/interactive content)
```

Before every `firecrawl_scrape` call, check `CRAWL_CONFIG.md` for domain-specific overrides. If the domain is listed, use its `includeTags` / `excludeTags` configuration instead of `onlyMainContent: true`.

### Credit budget guidance

A typical MS-Crawl run should use:
- 0 credits for `firecrawl_map` (already done in ms-brief)
- 20–40 credits for `firecrawl_scrape` calls across the five passes
- Up to 10 additional credits for `firecrawl_browser` on gated pages

If approaching 60+ scrape calls in a single run, pause and assess — you are likely fetching pages not needed for the evidence pack.

---

## The five passes

The crawl is structured as five sequential passes. Each pass has a defined scope and a target page set. Complete each pass fully before starting the next.

### Pass 1 — Core corporate pages

**Purpose:** Establish the company's basic corporate identity, structure, and messaging as expressed on the website.

**Pages to fetch:**
- Homepage (`/`)
- About / company overview (typically `/about`, `/about-us`, `/company`, `/who-we-are`)
- Strategy (typically `/strategy`, `/our-strategy`, `/about/strategy`)
- Business model (if a dedicated page exists)
- History / heritage (if present and relevant)
- Leadership / board (typically `/leadership`, `/board`, `/governance/board`)
- At a glance / key facts (if present)

**What to record per page:**
- Full URL
- Page title (`<title>` tag)
- H1 heading
- Primary navigation links visible on the page
- Content summary (key messages, structure, notable elements)
- Word count
- Any documents linked from this page (PDF, DOCX URLs)
- Classification tags from `CLASSIFICATION_RULES.md`

**Stop condition:** If a page is unavailable, note it as a gap. Do not substitute with a different page.

---

### Pass 2 — Investor relations

**Purpose:** Map the full IR section — landing page, results, reports, documents, financial calendar, shareholder information.

**Pages to fetch (work from URL inventory in brief manifest):**
- IR landing page
- Latest results (full-year and/or half-year)
- Annual report page
- Capital markets day / investor day materials (if present)
- Financial calendar
- Share price page
- Shareholder information / structure
- AGM information
- Debt investor / fixed income section (if present)
- Contact for investors

**Documents to extract (via `firecrawl_scrape`):**
- Results presentation PDF (latest)
- Annual report PDF (partial — first 40 pages unless consultant approved full extraction in ms-brief)
- CMD / investor day presentation PDF (if present and approved in ms-brief)
- Any other documents linked from IR pages

**What to record per page:**
- As Pass 1, plus:
- Documents linked from this page (URL, document type, file size if visible)
- Whether key IR components are present or absent (record presence/absence, not evaluation)

---

### Pass 3 — Sustainability and ESG

**Purpose:** Map the sustainability section — content depth, reporting frameworks, data availability, documents.

**Pages to fetch:**
- Sustainability / ESG landing page
- Environmental content
- Social responsibility content
- Governance content
- Reporting / data / performance section
- Any standalone sustainability reports linked from the section

**Documents to extract (when approved):**
- Sustainability report PDF (partial — key sections)
- TCFD report (if standalone)

**What to record per page:**
- As Pass 1, plus:
- Reporting framework references (GRI, TCFD, SASB, SDGs — present or absent)
- Targets mentioned (net zero, emissions reduction, etc.)
- Performance data visible (quantified metrics — record values, do not evaluate)

---

### Pass 4 — Careers and employer brand

**Purpose:** Map the careers section — EVP, content depth, job search, early careers.

**Pages to fetch:**
- Careers landing page
- Why join / culture / values
- Benefits / rewards
- Early careers / graduates (if present)
- Employee stories (if present)
- Diversity and inclusion (if present)
- Locations (if present)
- Jobs / vacancies page (fetch but do not extract individual listings)

**What to record per page:**
- As Pass 1, plus:
- Job application system type (internal, external ATS, external platform)
- Content types present (video, employee stories, testimonials — record presence, not quality)

---

### Pass 5 — News, media, and governance

**Purpose:** Map the newsroom and governance sections — content currency, media accessibility, governance completeness.

**Pages to fetch (news/media):**
- News / media / newsroom landing page
- Most recent press releases (latest 3–5)
- Media contacts page
- Image library or press pack (if present)

**Pages to fetch (governance):**
- Corporate governance landing
- Board composition / committee structure
- Committee terms of reference (if linked)
- Audit, remuneration, nomination committee pages
- Modern slavery statement (if present)
- Privacy policy / GDPR page

**What to record per page:**
- As Pass 1
- For news pages: article date, headline, content type (press release, story, RNS)
- For governance pages: document availability (policy documents, statements, reports)

---

## Page evidence file schema

Save one JSON file per page crawled. Files are saved to `{company}-crawl/pages/`.

```json
{
  "page_id": "p-001",
  "company": "Company Name plc",
  "domain": "company.com",
  "url": "https://www.company.com/investors",
  "crawl_pass": 2,
  "tool_used": "web_fetch",
  "fetched_at": "2026-03-12T11:30:00Z",
  "page_title": "Investors — Company Name",
  "h1": "Investor relations",
  "meta_description": "Access Company Name's investor relations section for results, reports, and shareholder information.",
  "word_count": 1240,
  "classification": {
    "section": "ir",
    "page_type": "ir_landing",
    "tags": ["ir", "listed", "navigation_hub"]
  },
  "content_summary": "IR landing page with navigation links to results, reports, financial calendar, and shareholder centre. Share price ticker present in header. No investment case or upcoming events module on the landing page.",
  "documents_linked": [
    {
      "url": "https://www.company.com/investors/annual-report-2025.pdf",
      "label": "Annual Report 2025",
      "type": "annual_report",
      "file_size_approx": "4.9MB"
    }
  ],
  "navigation_links": [
    "/investors/results",
    "/investors/annual-report",
    "/investors/financial-calendar",
    "/investors/shareholders",
    "/investors/contact"
  ],
  "notable_absences": [
    "No investment case or equity story visible on landing page",
    "No upcoming events module",
    "No latest results snapshot"
  ],
  "raw_content_truncated": false
}
```

**Notable absences field:** Use this to record what is not present on the page. Apply `NEGATIVE_VERIFICATION_CONCEPTS.md` — scope absence to the specific page, not the site. "No investment case visible on the IR landing page" is correct. "No investment case on the site" requires evidence from multiple sections.

---

## Crawl manifest schema

Save `{company}-ms-crawl-manifest.json` on completion.

```json
{
  "company": "Company Name plc",
  "domain": "company.com",
  "stage": "ms-crawl",
  "crawl_started_at": "2026-03-12T11:00:00Z",
  "crawl_completed_at": "2026-03-12T12:15:00Z",
  "brief_manifest_used": "{company}-ms-brief-evidence.json",
  "capabilities_used": ["web_fetch", "firecrawl_scrape"],
  "credits_used": {
    "firecrawl_map": 0,
    "firecrawl_scrape": 28,
    "firecrawl_browser": 0,
    "total": 28
  },
  "passes_completed": {
    "pass_1_corporate": { "pages_fetched": 7, "pages_failed": 0 },
    "pass_2_ir": { "pages_fetched": 9, "documents_extracted": 2, "pages_failed": 1 },
    "pass_3_sustainability": { "pages_fetched": 6, "documents_extracted": 1, "pages_failed": 0 },
    "pass_4_careers": { "pages_fetched": 7, "pages_failed": 0 },
    "pass_5_news_governance": { "pages_fetched": 9, "pages_failed": 0 }
  },
  "pages_crawled": 38,
  "documents_extracted": 3,
  "pages_directory": "{company}-crawl/pages/",
  "gaps": [
    "IR results page (p-017) returned HTTP 403 — content not retrieved",
    "CMD deck not crawled — not approved for extraction in ms-brief stage"
  ],
  "scope_exclusions": [
    "Regional subdomains not crawled (chile.company.com, australia.company.com)"
  ]
}
```

---

## Output files

- `{company}-ms-crawl-manifest.json` — crawl summary and metadata
- `{company}-crawl/pages/p-NNN.json` — one file per page crawled

---

## Handoff to ms-findings

MS-Findings reads:
1. `{company}-ms-brief-evidence.json` — company identity, benchmark data, situational context
2. `{company}-ms-crawl-manifest.json` — crawl summary and page directory
3. `{company}-crawl/pages/*.json` — page-level evidence pack

MS-Findings does not run until the crawl manifest is saved and all pass gaps are recorded. Incomplete crawls are valid — gaps are recorded and MS-Findings reasons from what is present.

---

## What not to include in page evidence files

Page evidence files must not contain:
- Evaluative language ("strong", "weak", "poor", "excellent")
- Archetype scores or component pass/fail checks
- Comparisons to peers or playbook criteria
- Recommendations or suggested improvements
- Claims about what the evidence implies
- Share price data or financial metrics beyond what is factually on the page

If you find yourself writing an evaluation, stop. That belongs in `ms-findings`. Record what is present. Record what is absent (bounded to this page). Nothing more.
