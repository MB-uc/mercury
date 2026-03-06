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
- `PLAYBOOK_REFERENCE.md` — IDX Corporate Website Playbook evaluation criteria
- `IQ_CRITERIA.md` — Connect.IQ benchmark methodology and company dataset
- `DOCUMENT_CHECKLIST.md` — 130-item document type inventory
- `SITE_CONFIGS.md` — Firecrawl domain overrides

**Data files** (in `data/`):
- `benchmarks.json` — Offline snapshot of top 200 companies plus index medians

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

6. **Analysis** — reason over collected evidence only
7. **Claim classification** — tag every substantive claim (re-read rules before each section)
8. **Artefact compilation** — save `{company}-{stage}-artefact.json`
9. **Markdown rendering** — generate report from artefact (not freehand)
10. **Compliance self-check** — run checks A–I (Stage 1) or A–H (Stages 2–4); repair failures

During reasoning, do not make additional tool calls. If you discover a gap in evidence, record
it in the limitations section — do not attempt to fill it. This boundary is critical. Violations
undermine the entire provenance chain.

---

## Capability detection

At the start of every stage, silently probe each tool. Record the result.

| Capability | How to detect | What it enables |
|------------|--------------|-----------------|
| `web_search` | Attempt a trivial search | Situational awareness, news, corporate signals |
| `web_fetch` | Attempt to fetch a known URL | Page content retrieval, document access |
| `evidence_collector` | Check if MCP server responds | Sitemap parsing, batch screenshots |
| `idx_api` | Attempt `GET /benchmarks/test` | IQ scores, client data, case studies |
| `firecrawl` | Check if API key is set | Deep site crawling |
| `bash` | Attempt a trivial command | File operations, offline data access |

### Capability manifest

Log at the top of every stage report:

```
## Capability declaration

| Tool | Status | Impact |
|------|--------|--------|
| web_search | ✓ Available | Full situational awareness |
| web_fetch | ✓ Available | Direct page content |
| evidence_collector | ✗ Unavailable | No batch screenshots; text only |
| idx_api | ✗ Unavailable | Using offline benchmarks (Jan 2026) |
| firecrawl | ✗ Unavailable | Manual navigation only |
| bash | ✓ Available | File operations enabled |
```

### Permitted finding types

The capability manifest is a constraint, not just information. Once declared, it locks which
findings the stage can produce. You cannot generate findings that require capabilities you do
not have — even if you "know" the answer from training data.

| Finding type | Requires | Without it |
|-------------|----------|------------|
| Page content claims | `web_fetch` or `evidence_collector` | Prohibited |
| Structural claims (quantitative) | `web_fetch` or `evidence_collector` or `firecrawl` | Qualitative only from search snippets |
| Visual/UX claims | `evidence_collector` (screenshots) | Prohibited entirely |
| Benchmark scores (specific) | `idx_api` or offline `benchmarks.json` | Estimated band only |
| Situational claims | `web_search` | Prohibited — no situational section |
| Client analytics | `idx_api` with client confirmation | Prohibited — treated as prospect |
| Document presence | `web_fetch` or `web_search` | Only if URL found in search results |

### Degradation fallbacks

| Missing tool | Fallback | Report annotation |
|-------------|----------|-------------------|
| `idx_api` | Use `data/benchmarks.json` | "Using offline benchmark data from [date]" |
| `idx_api` (client check) | Skip; treat as prospect | "Client status could not be verified" |
| `idx_api` (case studies) | Omit section | "Case study matching unavailable" |
| `web_search` | Skip situational awareness | "Situational context unavailable" |
| `web_fetch` | Search snippets + cached evidence | "Direct page access unavailable" |
| `evidence_collector` | Manual navigation via web_fetch | "No batch evidence collection" |
| `firecrawl` | sitemap.xml + manual navigation | "Deep crawl unavailable" |
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
| [3] | API | Connect.IQ, FTSE 100 index | Offline, Jan 2026 | F-004 |
| [4] | Search | web_search: "company leadership 2025" | 26 Feb 2026 | F-005 |
```

Rules:
- Every `[FACT]` must have at least one numbered citation reference
- Search-sourced facts cite the query used
- Offline benchmark facts cite the snapshot date
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

Append the self-check result to the JSON artefact as a `compliance` object. If any check fails,
attempt a targeted repair. If repair fails, note in the limitations section.

---

## Evidence manifest schema

Saved as `{company}-{stage}-evidence.json` at the end of the collection phase.

```json
{
  "company": "Company Name plc",
  "domain": "company.com",
  "stage": "brief",
  "collected_at": "2026-02-26T14:30:00Z",
  "capabilities_available": ["web_search", "web_fetch", "bash"],
  "capabilities_unavailable": ["idx_api", "evidence_collector", "firecrawl"],
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
      "source": "benchmarks.json (offline snapshot)",
      "tool_used": "bash",
      "accessed_at": "2026-02-26T14:30:30Z",
      "content_summary": "IQ scores: overall 42.3%, IR 38.1%, index median 38.6%"
    }
  ],
  "evidence_gaps": [
    "No screenshots captured (evidence_collector unavailable)",
    "IQ scores from offline snapshot, not live API"
  ]
}
```

---

## Artefact schema

Saved as `{company}-{stage}-artefact.json` at the end of the reasoning phase. The `findings`
shape varies by stage — all other fields are fixed.

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
  "findings": [
    {
      "id": "F-001",
      "classification": "FACT",
      "claim": "The IR landing page lists three upcoming results dates",
      "evidence": ["E-001"],
      "citations": [1],
      "severity": "positive",
      "section": "website_assessment"
    },
    {
      "id": "F-002",
      "classification": "INFERENCE",
      "claim": "Strategy content appears to pre-date the most recent results",
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
      "evidence": ["E-001"],
      "citations": [1]
    },
    {
      "category": "Investment case page",
      "status": "searched_not_found",
      "search_method": "Navigated IR section; searched site for 'investment case', 'why invest'",
      "evidence": [],
      "citations": []
    }
  ],
  "synthesis": {
    "overall_assessment": "[JUDGEMENT] Overall assessment text.",
    "priorities": [
      {
        "priority": 1,
        "recommendation": "What to do",
        "rationale": "Why — referencing F-001, F-002",
        "effort": "medium",
        "impact": "high"
      }
    ]
  },
  "limitations": [
    "No screenshots captured (evidence_collector unavailable)",
    "Situational context limited to web_search snippets"
  ],
  "citations": [
    {
      "ref": 1,
      "type": "web_page",
      "source": "https://www.company.com/investors",
      "accessed": "2026-02-26",
      "claims_supported": ["F-001", "F-002"]
    }
  ],
  "compliance": {
    "checks_passed": 8,
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

## Write fallback

When `idx_api` is unavailable for writing results:

1. Save the analysis JSON to `mercury-queue/{timestamp}-{company}-{stage}.json`
2. Notify: "Analysis saved locally. It will sync to IDX when you're next connected."
3. A daily check POSTs queued files to `POST /queue` when connectivity returns

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

**Step 2 — Benchmark check (deterministic):** Fetch IQ scores from `idx_api` or
`data/benchmarks.json`. Fetch index medians for context. If in dataset: rank, percentile,
category breakdown. If not: estimate band from sector/index medians.

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

**Step 4 — Website quick audit (web_fetch/evidence_collector):** Assess core page types:
homepage, about, IR, sustainability, careers, governance. For each: what exists, what's strong,
what's missing vs Playbook (see `PLAYBOOK_REFERENCE.md`). Check for listed company documents
(Annual Report, results presentations). On the homepage, note any news, stories, or
announcements being surfaced — these often signal material recent events that may not yet be
prominent in search results.

**Step 5 — Client check (idx_api only):** If confirmed IDX client: GA4 trends, Leadfeeder data,
engagement metrics. If prospect or API unavailable: skip, note as prospect.

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
{scores, rank, percentile — or estimated band. Cite data source.}

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

**Step 2 — Per-peer research:** For each confirmed peer: fetch IQ scores (API or offline),
website quick audit (same method as stage 1), document checklist check, section classification.

**Step 3 — Sector patterns (idx_api only):** Fetch cross-client patterns from IDX research
history. Skip if API unavailable.

**Step 4 — Save evidence manifest.**

### Reasoning phase steps

**Step 5 — Comparative analysis:** Build comparison matrix: client vs each peer vs sector median.
Dimensions: overall IQ, about, IR, sustainability, careers, media. Identify where client leads
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
{side-by-side scores for all companies in the comparison}
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
fetch fresh via web_fetch/evidence_collector.

**Step 2 — Supplementary evidence:** Only if prior stages are missing. Fetch current site
structure and peer structures.

**Step 3 — Save evidence manifest.**

### Reasoning phase steps

**Step 4 — Recommended structure:** Three sources: Playbook best practice
(`PLAYBOOK_REFERENCE.md`), top peer structures (from stage 2 artefact), IDX sector knowledge.
Every new section or page must be justified by at least one source. No "best practice says"
without a specific reference.

**Step 5 — Change rationale:** For every structural change: what is moving, why, which peer does
it well, which Playbook criteria it addresses.

**Step 6 — Priority tiers:** Foundational (fix first), Enhancement (next phase), Aspirational
(longer term).

**Step 7 — Service mapping:** Each recommended change mapped to the IDX service that delivers it.

RE-READ THE CLAIM CLASSIFICATION RULES ABOVE BEFORE PROCEEDING.

**Steps 8–10:** Compile artefact, render markdown, compliance self-check.

### Stage-specific report sections

```
## Current structure
{existing IA as nested list — descriptive, not evaluative}

---

## Recommended structure
{proposed IA as nested list, with change annotations}

---

## Change rationale
{per-change: what, why, peer evidence [URL], Playbook reference [criteria ID]}

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

RE-READ THE CLAIM CLASSIFICATION RULES ABOVE BEFORE PROCEEDING.

**Step 2 — Generate agenda:** Default 2-hour structure. Time-boxed sections linked to source
stages. Remove sections for missing stages; reallocate time.

**Step 3 — Client pre-read:** 2–3 page external-facing document. Factual, no IDX pitch
language. Summarises research context for stakeholders. All claims classified and cited.

**Step 4 — Facilitator guide:** Internal document. Talking points per agenda section. Evidence
references traced to source artefact finding IDs. Suggested discussion questions. Document cue
notes (which report to show when).

**Step 5 — Compliance self-check** on pre-read and facilitator guide.

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

## IDX API endpoints

Called when `idx_api` is available. All read-only except for storing results.

### Read

| Endpoint | Returns | Stages |
|----------|---------|--------|
| `GET /benchmarks/{company}` | IQ scores — overall and by category | 1, 2 |
| `GET /benchmarks/index/{index}` | Median, P25, P75 for an index | 1, 2 |
| `GET /benchmarks/sector/{sector}` | Sector-level distribution | 2 |
| `GET /criteria/{company}` | Granular criteria pass/fail | 1, 3 |
| `GET /analyses/{company}` | Cached prior analyses | 2, 4 |
| `GET /clients/{id}/analytics` | GA4 and Leadfeeder data (gated) | 1 |
| `GET /case-studies` | IDX project references | 1, 3 |
| `GET /sector-patterns/{sector}` | Cross-client patterns (anonymised) | 2 |

### Write

| Endpoint | Accepts | Stages |
|----------|---------|--------|
| `POST /analyses` | Full analysis result JSON | All |
| `POST /queue` | Same payload (offline fallback) | All |

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
