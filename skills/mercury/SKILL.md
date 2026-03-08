---
name: mercury
description: >
  Prepare IDX consultants for client engagements — from initial research through to a structured
  stakeholder meeting. Runs four stages: consultant briefing, competitive landscape, sitemap
  recommendation, and meeting pack. Each stage produces a markdown report with classified findings
  and an evidence-backed citation register. Invoke via /mercury:brief, /mercury:compete,
  /mercury:sitemap, /mercury:meeting, or /mercury:all to run the full pipeline.
  Triggers on phrases like: brief me on, prepare for meeting, audit this company, competitive
  landscape, compare to peers, sitemap recommendation, meeting pack, prepare a pitch.
---

# Mercury — consultant engagement preparation

## Overview

Mercury prepares IDX consultants for client engagements using proprietary IDX data that cannot be
replicated with generic research tools. Four stages run in sequence — each produces a standalone
markdown report. An integrated Word document is offered at the end.

**Reference files** (in `references/` alongside this file):
- `CLAIM_SCHEMA.md` — Claim schema, claim builder rules, and construction-time enforcement spec (vNext)
- `PLAYBOOK_REFERENCE.md` — IDX Corporate Website Playbook evaluation criteria
- `IQ_CRITERIA.md` — Connect.IQ benchmark methodology and company dataset
- `DOCUMENT_CHECKLIST.md` — 130-item document type inventory
- `SITE_CONFIGS.md` — Firecrawl domain overrides

**Data files** (in `data/`):
- `benchmarks/iq-scoring-model.json` — IQ score estimation model (category weights, observable criteria counts, confidence bands, positioning bands). Used when BigQuery is unavailable.
- `benchmarks/lenses.json` — Audit lens definitions (health, investors, ESG, etc.)
- `benchmarks/page-archetypes.json` — Expected components per page type (core + enhanced)
- `benchmarks/example-check-rr-investors.json` — Example archetype check output

---

## Core principles

These five principles govern every stage. They are not guidelines — they are rules.

**1. The skill enforces the protocol, not the LLM.** Each stage has a defined contract: what goes
in, what comes out, what tools are permitted, and what rules apply. You operate within the box
the stage defines. You do not decide what to do next, what evidence is admissible, or whether
rules apply.

**2. Contract-first artefacts.** Each stage produces two outputs: a structured JSON artefact
(the contract) and a markdown report (a human-readable rendering). The next stage consumes the
JSON artefact, not the markdown.

**3. Deterministic where possible.** If a check can be performed by matching content against a
defined list, do not use LLM reasoning. Benchmark lookups, IQ score fetching, and structure
extraction are mechanical operations.

**4. Provenance engine.** Every conclusion maps to a document, URL, captured artefact, or
classification step. The citation register is the provenance chain.

**5. Discipline before polish.** Process integrity, audit repeatability, and error traceability
matter more than visual quality or speed.

---

## Commands

| Command | Stage | What it runs |
|---------|-------|-------------|
| `/mercury:all <company>` | 1 → 4 | Full pipeline — briefing through to meeting pack |
| `/mercury:brief <company>` | 1 | Consultant briefing only |
| `/mercury:compete <company>` | 2 | Competitive landscape only |
| `/mercury:sitemap <company>` | 3 | Sitemap recommendation only |
| `/mercury:meeting <company>` | 4 | Meeting pack only |

Individual commands run exactly the named stage. If prior context is required but missing, the
skill surfaces a clear message — it does not silently trigger upstream stages.

---

## Stage execution protocol

Every stage follows the same two-phase structure. This is non-negotiable.

### Phase A: Collection (tools permitted)

1. **Intake** — confirm company identity, URL, and focus area
2. **Capability detection** — probe available tools; produce capability manifest
3. **Scope locking** — confirm scope with consultant; freeze it
4. **Evidence gathering** — use available tools to collect evidence
5. **Evidence manifest** — save `{company}-{stage}-evidence.json`

During collection, no findings are generated. No synthesis. No classification. You are gathering
raw material.

### Phase B: Reasoning (no tool calls)

6. **Claim construction** — build atomic claims from evidence using the claim builder (see `references/CLAIM_SCHEMA.md`). Every claim must pass construction-time validation: required fields, scope boundary, certainty vocabulary, evidence linkage. **Unsupported site-wide claims and unbounded negative claims are rejected here — they never enter the artefact.** Rejected claims are recorded in `claim_builder_errors[]`.
7. **Analysis** — reason over collected evidence and validated claims only
8. **Claim classification** — tag every substantive claim (re-read rules before each section)
9. **Artefact compilation** — save `{company}-{stage}-artefact.json` with `claims[]`, `claim_builder_errors[]`, claim-linked `findings[]`, and `rendered_units[]`
10. **Rendered unit construction** — before assembling final markdown, build discrete `rendered_units[]` — each a narrative chunk with `unit_id`, `text`, and `claim_ids`. This is the validator checkpoint.
11. **Artefact validation** — run `python validators/validate_artefact.py {artefact}.json`. If the validator returns FAIL, the artefact is rejected. Fix the errors and re-run. The validator checks claim structure, scope discipline, traceability, and rendered language against claim boundaries. This is **hard enforcement** — a failing artefact cannot proceed to the next stage.
12. **Markdown rendering** — assemble final report from validated rendered units (not freehand prose)
13. **Compliance self-check** — run checks A–N (Stage 1) or A–H, J–N (Stages 2–4); repair failures

During reasoning, do not make additional tool calls. If you discover a gap in evidence, record
it in the limitations section — do not attempt to fill it. This boundary is critical. Violations
undermine the entire provenance chain.

---

## Capability detection

At the start of every stage, silently probe each tool. Record the result.

| Capability | How to detect | What it enables |
|------------|--------------|-----------------|
| `web_search` | Attempt a trivial search | Situational awareness, news, corporate signals |
| `web_fetch` | Attempt to fetch a known URL | Page content retrieval (free, no credits) |
| `firecrawl` | Check if `firecrawl_scrape` responds | Site mapping, deep scraping, PDF/document extraction, browser sandbox |
| `bigquery` | Attempt `SELECT 1 FROM sector_intelligence.iq_benchmarks LIMIT 1` via `mcp__bigquery__query` | IQ scores, criteria detail, prior analyses |
| `bash` | Attempt a trivial command | File operations, offline data access |

When `firecrawl` is available, also check which sub-capabilities are present:

| Sub-capability | How to detect | What it adds |
|----------------|--------------|--------------|
| `firecrawl_scrape` | Scrape a test URL | Page scraping with cookie handling, PDF/DOCX/XLSX extraction |
| `firecrawl_map` | Map a test domain | Full URL discovery across a domain (returns all discoverable URLs) |
| `firecrawl_crawl` | Check if crawl endpoint responds | Multi-page crawling with depth control |
| `firecrawl_browser_*` | Check if `firecrawl_browser_create` responds | Interactive browser sessions for JS-rendered or gated content |

### Collection escalation protocol

Mercury uses tools in cost order. Start free, escalate only when the cheaper tool fails.

```
Level 0: web_fetch          — free, try first for any HTML page
Level 1: firecrawl_scrape   — 1 credit, use when web_fetch fails (cookie walls, JS rendering, PDFs)
Level 2: firecrawl_browser  — 1+ credits, use when scrape fails (multi-step interaction, gated IR sections)
```

**Escalation triggers:**
- `web_fetch` returns a cookie consent page, empty content, or a redirect loop → escalate to `firecrawl_scrape`
- `web_fetch` returns a page that references content not visible (JS-rendered tabs, accordions) → escalate to `firecrawl_scrape`
- `firecrawl_scrape` returns a gate or login prompt → escalate to `firecrawl_browser`
- Target is a PDF, DOCX, or XLSX URL → go directly to `firecrawl_scrape` (Level 1)

**Do not escalate when:**
- `web_fetch` succeeds with clean content — no need to spend credits
- The content is behind a login requiring credentials Mercury doesn't have — note as a gap
- Credits are exhausted — note as a limitation, do not retry

### Capability manifest

Log at the top of every stage report:

```
## Capability declaration

| Tool | Status | Impact |
|------|--------|--------|
| web_search | ✓ Available | Full situational awareness |
| web_fetch | ✓ Available | Direct page content (free) |
| firecrawl | ✓ Available | Site mapping, PDF extraction, browser sandbox |
| bigquery | ✓ Available | Official IQ scores for 747 companies (FTSE 100, FTSE 250, S&P 500, STOXX 50) |
| bash | ✓ Available | File operations enabled |
```

When firecrawl is available, also log sub-capabilities:

```
### Firecrawl sub-capabilities

| Tool | Status |
|------|--------|
| firecrawl_scrape | ✓ Available |
| firecrawl_map | ✓ Available |
| firecrawl_crawl | ✓ Available |
| firecrawl_browser | ✓ Available |
```

### Permitted finding types

The capability manifest is a constraint, not just information. Once declared, it locks which
findings the stage can produce. You cannot generate findings that require capabilities you do
not have — even if you "know" the answer from training data.

| Finding type | Requires | Without it |
|-------------|----------|------------|
| Page content claims | `web_fetch` or `firecrawl` | Prohibited |
| Structural claims (quantitative) | `web_fetch` or `firecrawl` | Qualitative only from search snippets |
| Site structure mapping | `firecrawl_map` or `web_fetch` + manual navigation | Partial structure from homepage navigation only |
| Visual/UX claims | `firecrawl_browser` (screenshots) | Prohibited entirely |
| Benchmark scores (specific) | `bigquery` or estimation from observable criteria | Estimated band only |
| Situational claims | `web_search` | Prohibited — no situational section |
| Client analytics | Not available via BigQuery | Treated as prospect |
| Document presence | `web_fetch` or `web_search` | Only if URL found in search results |
| Document content (PDF/DOCX/XLSX) | `firecrawl_scrape` | Presence only — no content extraction |
| Gated/JS-rendered content | `firecrawl_browser` | Note as inaccessible gap |

### Degradation fallbacks

| Missing tool | Fallback | Report annotation |
|-------------|----------|-------------------|
| `bigquery` | Estimate IQ scores from observable criteria using `data/benchmarks/iq-scoring-model.json` and `IQ_CRITERIA.md` | "IQ scores estimated from observable criteria (BigQuery unavailable)" |
| `web_search` | Skip situational awareness | "Situational context unavailable" |
| `web_fetch` | `firecrawl_scrape` for all pages | "Using Firecrawl for all page fetches" |
| `firecrawl` | `web_fetch` + manual navigation | "No site mapping, PDF extraction, or browser access" |
| `firecrawl_map` | Parse sitemap.xml via `web_fetch`, then navigate from homepage links | "Site structure from sitemap.xml and manual navigation" |
| `firecrawl_browser` | `firecrawl_scrape` or `web_fetch` | "Interactive/gated content not accessible" |
| All web tools | Conversation-only mode | "All findings based on user-supplied evidence" |

**Key rule:** The skill always runs. It produces the best report it can and honestly declares
what it could not assess.

---

## Scope locking

Once the consultant confirms the audit scope (company, URL, focus area), the scope is frozen.
The skill cannot expand scope mid-stage.

- If the brief says "assess investor communications", do not produce findings about careers
- Scope is confirmed at the start of each stage and recorded in the artefact JSON
- Scope cannot be widened after confirmation without restarting the stage

**Pressure valve:** The report may include a "Noted but out of scope" section for significant
observations outside the brief. These are flagged as `[OBSERVATION — out of scope]` and carry
no classification weight, no severity, and no recommendation.

---

## Claim classification rules

These rules apply to every stage, every finding, every paragraph. They are the most important
part of the protocol.

### Classifications

Every substantive claim carries exactly one tag:

| Tag | Meaning | Requirements |
|-----|---------|-------------|
| `[FACT]` | Directly verifiable from evidence | Must cite at least one source (URL, document, API) using numbered reference |
| `[INFERENCE]` | Reasonable conclusion from evidence | Must state reasoning and include confidence indicator |
| `[JUDGEMENT]` | Professional opinion or recommendation | Permitted only in synthesis and recommendation sections |

### Confidence indicators (required on every inference)

| Level | Meaning |
|-------|---------|
| Multiple sources | Corroborated across 2+ evidence items |
| Single source | Based on one piece of evidence |
| Limited sample | Based on partial evidence |
| Absence-based | Inferred from something not found |

Format: `[INFERENCE — single source, absence-based]`

### Context decay mitigation

You will reliably drop these rules after the first few paragraphs. To prevent this:

- **Re-read this classification section before generating findings**
- **Re-read this classification section before generating gap analysis**
- **Re-read this classification section before generating synthesis** — especially the rule
  that `[JUDGEMENT]` is only permitted in synthesis
- **Re-read the output template before generating each section**

This is not optional. Context decay is a known failure mode. The re-read is the mitigation.

### Citation protocol

Every stage report ends with a citations section. Every `[FACT]` has a corresponding entry.

```
## Citations

| Ref | Type | Source | Accessed | Claims supported |
|-----|------|--------|----------|-----------------|
| [1] | Web page | https://www.company.com/investors | 26 Feb 2026 | F-001, F-003 |
| [2] | Document | Annual Report 2025, p.12 | 26 Feb 2026 | F-002 |
| [3] | BigQuery | Connect.IQ, FTSE 100 index (sector_intelligence.iq_benchmarks) | 26 Feb 2026 | F-004 |
| [4] | Search | web_search: "company leadership 2025" | 26 Feb 2026 | F-005 |
```

Rules:
- Every `[FACT]` must have at least one numbered citation reference
- Search-sourced facts cite the query used
- BigQuery benchmark facts cite the dataset year and table
- Estimated benchmark facts cite the estimation methodology and confidence level
- No orphaned citations (cited but not referenced)
- No orphaned facts (referenced but not cited)

### Prohibited content

Never include, regardless of analytical relevance:
- Share price movements or performance
- Analyst opinions or consensus estimates
- Valuation multiples (P/E, PEG, EV/EBITDA)
- Inferred market sentiment ("investor concern", "market pressure")
- Price targets

If financial context is genuinely relevant, it may appear in synthesis as `[JUDGEMENT]` with
explicit framing, but never as `[FACT]` and never in situational context.

### Conservative defaults

- Ambiguous evidence → reduced claim (narrow the assertion)
- Uncertain scope → narrowed scope (claim about the page, not the site)
- Missing evidence → gap finding, not silence (absence is visible)
- Rules override judgement — when a rule conflicts with what seems useful, the rule wins
- Page-level precision — claims about "the site" require evidence from 2+ sections
- Gaps are findings — missing information has the same weight as present information
- Absence is visible — stated explicitly with the search method used

### Claim builder enforcement (vNext)

Claims are the bounded knowledge layer between evidence and findings. The claim builder
runs in Phase B step 6, before any findings are generated.

**Hard rules — violations cause rejection, not warnings:**

1. **Required fields** — every claim must have `scope`, `certainty`, and `evidence_ids` (unless method is `prior_stage_artefact`)
2. **Site-wide claims** — rejected unless supported by evidence from ≥2 distinct site sections. Trigger phrases: "the site", "anywhere on the site", "there is no", "does not have", "nowhere on", "across the site", "site-wide"
3. **Negative claims** — must use bounded language matching actual assessment scope. "No investment case page in the reviewed IR pages" is allowed. "There is no investment case page on the site" is rejected.
4. **searched_not_found** — derived claims must use certainty `observed` or `inferred` (never `confirmed`) and scope must name what was actually searched
5. **Certainty vocabulary** — only `confirmed`, `observed`, `inferred`, `not_assessed`

Rejected claims are logged in `claim_builder_errors[]` with reason and suggested revision.

See `references/CLAIM_SCHEMA.md` for the full schema, builder sequence, and error format.

---

## Compliance self-check

Run this at the end of every stage, before saving. It is a structured pass — not a re-read.

| Check | Rule | If failed |
|-------|------|-----------|
| A: Classification | Every finding has exactly one tag | Add missing tags |
| B: Fact citations | Every `[FACT]` has ≥1 citation ref | Add citation or downgrade to `[INFERENCE]` |
| C: Inference confidence | Every `[INFERENCE]` has confidence | Add missing indicator |
| D: Judgement placement | `[JUDGEMENT]` only in synthesis/recs | Reclassify or move |
| E: Capability compliance | No finding exceeds declared capability | Remove prohibited findings |
| F: Scope compliance | No finding outside locked scope | Move to out-of-scope or remove |
| G: Citation completeness | No orphaned citations or facts | Resolve |
| H: Prohibited content | No share prices, analyst opinions, etc. | Remove |
| I: Own news section fetched | *(Stage 1 only)* Company's news/stories/media section was fetched directly in Step 3b — not only searched via web_search | Fetch now; review most recent 10–15 articles; add any missed material events to situational awareness before saving |
| J: Claim mapping | Every finding has `claim_ids` referencing ≥1 active claim | Add claim linkage or remove finding |
| K: Negative scope integrity | Every negative statement in rendered output inherits its source claim's `scope` — no scope inflation from claim to prose | Narrow the rendered statement to match claim scope |
| L: Recommendation traceability | Every synthesis priority has `claim_ids` referencing ≥1 active claim | Add claim linkage or remove recommendation |
| M: Site-wide claim threshold | No claim with site-wide language unless backed by ≥2 distinct evidence sections (enforced at construction, verified here as backstop) | Reject claim or narrow scope |
| N: Certainty vocabulary | Every claim uses only allowed certainty values: `confirmed`, `observed`, `inferred`, `not_assessed` | Fix or reject |

Append the self-check result to the JSON artefact as a `compliance` object. If any check fails,
attempt a targeted repair. If repair fails, note in the limitations section.

**vNext priority:** Checks J–N should be enforced at claim construction time (Phase B step 6)
where possible, with the compliance self-check serving as a backstop. Earlier enforcement is
always preferred over later repair.

---

## Evidence manifest schema

Saved as `{company}-{stage}-evidence.json` at the end of the collection phase.

```json
{
  "company": "Company Name plc",
  "domain": "company.com",
  "stage": "brief",
  "collected_at": "2026-02-26T14:30:00Z",
  "capabilities_available": ["web_search", "web_fetch", "firecrawl", "bash"],
  "firecrawl_sub_capabilities": ["firecrawl_scrape", "firecrawl_map", "firecrawl_crawl", "firecrawl_browser"],
  "capabilities_available_data": ["bigquery"],
  "scope": {
    "focus": "investor communications",
    "confirmed_at": "2026-02-26T14:28:00Z"
  },
  "evidence_items": [
    {
      "id": "E-001",
      "type": "web_page",
      "url": "https://www.company.com/investors",
      "tool_used": "web_fetch",
      "accessed_at": "2026-02-26T14:31:12Z",
      "content_summary": "IR landing page — navigation, key links, upcoming events",
      "word_count": 1240
    },
    {
      "id": "E-002",
      "type": "search_result",
      "query": "Company Name leadership changes 2025 2026",
      "tool_used": "web_search",
      "accessed_at": "2026-02-26T14:32:05Z",
      "results_count": 8,
      "content_summary": "News results covering CEO statements, board changes"
    },
    {
      "id": "E-003",
      "type": "benchmark_data",
      "source": "sector_intelligence.iq_benchmarks (BigQuery)",
      "tool_used": "mcp__bigquery__query",
      "accessed_at": "2026-02-26T14:30:30Z",
      "content_summary": "IQ scores: overall 42.3%, IR 38.1%, careers 45.2%. FTSE 100, rank 67/103. Index median 41.8%."
    },
    {
      "id": "E-004",
      "type": "document_extraction",
      "url": "https://www.company.com/investors/cmd-2025.pdf",
      "document_type": "Capital Markets Day presentation",
      "tool_used": "firecrawl",
      "accessed_at": "2026-02-26T14:35:00Z",
      "pages_extracted": 85,
      "total_pages": 85,
      "extraction": "full",
      "content_summary": "Strategy priorities, medium-term targets, divisional deep dives"
    },
    {
      "id": "E-005",
      "type": "document_extraction",
      "url": "https://www.company.com/investors/annual-report-2025.pdf",
      "document_type": "Annual Report",
      "tool_used": "firecrawl",
      "accessed_at": "2026-02-26T14:38:00Z",
      "pages_extracted": 40,
      "total_pages": 196,
      "extraction": "partial",
      "content_summary": "Chair and CEO statements, strategy section, FY25 KPIs"
    }
  ],
  "evidence_gaps": [
    "IQ scores from BigQuery (2024 dataset)"
  ]
}
```

---

## Artefact schema

Saved as `{company}-{stage}-artefact.json` at the end of the reasoning phase. The `findings`
shape varies by stage — all other fields are fixed.

**vNext change:** Artefacts now include `claims[]` and `claim_builder_errors[]` as top-level
arrays. Claims are built before findings. Findings, gap analysis, and synthesis must reference
claim IDs. See `references/CLAIM_SCHEMA.md` for the full claim schema.

```json
{
  "company": "Company Name plc",
  "domain": "company.com",
  "stage": "brief",
  "generated_at": "2026-02-26T14:45:00Z",
  "scope": {
    "focus": "investor communications",
    "confirmed_at": "2026-02-26T14:28:00Z"
  },
  "capabilities_used": ["web_search", "web_fetch", "bash"],
  "executive_summary": "Plain language summary — no classification tags here.",
  "claims": [
    {
      "claim_id": "C-001",
      "entity": "Company Name plc",
      "domain": "company.com",
      "stage": "brief",
      "statement": "The IR landing page lists three upcoming results dates",
      "claim_type": "fact",
      "scope": "IR landing page only",
      "certainty": "confirmed",
      "method": "web_fetch",
      "evidence_ids": ["E-001"],
      "source_finding_ids": [],
      "status": "active",
      "supersedes_claim_id": null,
      "created_at": "2026-02-26T14:45:00Z"
    },
    {
      "claim_id": "C-002",
      "entity": "Company Name plc",
      "domain": "company.com",
      "stage": "brief",
      "statement": "Strategy content on the IR landing page appears to pre-date the most recent results",
      "claim_type": "inference",
      "scope": "IR landing page and results archive",
      "certainty": "inferred",
      "method": "web_fetch",
      "evidence_ids": ["E-001", "E-003"],
      "source_finding_ids": [],
      "status": "active",
      "supersedes_claim_id": null,
      "created_at": "2026-02-26T14:45:00Z"
    },
    {
      "claim_id": "C-003",
      "entity": "Company Name plc",
      "domain": "company.com",
      "stage": "brief",
      "statement": "No dedicated investment case page was identified in the reviewed IR pages",
      "claim_type": "gap",
      "scope": "reviewed IR pages",
      "certainty": "observed",
      "method": "web_fetch",
      "evidence_ids": ["E-001"],
      "source_finding_ids": [],
      "status": "active",
      "supersedes_claim_id": null,
      "created_at": "2026-02-26T14:45:00Z"
    }
  ],
  "claim_builder_errors": [
    {
      "error_id": "CBE-001",
      "candidate_statement": "There is no investment case page on the site",
      "candidate_scope": "company.com",
      "rejection_reason": "unsupported_site_wide_claim",
      "evidence_ids": ["E-001"],
      "detail": "Claim uses site-wide language but evidence covers only reviewed IR pages (1 section). Requires ≥2 distinct sections.",
      "suggested_revision": "No dedicated investment case page was identified in the reviewed IR pages",
      "suggested_scope": "reviewed IR pages"
    }
  ],
  "findings": [
    {
      "id": "F-001",
      "classification": "FACT",
      "claim": "The IR landing page lists three upcoming results dates",
      "claim_ids": ["C-001"],
      "evidence": ["E-001"],
      "citations": [1],
      "severity": "positive",
      "section": "website_assessment"
    },
    {
      "id": "F-002",
      "classification": "INFERENCE",
      "claim": "Strategy content appears to pre-date the most recent results",
      "claim_ids": ["C-002"],
      "confidence": "single_source, absence_based",
      "reasoning": "Strategy page references FY23 targets but FY24 results show upgraded targets",
      "evidence": ["E-001", "E-003"],
      "citations": [1, 2],
      "severity": "medium",
      "section": "website_assessment"
    },
    {
      "id": "F-003",
      "classification": "JUDGEMENT",
      "claim": "The IR section would benefit from a dedicated results snapshot on the landing page",
      "claim_ids": ["C-001", "C-002"],
      "evidence_basis": ["F-001", "F-002"],
      "severity": "medium",
      "section": "synthesis"
    }
  ],
  "gap_analysis": [
    {
      "category": "IR landing page",
      "status": "found",
      "detail": "Present with navigation and key links",
      "claim_ids": ["C-001"],
      "evidence": ["E-001"],
      "citations": [1]
    },
    {
      "category": "Investment case page",
      "status": "searched_not_found",
      "search_method": "Navigated IR section; searched site for 'investment case', 'why invest'",
      "claim_ids": ["C-003"],
      "evidence": ["E-001"],
      "citations": [1]
    }
  ],
  "synthesis": {
    "overall_assessment": "[JUDGEMENT] Overall assessment text.",
    "priorities": [
      {
        "priority": 1,
        "recommendation": "Add a dedicated investment case page",
        "rationale": "Based on C-003 (gap) and C-002 (outdated strategy content)",
        "claim_ids": ["C-003", "C-002"],
        "effort": "medium",
        "impact": "high"
      }
    ]
  },
  "rendered_units": [
    {
      "unit_id": "RU-001",
      "text": "The IR landing page lists three upcoming results dates, providing clear visibility of the reporting calendar.",
      "claim_ids": ["C-001"],
      "section": "website_assessment"
    },
    {
      "unit_id": "RU-002",
      "text": "No dedicated investment case page was identified in the reviewed IR pages.",
      "claim_ids": ["C-003"],
      "section": "gap_analysis"
    }
  ],
  "limitations": [
    "Situational context limited to web_search snippets"
  ],
  "citations": [
    {
      "ref": 1,
      "type": "web_page",
      "source": "https://www.company.com/investors",
      "accessed": "2026-02-26",
      "claims_supported": ["C-001", "C-002", "C-003", "F-001", "F-002"]
    }
  ],
  "compliance": {
    "checks_passed": 13,
    "checks_failed": 0,
    "failures": [],
    "repairs": []
  }
}
```

---

## Markdown report template

All stage reports use this shared structure. Stage-specific sections are inserted between the
capability declaration and the synthesis.

```markdown
# {Report title}: {Company name}

| Field | Value |
|-------|-------|
| Company | {legal name} |
| Sector | {sector} |
| Listed | {exchange: ticker} or Private |
| Website | {url} |
| Focus | {scope focus area} |
| Date | {date} |
| Prepared by | IDX using Mercury |

## Capability declaration

| Tool | Status | Impact |
|------|--------|--------|
{capability rows}

## Permitted finding types

| Finding type | Status |
|-------------|--------|
{permitted/prohibited rows based on capabilities}

---

{STAGE-SPECIFIC SECTIONS — see individual stage definitions}

---

## Synthesis

{[JUDGEMENT]-tagged overall assessment and priorities. This is the ONLY section where
[JUDGEMENT] tags are permitted.}

---

## Noted but out of scope

{[OBSERVATION — out of scope] items, if any. No classification weight, no severity.}

---

## Limitations

{What was not assessed and why. Capability constraints. Evidence gaps. Compliance self-check
failures if any.}

---

## Citations

| Ref | Type | Source | Accessed | Claims supported |
|-----|------|--------|----------|-----------------|
{citation rows — every [FACT] must appear here}
```

---

## Results storage

Analysis results are saved locally as artefact JSON files. When BigQuery is available,
prior analyses can be checked via:

```sql
SELECT * FROM sector_intelligence.analyses
WHERE LOWER(company_name) LIKE LOWER('%{name}%')
ORDER BY analysed_at DESC
```

---

## Stage 1 — Consultant briefing

**Command:** `/mercury:brief <company>`

**Purpose:** Internal IDX document. Not client-facing. Gives a consultant everything they need to
walk into a meeting knowing the company, its digital position, and how IDX would frame the
opportunity.

**Report title:** "Consultant briefing"

### Inputs

| Input | Required | Source |
|-------|----------|--------|
| Company name | Yes | Consultant provides |
| Company URL | Yes | Consultant provides or enriched from name |
| Audit focus | No | Optional lens (e.g., "investor communications") |

### Collection phase steps

**Step 1 — Intake:** Confirm company identity (legal name, listing, sector). Confirm URL and
detect subdomains. Lock scope.

**Step 2 — Benchmark check (deterministic):** Two paths:

*Path A — BigQuery available (preferred):* Query `sector_intelligence.iq_benchmarks` via
`mcp__bigquery__query` for official IQ scores. Three queries:

```sql
-- 1. Company scores (fuzzy match on company name)
SELECT company, overall, company_narrative, content_mix, channel_mix,
       optimization, reach, about_us, ir, media, csr, careers,
       reputational_resilience, index_name, dataset_year
FROM sector_intelligence.iq_benchmarks
WHERE LOWER(company) LIKE LOWER('%{company_name}%')

-- 2. Index stats for context
SELECT
  AVG(overall) as mean, APPROX_QUANTILES(overall, 4)[OFFSET(2)] as median,
  APPROX_QUANTILES(overall, 4)[OFFSET(1)] as p25,
  APPROX_QUANTILES(overall, 4)[OFFSET(3)] as p75,
  MIN(overall) as min, MAX(overall) as max, COUNT(*) as n
FROM sector_intelligence.iq_benchmarks
WHERE index_name = '{index_name}'

-- 3. Company rank within index
SELECT company, overall,
  RANK() OVER (ORDER BY overall DESC) as rank,
  COUNT(*) OVER () as total
FROM sector_intelligence.iq_benchmarks
WHERE index_name = '{index_name}'
ORDER BY overall DESC
```

If the company is in the dataset (747 companies across FTSE 100, FTSE 250, S&P 500, STOXX 50):
report actual scores, rank, percentile, and category breakdown as `[FACT]`.

If the company is NOT in the dataset: note this, then fall through to Path B for estimation.
Still use BQ index stats for context (medians, percentiles).

For granular criteria detail, query `sector_intelligence.iq_criteria_detail`:

```sql
-- Per-criterion pass/fail for a company
SELECT criterion_number, criterion_name, category, present
FROM sector_intelligence.iq_criteria_detail
WHERE LOWER(company) LIKE LOWER('%{company_name}%')
ORDER BY criterion_number
```

This gives 356 binary criteria per company — use for gap analysis in Steps 4-5.

*Path B — BigQuery unavailable or company not in dataset (estimation):* Use
`data/benchmarks/iq-scoring-model.json` to estimate IQ scores from observable criteria.
1. During the website assessment (Steps 4-5), evaluate each observable criterion from
   `IQ_CRITERIA.md` as present (1) or absent (0) against page evidence.
2. Compute category scores: `(criteria_present / observable_criteria) × 100` per category.
3. Compute weighted overall: sum of `(category_score × weight)` using weights from the model.
4. Determine positioning band and confidence level from the model.
5. Report as `[INFERENCE — estimated from observable criteria]` with the confidence band.
   Never present estimated scores as official Connect.IQ scores.

Categories excluded from estimation (no observable criteria): SEO, Paid Search. Their weight
is redistributed across observable categories.

**Step 3 — Situational awareness (web_search + web_fetch):** Two mandatory sub-steps:

*3a — Web search.* Recent news (6 months): leadership, M&A, results, ESG, controversies. Each
event must have: date, source, relevance to website. Financial calendar: upcoming dates. Rules:
no share price, no analyst opinion, no inferred sentiment.

*3b — Company's own news section (web_fetch — mandatory).* Fetch the company's news, stories,
press releases, or media section directly (typically `/news`, `/media`, `/our-stories`,
`/press-releases`, `/newsroom`, or equivalent — check homepage navigation if unclear). Review
the most recent 10–15 articles. This step is mandatory regardless of what web search returns:
search results cannot be relied upon for very recent events due to indexing lag, and the most
material events often appear on the company's own domain first.

Flag any article that changes the company's portfolio, name, structure, ownership, or
leadership. Apply the material events checklist before leaving this step:

| Event type | Check |
|------------|-------|
| Merger, acquisition, or merger of equals announced | □ |
| Major divestiture announced or completed | □ |
| Company name or brand change | □ |
| Listing or headquarter change | □ |
| CEO or CFO appointment or departure | □ |

If any item is ticked, it must appear in the situational awareness section with date, source
URL, and relevance to the website assessment. It may also require updating scope or synthesis.

**Step 4 — Website quick audit:** Assess core page types: homepage, about, IR, sustainability,
careers, governance. For each: what exists, what's strong, what's missing vs Playbook (see
`PLAYBOOK_REFERENCE.md`). Check for listed company documents (Annual Report, results
presentations). On the homepage, note any news, stories, or announcements being surfaced —
these often signal material recent events that may not yet be prominent in search results.

**Site structure discovery:** If `firecrawl_map` is available, run it first on the company domain
to get a complete URL inventory. This replaces manual navigation and gives a definitive view of
the site's information architecture. Use the URL list to identify page types, document URLs
(PDFs, presentations), and sections to audit.

```json
firecrawl_map({ "url": "https://www.company.com" })
```

If `firecrawl_map` is unavailable, fall back to fetching `sitemap.xml` via `web_fetch`, then
navigate from homepage links.

**Page fetching:** Follow the collection escalation protocol. Start with `web_fetch` (free). If
a page returns a cookie wall, empty content, or JS-rendered shell, escalate to
`firecrawl_scrape`. Only use `firecrawl_browser` for pages that require multi-step interaction
(e.g., accepting investor terms, navigating tabbed interfaces).

**Step 4b — Document extraction (firecrawl — when available).** If `firecrawl` is available and
PDF document URLs were identified in Step 4 (Annual Report, results presentations, sustainability
reports), extract key documents using `firecrawl_scrape` with the PDF parser.

Firecrawl automatically parses PDFs into markdown when you scrape a PDF URL — no special
configuration is needed. Firecrawl also supports Word (.docx), Excel (.xlsx), and RTF documents
using the same approach.

**Priority order for extraction:**
1. Capital markets day or investor day presentation — the single richest source of strategy narrative, medium-term targets, and management priorities. Often more candid and forward-looking than the Annual Report. Check the IR section for CMD/investor day materials from the last 18 months.
2. Latest Annual Report — strategy, KPIs, chair/CEO statements
3. Latest results presentation — most recent performance narrative
4. Sustainability/ESG report — if scope includes sustainability

**Document discovery and depth confirmation:** Before extracting any document, do a shallow
probe first — scrape just the first 5 pages to identify the document:

```json
{
  "url": "https://company.com/investors/annual-report-2025.pdf",
  "parsers": [{ "type": "pdf", "maxPages": 5 }]
}
```

From the first 5 pages, identify:
- Document title and date
- Table of contents (if present)
- Total page count (often shown in headers/footers or ToC)

Then present the document list to the consultant for confirmation before extracting further:

```
## Documents found for extraction

| # | Document | Pages | Credits | Recommended depth |
|---|----------|-------|---------|-------------------|
| 1 | Capital Markets Day 2025 | ~85 slides | 85 | Full — primary strategy source |
| 2 | Annual Report 2025 | ~196 pages | 196 | Partial (first 40) — chair/CEO statement and strategy only |
| 3 | FY25 Results Presentation | ~42 slides | 42 | Full — recent performance narrative |

Extracting all recommended pages would use ~167 credits.
Which documents would you like me to extract, and to what depth?
```

**Wait for confirmation before proceeding.** The consultant may:
- Approve all recommendations
- Skip expensive documents (e.g., "skip the Annual Report, just do the CMD deck")
- Request deeper extraction ("get the full Annual Report")
- Add documents Mercury didn't suggest

**What to extract:** Do not attempt to summarise the entire document. Focus on:
- Strategic priorities and medium-term targets (especially from CMD/investor day decks)
- Chair and CEO statements (strategy narrative, priorities, tone)
- Key financial metrics and KPIs referenced in the strategy
- Forward-looking statements and targets
- Any content that directly relates to the audit scope

For large documents where partial extraction is approved, use `maxPages` to limit:

```json
{
  "url": "https://company.com/investors/annual-report-2025.pdf",
  "parsers": [{ "type": "pdf", "maxPages": 40 }]
}
```

**Evidence recording:** Each extracted document is a separate evidence item with type
`document_extraction`, the PDF URL, pages extracted, total page count, and a content summary.
This evidence can support `[FACT]` claims with `certainty: confirmed` and `method: firecrawl`.
If only partial extraction was performed, record that in the evidence item and note it as a
limitation.

If `firecrawl` is unavailable, skip this step. Note document URLs in evidence gaps and annotate:
"Document content not extracted — Firecrawl unavailable."

**Step 5 — Client check:** Client analytics (GA4, Leadfeeder) are not currently available via
BigQuery. Treat all companies as prospects. Note as: "Client analytics not available."

**Step 6 — Save evidence manifest.**

### Reasoning phase steps

**Step 7 — Gap framing:** Translate Playbook gaps into IDX service opportunities. Match 1–2
relevant IDX case studies from API, or skip if unavailable.

RE-READ THE CLAIM CLASSIFICATION RULES ABOVE BEFORE PROCEEDING.

**Step 8 — Compile artefact.** Build JSON with classified findings, citations, gaps.

**Step 9 — Render markdown.** Generate report from artefact data. Re-read classification rules
before each section.

**Step 10 — Compliance self-check.** Run checks A–I.

### Stage-specific report sections

Insert between capability declaration and synthesis:

```
## Company identification
{[FACT]-tagged company details with citations}

---

## Connect.IQ benchmark position
{If BigQuery available and company in dataset: actual scores, rank, percentile as [FACT].
 Show: overall, top 3 category scores, bottom 3 category scores, index rank.
 Compare to index median, P25, P75.}
{If BigQuery unavailable or company not in dataset: estimated scores from observable
 criteria as [INFERENCE]. Include criteria coverage, confidence band, positioning band.}

---

## Situational awareness
{recent events, each with date/source/relevance. Or "Unavailable" if no web_search.}

---

## Website assessment
{page-by-page assessment against Playbook. Strengths and gaps per section.}

---

## Client data
{GA4/Leadfeeder if available, or "Prospect — no client data available"}

---

## Gap framing — IDX opportunity
{gaps translated to service opportunities}

---

## Case study matches
{1–2 matched projects, or "Case study matching unavailable"}
```

### Output files

- `{company}-brief-evidence.json`
- `{company}-brief-artefact.json`
- `{company}-brief.md`

---

## Stage 2 — Competitive landscape

**Command:** `/mercury:compete <company>`

**Purpose:** Maps where the client sits in their peer set, grounded in IQ data and Playbook
evaluation. Gives consultants evidence to say "your peers are doing this and you are not" with
specific, named examples.

**Report title:** "Competitive landscape"

**Prerequisite:** Stage 1 artefact recommended. If missing, prompt the consultant to run
`/mercury:brief` first. Do not silently trigger it.

### Inputs

| Input | Required | Source |
|-------|----------|--------|
| Company name and URL | Yes | From stage 1 artefact or consultant |
| Stage 1 artefact | Recommended | `{company}-brief-artefact.json` if available |

### Collection phase steps

**Step 1 — Peer identification:** Suggest 4–5 sector peers based on sector, geography, and index
membership. Present to consultant for confirmation BEFORE any research runs. Consultant may add,
remove, or replace peers. Lock peer set after confirmation.

**Step 2 — Per-peer research:** For each confirmed peer: fetch IQ scores from BigQuery (or
estimate from observable criteria if not in dataset), website quick audit (same method as
stage 1), document checklist check, section classification. When BigQuery is available, fetch
all peers in one query:

```sql
SELECT company, overall, company_narrative, ir, csr, careers, about_us, media, index_name
FROM sector_intelligence.iq_benchmarks
WHERE LOWER(company) IN (LOWER('{peer1}'), LOWER('{peer2}'), ...)
```

**Step 3 — Sector patterns:** When BigQuery is available, query index-level distributions for
context:

```sql
SELECT index_name, AVG(overall) as mean, APPROX_QUANTILES(overall, 4)[OFFSET(2)] as median,
  MIN(overall) as min, MAX(overall) as max, COUNT(*) as n
FROM sector_intelligence.iq_benchmarks
GROUP BY index_name
```

Skip if BigQuery unavailable.

**Step 4 — Save evidence manifest.**

### Reasoning phase steps

**Step 5 — Comparative analysis:** Build comparison matrix: client vs each peer vs sector median.
Dimensions: overall IQ (actual or estimated), about, IR, sustainability, careers, media. Identify where client leads
(with page-level evidence). Identify where client lags (with peer URLs). White space analysis:
what no peer does well.

RE-READ THE CLAIM CLASSIFICATION RULES ABOVE BEFORE PROCEEDING.

**Steps 6–8:** Compile artefact, render markdown, compliance self-check.

### Stage-specific report sections

```
## Peer set
{confirmed peers with rationale for selection}

---

## Comparison matrix
{full comparison table: client vs each peer vs sector median}

---

## Where {Company} leads
{3+ findings with page-level evidence from specific peers}

---

## Where {Company} lags
{3+ findings with peer URLs as evidence}

---

## White space opportunities
{capabilities no peer does well — differentiation opportunities}

---

## Sector patterns
{cross-client patterns from IDX research, or "Unavailable"}

---

## Connect.IQ context
{side-by-side scores for all companies in the comparison.
 If from BigQuery: actual scores as [FACT]. Include index context.
 If estimated: show estimated scores with confidence level, tagged [INFERENCE].}
```

### Output files

- `{company}-compete-evidence.json`
- `{company}-compete-artefact.json`
- `{company}-compete.md`

---

## Stage 3 — Sitemap recommendation

**Command:** `/mercury:sitemap <company>`

**Purpose:** A concrete proposed information architecture grounded in Playbook criteria and peer
evidence from stage 2. Every structural recommendation cites at least one source.

**Report title:** "Sitemap recommendation"

**Prerequisite:** Stage 1 artefact recommended. Stage 2 artefact enriches recommendations with
peer evidence. If missing, prompt consultant. Do not silently trigger.

### Inputs

| Input | Required | Source |
|-------|----------|--------|
| Company name and URL | Yes | From prior artefacts or consultant |
| Stage 1 artefact | Recommended | Website assessment provides current structure |
| Stage 2 artefact | Recommended | Peer evidence provides "what top performers do" |

### Collection phase steps

**Step 1 — Current structure:** Extract current IA from stage 1/2 artefacts. If no prior stages,
fetch fresh via `web_fetch` or `firecrawl_map`.

If `firecrawl_map` is available, run it on the company domain to get a complete URL inventory.
This gives a definitive view of all discoverable pages and their hierarchy.

**Step 2 — Per-page SEO and AEO audit:** For each page in the current structure (or at minimum
the key page types), collect:

- **URL / slug** — the actual path
- **Page title** (`<title>` tag)
- **Meta description** — present, absent, or generic
- **H1** — present, matches page purpose, or missing/generic
- **Structured data** — Schema.org markup types found (Organization, WebPage, FAQPage,
  BreadcrumbList, Article, etc.) and whether they are valid
- **Open Graph / social tags** — present and populated, or missing
- **Canonical URL** — present and correct, or missing/misconfigured
- **Content assessment** — brief note on content quality and completeness

For AEO (Answer Engine Optimisation) readiness, also check:
- **FAQ sections** — structured Q&A content that can be surfaced by AI assistants
- **Clear entity definitions** — does the page clearly define what the company/product/service is
  in a way that AI models can extract?
- **Topical authority signals** — depth of content on the page's topic, internal linking to
  related content

Use `web_fetch` for basic HTML inspection. Escalate to `firecrawl_scrape` if pages are
JS-rendered or behind cookie walls. This data feeds directly into the Excel output.

**Step 3 — Supplementary evidence:** Only if prior stages are missing. Fetch current site
structure and peer structures.

**Step 4 — Save evidence manifest.**

### Reasoning phase steps

**Step 5 — Recommended structure:** Three sources: Playbook best practice
(`PLAYBOOK_REFERENCE.md`), top peer structures (from stage 2 artefact), IDX sector knowledge.
Every new section or page must be justified by at least one source. No "best practice says"
without a specific reference.

For each recommended page, specify:
- **Recommended slug** — the proposed URL path
- **Page purpose** — what this page should achieve
- **Content notes** — what content should appear on the page
- **SEO notes** — recommended title tag, H1, Schema.org markup, and any specific SEO
  considerations (e.g., "add FAQPage schema for the investment case page")
- **AEO notes** — how the page should be structured for AI readability (e.g., "include a
  clear company definition paragraph", "add structured FAQ section")
- **Change type** — `new`, `restructured`, `merged`, `renamed`, `unchanged`
- **Source** — which Playbook criterion, peer URL, or IDX knowledge justifies this page

**Step 6 — Change rationale:** For every structural change: what is moving, why, which peer does
it well, which Playbook criteria it addresses.

**Step 7 — Priority tiers:** Foundational (fix first), Enhancement (next phase), Aspirational
(longer term).

**Step 8 — Service mapping:** Each recommended change mapped to the IDX service that delivers it.

RE-READ THE CLAIM CLASSIFICATION RULES ABOVE BEFORE PROCEEDING.

**Steps 9–11:** Compile artefact, render markdown, compliance self-check.

**Step 12 — Generate Excel sitemap.** After the artefact is compiled and validated, generate
an Excel file with two sheets:

#### Sheet 1: Current Structure

| Column | Content |
|--------|---------|
| Level 1 | Top-level section (e.g., "About", "Investors", "Sustainability") |
| Level 2 | Sub-section |
| Level 3 | Page |
| Level 4 | Sub-page (if applicable) |
| URL | Full URL of the page |
| Slug | Path component only (e.g., `/investors/results`) |
| Page title | `<title>` tag content |
| H1 | Main heading on the page |
| Meta description | Present / absent / generic |
| Schema.org markup | Types found (e.g., "Organization, BreadcrumbList") or "None" |
| OG tags | Present / absent |
| Canonical | Correct / missing / misconfigured |
| AEO readiness | Brief assessment: entity definition, FAQ content, AI-parseable structure |
| Content notes | Brief note on content quality and completeness |

#### Sheet 2: Recommended Structure

| Column | Content |
|--------|---------|
| Level 1 | Top-level section |
| Level 2 | Sub-section |
| Level 3 | Page |
| Level 4 | Sub-page (if applicable) |
| Recommended slug | Proposed URL path |
| Change type | `new` / `restructured` / `merged` / `renamed` / `unchanged` |
| Page purpose | What this page should achieve |
| Content notes | What content should appear |
| SEO notes | Title tag, H1, Schema.org markup recommendations |
| AEO notes | AI readability recommendations (entity definitions, FAQ structure, etc.) |
| Priority | Foundational / Enhancement / Aspirational |
| Source | Playbook criterion ID, peer URL, or IDX knowledge |
| IDX service | Which IDX service delivers this change |

Generate the Excel file using the `exceljs` npm package:

```bash
npm install exceljs  # add to session setup if not already installed
```

```javascript
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();

// Sheet 1: Current Structure
const current = workbook.addWorksheet('Current Structure');
current.columns = [
  { header: 'Level 1', key: 'l1', width: 20 },
  { header: 'Level 2', key: 'l2', width: 20 },
  { header: 'Level 3', key: 'l3', width: 25 },
  { header: 'Level 4', key: 'l4', width: 25 },
  { header: 'URL', key: 'url', width: 40 },
  { header: 'Slug', key: 'slug', width: 25 },
  { header: 'Page Title', key: 'title', width: 35 },
  { header: 'H1', key: 'h1', width: 30 },
  { header: 'Meta Description', key: 'meta', width: 15 },
  { header: 'Schema.org', key: 'schema', width: 25 },
  { header: 'OG Tags', key: 'og', width: 12 },
  { header: 'Canonical', key: 'canonical', width: 15 },
  { header: 'AEO Readiness', key: 'aeo', width: 30 },
  { header: 'Content Notes', key: 'content', width: 40 }
];
// Style header row
current.getRow(1).font = { bold: true };
current.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF12061A' } };
current.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
// Add data rows from artefact...

// Sheet 2: Recommended Structure
const recommended = workbook.addWorksheet('Recommended Structure');
recommended.columns = [
  { header: 'Level 1', key: 'l1', width: 20 },
  { header: 'Level 2', key: 'l2', width: 20 },
  { header: 'Level 3', key: 'l3', width: 25 },
  { header: 'Level 4', key: 'l4', width: 25 },
  { header: 'Recommended Slug', key: 'slug', width: 25 },
  { header: 'Change Type', key: 'change', width: 15 },
  { header: 'Page Purpose', key: 'purpose', width: 35 },
  { header: 'Content Notes', key: 'content', width: 40 },
  { header: 'SEO Notes', key: 'seo', width: 40 },
  { header: 'AEO Notes', key: 'aeo', width: 40 },
  { header: 'Priority', key: 'priority', width: 15 },
  { header: 'Source', key: 'source', width: 30 },
  { header: 'IDX Service', key: 'service', width: 25 }
];
recommended.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF12061A' } };
recommended.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
// Add data rows from artefact...

await workbook.xlsx.writeFile('{company}-sitemap.xlsx');
```

### Stage-specific report sections

```
## Current structure
{existing IA as hierarchical list with URLs — descriptive, not evaluative}

---

## SEO and AEO assessment
{per-page summary of current SEO health and AEO readiness. Flag pages with missing
meta descriptions, absent Schema.org markup, or poor AI-parseable structure.}

---

## Recommended structure
{proposed IA as hierarchical list, with change annotations and recommended slugs}

---

## Change rationale
{per-change: what, why, peer evidence [URL], Playbook reference [criteria ID]}

---

## SEO and AEO recommendations
{structural SEO recommendations: Schema.org markup strategy, URL structure, internal
linking. AEO recommendations: entity definition strategy, FAQ content, AI-readable
page structures.}

---

## Priority tiers

### Foundational
{changes to make first}

### Enhancement
{next phase changes}

### Aspirational
{longer term changes}

---

## IDX service mapping
{each change → IDX service that delivers it}
```

### Output files

- `{company}-sitemap-evidence.json`
- `{company}-sitemap-artefact.json`
- `{company}-sitemap.md`
- `{company}-sitemap.xlsx` — two-sheet Excel workbook (Current Structure + Recommended Structure)

---

## Stage 4 — Meeting pack

**Command:** `/mercury:meeting <company>`

**Purpose:** Everything needed to run a 2-hour stakeholder workshop. Synthesises stages 1–3.

**Report title:** "Meeting pack"

**Prerequisite:** Stage 1 artefact is REQUIRED. Stage 4 will not run without it. Stages 2 and 3
are optional — they enrich the meeting but are not blocking.

### Inputs

| Input | Required | Source |
|-------|----------|--------|
| Stage 1 artefact | Yes | `{company}-brief-artefact.json` — required |
| Stage 2 artefact | No | `{company}-compete-artefact.json` — enriches |
| Stage 3 artefact | No | `{company}-sitemap-artefact.json` — enriches |

### Process

Stage 4 is pure synthesis. It has no collection phase — it reads from prior artefacts only.

**Step 1 — Check artefacts:** Look for prior stage JSON files. Stage 1 must exist. Stages 2
and 3 are optional. Adjust agenda for available content.

**Step 1b — Load claims (vNext):** Extract `claims[]` from each available artefact. Claims
are the primary bounded knowledge layer for synthesis. If an artefact lacks `claims[]` (legacy),
apply the legacy compatibility shim: derive provisional claims with `status: "provisional_legacy"`
and restricted rendering power (see `references/CLAIM_SCHEMA.md` §8).

RE-READ THE CLAIM CLASSIFICATION RULES ABOVE BEFORE PROCEEDING.

**Step 2 — Generate agenda:** Default 2-hour structure. Time-boxed sections linked to source
stages. Remove sections for missing stages; reallocate time.

**Step 3 — Client pre-read:** 2–3 page external-facing document. Factual, no IDX pitch
language. Summarises research context for stakeholders. **vNext:** All statements in the
pre-read must be traceable to specific claims from prior artefacts. The pre-read must not
exceed claim scope — if a claim says "reviewed IR pages", the pre-read cannot say "the site".
Provisional legacy claims cannot support high-confidence statements in the pre-read.

**Step 4 — Facilitator guide:** Internal document. Talking points per agenda section.
**vNext:** Evidence references traced to source artefact claim IDs (not just finding IDs).
Each talking point must reference ≥1 claim. Suggested discussion questions. Document cue
notes (which report to show when).

**Step 5 — Compile artefact.** The meeting artefact includes its own `claims[]` array
containing claims carried forward from prior stages (method: `prior_stage_artefact`) plus
any new `judgement_support` claims synthesised from prior claims. New synthesis claims must
reference the prior claim IDs they are derived from.

**Step 6 — Compliance self-check** on pre-read and facilitator guide. Run checks A–H, J–N.

### Default 2-hour agenda

| Time | Section | Source |
|------|---------|--------|
| 0:00–0:10 | Welcome and agenda overview | — |
| 0:10–0:25 | Your digital context — where you sit today | Stage 1 |
| 0:25–0:50 | Competitive landscape — your peer set | Stage 2 |
| 0:50–1:10 | Current site assessment — strengths and gaps | Stage 1 |
| 1:10–1:40 | Proposed new structure — walkthrough and rationale | Stage 3 |
| 1:40–1:55 | Open discussion | Facilitator guide |
| 1:55–2:00 | Next steps and close | — |

If stage 2 or 3 outputs are missing, the agenda contracts and reallocates time.

### Output files

- `{company}-meeting-artefact.json`
- `{company}-meeting-agenda.md`
- `{company}-meeting-preread.md`
- `{company}-meeting-guide.md`

---

## Full pipeline — /mercury:all

Runs stages 1 → 2 → 3 → 4 in sequence. Each stage saves its artefact JSON, which the next
stage reads. The only point of human interaction is stage 2, step 1 (peer confirmation).

After all stages complete, offer:

> "Stage reports saved as markdown. Would you like me to generate an integrated Word document
> combining all stage reports?"

The integrated Word report reads JSON artefacts (not markdown), combines them with a cover page,
table of contents, and section dividers, and renders as branded .docx. All citation registers
are merged into a single appendix, deduplicated by source URL.

---

## BigQuery data source

Mercury accesses IDX benchmark data via the BigQuery MCP server (`mcp__bigquery__query`).
All queries are read-only. The data lives in the `sector_intelligence` dataset.

### Tables

| Table | Contents | Rows | Stages |
|-------|----------|------|--------|
| `iq_benchmarks` | IQ scores — overall and 11 categories per company | 747 companies | 1, 2 |
| `iq_criteria_detail` | Binary pass/fail for each of 356 criteria per company | ~266K rows | 1, 2, 3 |
| `analyses` | Cached prior Mercury analyses | Variable | 2, 4 |

### Coverage

| Index | Companies |
|-------|-----------|
| S&P 500 | 501 |
| FTSE 100 | 103 |
| FTSE 250 | 93 |
| STOXX 50 | 50 |

### Score columns in `iq_benchmarks`

`company`, `overall`, `company_narrative`, `content_mix`, `channel_mix`, `optimization`,
`reach`, `about_us`, `ir`, `media`, `csr`, `careers`, `reputational_resilience`,
`index_name`, `dataset_year`

### Key queries

```sql
-- Company lookup (fuzzy)
SELECT * FROM sector_intelligence.iq_benchmarks
WHERE LOWER(company) LIKE LOWER('%{name}%')

-- Index statistics
SELECT AVG(overall) as mean,
  APPROX_QUANTILES(overall, 4)[OFFSET(2)] as median,
  APPROX_QUANTILES(overall, 4)[OFFSET(1)] as p25,
  APPROX_QUANTILES(overall, 4)[OFFSET(3)] as p75
FROM sector_intelligence.iq_benchmarks
WHERE index_name = '{index}'

-- Company rank
SELECT company, overall,
  RANK() OVER (ORDER BY overall DESC) as rank,
  COUNT(*) OVER () as total
FROM sector_intelligence.iq_benchmarks
WHERE index_name = '{index}'

-- Criteria detail
SELECT criterion_number, criterion_name, category, present
FROM sector_intelligence.iq_criteria_detail
WHERE LOWER(company) LIKE LOWER('%{name}%')
ORDER BY criterion_number

-- Prior analyses
SELECT * FROM sector_intelligence.analyses
WHERE LOWER(company_name) LIKE LOWER('%{name}%')
```

### Fallback

When BigQuery MCP is unavailable, Mercury estimates IQ scores from observable criteria
using `data/benchmarks/iq-scoring-model.json`. See Step 2, Path B.

---

## Response guidelines

### Do

- Be direct and conversational
- Lead with the most useful insights
- Use specific examples from evidence
- Cite page URLs when making claims
- Reference the "IDX Corporate Website Playbook" by name for gaps
- Use British English spelling throughout
- Offer next steps after each stage

### Do not

- Mention Firecrawl, BigQuery, APIs, or technical internals
- Show raw JSON or technical errors to the consultant
- Use numerical scores in body text (qualitative assessments only; IQ percentages in the
  benchmark section)
- Invent or fabricate content not found in evidence
- Produce findings that exceed your declared capabilities
- Make tool calls during the reasoning phase
