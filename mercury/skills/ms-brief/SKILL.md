---
name: ms-brief
description: >
  Company and website intelligence gathering for Mercury Strategy. Collects structured evidence
  about a company — its identity, positioning, recent events, website content, and document
  inventory — and produces a brief artefact for downstream strategy stages. This is a pure
  collection skill: it gathers, classifies, and records evidence. It does not synthesise,
  score, or recommend. Invoke via /ms-brief <company name>.
---

# MS-Brief — company and website intelligence

## Role in the Mercury Strategy pipeline

MS-Brief is the first stage of the Mercury Strategy pipeline. Its job is **evidence collection only**. It produces a structured brief artefact that feeds `ms-crawl` (site discovery) and `ms-findings` (strategic synthesis).

**What this skill does:**
- Confirms company identity, listing status, sector, and primary domain
- Gathers situational context from the last six months
- Inventories the website at a high level — sections present, document availability, navigation structure
- Checks for material corporate events that affect the website assessment
- Records everything with provenance — what tool was used, when, what it found

**What this skill does not do:**
- It does not synthesise findings or make recommendations
- It does not classify content against archetypes or playbook criteria (that is `ms-findings`)
- It does not run the full five-pass site crawl (that is `ms-crawl`)
- It does not score or rank the website

---

## Reference files

All reference files are in `mercury/references/` alongside the skill files:

- `PEER_RESEARCH_GUIDE.md` — how to identify and validate sector peers
- `CRAWL_CONFIG.md` — Firecrawl parameters and domain overrides
- `MATERIAL_EVENTS_CHECKLIST.md` — events that must be flagged in situational awareness
- `NEGATIVE_VERIFICATION_CONCEPTS.md` — bounded absence language rules

---

## Core principles

**1. Collection before reasoning.** This skill runs entirely in Phase A. No synthesis, no claims, no recommendations. Everything goes into the evidence manifest.

**2. Provenance on every item.** Every piece of evidence records: what tool retrieved it, when, what URL or query was used, and a content summary. No evidence without a trail.

**3. Bounded absence.** When something is not found, record what was searched and where. Do not assert universal absence from partial evidence. See `NEGATIVE_VERIFICATION_CONCEPTS.md`.

**4. Material events are mandatory.** The company's own news section must be fetched directly, not just searched. See `MATERIAL_EVENTS_CHECKLIST.md`.

**5. Cost discipline.** Use `web_fetch` before `firecrawl_scrape`. Use `firecrawl_map` (1 credit) before selective `firecrawl_scrape` (1 credit each). Never use `firecrawl_crawl`.

---

## Capability detection

At the start of every run, silently probe each tool and record the result in the capability manifest.

| Capability | How to detect | What it enables |
|------------|--------------|-----------------|
| `web_search` | Attempt a trivial search | Situational awareness, news, corporate signals |
| `web_fetch` | Attempt to fetch a known URL | Page content retrieval (free, no credits) |
| `firecrawl_scrape` | Attempt to scrape a test URL | Deep page content, PDF/document extraction |
| `firecrawl_map` | Attempt to map a test domain | Full URL discovery (1 credit) |
| `firecrawl_browser` | Check if browser session responds | JS-rendered and gated content |
| `bigquery` | Attempt `SELECT 1 FROM sector_intelligence.iq_benchmarks LIMIT 1` | IQ benchmark scores for 747 companies |
| `bash` | Attempt a trivial command | File operations |

### ⚠️ PROHIBITED: `firecrawl_crawl`

Never use `firecrawl_crawl`. It spiders an entire site and can consume hundreds of credits on a single corporate domain. Use `firecrawl_map` (discovers all URLs, 1 credit) followed by selective `firecrawl_scrape` (1 credit per page) instead.

### Collection escalation protocol

```
Level 0: web_fetch          — free, always try first
Level 1: firecrawl_scrape   — 1 credit per page, when web_fetch fails or returns JS shell
Level 2: firecrawl_browser  — 1+ credits, when scrape fails (gated, multi-step interaction)
```

Escalation triggers:
- `web_fetch` returns cookie consent wall, empty content, or redirect loop → escalate to `firecrawl_scrape`
- `web_fetch` returns page with JS-rendered content not visible → escalate to `firecrawl_scrape`
- `firecrawl_scrape` returns login gate → escalate to `firecrawl_browser`
- Target is a PDF, DOCX, or XLSX → go directly to `firecrawl_scrape`

Do not escalate when:
- `web_fetch` succeeds with clean content
- Content is behind a login requiring credentials Mercury does not have (note as gap)
- A page has already been fetched (do not re-scrape)

### Subdomain restriction

Map and scrape the corporate website primary domain only (e.g. `www.company.com`). Do not map regional or country subdomains (e.g. `chile.company.com`) unless the consultant specifically requests them. If the primary domain redirects to a regional site, follow the redirect but do not spider other regions.

---

## Collection steps

### Step 1 — Intake

Confirm with the consultant:
- Legal company name (including corporate suffix — plc, Inc., AG, etc.)
- Primary corporate website URL
- Listing status (exchange and ticker, or private)
- Sector and geography
- Focus area for this engagement (e.g. investor communications, full corporate audit)

Lock scope after confirmation. Scope cannot be widened mid-run without restarting.

Record scope in the evidence manifest:
```json
{
  "scope": {
    "focus": "investor communications",
    "confirmed_at": "2026-03-12T10:00:00Z"
  }
}
```

### Step 2 — Company identity

Collect and record as evidence:
- Legal name, trading name (if different), corporate suffix
- Listing exchange and ticker symbol (if listed)
- Sector classification (GICS or equivalent)
- Primary geography / headquarters
- Brief business description (one or two sentences from the company's own language)

Sources: company homepage, about page, web search for `{company} plc annual report 2025`, Companies House or equivalent.

Record each source as a separate evidence item.

### Step 3 — Benchmark check

**Path A — BigQuery available (preferred):**

Run these three queries against `sector_intelligence.iq_benchmarks`:

```sql
-- Company scores
SELECT company, overall, company_narrative, content_mix, channel_mix,
       optimization, reach, about_us, ir, media, csr, careers,
       reputational_resilience, index_name, dataset_year
FROM sector_intelligence.iq_benchmarks
WHERE LOWER(company) LIKE LOWER('%{company_name}%')
```

```sql
-- Index statistics for context
SELECT
  AVG(overall) as mean,
  APPROX_QUANTILES(overall, 4)[OFFSET(2)] as median,
  APPROX_QUANTILES(overall, 4)[OFFSET(1)] as p25,
  APPROX_QUANTILES(overall, 4)[OFFSET(3)] as p75,
  MIN(overall) as min, MAX(overall) as max, COUNT(*) as n
FROM sector_intelligence.iq_benchmarks
WHERE index_name = '{index_name}'
```

```sql
-- Company rank within index
SELECT company, overall,
  RANK() OVER (ORDER BY overall DESC) as rank,
  COUNT(*) OVER () as total
FROM sector_intelligence.iq_benchmarks
WHERE index_name = '{index_name}'
ORDER BY overall DESC
```

If the company is in the dataset (747 companies across FTSE 100, FTSE 250, S&P 500, STOXX 50), record scores, rank, and index context as evidence type `benchmark_data`.

If the company is NOT in the dataset, record this as a gap and note it in the evidence manifest. Use the index statistics for context in later stages.

**Path B — BigQuery unavailable or company not in dataset:**

Note the limitation. IQ score estimation from observable criteria is performed in `ms-findings`, not here. This step records the gap.

### Step 4 — Situational awareness

Two mandatory sub-steps. Both are required regardless of what the other returns.

**4a — Web search (6 months):**

Search for recent events covering:
- Leadership changes (CEO, CFO, Chair appointments or departures)
- M&A activity (acquisitions, disposals, mergers)
- Results and financial calendar (upcoming and recent)
- ESG developments, controversies, or awards
- Any regulatory, legal, or reputational events

For each event found, record:
- Date of the event
- Source URL
- Relevance to the website assessment
- Evidence type: `search_result`

Do not record share price movements, analyst opinions, or valuation commentary. These are prohibited throughout Mercury Strategy.

**4b — Company's own news section (mandatory, direct fetch):**

Identify the company's news, stories, press releases, media, or newsroom section. Check homepage navigation if the URL is not obvious (common paths: `/news`, `/media`, `/our-stories`, `/press-releases`, `/newsroom`, `/stories`).

Fetch the section directly using `web_fetch` (escalate to `firecrawl_scrape` if needed). Review the most recent 10–15 articles.

Apply the `MATERIAL_EVENTS_CHECKLIST.md` before leaving this step. If any material event is identified, it must appear in the evidence manifest with date, source URL, and relevance note.

This step is mandatory regardless of what Step 4a returned. Search indexing lag means very recent events may appear on the company's domain before they surface in search results.

Record each article reviewed as evidence, even if it contains no material events — the record shows the step was completed.

### Step 5 — Site structure discovery

**If `firecrawl_map` is available:**

Run it on the primary corporate domain:
```json
firecrawl_map({ "url": "https://www.company.com" })
```

Check `CRAWL_CONFIG.md` for domain-specific Firecrawl overrides before running any scrape.

This returns a complete URL inventory. Record as evidence type `site_map` with a summary count of URLs discovered by section (e.g. "47 URLs: /investors 12, /sustainability 8, /careers 11, /about 9, /news 7").

**If `firecrawl_map` is unavailable:**

Fetch `sitemap.xml` via `web_fetch`, then navigate from homepage links. Record what was and was not discoverable.

**Identify and record:**
- Top-level navigation sections present
- Document URLs found (PDFs, DOCX, XLSX — these feed Step 6)
- Sections relevant to the audit focus
- Any notable gaps in structure (e.g. no IR section, no sustainability section)

### Step 6 — Homepage and key section quick audit

Fetch the homepage and 4–6 key pages relevant to the audit focus. Record each page as a separate evidence item.

For each page fetched:
- URL fetched
- Tool used (web_fetch / firecrawl_scrape)
- Content summary (2–3 sentences: what is on the page, what is notable, what appears absent)
- Word count (approximate)

Minimum pages to fetch for any engagement:
- Homepage
- About / at a glance
- One section relevant to the focus area (e.g. `/investors` for an IR focus)

Additional pages to fetch when audit focus warrants:
- Sustainability / ESG
- Careers
- News / media
- Governance / leadership

**Note on homepage signals:** On the homepage, note any news, stories, or announcements being surfaced. These often signal material recent events not yet prominent in search results.

Do not fetch regional subdomains, product detail pages, or career vacancy listings unless the consultant specifically asks.

### Step 7 — Document inventory

Based on URLs discovered in Step 5 and pages fetched in Step 6, identify key documents for potential extraction.

For each document identified, do a shallow probe first — scrape just the first 5 pages to confirm:
```json
{
  "url": "https://company.com/investors/annual-report-2025.pdf",
  "parsers": [{ "type": "pdf", "maxPages": 5 }]
}
```

From the first 5 pages, identify: document title, date, table of contents (if present), and total page count.

Present the document list to the consultant for extraction confirmation before proceeding:

```
## Documents found for extraction

| # | Document | Pages | Credits | Recommended depth |
|---|----------|-------|---------|-------------------|
| 1 | Capital Markets Day 2025 | ~85 slides | 85 | Full — primary strategy source |
| 2 | Annual Report 2025 | ~196 pages | 196 | Partial (first 40) — chair/CEO and strategy only |
| 3 | FY25 Results Presentation | ~42 slides | 42 | Full — recent performance narrative |

Extracting all recommended pages would use ~167 credits.
Which documents would you like me to extract, and to what depth?
```

**Wait for confirmation before extracting.** The consultant may approve, skip, add, or modify.

**Priority order for extraction (when approved):**
1. Capital markets day or investor day presentation — richest source of strategy narrative and management priorities
2. Latest Annual Report — strategy, KPIs, chair/CEO statements
3. Latest results presentation — most recent performance narrative
4. Sustainability/ESG report — when scope includes sustainability

**What to extract from documents (when approved):**
- Strategic priorities and medium-term targets
- Chair and CEO statements
- Key financial metrics and KPIs
- Forward-looking statements and targets
- Content directly relevant to the audit scope

For large documents where partial extraction is approved, use `maxPages`:
```json
{
  "url": "https://company.com/investors/annual-report-2025.pdf",
  "parsers": [{ "type": "pdf", "maxPages": 40 }]
}
```

Record each extracted document as a separate evidence item with: URL, document type, pages extracted, total page count, extraction status (full / partial), and a content summary.

If `firecrawl` is unavailable, record document URLs in evidence gaps and note: "Document content not extracted — Firecrawl unavailable."

### Step 8 — Save evidence manifest

Save `{company}-ms-brief-evidence.json` using the schema below. This is the handoff to `ms-crawl` and `ms-findings`.

---

## Evidence manifest schema

```json
{
  "company": "Company Name plc",
  "domain": "company.com",
  "stage": "ms-brief",
  "collected_at": "2026-03-12T10:30:00Z",
  "capabilities_available": ["web_search", "web_fetch", "firecrawl_scrape", "firecrawl_map", "bash"],
  "capabilities_unavailable": [],
  "scope": {
    "focus": "investor communications",
    "confirmed_at": "2026-03-12T10:00:00Z"
  },
  "company_identity": {
    "legal_name": "Company Name plc",
    "trading_name": "Company Name",
    "exchange": "London Stock Exchange",
    "ticker": "CN.",
    "sector": "Industrials",
    "headquarters": "London, UK",
    "description": "One or two sentences in the company's own language."
  },
  "benchmark": {
    "in_dataset": true,
    "index_name": "FTSE 100",
    "overall": 49.3,
    "rank": 51,
    "total_in_index": 103,
    "source": "sector_intelligence.iq_benchmarks (BigQuery)",
    "dataset_year": 2024
  },
  "evidence_items": [
    {
      "id": "E-001",
      "type": "web_page",
      "url": "https://www.company.com",
      "tool_used": "web_fetch",
      "accessed_at": "2026-03-12T10:05:00Z",
      "content_summary": "Corporate homepage — primary nav, purpose statement, news module. Share price ticker in header.",
      "word_count": 980
    },
    {
      "id": "E-002",
      "type": "search_result",
      "query": "Company Name plc leadership changes 2025 2026",
      "tool_used": "web_search",
      "accessed_at": "2026-03-12T10:08:00Z",
      "results_count": 7,
      "content_summary": "News coverage: new CFO appointed January 2026, full-year results announcement February 2026."
    },
    {
      "id": "E-003",
      "type": "news_section",
      "url": "https://www.company.com/news",
      "tool_used": "web_fetch",
      "accessed_at": "2026-03-12T10:10:00Z",
      "articles_reviewed": 12,
      "material_events_found": true,
      "content_summary": "12 articles reviewed. Material event: CFO appointment announced 15 January 2026.",
      "material_events_checklist_applied": true
    },
    {
      "id": "E-004",
      "type": "site_map",
      "url": "https://www.company.com",
      "tool_used": "firecrawl_map",
      "accessed_at": "2026-03-12T10:12:00Z",
      "urls_discovered": 143,
      "content_summary": "143 URLs discovered. Sections: /investors (18), /sustainability (12), /careers (22), /about (14), /news (11), /governance (8), other (58)."
    },
    {
      "id": "E-005",
      "type": "benchmark_data",
      "source": "sector_intelligence.iq_benchmarks (BigQuery)",
      "tool_used": "mcp__bigquery__query",
      "accessed_at": "2026-03-12T10:03:00Z",
      "content_summary": "IQ scores retrieved: overall 49.3, IR 52.1, CSR 44.7. FTSE 100, rank 51/103. Index median 49.2."
    },
    {
      "id": "E-006",
      "type": "document_extraction",
      "url": "https://www.company.com/investors/annual-report-2025.pdf",
      "document_type": "Annual Report",
      "tool_used": "firecrawl_scrape",
      "accessed_at": "2026-03-12T10:20:00Z",
      "pages_extracted": 40,
      "total_pages": 196,
      "extraction": "partial",
      "content_summary": "Chair and CEO statements, strategy section, FY25 KPIs. Strategy priorities: operational excellence, market expansion, digital transformation."
    }
  ],
  "documents_pending_extraction": [
    {
      "url": "https://www.company.com/investors/cmd-2025.pdf",
      "document_type": "Capital Markets Day presentation",
      "estimated_pages": 85,
      "status": "awaiting_consultant_confirmation"
    }
  ],
  "evidence_gaps": [
    "Capital Markets Day deck not yet extracted — awaiting consultant approval",
    "Governance sub-pages not fetched — out of scope for IR focus"
  ],
  "material_events": [
    {
      "event_type": "CFO appointment or departure",
      "date": "2026-01-15",
      "source_url": "https://www.company.com/news/cfo-appointment-2026",
      "relevance": "New CFO Sarah Chen appointed. Previous CFO material in any IR content referencing leadership. Website may not yet reflect this change."
    }
  ]
}
```

---

## Output files

- `{company}-ms-brief-evidence.json` — complete evidence manifest

---

## Handoff to downstream skills

The evidence manifest is the primary input to:
- `ms-crawl` — uses `site_map` evidence and `domain` to run the five-pass site discovery
- `ms-findings` — uses all evidence items to construct claims and produce strategic synthesis

`ms-crawl` and `ms-findings` read the evidence manifest, not markdown output. Do not pass markdown between stages.

---

## What not to include

The evidence manifest must not contain:
- Synthesised findings or recommendations
- Archetype scores or classifications
- Claims about what the evidence "means"
- Share price data, analyst opinions, or valuation commentary
- Content from regional/country subdomains (unless explicitly in scope)
- Any assertion of universal absence (see `NEGATIVE_VERIFICATION_CONCEPTS.md`)

If you find yourself writing a finding or recommendation, stop. That belongs in `ms-findings`. This skill collects. It does not reason.
