---
name: ms-findings
description: "Mercury Strategy reasoning stage 3 — archetype matching, audience analysis, elevation to strategic implications, and structured findings output. Use when the consultant runs /ms-findings. This stage makes no tool calls after evidence loading. It reasons over pre-collected evidence only."
---

# ms-findings — Mercury Strategy synthesis stage

Reasoning stage 3 of 3. Loads all evidence from the ms-brief and ms-crawl artefacts, matches against the 13 archetypes in `references/ARCHETYPE_LIBRARY.md`, assesses audience tier support against `references/AUDIENCE_LIBRARY.md`, elevates High-confidence patterns to strategic implications, and produces a structured findings artefact and rendered markdown report.

**Critical rule:** After Phase A (evidence loading) is complete, no further tool calls are made. All reasoning operates over the evidence already in the context window.

---

## Before you begin

Read `references/FINDINGS_TEMPLATE.md` in full. Then read `references/ARCHETYPE_LIBRARY.md`, `references/AUDIENCE_LIBRARY.md`, and `references/CAPABILITY_LIBRARY.md`. These files are the authoritative sources for this stage. Do not begin reasoning without reading them.

Check that both of the following exist:
- `{company}-ms-brief-evidence.json`
- `{company}-ms-crawl-manifest.json` and `{company}-ms-crawl-structure.json`

If the crawl manifest is missing, surface a clear message. If only the brief manifest exists, offer to proceed with declared limitations — note that absence claims cannot be made and archetype evidence will be incomplete.

---

## Phase A — Evidence loading (tool calls permitted here only)

Load and read the following files in order. After this phase, make no further tool calls.

1. `{company}-ms-brief-evidence.json`
2. `{company}-ms-crawl-manifest.json`
3. `{company}-ms-crawl-structure.json`
4. All individual page evidence from `crawl_manifest.section_inventory`

After loading, record a summary of what was loaded:
```json
{
  "evidence_loaded": {
    "brief_manifest": true,
    "crawl_manifest": true,
    "pages_loaded": 0,
    "sections_assessed": [],
    "negative_verification_results": 0,
    "evidence_gaps": []
  }
}
```

Carry the `evidence_gaps` from both manifests forward — they become the limitations section of the output.

---

## Phase B — Reasoning (no tool calls)

Work through steps B1–B11 in order. Do not skip steps or reorder them. All observations must be derived from the loaded evidence — do not infer, assume, or supplement from general knowledge.

---

### B1 — Company context

From the brief manifest, establish:
- Company type (listed / private; sector; scale; listing exchange and index if applicable)
- Primary domain and scope
- Benchmark position (if in dataset)
- Material events in the last 12 months
- Coverage confidence from the crawl manifest

Material events affect interpretation of findings. A stale strategy page is a different signal before and after a CEO change. A thin careers section is different for a company that recently announced a hiring freeze. Flag material events in the consultant notes section of the output.

---

### B2 — Select relevant audience tiers

Using the company type established in B1, select the relevant audience tiers from `references/AUDIENCE_LIBRARY.md` using the selection table in `references/FINDINGS_TEMPLATE.md`:

| Company type | Always include | Include if applicable |
|-------------|---------------|----------------------|
| Listed company (any) | Tiers 1, 2, 7 | Tier 10 |
| Large industrial / B2B | Tiers 3, 7 | Tiers 5, 9 |
| Agency / consultancy | Tier 4 | Tier 7 |
| Technology / SaaS | Tiers 8, 4 | Tiers 7, 10 |
| Any with active hiring | Tier 6 | — |
| Multi-market global | All selected tiers | Tier 9 |

Record the selected tiers. Do not apply all 10 tiers to every company.

---

### B3 — Archetype matching

For each of the 13 archetypes in `references/ARCHETYPE_LIBRARY.md`, check every criterion against the loaded evidence:

- **Criterion met** — supporting evidence exists in the crawl manifest (scraped page confirms the signal described in the criterion)
- **Criterion not met** — no supporting evidence, or counter-evidence found
- **Not assessable** — the required page type was not crawled or is in the evidence gaps list

Count only met criteria toward the confidence threshold. Not-assessable criteria do not count for or against.

**Confidence thresholds:**

| Met criteria | Confidence | Action |
|-------------|------------|--------|
| 3 or more | High | Elevate to main report body |
| 2 | Medium | Appendix only, flagged for consultant |
| 1 | Low | Discard |
| 0 | None | Discard |

Record for each archetype:
```json
{
  "archetype_id": "A01",
  "archetype_name": "The document repository",
  "confidence": "high | medium | low | none",
  "criteria_met": ["A01-1", "A01-3", "A01-5"],
  "criteria_not_met": ["A01-2", "A01-4"],
  "criteria_not_assessable": ["A01-6"],
  "evidence_notes": ""
}
```

After assessing all 13 archetypes, check the co-occurrence patterns in `references/ARCHETYPE_LIBRARY.md`. Where two co-occurring archetypes are both High confidence, treat this as a systemic finding — frame the implication at the systemic level rather than as two separate issues.

---

### B4 — Audience journey assessment

For each selected audience tier, work through the three steps in `references/FINDINGS_TEMPLATE.md`:

**Step 1** — Check access pattern support: Does the site have the content this audience needs? Is the navigation pathway accessible within 3 clicks? Are the failure signals from `references/AUDIENCE_LIBRARY.md` present?

**Step 2** — Classify each tier:

| Classification | Meaning |
|---------------|---------| 
| Served | Key content needs met, access pattern supported, no failure signals |
| Underserved | Some content present but access pattern incomplete or failure signals present |
| Absent | No content layer, pathway, or signals for this audience type |

**Step 3** — Record classification and evidence notes.

Surface only Underserved and Absent tiers in the main report body (Section 4). Served tiers go to the appendix.

---

### B5 — Capability signals

For each High-confidence archetype, look up the mapped capabilities in `references/CAPABILITY_LIBRARY.md`.

Apply the sequencing rule: where both C09 (AEO audit) and C13 (AI readiness programme) are implicated by A11, surface C09 first.

Surface a maximum of four capability signals total, prioritising:
1. Archetypes with the strongest evidence (most criteria met)
2. Most direct commercial relevance to this client's profile

Do not surface capability signals for Medium-confidence archetypes.

---

### B6 — Peer calibration

Load the `peer_context` block from `{company}-ms-brief-evidence.json`. If no peer_context is present (peer research was skipped or the brief manifest is missing), record a limitations note and proceed — peer calibration is not a blocking dependency.

**Step 1 — Feature matrix comparison**

Read the feature matrix from `peer_context.feature_matrix`. For each feature (F01–F39), compare the client's status against the peer set:

- **Baseline expectation** — feature is `present` or `present_thin` for 3 or more peers: treat as a standard component for this company type. Client absence is a gap against baseline, not against best practice.
- **Leading feature** — feature is `present` for the client but `absent` or `present_thin` for most peers: note as a potential strength.
- **Sector-wide gap** — feature is `absent` for the client and most or all peers: this is a sector pattern, not a client-specific failing. Frame it as a sector opportunity, not a client gap.

**Step 2 — Refine archetype framing**

For each High-confidence archetype from B3, check whether peer evidence strengthens or complicates the framing:

- If most peers share the same archetype pattern: the client's issue is sector-wide — frame as "this is a widespread pattern among [index/sector] companies, and [client] is no exception"
- If the client is notably worse than peers: strengthen the finding with named peer examples
- If a peer has clearly addressed the pattern: use as a named positive example in benchmark framing

**Step 3 — Compile peer calibration block**

```json
{
  "peer_calibration": {
    "peers_researched": [],
    "baseline_expectations": [
      {
        "feature_id": "F01",
        "feature": "",
        "client_status": "present | absent | ...",
        "peer_consensus": "present | absent | mixed",
        "framing": "baseline_gap | leading | sector_gap | not_assessed"
      }
    ],
    "named_examples": [
      {
        "peer": "",
        "feature": "",
        "url": "",
        "notes": ""
      }
    ],
    "sector_patterns": []
  }
}
```

Named examples are used in benchmark framing in B7 findings. Each named example must have a confirmed URL from the peer research — do not use peer examples that were `not_assessed` in the feature matrix.

---

### B7 — Claim construction

For each finding that will appear in the main report body, construct a claim record:

```json
{
  "claim_id": "C-001",
  "statement": "",
  "claim_type": "fact | inference | gap | judgement_support",
  "scope": "Which pages or sections this claim is based on — never site-wide unless multi-section evidence exists",
  "certainty": "confirmed | observed | inferred | not_assessed",
  "evidence_source": "crawl manifest section and page URL(s)",
  "archetype_criteria": ["A01-1", "A01-3"]
}
```

**Certainty vocabulary:**
- `confirmed` — directly observed in scraped content
- `observed` — visible in URL inventory or navigation structure
- `inferred` — reasoned from pattern of confirmed evidence
- `not_assessed` — page type not crawled or in evidence gaps

**Scope discipline:** A claim's scope must match the evidence that supports it. If only the IR landing page was scraped, the claim scope is `"IR landing page only"` — not `"the investor relations section"` and never `"the site"`. Site-wide claims require multi-section evidence.

---

### B8 — Findings construction

Construct findings for the main report body. Each finding maps to one High-confidence archetype.

Apply the elevation test from `references/FINDINGS_TEMPLATE.md` before including any finding:
1. Does it name a specific audience affected?
2. Does it explain the consequence for that audience?
3. Does it use benchmark framing rather than best-practice framing?
4. Is it grounded in evidence from the manifest?
5. Could it not appear unchanged in a generic website audit template?

If any answer is no, the finding belongs in the appendix, not the main body.

**Benchmark framing (required):** "For a FTSE 250 industrial company with an active investor relations programme, an investment case page is a standard component."

**Best-practice framing (forbidden):** "Best practice recommends an investment case page on IR sites."

Each finding in the artefact:
```json
{
  "finding_id": "F-001",
  "theme": "",
  "severity": "significant | moderate | minor",
  "classification": "INFERENCE",
  "implication": "",
  "audience_impact": ["Institutional investors — Tier 1.1", "Sell-side analysts — Tier 1.4"],
  "claim_ids": ["C-001", "C-003"],
  "archetype_id": "A01",
  "archetype_confidence": "high"
}
```

**Severity:**
- `significant` — directly affects the company's ability to serve a primary audience tier or supports a High-confidence archetype with 5+ criteria
- `moderate` — affects a secondary audience or supports a High-confidence archetype with 3–4 criteria
- `minor` — affects a tertiary audience or is a co-occurrence signal

---

### B9 — Gap summary

Construct a gaps array from the negative verification results in the crawl manifest. Only include gaps confirmed as `absent` by the three-step verification procedure. Do not include `not_assessed` items as gaps.

```json
{
  "gap_id": "G-001",
  "concept": "",
  "description": "",
  "section": "",
  "scope": "",
  "severity": "significant | moderate | minor",
  "verified_by": "path_match | direct_probe | site_search",
  "claim_ids": [],
  "archetype_criteria": []
}
```

---

### B10 — Strategic implications

Distil the High-confidence archetype findings into strategic implications for `synthesis.implications`. Each implication is a narrative statement (2–4 sentences) describing what the pattern means for the company, not what the criteria show.

```json
{
  "synthesis": {
    "executive_summary": "",
    "implications": [
      {
        "title": "",
        "statement": "",
        "archetype_ids": ["A01"],
        "capability_ids": ["C04"],
        "claim_ids": ["C-001", "C-002"]
      }
    ]
  }
}
```

Maximum five implications, ordered by evidence strength (most criteria met first). Where two co-occurring archetypes produced a systemic finding, merge their implications into one.

---

### B11 — Compile the artefact

```json
{
  "stage": "ms-findings",
  "company": "",
  "domain": "",
  "generated_at": "",
  "evidence_loaded": {},
  "company_context": {
    "company_type": "",
    "sector": "",
    "listing_status": "",
    "benchmark": {},
    "material_events": [],
    "coverage_confidence": ""
  },
  "archetype_results": [],
  "audience_assessment": [],
  "peer_calibration": {},
  "claims": [],
  "findings": [],
  "gaps": [],
  "synthesis": {
    "executive_summary": "",
    "implications": []
  },
  "site_structure": null,
  "limitations": [],
  "appendix": {
    "archetype_evidence_tables": [],
    "audience_failure_signals": [],
    "peer_feature_matrix": {},
    "consultant_notes": []
  }
}
```

**`site_structure`:** Load the contents of `{company}-ms-crawl-structure.json` and embed it here. This is the field the adapter reads to populate `reportData.sitemapData` for the HTML directory tree and Excel site structure sheet.

**`limitations`:** Carry forward all evidence gaps from both manifests. Each limitation records the gap, its source, and whether it affected any archetype confidence determination.

---

### B12 — Self-check

Before producing any output, run the self-check from `references/FINDINGS_TEMPLATE.md`:

**Peer calibration check**
- [ ] peer_context loaded from brief manifest (or limitation noted if absent)
- [ ] Feature matrix applied — baseline expectations, leading features, sector gaps classified
- [ ] Named peer examples confirmed against feature matrix (not_assessed examples not cited)
- [ ] Archetype framing updated where peer evidence strengthens or complicates it

**Elevation check**
- [ ] No criterion-level observation appears in the main report body
- [ ] Every finding names a specific audience
- [ ] Every finding uses benchmark framing, not best-practice framing
- [ ] Every finding is traceable to the evidence manifest

**Archetype check**
- [ ] Only High-confidence archetypes appear in Section 3
- [ ] Medium-confidence archetypes are in the appendix only
- [ ] Co-occurrence patterns checked and applied
- [ ] Maximum 5 subsections in Section 3

**Audience check**
- [ ] Only relevant audience tiers selected for this company type
- [ ] Only Underserved and Absent tiers appear in Section 4
- [ ] Maximum 6 paragraphs in Section 4

**Capability check**
- [ ] Capability signals for High-confidence archetypes only
- [ ] Maximum 4 capability signals
- [ ] No recommendation language — consequence framing only
- [ ] AEO/AI sequencing: C09 before C13 where applicable

**Output constraints check**
- [ ] British English throughout
- [ ] No archetype codes (A01, C03 etc.) in client-facing sections
- [ ] No percentage scores in main report body
- [ ] No mention of Firecrawl, BigQuery, or technical infrastructure
- [ ] All absence claims verified against negative verification results

---

## Output files

### `{company}-ms-findings-artefact.json`

The complete structured artefact as defined in B10. This is the primary output — it is what the adapter reads to build `reportData` for all renderers.

### `{company}-ms-findings.md`

Rendered markdown report following the section order from `references/FINDINGS_TEMPLATE.md`:

**Main report body:**
1. Executive summary (80–120 words, prose not bullets)
2. Company and site context (100–150 words)
3. Strategic implications (one subsection per High-confidence archetype, 150–250 words each, maximum 5)
4. Audience analysis (one paragraph per Underserved/Absent tier, 80–120 words each, maximum 6)
5. Commercial signal (one paragraph per capability, 60–100 words each, maximum 4)
6. Consultant notes (5–10 bullets)

**Appendix:**
- A. Archetype evidence tables (criterion-level observations for each High and Medium-confidence archetype)
- B. Audience failure signals (specific observations per audience tier)
- C. Peer feature matrix (F01–F39 comparison across client and peer set)
- D. Document checklist results
- E. URL classification output
- F. Evidence gaps and limitations

---

## Output constraints (non-negotiable)

- British English spelling throughout
- No archetype codes (A01, A03 etc.) in Sections 1–6 — they are internal labels
- No percentage scores or IQ-style ratings in the main report body
- No phrases: "best practice", "you should", "we recommend" in Sections 1–5
- No mention of Firecrawl, BigQuery, APIs, or technical infrastructure
- All absence claims must be verified — `verified_by` field must be `path_match`, `direct_probe`, or `site_search`, not `not_run`
- Peer comparison claims must be grounded in data from the brief or crawl — do not invent peer benchmarks

---

## Phase G — Persist to BigQuery

After saving both output files, store the structured results in BigQuery using the appropriate tool for the current environment:
- **Cowork (Toolbox MCP):** `run_query`
- **Local MCP:** `mcp__bigquery__query`

This step is permitted even though Phase A is the only phase that normally makes tool calls — persistence is a post-output operation, not a reasoning step.

**Project qualification:** The INSERT examples below use fully qualified table names (`diageo-rep-247.sector_intelligence.*`). In the Toolbox environment the default project is already configured, so unqualified names (`sector_intelligence.*`) also work. Use whichever form the Toolbox accepts without error.

Generate a UUID for `analysis_id` (use `GENERATE_UUID()` in SQL). Execute the following INSERTs in order:

### 1. `sector_intelligence.ms_analyses` — one row per analysis

```sql
INSERT INTO `diageo-rep-247.sector_intelligence.ms_analyses`
  (analysis_id, company, domain, generated_at, executive_summary,
   coverage_confidence, iq_score, index_name, sector, listing_status,
   pages_loaded, sections_assessed, evidence_gaps, limitations, artefact_json)
VALUES (
  GENERATE_UUID(),
  '{company}',
  '{domain}',
  TIMESTAMP('{generated_at}'),
  '{synthesis.executive_summary}',
  '{company_context.coverage_confidence}',
  {company_context.benchmark.iq_score or NULL},
  '{company_context.benchmark.index_name}',
  '{company_context.sector}',
  '{company_context.listing_status}',
  {evidence_loaded.pages_loaded},
  ['{sections_assessed_1}', ...],
  ['{evidence_gaps_1}', ...],
  ['{limitations_1}', ...],
  '{full artefact JSON, escaped}'
)
```

Use the returned `analysis_id` (or use a CTE with `GENERATE_UUID()` aliased) for the child table inserts.

### 2. `sector_intelligence.ms_findings` — one row per finding

Insert each item from the `findings[]` array.

### 3. `sector_intelligence.ms_gaps` — one row per gap

Insert each item from the `gaps[]` array.

### 4. `sector_intelligence.ms_claims` — one row per claim

Insert each item from the `claims[]` array.

**Error handling:** If BigQuery is unavailable or the insert fails, log a warning but do not block the stage. The JSON artefact file is the primary output; BigQuery persistence is supplementary.

---

## Stage completion

After saving both output files and persisting to BigQuery, show a clean summary:

**Show:**
- Findings by severity (significant / moderate / minor — counts)
- Gaps identified (count)
- Top 3 strategic implications (one sentence each)
- Limitations (if any materially affect the findings)

**Offer output formats:**
- **HTML** — interactive presentation with directory tree
- **Word** — branded .docx
- **Slides** — branded .pptx
- **Excel** — structured workbook with site structure sheet

**Render on request** — when the consultant picks a format, use `mercury-output.js` `renderStage()` with `stage: 'ms_findings'`.

Do not show raw JSON. Do not show criterion-level observations in the summary — lead with the strategic implications.
