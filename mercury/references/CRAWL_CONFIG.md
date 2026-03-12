# CRAWL_CONFIG.md
# Mercury Strategy — Crawl configuration and methodology
# Version 0.1 | March 2026

---

## Purpose

This file governs how the ms-crawl skill discovers, collects, and
classifies the URLs and content that form the evidence manifest.
It defines the four-source crawl methodology, section classification
rules, SITE_CONFIGS integration, graceful degradation behaviour, and
the crawl_summary output contract.

The ms-crawl skill is a collection agent only. It does not evaluate,
interpret, or generate findings. Everything it produces is factual
observation — raw material for the ms-findings reasoning phase.

---

## Core principle: representative discovery

A partial crawl produces unreliable absence claims. The canonical
failure mode is: crawl a subset of URLs → miss a section → assert
it does not exist → recommendations built on a false gap.

To produce a genuinely representative picture of the site, the crawl
must combine four independent discovery sources and deduplicate across
them. No single source is sufficient on its own:

| Source | What it captures | What it misses |
|--------|-----------------|----------------|
| sitemap.xml | Declared pages — complete if well-maintained | Undeclared pages, orphaned content |
| HTML navigation | Intended structure — what the site presents to users | Deep pages not in nav, archived content |
| firecrawl_map | Full link graph — discovers everything linked | Pagination loops, JS-gated content |
| Pagination loops | Archive depth — news, results, press release history | Content behind login, robots.txt exclusions |

Only after all four sources have been attempted and deduplicated can
the crawl_summary be considered representative.

---

## Four-source crawl procedure

### Source 1 — sitemap.xml

**Goal:** Establish the declared URL inventory.

**Steps:**
1. Fetch `[domain]/sitemap.xml`
2. If it returns a sitemap index, fetch each child sitemap listed
3. Also try `[domain]/sitemap_index.xml` if the first fails
4. Extract all `<loc>` URLs from the sitemap(s)
5. Record total URL count and any sitemap sections (e.g. `news-sitemap.xml`)

**What to note:**
- If sitemap is absent: record `sitemap: not_found` in crawl_summary
- If sitemap is present but sparse (fewer than 30% of URLs found by
  firecrawl_map): record `sitemap: present_incomplete`
- If sitemap is present and comprehensive: record `sitemap: present`

**Graceful degradation:** If sitemap fetch fails or times out, proceed
to Source 2. Do not block on this source.

---

### Source 2 — HTML navigation

**Goal:** Establish the intended site structure as presented to visitors.

**Steps:**
1. Fetch the homepage using `firecrawl_scrape` (check SITE_CONFIGS.md
   first — see SITE_CONFIGS integration section below)
2. Extract all links from the primary navigation — `<nav>`, `<header>`,
   and any element with a nav-related class or role attribute
3. Also extract footer links — these often surface governance, legal,
   and policy pages not in the main nav
4. Record each link as: `{ url, label, nav_position }`
   where `nav_position` is one of: `primary_nav`, `secondary_nav`,
   `footer`, `homepage_body`

**What to note:**
- Navigation depth (single-level vs dropdown/flyout)
- Presence of audience-specific entry points (Investors, Careers, etc.)
- Any external links in nav (e.g. careers on a separate domain)

**Graceful degradation:** If homepage scrape fails, attempt
`firecrawl_map` alone (Source 3) and note the navigation gap.

---

### Source 3 — firecrawl_map

**Goal:** Discover all linked pages — the full reachable URL graph.

**Steps:**
1. Run `firecrawl_map` on the root domain
2. Collect all returned URLs
3. Note total count
4. Identify subdomains present (e.g. `careers.[domain]`,
   `investors.[domain]`) — these require separate handling (see
   Subdomain handling below)

**What to note:**
- Total URLs discovered
- Any sections present in the map but absent from sitemap or nav
  (orphaned content, or recently added pages not yet in sitemap)
- robots.txt restrictions — check `[domain]/robots.txt` and note
  any significant `Disallow` rules that may explain absent sections

**Graceful degradation:** If firecrawl_map times out or returns
fewer than 10 URLs (indicating blocking), record
`firecrawl_map: blocked` and rely on Sources 1, 2, and 4.

---

### Source 4 — Pagination loops

**Goal:** Establish the true depth of archive sections — news,
results, press releases — that appear shallow from the map but
contain significant historical content.

**Steps:**
1. Identify paginated sections from Sources 1–3:
   - News / newsroom / press releases
   - Results archive
   - Reports and publications
2. For each paginated section, follow pagination links up to a
   maximum of 5 pages (to establish depth without exhaustive crawl)
3. Record: section name, total pages estimated, date range of
   content visible (first and last item dates where available)

**What to note:**
- Sections where pagination depth is significantly greater than
  nav structure suggests (e.g. nav shows "News" as a single link
  but archive runs to 40+ pages — indicates active publishing programme)
- Sections where pagination is broken or returns 404 on page 2+
  (indicates content management issues)

**Graceful degradation:** If pagination links are not found or
are JavaScript-rendered, record section depth as `not_assessed`
rather than assuming shallow.

---

### Deduplication and crawl_summary

After all four sources have been attempted, deduplicate the URL
inventory and produce the crawl_summary:

```json
{
  "domain": "[domain]",
  "crawl_date": "[ISO 8601 datetime]",
  "sources": {
    "sitemap": "present | present_incomplete | not_found | blocked",
    "navigation": "extracted | failed",
    "firecrawl_map": "complete | partial | blocked",
    "pagination": "assessed | not_assessed"
  },
  "pages_discovered": N,
  "pages_crawled": N,
  "excluded": N,
  "error_pages": N,
  "subdomains_found": ["careers.domain.com", "..."],
  "robots_disallow": ["...", "..."],
  "coverage_confidence": "high | medium | low"
}
```

**Coverage confidence:**
- `high` — all four sources succeeded, sitemap is comprehensive
- `medium` — 2–3 sources succeeded, or sitemap is incomplete
- `low` — only 1 source succeeded, or firecrawl_map was blocked

Coverage confidence is surfaced in the evidence manifest and informs
how the ms-findings skill interprets absence claims. Low-confidence
crawls should downgrade absence claims to `not_assessed`.

---

## Section classification

After discovery, every URL is classified into a section key. This
classification drives the evidence manifest and the negative
verification checks.

### Classification method

Classification is applied in two passes:

**Pass 1 — URL pattern matching** (primary)
Match the URL path case-insensitively against the patterns below.
Use partial path-segment matching (e.g. `/about-us` matches `about`).
Return the first matching section key.

**Pass 2 — Navigation label matching** (fallback)
If URL matching returns no result, match the nav label text for that
link against the label patterns below.
Return the first matching section key.

If neither pass produces a match, classify as `unclassified`.

### Section classification table

| Section key | URL patterns | Label patterns |
|-------------|-------------|----------------|
| `homepage` | `/`, `/en`, `/en/`, `/home` | — |
| `about` | `/about`, `/who-we-are`, `/our-company`, `/company`, `/at-a-glance`, `/key-facts`, `/our-story` | about, who we are, our company, at a glance |
| `strategy` | `/strategy`, `/our-strategy`, `/strategic-priorities`, `/purpose`, `/vision`, `/business-model`, `/value-creation` | strategy, our strategy, purpose, vision |
| `leadership` | `/leadership`, `/board`, `/management`, `/directors`, `/executive`, `/people`, `/our-leadership` | leadership, board, management, directors, executive team |
| `investor_relations` | `/investors`, `/investor-relations`, `/ir`, `/shareholder`, `/financial-information` | investors, investor relations, shareholders |
| `financial_results` | `/results`, `/earnings`, `/financial-results`, `/reports-and-results`, `/half-year`, `/full-year` | results, earnings, financial results |
| `annual_report` | `/annual-report`, `/annual-review`, `/ar-`, `/integrated-report` | annual report, annual review |
| `governance` | `/governance`, `/corporate-governance`, `/committees`, `/remuneration`, `/agm` | governance, corporate governance |
| `esg_sustainability` | `/sustainability`, `/esg`, `/responsibility`, `/csr`, `/environment`, `/climate`, `/net-zero` | sustainability, ESG, responsibility, environment, climate |
| `responsible_ai` | `/responsible-ai`, `/ai-ethics`, `/ai-principles`, `/technology-ethics` | responsible AI, AI ethics |
| `careers` | `/careers`, `/jobs`, `/work-with-us`, `/join-us`, `/vacancies`, `/join-our-team` | careers, jobs, work with us, join us |
| `employer_brand` | `/why-work`, `/life-at`, `/working-at`, `/our-culture`, `/our-people` | why work here, life at, our culture, our people |
| `products_services` | `/products`, `/services`, `/solutions`, `/what-we-do`, `/our-business`, `/capabilities` | products, services, solutions, what we do |
| `brands_portfolio` | `/brands`, `/portfolio`, `/our-brands` | brands, portfolio, our brands |
| `case_studies` | `/case-studies`, `/case-study`, `/success-stories`, `/client-stories`, `/references` | case studies, success stories, client stories |
| `news_media` | `/news`, `/newsroom`, `/media`, `/press`, `/press-room`, `/media-centre` | news, newsroom, media, press |
| `insights` | `/insights`, `/perspectives`, `/thought-leadership`, `/research`, `/articles`, `/blog` | insights, perspectives, thought leadership, research |
| `contact` | `/contact`, `/contact-us`, `/get-in-touch`, `/enquire` | contact, get in touch, enquire |
| `legal_compliance` | `/privacy`, `/cookies`, `/terms`, `/legal`, `/accessibility`, `/modern-slavery`, `/tax-strategy` | privacy, cookies, terms, legal, accessibility |
| `investment_case` | `/investment-case`, `/why-invest`, `/equity-story`, `/investor-proposition` | investment case, why invest, equity story |
| `reports_library` | `/reports`, `/publications`, `/library`, `/downloads`, `/document-library` | reports, publications, library, downloads |

### Legal page sub-classification

URLs classified as `legal_compliance` are additionally sub-classified:

| Sub-key | Patterns |
|---------|----------|
| `privacy_policy` | privacy, data-protection |
| `cookie_policy` | cookie |
| `terms_of_use` | terms, conditions-of-use |
| `accessibility_statement` | accessib |
| `modern_slavery_statement` | modern-slavery, human-trafficking |
| `tax_strategy` | tax-strategy |
| `gender_pay_gap` | gender-pay |

### Careers platform detection

If a careers link routes to an external domain, detect the platform:

| Platform | URL patterns |
|----------|-------------|
| `workday` | myworkdayjobs.com, wd[N].myworkday |
| `taleo` | taleo.net |
| `greenhouse` | greenhouse.io, boards.greenhouse |
| `lever` | lever.co, jobs.lever |
| `smartrecruiters` | smartrecruiters.com |
| `icims` | icims.com |
| `successfactors` | successfactors.com, jobs.sap.com |

Record as `careers_platform: [platform name]` in the evidence manifest.
This is relevant evidence for A09 (careers site as afterthought) and
A12 (unintegrated multi-system estate) archetype matching.

---

## Subdomain handling

Subdomains are common for careers, investor portals, and sustainability
microsites. They require separate treatment:

1. **Detect** — any URL in the crawl results on a subdomain of the
   root domain (e.g. `careers.rolls-royce.com` for `rolls-royce.com`)
2. **Classify** — apply the same section classification to subdomain
   URLs. A subdomain is typically one of: `careers`, `investor_relations`,
   `esg_sustainability`, `reports_library`
3. **Note design consistency** — record whether the subdomain uses
   visually different design from the main site. This is a signal
   for A09 and A12 archetype matching
4. **Do not deep-crawl** — run `firecrawl_map` on the subdomain root
   only to establish its structure; do not fully inventory it
5. **Record** in crawl_summary as `subdomains_found`

---

## SITE_CONFIGS integration

Before any `firecrawl_scrape` call, check `SITE_CONFIGS.md` for the
target domain. If an entry exists, use the listed `includeTags` or
`excludeTags` instead of the default `onlyMainContent: true`.

**Default scrape call:**
```
firecrawl_scrape(url: "[page_url]", formats: ["markdown"], onlyMainContent: true)
```

**Override scrape call (when SITE_CONFIGS entry exists):**
```
firecrawl_scrape(url: "[page_url]", formats: ["markdown"],
  includeTags: ["[selector]"], onlyMainContent: false)
```

**Oversized scrape detection:**
If a scrape returns more than 60,000 characters, the site likely has
nav bloat. Record this in the evidence manifest and note the affected
URL. Do not pass bloated content to the reasoning phase.

---

## robots.txt handling

Always fetch `[domain]/robots.txt` as part of Source 3. Note any
significant `Disallow` rules. Common patterns and their implications:

| Disallow pattern | Likely implication |
|-----------------|-------------------|
| `/investors/` | IR section excluded from public crawl — may be gated |
| `/governance/` | Governance docs may be restricted |
| `/careers/` | Careers content may be on external ATS only |
| `/sustainability/data/` | ESG data downloads may be gated |
| `/*.pdf` | PDFs not indexed — document discovery will be incomplete |

robots.txt restrictions do not constitute evidence of absence — they
are alternative explanations for missing content that should be noted
in the evidence manifest and surfaced in the appendix.

---

## Content scraping — priority tiers

After discovery and classification, the crawl phase scrapes a
representative sample of pages for content. Not every discovered
URL is scraped — priority tiers govern the scope.

### Tier 1 — Always scrape
Homepage, IR landing, strategy page, sustainability landing,
about/at-a-glance, careers landing, newsroom landing, governance
overview, leadership/board page.

Maximum pages: 10. These are the minimum viable evidence set.

### Tier 2 — Scrape for standard audits
Investment case, results page, annual report page, sustainability
strategy page, one sustainability topic page, one news article
(most recent).

Maximum additional pages: 8.

### Tier 3 — Scrape for deep audits only
Committee pages, sustainability reporting centre, ESG data page,
graduate programme page, employee stories page, CMD/investor day
page, 3–5 additional news articles (to assess publishing cadence).

Maximum additional pages: 12.

Default depth is Tier 1 + Tier 2 unless the consultant has requested
a deep audit via the ms-crawl command.

---

## Negative verification pass

After content scraping, run the negative verification procedure for
all concepts listed in `NEGATIVE_VERIFICATION_CONCEPTS.md`.

The negative verification pass:
1. Checks each concept against the URL inventory from Sources 1–4
2. Runs direct URL probes for concepts not found in the inventory
3. Runs site search fallback for concepts not confirmed by direct probe
4. Records the result for each concept in the evidence manifest

**Rule:** Do not assert absence without completing all three
verification steps. See `NEGATIVE_VERIFICATION_CONCEPTS.md` for
the full procedure and concept list.

---

## Evidence manifest output

The crawl phase produces a single evidence manifest file:
`{company}-crawl-manifest.json`

Structure:

```json
{
  "company": "[name]",
  "domain": "[domain]",
  "crawl_summary": {
    "domain": "[domain]",
    "crawl_date": "[ISO 8601 datetime]",
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
  },
  "section_inventory": {
    "[section_key]": {
      "urls": [],
      "pages_scraped": 0,
      "scraped_content": [
        {
          "url": "...",
          "title": "...",
          "word_count": 0,
          "content_summary": "...",
          "key_observations": []
        }
      ]
    }
  },
  "negative_verification": {
    "[concept]": {
      "status": "present | present_thin | present_stale | present_documents_only | present_external | present_generic | absent | not_assessed",
      "verified_by": "path_match | direct_probe | site_search | not_run",
      "url": "...",
      "notes": "..."
    }
  },
  "subdomains": [],
  "careers_platform": "...",
  "robots_disallow": [],
  "document_checklist": {},
  "evidence_gaps": []
}
```

The evidence manifest is the sole input to the ms-findings reasoning
phase. The reasoning phase must not make tool calls — it reasons
over the manifest only.

---

## Graceful degradation summary

| Condition | Response |
|-----------|----------|
| sitemap.xml absent | Proceed with Sources 2–4; note in crawl_summary |
| Homepage scrape fails | Skip Source 2 nav extraction; note gap |
| firecrawl_map blocked | Rely on sitemap + nav; set coverage_confidence: low |
| Pagination not found | Record section depth as not_assessed |
| robots.txt blocks sections | Note restriction; do not assert absence |
| Scrape returns >60K chars | Flag nav bloat; check SITE_CONFIGS; do not pass to reasoning phase |
| Subdomain blocks crawl | Note subdomain presence; record structure as not_assessed |
| All sources partially fail | Produce manifest with available evidence; set coverage_confidence: low; surface as evidence gap in findings |

The crawl phase never fails silently. Every degradation is recorded
in the crawl_summary and surfaced as an evidence gap.
