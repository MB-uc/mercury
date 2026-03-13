---
name: ms-brief
description: "Mercury Strategy collection stage 1 — company identity, benchmark check, situational awareness, and website inventory. Use when the consultant runs /ms-brief. This stage collects only. It produces no findings, no evaluations, and no recommendations."
---

# ms-brief — Mercury Strategy briefing stage

Collection stage 1 of 3. Produces a structured evidence manifest covering company identity, benchmark data, situational awareness, and a high-level website inventory. No analysis. No findings.

---

## Before you begin

Read this file in full before starting. Then:

1. Confirm the company name and primary domain with the consultant
2. Confirm the scope: full pipeline (brief → crawl → findings) or brief only
3. Do not begin collection until scope is confirmed

---

## Step 1 — Company identity

Establish and record the following. All fields are required before proceeding.

| Field | Source |
|-------|--------|
| Legal name | Company website, regulatory filings |
| Trading name (if different) | Website, news coverage |
| Stock ticker and exchange | IR landing page, Bloomberg, LSE/NYSE |
| Listing status | Listed / private / recently listed / delisted |
| Sector and sub-sector | Company description, SIC code |
| Headquarters | About or contact page |
| Primary domain | Confirmed live URL |
| Subdomains (if any) | Note any careers / IR / sustainability subdomains |
| Geographic scope | Global / regional / single-market |
| Revenue scale (approximate) | Annual report, press coverage — record if available, note if not |

Record in the evidence manifest as `company_identity`.

---

## Step 2 — Benchmark check

### Path A — Company is in the BigQuery benchmark dataset

Query the Connect.IQ benchmark dataset for this company. The dataset covers 747 companies including the FTSE 100, FTSE 250, S&P 500, and Euro STOXX 50.

Run three queries:

**Query 1 — Company scores**
```sql
SELECT company, overall, company_narrative, content_mix, channel_mix,
       optimization, reach, about_us, ir, media, csr, careers,
       reputational_resilience, index_name, dataset_year
FROM sector_intelligence.iq_benchmarks
WHERE LOWER(domain) = LOWER('{domain}')
   OR LOWER(company) LIKE LOWER('%{company}%')
LIMIT 5
```

**Query 2 — Index statistics**
```sql
SELECT
  AVG(overall) AS mean_score,
  APPROX_QUANTILES(overall, 4)[OFFSET(2)] AS median_score,
  APPROX_QUANTILES(overall, 4)[OFFSET(3)] AS p75_score,
  COUNT(*) AS company_count
FROM sector_intelligence.iq_benchmarks
WHERE index_name = '{index_from_query_1}'
```

**Query 3 — Rank within index**
```sql
SELECT company, overall,
  RANK() OVER (ORDER BY overall DESC) AS rank,
  COUNT(*) OVER () AS total
FROM sector_intelligence.iq_benchmarks
WHERE index_name = '{index_from_query_1}'
ORDER BY overall DESC
```

Record in the evidence manifest as `benchmark`:
```json
{
  "overall": 0,
  "index_name": "",
  "sector_median": 0,
  "sector_p75": 0,
  "rank": 0,
  "total_in_index": 0,
  "dataset_year": ""
}
```

### Path B — Company is not in the dataset

Record in the evidence manifest:
```json
{
  "benchmark": {
    "status": "not_in_dataset",
    "note": "Company not found in Connect.IQ benchmark dataset. No comparative scoring available."
  }
}
```

Do not attempt to estimate a score. Do not search for alternative benchmark sources at this stage.

---

## Step 3 — Situational awareness

Gather recent intelligence on the company. Scope: **last six months only**. Do not surface older material unless it is a structural fact (founding date, listing history).

### 3a — Web search

Run web searches covering:
- Recent corporate news and announcements
- Strategy updates or leadership changes
- Financial results or trading statements
- ESG commitments or sustainability announcements
- Brand or positioning changes
- Regulatory matters (if public)

Do not search for: share price, analyst ratings, or market cap data. These are not used in the findings stage.

### 3b — Material events check

Apply `references/MATERIAL_EVENTS_CHECKLIST.md` to the search results. For each event type in the checklist, record:
- Whether the event occurred in the last 12 months
- Date and source URL
- Relevance to the digital estate (e.g. a new CEO often signals an upcoming site refresh; an M&A event may mean IR content is in transition)

Record in the evidence manifest as `situational_awareness`:
```json
{
  "search_date": "",
  "material_events": [],
  "recent_news_summary": "",
  "sources": []
}
```

### 3c — Direct fetch of company news section

Fetch the company's news or newsroom section directly — do not rely on search results alone for recent news. Use `firecrawl_scrape` on the newsroom landing page and note:
- Date of most recent item
- Nature of recent announcements (results, strategy, people, product)
- Publishing cadence (estimated from visible archive)

---

## Step 4 — Site structure discovery

Establish the primary domain's structure using `firecrawl_map`. Check `references/CRAWL_CONFIG.md` for any domain-specific configuration before running the map.

**Default call:**
```
firecrawl_map(url: "{primary_domain}")
```

**If a CRAWL_CONFIG entry exists for this domain**, use the specified parameters instead.

From the map output:
- Count total URLs returned
- Identify top-level sections (from first path segment after locale stripping — see `references/CLASSIFICATION_RULES.md` Priority 2)
- Note subdomains present
- Check `robots.txt` at `{domain}/robots.txt` and record any significant `Disallow` rules

If `firecrawl_map` returns fewer than 10 URLs, the site may be blocking the crawler. Record `firecrawl_map: blocked` and fall back to sitemap.xml.

**Sitemap fallback:**
Fetch `{domain}/sitemap.xml`. If it returns a sitemap index, fetch each child sitemap. Extract `<loc>` URLs and count them.

Record in the evidence manifest as `site_discovery`:
```json
{
  "firecrawl_map_status": "complete | partial | blocked",
  "sitemap_status": "present | present_incomplete | not_found",
  "total_urls_discovered": 0,
  "top_level_sections": [],
  "subdomains_found": [],
  "robots_disallow": []
}
```

---

## Step 5 — Homepage and key section quick audit

Scrape the homepage and four to six key section landing pages. Priority order:
1. Homepage
2. IR or investor relations landing
3. Strategy or about/at-a-glance
4. Sustainability or ESG landing
5. Careers landing
6. Newsroom or media centre

For each page, use `firecrawl_scrape` with `onlyMainContent: true` (or CRAWL_CONFIG override if applicable).

Apply URL classification from `references/CLASSIFICATION_RULES.md` to assign each page a `section_key` and `playbook_page_type`.

Apply presence quality classification from `references/CLASSIFICATION_RULES.md` (Presence quality classification section) to each scraped page:

| Quality | Criteria |
|---------|----------|
| `present` | 400+ words, structured headings, content addresses the expected concept |
| `present_thin` | Page exists but fewer than 200 words or generic boilerplate |
| `present_stale` | Content not updated in 18+ months |
| `present_documents_only` | Page consists only of PDF download links |
| `present_external` | Content served via external platform |
| `present_generic` | Page exists but not configured for expected audience or purpose |

Record in the evidence manifest as `section_inventory` — one entry per page:
```json
{
  "url": "",
  "section_key": "",
  "playbook_page_type": "",
  "classification_rule": "priority_1_exact | priority_2_segment | priority_3_deep | ambiguous",
  "classification_confidence": "high | medium",
  "presence_quality": "",
  "word_count": 0,
  "page_title": "",
  "content_summary": ""
}
```

---

## Step 6 — Document inventory

### 6a — Shallow probe

Probe for downloadable documents linked from the pages crawled in Step 5. Look for PDF, PPTX, XLSX links in the scraped content. Do not fetch document contents at this stage — record URLs and apparent document types only.

Classify by document type using `references/CLASSIFICATION_RULES.md` Document sub-classification table:

- Annual report
- Results presentation
- Sustainability report
- ESG data pack
- Investor presentation / CMD deck
- Governance report
- Modern slavery statement
- Gender pay report

**Priority document types** (most valuable for the findings stage):
1. Capital markets day / investor day deck
2. Annual report
3. Results presentation (most recent)
4. ESG / sustainability report

### 6b — Consultant approval gate

Present the document list to the consultant before extracting any documents. Show:
- Document type
- URL
- Approximate file size (if visible from link context)
- Priority (High / Medium / Low)

**Wait for confirmation before proceeding.** The consultant may choose to:
- Extract all documents
- Extract priority documents only
- Skip document extraction entirely

Do not extract document contents without explicit confirmation.

### 6c — Document extraction (if approved)

For approved documents, use `firecrawl_scrape` on the document URL. Record:
- Key claims or strategy statements found
- Financial data points cited
- ESG targets or commitments stated
- Any content that materially affects the situational awareness picture

---

## Step 7 — Peer research

Read `references/PEER_RESEARCH_GUIDE.md` before beginning this step.

### 7a — Peer selection

Propose 4–5 sector peers using the three primary filters from `PEER_RESEARCH_GUIDE.md`:

1. **Sector alignment** — same GICS sector or sub-industry, or sufficiently close that the same investor and stakeholder audiences would evaluate both
2. **Index membership** — same index or one tier adjacent; default to the client's own index
3. **Comparable market capitalisation** — broadly comparable in size (3–5x range acceptable); do not compare a £500m company against a £50bn company

After applying the primary filters, use the secondary considerations to choose between eligible candidates (direct competitive overlap, acknowledged benchmarks, digital maturity contrast, avoid related parties).

Present the proposed peer set to the consultant **before running any research**:

```
Proposed peer set for [Client]:

| Company | Sector | Index | Market cap | Rationale |
|---------|--------|-------|------------|-----------|
| [Name]  | [sector] | [index] | [cap] | [1 sentence] |
...

Confirm this set to proceed, or suggest replacements.
```

**Wait for confirmation.** Do not begin peer research until the peer set is locked.

---

### 7b — Feature matrix pass

For each confirmed peer, run the research scope defined in `PEER_RESEARCH_GUIDE.md`:

**Per peer (credit budget: ~7 credits)**

1. Run `firecrawl_map` on the root domain. Record total URL count and subdomains. Classify sections present using `references/CLASSIFICATION_RULES.md`.

2. Scrape 6–10 targeted pages: homepage, IR landing, sustainability landing, careers landing, newsroom, and any sections relevant to the specific archetypes being investigated (check which archetypes are most likely given the company profile from Step 1).

3. Run the abbreviated document check: annual report, sustainability report, results presentation, TCFD report, and any documents directly relevant to the engagement focus. Do not run the full DOCUMENT_CHECKLIST at this stage — that is the client's domain (ms-crawl).

4. Note any features or capabilities that are notably stronger or weaker than the client.

For each peer, complete the feature matrix using the standard feature set from `PEER_RESEARCH_GUIDE.md` (F01–F39). Record each feature as `present`, `present_thin`, `present_external`, `absent`, or `not_assessed`.

Feature categories:
- **F01–F10** — IR and investor content
- **F11–F18** — Sustainability and ESG
- **F19–F25** — Careers and employer brand
- **F26–F33** — Digital and content capability
- **F34–F39** — Navigation and audience experience

If the total peer research budget would exceed 35 credits, reduce pages scraped per peer rather than reducing peer count. Minimum viable pass per peer: homepage + IR landing + sustainability landing + careers landing (3 targeted pages, ~4 credits).

If a peer site blocks the crawl, record all feature matrix entries as `not_assessed` and note the limitation.

---

### 7c — Connect.IQ integration

Where Connect.IQ benchmark data is available for peers, pull it to supplement the feature matrix:

```sql
SELECT company, overall, ir, csr, careers, media, about_us
FROM sector_intelligence.iq_benchmarks
WHERE LOWER(company) IN ([peer names lower-cased])
AND dataset_year = 2024
```

If Connect.IQ data is not available for a peer (company not in the benchmark universe), note this and rely solely on the feature matrix. Do not estimate IQ scores for peers.

---

### 7d — Compile peer_context block

Record peer research findings in the evidence manifest as `peer_context`:

```json
{
  "peer_context": {
    "confirmed_peers": [
      {
        "name": "",
        "domain": "",
        "index": "",
        "sector": "",
        "market_cap_approx": "",
        "pages_discovered": 0,
        "subdomains": [],
        "iq_scores": {},
        "notable_features": [],
        "notable_absences": [],
        "research_limitations": []
      }
    ],
    "feature_matrix": {
      "client": "",
      "peers": [],
      "research_date": "",
      "features": [
        {
          "feature_id": "F01",
          "category": "",
          "feature": "",
          "client": "present | present_thin | present_external | absent | not_assessed",
          "peers": {},
          "notes": ""
        }
      ]
    },
    "peer_patterns": [
      {
        "pattern": "",
        "client_position": "aligned | ahead | behind | not_assessed"
      }
    ]
  }
}
```

`peer_patterns`: after completing the feature matrix, identify patterns across the peer set — features present across most or all peers, features the client has that peers lack, and gaps shared across the entire peer set. These patterns feed directly into benchmark framing in ms-findings.

---

## Step 8 — Save the evidence manifest

Save the complete evidence manifest as `{company}-ms-brief-evidence.json`.

Manifest structure:
```json
{
  "stage": "ms-brief",
  "company": "",
  "domain": "",
  "collected_at": "",
  "company_identity": {},
  "benchmark": {},
  "situational_awareness": {},
  "site_discovery": {},
  "section_inventory": [],
  "document_inventory": [],
  "document_extraction": [],
  "peer_context": {},
  "evidence_gaps": [],
  "consultant_notes": []
}
```

`evidence_gaps`: record any sections that could not be accessed, pages that returned errors, or data points that could not be confirmed. These are inputs to the ms-findings limitations section.

`consultant_notes`: record any observations that require consultant judgement — ambiguous company structures, recently changed domains, apparent site migrations in progress, etc.

---

## Stage completion

After saving the manifest, show a clean summary to the consultant:

**Show:**
- Company confirmed (name, domain, listing status)
- Benchmark position (or note if not in dataset)
- Top-level sections identified (count and names)
- Material events flagged (if any)
- Documents found (count by type) — and whether extraction is pending, approved, or skipped
- Peer set confirmed and researched (peer names, key feature matrix patterns)
- Evidence gaps (if any)

**Do not show:** raw JSON, criterion observations, findings, or recommendations.

**Offer:**
- Continue to `/ms-crawl` (recommended next step)
- Pause here (manifest is saved — crawl can run later)

If document extraction is still pending consultant approval, surface the document list now and wait for instruction before offering to continue.

---

## What this stage does not do

- Produce findings, evaluations, or recommendations
- Assess the quality of individual pages beyond presence quality classification
- Run the full four-source crawl on the client site (that is ms-crawl's responsibility)
- Run the full DOCUMENT_CHECKLIST against the client site (that is ms-crawl's responsibility)
- Deep-crawl peer sites — peer research is a feature matrix pass only (~7 credits per peer)
- Apply archetype criteria
- Assess audience journeys
