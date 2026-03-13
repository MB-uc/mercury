---
name: ms-crawl
description: "Mercury Strategy collection stage 2 — four-source site discovery, section classification, content scraping, negative verification, and site structure output. Use when the consultant runs /ms-crawl. This stage collects only. It produces no findings, no evaluations, and no recommendations."
---

# ms-crawl — Mercury Strategy site discovery stage

Collection stage 2 of 3. Executes the four-source crawl methodology defined in `references/CRAWL_CONFIG.md`, classifies all discovered URLs using `references/CLASSIFICATION_RULES.md`, scrapes a representative page sample, runs negative verification for all concepts in `references/NEGATIVE_VERIFICATION_CONCEPTS.md`, and outputs a structured evidence manifest and an HTML directory tree site structure file.

---

## Before you begin

1. Confirm `{company}-ms-brief-evidence.json` exists. If it does not, surface a clear message and prompt the consultant to run `/ms-brief` first. Do not silently trigger it.
2. Load the brief manifest and note: primary domain, subdomains found, `firecrawl_map` status from Step 4 of ms-brief, and any CRAWL_CONFIG entries for this domain.
3. Read `references/CRAWL_CONFIG.md` in full before making any scrape calls.

---

## Core principle

A partial crawl produces unreliable absence claims. Every URL classification must be supported by at least one of the four discovery sources below. No absence claim may be asserted unless it has passed the three-step negative verification procedure in `references/NEGATIVE_VERIFICATION_CONCEPTS.md`.

---

## Source 1 — sitemap.xml

**Goal:** Establish the declared URL inventory.

1. Fetch `{domain}/sitemap.xml`
2. If it returns a sitemap index, fetch each child sitemap
3. Also try `{domain}/sitemap_index.xml` if the first fetch fails or returns 404
4. Extract all `<loc>` URLs
5. Count total and note any dedicated sitemaps (e.g. `news-sitemap.xml`)

**Record in `crawl_summary.sources.sitemap`:**
- `present` — sitemap exists and is comprehensive (covers 70%+ of URLs found by firecrawl_map)
- `present_incomplete` — sitemap exists but sparse relative to firecrawl_map results
- `not_found` — no sitemap returned
- `blocked` — fetch timed out or returned non-200

If sitemap fails, proceed to Source 2. Do not block.

---

## Source 2 — HTML navigation

**Goal:** Establish the intended site structure as presented to visitors.

1. Fetch the homepage using `firecrawl_scrape` (check CRAWL_CONFIG first)
2. Extract all links from: `<nav>`, `<header>`, and elements with nav-related class or role attributes
3. Also extract footer links (often surfaces governance, legal, policy pages not in main nav)
4. For each link record: `{ url, label, nav_position }` where `nav_position` is `primary_nav`, `secondary_nav`, `footer`, or `homepage_body`

**Note:**
- Navigation depth (single-level vs dropdown)
- Whether audience-specific entry points are present (Investors, Careers etc.)
- Any external links in nav (careers on a separate domain is evidence for A09/A12 archetypes)

If homepage scrape fails, proceed with Sources 1, 3, and 4 and note the gap.

---

## Source 3 — firecrawl_map

**Goal:** Discover all linked pages — the full reachable URL graph.

If ms-brief Step 4 already ran `firecrawl_map` and returned a complete result, use that output — do not re-run unnecessarily. If it returned `blocked` or `partial`, attempt again.

1. Run `firecrawl_map` on the root domain
2. Collect all returned URLs
3. Note total count
4. Identify subdomains present
5. Fetch `{domain}/robots.txt` and note any significant `Disallow` rules

**Record in `crawl_summary.sources.firecrawl_map`:**
- `complete` — returned 10+ URLs with no error indicators
- `partial` — returned some URLs but appears incomplete
- `blocked` — returned fewer than 10 URLs or timed out

If blocked, record and rely on Sources 1, 2, and 4.

---

## Source 4 — Pagination loops

**Goal:** Establish the true depth of archive sections.

From the URL inventory from Sources 1–3, identify paginated sections:
- News / newsroom / press releases
- Results archive
- Reports and publications

For each paginated section, follow pagination links up to a maximum of 5 pages. Record:
- Section name
- Total pages estimated
- Date range of visible content (first and last item dates)

If pagination links are not found or are JavaScript-rendered, record `not_assessed` — do not assume the section is shallow.

---

## Deduplication and crawl_summary

After all four sources, deduplicate the URL inventory (strip tracking parameters, remove pagination variants per `references/CRAWL_CONFIG.md` URL exclusion rules) and compile:

```json
{
  "domain": "",
  "crawl_date": "",
  "sources": {
    "sitemap": "present | present_incomplete | not_found | blocked",
    "navigation": "extracted | failed",
    "firecrawl_map": "complete | partial | blocked",
    "pagination": "assessed | not_assessed"
  },
  "pages_discovered": 0,
  "pages_crawled": 0,
  "excluded": 0,
  "error_pages": 0,
  "subdomains_found": [],
  "robots_disallow": [],
  "coverage_confidence": "high | medium | low"
}
```

**Coverage confidence:**
- `high` — all four sources succeeded, sitemap is comprehensive
- `medium` — 2–3 sources succeeded, or sitemap is incomplete
- `low` — only 1 source succeeded, or firecrawl_map was blocked

Low coverage confidence downgrades all absence claims to `not_assessed` in the evidence manifest.

---

## URL classification

Classify every discovered URL using `references/CLASSIFICATION_RULES.md` in strict priority order:

1. **Priority 1** — Exact path match (high confidence)
2. **Priority 2** — First path segment match after locale stripping (high confidence)
3. **Priority 3** — Deep segment match (medium confidence)
4. **Priority 4** — File extension (high confidence for document type)
5. **Priority 5** — Unclassified

For ambiguous URLs (see `references/CLASSIFICATION_RULES.md` Ambiguous URL handling), record as `ambiguous` and resolve during content scraping using page title and content signals.

Apply document sub-classification to all URLs classified as `document` type.

Apply careers platform detection (Workday, Taleo, Greenhouse etc.) if a careers link routes to an external domain.

---

## Content scraping — priority tiers

After classification, scrape a representative sample. Use `firecrawl_scrape` with `onlyMainContent: true` unless CRAWL_CONFIG specifies an override.

If a scrape returns more than 60,000 characters, flag as nav bloat. Check CRAWL_CONFIG for a selector override. Do not pass bloated content to the evidence manifest.

### Tier 1 — Always scrape (maximum 10 pages)

Homepage, IR landing, strategy page, sustainability landing, about/at-a-glance, careers landing, newsroom landing, governance overview, leadership/board page.

### Tier 2 — Standard audit (maximum 8 additional pages)

Investment case, results page, annual report page, sustainability strategy page, one sustainability topic page, most recent news article.

### Tier 3 — Deep audit only (maximum 12 additional pages)

Committee pages, sustainability reporting centre, ESG data page, graduate programme page, employee stories page, CMD/investor day page, 3–5 additional news articles.

**Default depth is Tier 1 + Tier 2** unless the consultant has requested a deep audit.

For each scraped page, apply presence quality classification from `references/CLASSIFICATION_RULES.md`:

| Quality | Criteria |
|---------|----------|
| `present` | 400+ words, structured headings, content addresses the concept |
| `present_thin` | Fewer than 200 words or generic boilerplate |
| `present_stale` | Not updated in 18+ months (check dates, copyright year, referenced events) |
| `present_documents_only` | Only PDF download links, no on-page narrative |
| `present_external` | Served via external platform |
| `present_generic` | Not configured for the expected audience or purpose |

Record staleness signals checked: copyright year, most recent results reference, CEO name currency, financial target currency.

---

## Document checklist

Read `references/DOCUMENT_CHECKLIST.md` before running this step.

The checklist covers 130 document types across financial reporting, investor communications, sustainability, corporate communications, governance, and more. Each item is tagged with a skill assignment — check only items tagged **WR** (website-research) or **BOTH**.

**Priority pass — always run (regardless of audit depth):**

Check for the following WR/BOTH items from the document inventory found during scraping. These are the highest-value documents for the findings stage:

| # | Document | Where to look |
|---|----------|---------------|
| 1 | Annual report and accounts | IR section, PDF links |
| 3 | Prelims presentation slides | IR section, results page |
| 6 | Half-year / interim results | IR section |
| 7 | Half-year presentation slides | IR section |
| 11 | Capital markets day presentation | IR section, events |
| 13 | Investor day materials | IR section |
| 14 | Strategy update presentation | Strategy / IR section |
| 17 | Investor factsheet / factbook | IR section |
| 19 | AGM presentation | Governance / IR section |
| 32 | Sustainability report / ESG report | Sustainability section, PDF links |
| 33 | TCFD report | Sustainability section |
| 35 | Net zero transition plan | Sustainability section |
| 36 | Modern slavery statement | Footer, governance, sustainability |
| 37 | Gender pay gap report | Careers, governance section |

For each item, record:
```json
{
  "item_id": 1,
  "document": "Annual report and accounts",
  "status": "present | present_partial | absent | not_assessed",
  "url": "",
  "notes": ""
}
```

**Extended pass — run for Tier 2 and Tier 3 audits:**

Check all remaining WR and BOTH items from DOCUMENT_CHECKLIST.md (items tagged CR are not assessed at this stage — those are company-research scope). Record all checked items in the document_checklist section of the manifest.

Do not extract document contents in this stage — record presence and URL only. Document extraction is ms-brief's responsibility with consultant approval.

---

## Negative verification

After scraping, run the negative verification procedure for every concept in `references/NEGATIVE_VERIFICATION_CONCEPTS.md`.

For each concept, follow the three-step procedure in that file:

1. **Step 1** — Path matching against the deduplicated URL inventory
2. **Step 2** — Direct URL probe (top three candidate paths from the concept's path variants list)
3. **Step 3** — Site search fallback using the concept's listed search query

Only after all three steps fail may the concept be recorded as `absent`.

Record each concept result in the evidence manifest:
```json
{
  "concept": "",
  "status": "present | present_thin | present_stale | present_documents_only | present_external | present_generic | absent | not_assessed",
  "verified_by": "path_match | direct_probe | site_search | not_run",
  "url": "",
  "checked_paths": [],
  "search_query": "",
  "notes": ""
}
```

If coverage confidence is `low`, record all concepts as `not_assessed` rather than `absent` — insufficient coverage means absence cannot be confirmed.

---

## Site structure output

After completing the crawl, build two outputs from the classified URL inventory and scraped content.

### Evidence manifest section — section_inventory

Record the classified section inventory in the evidence manifest. For each section key, record:
```json
{
  "section_key": "",
  "urls_discovered": 0,
  "pages_scraped": 0,
  "presence_quality": "",
  "scraped_pages": [
    {
      "url": "",
      "page_title": "",
      "section_key": "",
      "playbook_page_type": "",
      "classification_rule": "",
      "classification_confidence": "high | medium",
      "presence_quality": "",
      "word_count": 0,
      "content_summary": "",
      "key_observations": [],
      "documents_linked": [],
      "staleness_signals": []
    }
  ]
}
```

### Site structure file — hierarchical tree

Build a nested tree representing the site's confirmed structure. Save as `{company}-ms-crawl-structure.json`.

This file is consumed by the HTML and Excel renderers. Shape:

```json
{
  "name": "root",
  "label": "{domain}",
  "children": [
    {
      "name": "{section_key}",
      "label": "{display name — e.g. 'Investors'}",
      "url": "{section landing page URL}",
      "description": "{one-sentence content summary}",
      "presence_quality": "present | present_thin | present_stale | ...",
      "word_count": 0,
      "children": [
        {
          "name": "{sub-section key}",
          "label": "{display name}",
          "url": "{URL}",
          "description": "",
          "presence_quality": "",
          "word_count": 0
        }
      ]
    }
  ]
}
```

**Display names** — use plain English labels, not snake_case keys:

| section_key | label |
|-------------|-------|
| `homepage` | Home |
| `investor_relations` | Investors |
| `investment_case` | Investment case |
| `financial_results` | Results |
| `annual_report` | Annual report |
| `governance` | Governance |
| `esg_sustainability` | Sustainability |
| `responsible_ai` | Responsible AI |
| `careers` | Careers |
| `employer_brand` | Life at [Company] |
| `news_media` | Newsroom |
| `about` | About |
| `strategy` | Strategy |
| `leadership` | Leadership |
| `contact` | Contact |

Include only sections with `presence_quality` that is not `absent`. Absent sections are recorded in the evidence manifest's negative verification results — they do not appear as nodes in the site structure tree.

Include sub-pages as children where they were discovered and scraped. Leaf nodes with no children omit the `children` field.

---

## Save outputs

Save both files on completion:

1. `{company}-ms-crawl-manifest.json` — complete evidence manifest (structure below)
2. `{company}-ms-crawl-structure.json` — hierarchical site tree

**Evidence manifest structure:**
```json
{
  "stage": "ms-crawl",
  "company": "",
  "domain": "",
  "crawled_at": "",
  "crawl_summary": {},
  "section_inventory": {},
  "negative_verification": {},
  "subdomains": [],
  "careers_platform": "",
  "document_checklist": {
    "priority_pass_complete": true,
    "extended_pass_complete": false,
    "items_checked": 0,
    "items": []
  },
  "evidence_gaps": []
}
```

`evidence_gaps`: record every condition where data could not be collected — blocked pages, robots.txt exclusions, JavaScript-rendered content, timeouts. These feed directly into the ms-findings limitations section.

---

## Subdomain handling

If subdomains are found (e.g. `careers.{domain}`, `investors.{domain}`):

1. Apply section classification to the subdomain root URL
2. Run `firecrawl_map` on the subdomain root only — do not deep-crawl it
3. Note whether the subdomain uses visually different design from the main site (evidence for A09 and A12 archetype matching)
4. Record under `crawl_summary.subdomains_found`

---

## Graceful degradation

| Condition | Response |
|-----------|----------|
| sitemap.xml absent | Proceed with Sources 2–4; note in crawl_summary |
| Homepage scrape fails | Skip Source 2 nav extraction; note gap |
| firecrawl_map blocked | Rely on sitemap + nav; set `coverage_confidence: low` |
| Pagination not found | Record section depth as `not_assessed` |
| robots.txt blocks sections | Note restriction; do not assert absence |
| Scrape returns >60K chars | Flag nav bloat; check CRAWL_CONFIG; do not pass to reasoning phase |
| Subdomain blocks crawl | Note subdomain presence; record structure as `not_assessed` |
| All sources partially fail | Produce manifest with available evidence; set `coverage_confidence: low`; surface in evidence_gaps |

The crawl never fails silently. Every degradation is recorded in `crawl_summary` and surfaced as an evidence gap.

---

## Stage completion

After saving both output files, show a clean summary:

**Show:**
- Pages discovered (total) and pages scraped (by tier)
- Sections confirmed present (list section labels and presence quality)
- Concepts confirmed absent (from negative verification)
- Evidence gaps (blocked pages, robots restrictions, low coverage areas)
- Subdomains found (if any)
- Coverage confidence level

**Do not show:** raw JSON, criterion observations, findings, or recommendations.

**Offer:**
- Continue to `/ms-findings`
- Pause here (both files are saved — findings can run later)

---

## What this stage does not do

- Produce findings, evaluations, or strategic implications
- Assert absence without completing all three negative verification steps
- Deep-crawl subdomains
- Extract document contents (that is ms-brief's responsibility, with consultant approval)
- Make tool calls after the evidence manifest is saved
