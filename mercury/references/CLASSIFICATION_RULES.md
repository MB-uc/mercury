# CLASSIFICATION_RULES.md
# Mercury Strategy — URL and content classification rules
# Version 0.1 | March 2026

---

## Purpose

This file defines the classification rules the ms-crawl skill applies
to raw URLs and page content to produce the structured section inventory
in the evidence manifest.

Classification is the bridge between raw crawl data and the archetype
matching logic in ms-findings. If classification is wrong, archetype
confidence scores will be wrong. The rules below are deterministic —
the skill applies them in the defined order without interpretation.

---

## URL classification — priority order

URLs are classified by applying rules in strict priority order. The
first rule that matches wins. Do not continue checking lower-priority
rules once a match is found.

### Priority 1 — Exact path match

Check whether the URL path exactly matches a known canonical path.
These are high-confidence classifications with no ambiguity.

| Canonical path | Section key |
|---------------|-------------|
| `/` | `homepage` |
| `/en` | `homepage` |
| `/en/` | `homepage` |
| `/home` | `homepage` |
| `/investors` | `investor_relations` |
| `/investor-relations` | `investor_relations` |
| `/sustainability` | `esg_sustainability` |
| `/esg` | `esg_sustainability` |
| `/careers` | `careers` |
| `/governance` | `governance` |
| `/corporate-governance` | `governance` |
| `/news` | `news_media` |
| `/newsroom` | `news_media` |
| `/about` | `about` |
| `/about-us` | `about` |
| `/contact` | `contact` |
| `/contact-us` | `contact` |

---

### Priority 2 — Path segment match

Check whether the first meaningful path segment (after stripping
locale prefixes) matches a known section pattern. Match is
case-insensitive.

**Locale prefix stripping:** Remove leading locale segments before
matching. Common prefixes to strip: `/en/`, `/en-gb/`, `/en-us/`,
`/global/`, `/corporate/`, `/www/`.

Examples:
- `/en-gb/investors/results` → strip `/en-gb/` → classify on `/investors/`
- `/corporate/sustainability/climate` → strip `/corporate/` → classify on `/sustainability/`

**Path segment patterns:**

| First path segment contains | Section key |
|----------------------------|-------------|
| `about`, `who-we-are`, `our-company`, `our-story` | `about` |
| `strategy`, `our-strategy`, `strategic` | `strategy` |
| `purpose`, `vision`, `mission` | `strategy` |
| `business-model`, `value-creation`, `how-we-work` | `strategy` |
| `leadership`, `our-leadership`, `management-team` | `leadership` |
| `board`, `directors`, `executive-committee` | `leadership` |
| `investor`, `investors`, `shareholder`, `ir` | `investor_relations` |
| `financial-information`, `financial-results` | `investor_relations` |
| `results`, `earnings`, `half-year`, `full-year` | `financial_results` |
| `annual-report`, `annual-review`, `integrated-report` | `annual_report` |
| `governance`, `corporate-governance` | `governance` |
| `committees`, `remuneration`, `audit-committee` | `governance` |
| `agm`, `annual-general-meeting` | `governance` |
| `sustainability`, `esg`, `responsibility`, `csr` | `esg_sustainability` |
| `environment`, `climate`, `net-zero`, `carbon` | `esg_sustainability` |
| `responsible-ai`, `ai-ethics`, `ai-principles` | `responsible_ai` |
| `careers`, `jobs`, `vacancies`, `opportunities` | `careers` |
| `work-with-us`, `join-us`, `join-our-team` | `careers` |
| `why-work`, `life-at`, `working-at`, `our-culture` | `employer_brand` |
| `our-people`, `people` (careers context) | `employer_brand` |
| `products`, `services`, `solutions`, `capabilities` | `products_services` |
| `what-we-do`, `our-business`, `our-services` | `products_services` |
| `brands`, `portfolio`, `our-brands` | `brands_portfolio` |
| `case-studies`, `case-study`, `success-stories` | `case_studies` |
| `client-stories`, `references`, `projects` | `case_studies` |
| `news`, `newsroom`, `media`, `press`, `press-room` | `news_media` |
| `media-centre`, `media-center` | `news_media` |
| `insights`, `perspectives`, `thought-leadership` | `insights` |
| `research`, `articles`, `blog`, `views`, `opinion` | `insights` |
| `contact`, `get-in-touch`, `enquire`, `enquiries` | `contact` |
| `investment-case`, `why-invest`, `equity-story` | `investment_case` |
| `investor-proposition`, `investment-proposition` | `investment_case` |
| `reports`, `publications`, `library`, `downloads` | `reports_library` |
| `document-library`, `resource-centre` | `reports_library` |
| `privacy`, `data-protection` | `legal_compliance` |
| `cookies`, `cookie-policy` | `legal_compliance` |
| `terms`, `conditions-of-use`, `legal` | `legal_compliance` |
| `accessibility` | `legal_compliance` |
| `modern-slavery`, `human-trafficking` | `legal_compliance` |
| `tax-strategy`, `gender-pay` | `legal_compliance` |
| `sitemap` | `technical` |
| `search` | `technical` |
| `404`, `error` | `technical` |

---

### Priority 3 — Deep path match

If the first segment did not match, check subsequent path segments.
This catches pages nested under non-standard parent sections.

Examples:
- `/our-company/governance` → matches `governance` in second segment
- `/about/our-board` → matches `board` in second segment
- `/company/investor-relations` → matches `investor` in second segment

Apply the same segment patterns from Priority 2 to each subsequent
path segment in turn. Return the first match found.

---

### Priority 4 — File extension classification

If no path segment match is found, classify by file extension:

| Extension | Classification |
|-----------|---------------|
| `.pdf` | `document` |
| `.xlsx`, `.xls`, `.csv` | `data_download` |
| `.pptx`, `.ppt` | `presentation` |
| `.docx`, `.doc` | `document` |
| `.mp4`, `.webm`, `.mov` | `video` |
| `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp` | `image` |
| `.xml` | `technical` |
| `.json` | `technical` |

---

### Priority 5 — Unclassified

If no rule above produces a match, classify as `unclassified`.
Unclassified URLs are included in the evidence manifest but do not
contribute to section classification counts or archetype evidence.

---

## Document sub-classification

URLs classified as `document` (Priority 4) are additionally
sub-classified by filename pattern to identify key document types:

| Document type | Filename patterns |
|--------------|------------------|
| `annual_report` | annual-report, annual-review, ar-20, integrated-report |
| `sustainability_report` | sustainability-report, esg-report, responsibility-report, cr-report |
| `climate_report` | tcfd, climate-report, climate-disclosure, net-zero-report |
| `esg_data_pack` | esg-data, sustainability-data, kpi-data, esg-appendix |
| `results_presentation` | results-presentation, interim-results, full-year-results, half-year |
| `annual_report_presentation` | annual-report-presentation, fy-presentation |
| `proxy_report` | proxy, notice-of-agm, agm-notice |
| `governance_report` | governance-report, directors-report, corporate-governance |
| `modern_slavery_statement` | modern-slavery, mss- |
| `gender_pay_report` | gender-pay, gpg- |
| `investor_presentation` | investor-presentation, cmd, capital-markets-day, investor-day |

---

## Content classification — page type assignment

After a page is scraped, assign it a Playbook page type based on
content signals. This is used to map scraped content to the correct
Playbook evaluation criteria in the evidence manifest.

Page type assignment uses the following signals in priority order:

### Signal 1 — URL section key (primary)

Use the section key from URL classification as the primary signal
for page type:

| Section key | Default Playbook page type |
|-------------|---------------------------|
| `homepage` | Homepage |
| `investor_relations` | IR landing page |
| `investment_case` | Investment case |
| `financial_results` | Results page |
| `annual_report` | Annual report page |
| `governance` | Corporate governance |
| `esg_sustainability` | Sustainability strategy page |
| `careers` | Careers hub |
| `news_media` | Newsroom / media centre |
| `about` | At a glance |
| `strategy` | Strategy page |
| `leadership` | Corporate governance (leadership sub-section) |
| `reports_library` | Sustainability reporting centre |

### Signal 2 — Page title (secondary)

If URL classification is ambiguous (e.g. `/our-company/` could be
About or Strategy), use the scraped page title to disambiguate:

| Title contains | Playbook page type |
|---------------|-------------------|
| "investment case", "why invest", "equity story" | Investment case |
| "results", "earnings", "interim", "full year" | Results page |
| "annual report", "annual review", "integrated report" | Annual report page |
| "governance", "board of directors", "committees" | Corporate governance |
| "sustainability strategy", "our approach to sustainability" | Sustainability strategy page |
| "reporting", "TCFD", "GRI", "sustainability data" | Sustainability reporting centre |
| "strategy", "strategic priorities", "our strategy" | Strategy page |
| "careers", "jobs", "work with us", "join us" | Careers hub |
| "investment case", "why invest" | Investment case |
| "at a glance", "key facts", "facts and figures" | At a glance |
| "leadership", "management team", "executive committee" | Corporate governance |

### Signal 3 — Content keywords (fallback)

If title is absent or generic, scan the first 500 words of scraped
content for discriminating keywords:

| Keywords present | Likely page type |
|-----------------|-----------------|
| "share price", "ticker", "stock", "RNS", "regulatory news" | IR landing page |
| "investment case", "investment proposition", "why invest" | Investment case |
| "revenue", "profit", "EPS", "dividend", "results for the" | Results page |
| "annual report", "strategic report", "chairman's statement" | Annual report page |
| "board composition", "non-executive", "committee chair" | Corporate governance |
| "net zero", "scope 1", "scope 2", "GHG", "carbon emissions" | Sustainability strategy page |
| "TCFD", "GRI index", "SASB", "sustainability data pack" | Sustainability reporting centre |
| "strategic priorities", "value creation model", "medium-term targets" | Strategy page |
| "graduate programme", "early careers", "apprenticeship" | Careers hub |
| "press release", "media contact", "spokesperson" | Newsroom / media centre |

---

## Presence quality classification

When a page is found and scraped, classify the quality of its content
using the following scale. This feeds into the negative verification
qualified-presence system.

| Quality level | Criteria | Evidence manifest value |
|--------------|----------|------------------------|
| Full | 400+ words, structured headings, on-page content addresses the concept | `present` |
| Thin | Page exists but fewer than 200 words, or content is generic boilerplate | `present_thin` |
| Stale | Page exists but content has not been updated in 18+ months (check dates, copyright year, or referenced events) | `present_stale` |
| Documents only | Page exists but consists only of PDF download links with no on-page narrative content | `present_documents_only` |
| External | Concept is served via an external platform (e.g. careers via ATS, IR via portal) | `present_external` |
| Generic | Page exists but is not configured for the specific audience or purpose expected | `present_generic` |

Staleness signals to look for:
- Copyright year in footer is two or more years old
- Most recent news or results reference is 18+ months old
- Strategy content references a CEO or brand positioning that has
  since changed
- Financial targets have been superseded by new guidance

---

## URL exclusion rules

The following URL types should be excluded from the section inventory
and not counted in pages_discovered:

| Exclusion type | Patterns |
|---------------|----------|
| Pagination variants | `?page=`, `?p=`, `/page/2`, `#page-2` |
| Locale duplicates | Same path under multiple locale prefixes (keep one, exclude rest) |
| Print versions | `/print/`, `?print=true`, `?format=print` |
| Feed URLs | `/feed`, `/rss`, `/atom`, `.rss`, `.atom` |
| Tracking parameters | `?utm_`, `?ref=`, `?source=` (strip params, deduplicate) |
| Internal search results | `/search?`, `?q=`, `?query=` |
| Login / account pages | `/login`, `/account`, `/my-`, `/sign-in` |
| Admin / CMS pages | `/admin`, `/wp-admin`, `/cms`, `/editor` |
| API endpoints | `/api/`, `/.json`, `/_next/`, `/_nuxt/` |
| Asset URLs | `/assets/`, `/static/`, `/dist/`, `/build/` |
| Image variants | `-small.`, `-medium.`, `-large.`, `-thumbnail.` |

---

## Ambiguous URL handling

Some URLs are genuinely ambiguous and cannot be reliably classified
from path alone. Record these as `ambiguous` with a note, and
resolve during content scraping using the content classification
signals above.

Common ambiguous patterns:

| Pattern | Ambiguity | Resolution |
|---------|-----------|------------|
| `/our-company/` | Could be About, Strategy, or IR landing | Resolve by page title / content |
| `/people/` | Could be Leadership or Employer brand | Resolve by page title / content |
| `/performance/` | Could be Financial results or Sustainability KPIs | Resolve by page title / content |
| `/reports/` | Could be Financial reports or Sustainability reports | Resolve by page title / sibling links |
| `/responsibility/` | Could be ESG strategy or Policies | Resolve by page title / content |
| `/resources/` | Could be Reports library or Insights | Resolve by content type (PDFs vs articles) |

---

## Classification confidence

Every classified URL is assigned a classification confidence level
based on which priority rule matched:

| Rule that matched | Confidence |
|------------------|------------|
| Priority 1 — Exact path | High |
| Priority 2 — First segment | High |
| Priority 3 — Deep segment | Medium |
| Priority 4 — File extension | High (for document type) |
| Resolved from ambiguous | Medium |
| Priority 5 — Unclassified | None |

Medium-confidence classifications are flagged in the evidence manifest.
The ms-findings skill treats Medium-confidence section classifications
with appropriate caution when making claims about section presence or
absence.

---

## Classification output in evidence manifest

The classification output is recorded per URL in the section_inventory:

```json
{
  "url": "https://www.example.com/investors/investment-case",
  "section_key": "investment_case",
  "playbook_page_type": "Investment case",
  "classification_rule": "priority_2_segment",
  "classification_confidence": "high",
  "presence_quality": "present",
  "word_count": 842,
  "page_title": "Investment case | Example plc"
}
```
