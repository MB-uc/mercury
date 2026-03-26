# Mercury Strategy — Process, Connectors, and Deliverables

## Pipeline overview

```
Stage 1: ms-brief          Stage 2: ms-crawl           Stage 3: ms-findings
(Collection)                (Discovery)                 (Synthesis)

Company identity            Four-source URL collection  Archetype matching (A01-A13)
Benchmark check             Content scraping (3 tiers)  Audience tier assessment
Situational awareness       Document checklist (130)     Peer calibration
Site discovery              Negative verification       Claim construction
Document inventory          Site structure tree          Strategic findings
Peer research (F01-F39)     Coverage confidence          Strategic implications

Output:                     Output:                     Output:
{co}-ms-brief-evidence.json {co}-ms-crawl-manifest.json {co}-ms-findings-artefact.json
                            {co}-ms-crawl-structure.json {co}-ms-findings.md
```

---

## Connectors and tools

### MCP servers (remote, configured in `.mcp.json`)

| Connector | Endpoint | Used by |
|-----------|----------|---------|
| **Firecrawl** | `https://mcp.firecrawl.dev/v2/mcp` | ms-brief, ms-crawl |
| **BigQuery** (Google Toolbox) | `https://toolbox-56285826751.us-central1.run.app/mcp` | ms-brief, ms-crawl, ms-findings |

### Tool usage by stage

| Tool | ms-brief | ms-crawl | ms-findings |
|------|----------|----------|-------------|
| `web_search` | Company identity, news, situational awareness | - | - |
| `web_fetch` | Document retrieval, news articles | - | - |
| `firecrawl_map` | Site discovery (URL inventory) | Source 3: full site map | - |
| `firecrawl_scrape` | Homepage + key section pages | Tier 1-3 content scraping | - |
| `firecrawl_search` | Peer research | - | - |
| `mcp__bigquery__run_query` | Benchmark lookup (iq_benchmarks) | Persist crawl data (optional) | Persist findings to 4 tables (optional) |

### BigQuery tables (project: `diageo-rep-247`, dataset: `sector_intelligence`, region: US)

| Table | Purpose | Written by |
|-------|---------|------------|
| `iq_benchmarks` | 4,863 companies, Connect.IQ scores (dataset_year=2025) | Pre-loaded |
| `ms_analyses` | One row per engagement | ms-brief (insert), ms-crawl (update), ms-findings (insert) |
| `ms_findings` | One row per finding | ms-findings |
| `ms_gaps` | One row per gap | ms-findings |
| `ms_claims` | One row per claim | ms-findings |

### Key constraints

- **ms-findings makes zero tool calls after evidence loading.** All reasoning operates over evidence already in the context window.
- **BigQuery persistence is best-effort.** If the connector is unavailable, the JSON artefact is the primary output.
- **Firecrawl credit budget:** ms-brief ~15 credits (client) + ~7 per peer. ms-crawl ~30-40 credits total.

---

## Stage detail

### Stage 1 — ms-brief (Collection)

**Command:** `/ms-brief <company>`

| Step | What happens | Tools used |
|------|-------------|-----------|
| 1. Company identity | Legal name, ticker, HQ, CEO, revenue, employees | `web_search` |
| 2. Benchmark check | Query Connect.IQ for company scores + index statistics | `mcp__bigquery__run_query` |
| 3. Situational awareness | Last 6 months: M&A, leadership changes, regulatory, earnings | `web_search`, `firecrawl_scrape` |
| 4. Site discovery | Homepage scrape, `firecrawl_map`, sitemap.xml parse | `firecrawl_scrape`, `firecrawl_map` |
| 5. Section inventory | Classify top-level sections, record presence quality | `firecrawl_scrape` |
| 6. Document inventory | Check 130-item document checklist (with consultant gate) | `firecrawl_scrape`, `web_fetch` |
| 7. Peer research | Select 4-5 peers, feature matrix F01-F39, IQ lookup | `firecrawl_map`, `firecrawl_scrape`, `mcp__bigquery__run_query` |
| 8. Persist (optional) | Insert row into `ms_analyses` | `mcp__bigquery__run_query` |

**Pause point:** Consultant confirms peer set before research begins. Consultant approves document extraction list.

### Stage 2 — ms-crawl (Discovery)

**Command:** `/ms-crawl <company>`

| Step | What happens | Tools used |
|------|-------------|-----------|
| 1. Load brief manifest | Read ms-brief evidence, extract domain and site map | File read |
| 2. Four-source collection | Sitemap, navigation, firecrawl_map, pagination | `firecrawl_scrape`, `firecrawl_map` |
| 3. URL classification | Priority 1-5 ranking, document sub-classification | Internal logic |
| 4. Content scraping | Tier 1: 10 pages, Tier 2: +8 pages, Tier 3: +12 pages | `firecrawl_scrape` |
| 5. Document checklist | 130-item checklist, WR/BOTH tags | `firecrawl_scrape`, `web_fetch` |
| 6. Negative verification | Three-step absence confirmation for expected content | `firecrawl_scrape`, `web_fetch` |
| 7. Site structure | Build hierarchical tree (deduplicated, classified) | Internal logic |
| 8. Persist (optional) | Update `ms_analyses` row or insert new | `mcp__bigquery__run_query` |

**Escalation protocol:** `web_fetch` -> `firecrawl_scrape` -> `firecrawl_browser` (if blocked).

### Stage 3 — ms-findings (Synthesis)

**Command:** `/ms-findings <company>`

| Phase | What happens | Tools used |
|-------|-------------|-----------|
| A. Evidence loading | Load ms-brief + ms-crawl artefacts | File read |
| B3. Archetype matching | Check 13 archetypes against evidence (High/Medium/Low/None) | None |
| B4. Audience assessment | Classify audience tiers (Served/Underserved/Absent) | None |
| B5. Capability signals | Map High archetypes to capability recommendations | None |
| B6. Peer calibration | Compare feature matrix, refine archetype framing | None |
| B7. Claim construction | Build bounded claims with scope and certainty | None |
| B8-B9. Findings + gaps | Construct strategic findings and verified gaps | None |
| B10. Implications | Distil to max 5 strategic implications (150-250 words each) | None |
| B11. Synthesis | Executive summary (80-120 words) | None |
| B12. Self-check | Word count gates, elevation check, forbidden patterns | None |
| C. Render | Save artefact JSON + markdown report | File write |
| G. Persist (optional) | Insert into 4 BigQuery tables | `mcp__bigquery__run_query` |

**Hard rule:** No tool calls after Phase A. All reasoning is over pre-loaded evidence.

---

## Deliverable table of contents

### Word document (.docx) — Mercury Strategy

| # | Section | Content |
|---|---------|---------|
| 1 | **Cover page** | Mercury Strategy, company name, domain, sector, index, date |
| 2 | **Executive summary** | 80-120 word synthesis of findings |
| 3 | **Company context** | Identity table (type, sector, listing, IQ score, index, rank) + material events |
| 4 | **Connect.IQ benchmark position** | Score table vs index median and P75 |
| 5 | **Strategic findings** | Summary table (finding, severity, signal, audience impact) + detailed write-up per finding |
| 6 | **Archetype assessment** | High and Medium archetypes (name, confidence, criteria met/not met) + detail for High |
| 7 | **Audience analysis** | Tier classification table + detail for Underserved and Absent tiers |
| 8 | **Gaps identified** | Priority-coloured gaps table (gap, section, priority, detail) |
| 9 | **Site overview** | Pages loaded, documents loaded, sections assessed |
| 10 | **Strategic implications** | Numbered implications with full narrative detail |
| 11 | **Peer calibration** | Baseline expectations, leading features, sector-wide gaps |
| A | **Appendix A — Archetype evidence** | Full A01-A13 table + criterion-level observations per archetype |
| B | **Appendix B — Pages accessed** | URL table with page type and presence quality |
| C | **Appendix C — Documents accessed** | URL table with document type and status |
| D | **Appendix D — Claim register** | Full provenance trail (claim ID, statement, certainty, scope) |
| E | **Appendix E — Methodology and limitations** | Process description + limitations list |

### HTML presentation (.html)

| # | Section | Content |
|---|---------|---------|
| 1 | **Hero** | Cover with IDX branding, company name, domain |
| 2 | **Executive summary** | Narrative summary + optional ratings table |
| 3 | **Documents** | Download hub listing all rendered files by stage and format |
| 4 | **Strengths** | Finding cards for positive-polarity findings |
| 5 | **Peer comparison** | Comparison matrix table (compete stage only) |
| 6 | **Gaps** | Priority table + detail cards per gap |
| 7 | **Benchmarks** | Connect.IQ data table |
| 8 | **Talking points** | Card grid of strategic implications |
| 9 | **Site architecture** | CSS directory tree with section counts and absent concepts |
| 10 | **Pages accessed** | URL table |
| 11 | **Documents accessed** | URL table |
| 12 | **Methodology** | Process narrative + limitations |

### PowerPoint (.pptx)

| # | Slide | Content |
|---|-------|---------|
| 1 | **Title** | Cover slide with company name and metadata |
| 2-3 | **Executive summary** | Divider + content slide |
| 4 | **Assessment summary** | Rating table (if present) |
| 5-6 | **What they do well** | Divider + bullet slide |
| 7-8 | **Peer comparison** | Divider (blue) + table slide |
| 9-10 | **Gaps** | Divider + priority table |
| 11-12 | **Benchmarks** | Divider + data table |
| 13-14 | **Priorities** | Divider + numbered bullets |
| 15-17 | **Meeting pack** | Agenda, pre-read, facilitator guide (if present) |
| 18-19 | **Pages accessed** | Divider + table slides (batched 10 per slide) |
| 20-21 | **Documents accessed** | Divider + table slides (batched 10 per slide) |
| 22-23 | **Methodology** | Divider + content slide |

### Excel (.xlsx)

| # | Sheet | Content |
|---|-------|---------|
| 1 | **Cover** | Metadata, summary statistics, methodology |
| 2 | **Site structure** | Hierarchical tree flattened with section colours, URLs as hyperlinks |
| 3 | **Findings** | Gaps and findings table with priority colouring |
| 4 | **Talking points** | Strategic implications with detail |
| 5 | **Pages analysed** | Evidence inventory (URLs, page types) |
| 6 | **Benchmarks** | Connect.IQ benchmark data (if available) |

### Markdown (.md)

| # | Section | Content |
|---|---------|---------|
| 1 | **Header** | Company name, date, stages completed |
| 2 | **Executive summary** | H1 + narrative |
| 3 | **Findings** | H2 per finding, H3 for detail |
| 4 | **Gaps** | Pipe table (gap, section, priority) |
| 5 | **Benchmarks** | Pipe table |
| 6 | **Talking points** | H2 per point |
| 7 | **Pages analysed** | Pipe table |
| 8 | **Methodology** | Narrative |

---

## Data flow diagram

```
                    Firecrawl MCP                    BigQuery MCP
                    (scrape, map)                    (run_query)
                         |                               |
                         v                               v
    +-----------+   +-----------+   +-------------+   +------------------+
    | web_search|   | firecrawl |   | firecrawl   |   | sector_          |
    | web_fetch |   | _scrape   |   | _map        |   | intelligence.    |
    +-----------+   +-----------+   +-------------+   | iq_benchmarks    |
         |               |               |            +------------------+
         v               v               v                    |
    +------------------------------------------------+        |
    |              STAGE 1: ms-brief                 |<-------+
    |  Company identity, benchmarks, awareness,      |
    |  site discovery, documents, peer research      |
    +------------------------------------------------+
         |
         | {company}-ms-brief-evidence.json
         v
    +------------------------------------------------+
    |              STAGE 2: ms-crawl                 |
    |  Four-source collection, content scraping,     |
    |  document checklist, negative verification     |
    +------------------------------------------------+
         |
         | {company}-ms-crawl-manifest.json
         | {company}-ms-crawl-structure.json
         v
    +------------------------------------------------+
    |              STAGE 3: ms-findings              |
    |  Archetypes, audience, claims, findings,       |   NO TOOL CALLS
    |  gaps, implications, synthesis                 |   (pure reasoning)
    +------------------------------------------------+
         |
         | {company}-ms-findings-artefact.json
         | {company}-ms-findings.md
         v
    +------------------------------------------------+        +------------------+
    |              RENDERER                          |------->| sector_          |
    |  mercury-adapter.js -> mercury-output.js       |        | intelligence.    |
    |                                                |        | ms_analyses      |
    |  Produces: .docx  .html  .pptx  .xlsx  .md    |        | ms_findings      |
    +------------------------------------------------+        | ms_gaps          |
                                                              | ms_claims        |
                                                              +------------------+
```
