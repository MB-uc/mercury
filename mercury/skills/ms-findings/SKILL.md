---
name: ms-findings
description: >
  Strategic synthesis for Mercury Strategy. Takes the ms-brief evidence manifest and ms-crawl
  page evidence pack, constructs bounded claims, runs archetype checks against the audience and
  capability libraries, identifies gaps and patterns, and produces a structured findings artefact
  with strategic implications. This is a pure reasoning skill — no tool calls after the evidence
  loading step. Invoke via /ms-findings <company name>.
---

# MS-Findings — strategic synthesis

## Role in the Mercury Strategy pipeline

MS-Findings is the third and final stage of the Mercury Strategy pipeline. It runs after `ms-crawl` and produces the deliverable.

**The two-agent separation principle.** MS-Findings is the reasoning agent. Its evidence is fixed — it is whatever `ms-brief` and `ms-crawl` collected. MS-Findings cannot make tool calls to fetch new evidence. If a gap exists in the evidence, it is recorded as a limitation, not filled by an additional fetch.

**What this skill does:**
- Loads evidence from `ms-brief` and `ms-crawl` outputs
- Constructs bounded claims following the claim builder rules
- Checks pages against archetypes in `ARCHETYPE_LIBRARY.md` and audience needs in `AUDIENCE_LIBRARY.md`
- Identifies capability patterns using `CAPABILITY_LIBRARY.md`
- Synthesises findings into strategic implications (never criterion-level observations)
- Produces a structured findings artefact and rendered report

**What this skill does not do:**
- It does not make tool calls to fetch additional evidence
- It does not produce IQ scores or percentage scores
- It does not use "best practice" language
- It does not produce criterion-level observations in the findings body — implications only
- It does not compare the company to peers (that is a separate stage if commissioned)

---

## Reference files

- `FINDINGS_TEMPLATE.md` — the required output structure and section-by-section instructions
- `ARCHETYPE_LIBRARY.md` — page archetypes with expected components (core and enhanced)
- `AUDIENCE_LIBRARY.md` — audience types with information needs and journey expectations
- `CAPABILITY_LIBRARY.md` — IDX service capabilities and how they map to findings
- `NEGATIVE_VERIFICATION_CONCEPTS.md` — bounded absence language rules

---

## Prerequisites

Both of the following must exist:
- `{company}-ms-brief-evidence.json`
- `{company}-ms-crawl-manifest.json` and the pages directory it references

If the brief manifest is missing, surface a clear message and halt.
If the crawl manifest is missing but the brief manifest exists, surface a clear message. Offer to run MS-Findings from brief evidence only — with a declared limitation that page-level evidence is absent.

---

## Core principles

**1. No tool calls after evidence loading.** Load all evidence files at the start of Phase B. Then reason from what you have. If you discover a gap, record it as a limitation. Do not attempt to fill it.

**2. Implications only in the findings body.** The findings report does not list criterion-level observations. It does not say "the IR landing page is missing component ir-07". It says what that absence means strategically — for an investor audience, for a competitor gap, for an IDX opportunity. The elevation principle: every finding must be expressed at the level of strategic implication.

**3. Archetype confidence thresholds.** The archetype check produces a confidence level for each archetype assessed. Only archetypes meeting their threshold enter the findings body:
   - **High confidence** (3+ criteria with evidence): include in main findings body
   - **Medium confidence** (2 criteria with evidence): include in appendix with declared confidence level
   - **Low confidence** (fewer than 2 criteria): discard — record in limitations

**4. No IQ scoring, no percentage scores.** Do not produce numerical scores. Do not produce percentage-based assessments. The archetype check uses component counts internally to reach confidence thresholds — these counts are not surfaced in the report.

**5. No "best practice" language.** Do not write "best practice suggests", "industry standard is", or "leading companies do". Instead: name a specific archetype expectation from `ARCHETYPE_LIBRARY.md`, or name a specific audience need from `AUDIENCE_LIBRARY.md`.

**6. Bounded claims.** Every claim is scoped to what was actually assessed. See claim construction below and `NEGATIVE_VERIFICATION_CONCEPTS.md`.

---

## Phase A — Evidence loading (one-time, tool calls permitted)

At the start of the run, load all evidence:

1. Load `{company}-ms-brief-evidence.json`
2. Load `{company}-ms-crawl-manifest.json`
3. Load all page evidence files from the pages directory listed in the crawl manifest

Record what was loaded in the findings artefact header:
```json
{
  "evidence_loaded": {
    "brief_manifest": "{company}-ms-brief-evidence.json",
    "crawl_manifest": "{company}-ms-crawl-manifest.json",
    "pages_loaded": 38,
    "documents_loaded": 3,
    "evidence_gaps": ["IR results page not retrieved (HTTP 403)", "CMD deck not extracted"]
  }
}
```

After this step, **no further tool calls**. Reasoning begins.

---

## Phase B — Reasoning

All of Phase B runs without tool calls. Work through the steps in sequence.

### Step 1 — Company context summary

From the brief manifest, extract and summarise:
- Company identity, sector, listing status
- Benchmark position (if available): index, rank, category strengths and weaknesses — reported as descriptive context, not as a score
- Situational context: material events from the last six months, flagged material events from the checklist
- Scope focus area

This becomes the opening section of the findings report.

### Step 2 — Archetype checks

For each page archetype that is relevant to the scope focus (defined in `ARCHETYPE_LIBRARY.md`), check the page evidence against the archetype's expected components.

**Process:**
1. Identify which pages in the evidence pack correspond to this archetype
2. For each expected component (core and enhanced), check: is there evidence this component is present? Is there evidence it is absent? Or is it not assessed (no evidence either way)?
3. Record presence / absence / not_assessed for each component, with the evidence source
4. Count confirmed-present components to determine confidence level

**Confidence thresholds:**
- **High** (3+ components with direct evidence — present or confirmed absent): enter main findings body
- **Medium** (2 components with direct evidence): enter appendix
- **Low** (fewer than 2): discard, record in limitations as "insufficient evidence to assess {archetype}"

**What enters the findings body is implications, not component lists.** The component check is the analytical step. What gets written is what the pattern means.

Example of what NOT to write:
> "The IR landing page is missing components ir-06 (latest results snapshot), ir-07 (investment case), and ir-08 (upcoming events module)."

Example of what TO write:
> "The IR landing page requires investors to navigate to find the information they arrive seeking — current performance data, upcoming dates, and the investment rationale. Investors who cannot quickly answer 'why hold' and 'what's next' are more likely to disengage."

### Step 3 — Audience journey assessment

Using `AUDIENCE_LIBRARY.md`, assess the site's performance against the information needs of audiences relevant to the scope.

For each audience type in scope:
1. Identify the journey stages and key information needs
2. Map available page evidence to those needs — is the information present, navigable, and accessible?
3. Record which needs are met, which are unmet, and which cannot be assessed from available evidence

The audience assessment feeds the findings body. Express as: what the audience experiences, what they cannot easily find, and what that means.

### Step 4 — Capability patterns

Using `CAPABILITY_LIBRARY.md`, identify which IDX service capabilities are most relevant given the patterns observed in the archetype and audience assessments.

Capability mapping is an internal analytical step — it informs how findings are framed as opportunities. It does not appear verbatim in the client-facing report. The findings report expresses opportunities in terms of audience outcomes and strategic effect, not IDX service names.

### Step 5 — Claim construction

Before building findings, construct the claim ledger. Every finding must be traceable to one or more claims.

**Claim types used in MS-Findings:**

| Type | When to use |
|------|-------------|
| `fact` | Directly verifiable from page evidence (page title, H1, document link present) |
| `inference` | Reasonable conclusion from page evidence pattern |
| `gap` | Bounded absence — expected component not found in assessed pages |
| `judgement_support` | Strategic implication derived from one or more claims |

**Scope discipline:** Every claim is scoped to what was actually assessed. See `NEGATIVE_VERIFICATION_CONCEPTS.md` for required language patterns.

**Required claim fields:**
```json
{
  "claim_id": "C-001",
  "statement": "The IR landing page does not display current performance data or upcoming events without navigation",
  "claim_type": "gap",
  "scope": "IR landing page (p-008)",
  "certainty": "observed",
  "method": "web_fetch",
  "evidence_ids": ["p-008"],
  "status": "active"
}
```

**Hard rules — violations cause rejection:**
1. Claims using site-wide language ("the site", "there is no", "nowhere on") require evidence from 2+ distinct sections
2. Negative claims must use bounded language matching the actual assessment scope
3. Certainty vocabulary: only `confirmed`, `observed`, `inferred`, `not_assessed`

### Step 6 — Findings construction

Build findings from validated claims. Group by theme, not by section or archetype.

**Elevation principle:** Every finding is expressed as a strategic implication, not a criterion-level observation. Ask: what does this mean for the investor / the analyst / the talent prospect? What is the opportunity? What is the competitive risk?

**Finding structure:**
```json
{
  "finding_id": "F-001",
  "theme": "Investor orientation",
  "classification": "INFERENCE",
  "implication": "The IR section requires investors to navigate before finding the information they typically arrive seeking.",
  "claim_ids": ["C-001", "C-002", "C-003"],
  "confidence": "multiple sources",
  "audience_impact": ["institutional_investor", "retail_investor"],
  "severity": "significant"
}
```

**Severity levels:**
- `significant` — affects a primary audience journey or creates a material gap vs audience expectations
- `moderate` — affects a secondary journey or creates a gap vs enhanced expectations
- `minor` — improvement opportunity with limited audience impact

**What not to include in findings:**
- Component counts or checklists
- Percentage scores or numerical ratings
- "Best practice" references without a named archetype or audience need
- Share price, analyst opinions, financial performance commentary

### Step 7 — Gap summary

Produce a structured gap summary from gap-type claims. Group gaps by audience and severity.

The gap summary is distinct from the findings body. It is a referenced inventory — it exists to allow a consultant to quickly locate specific gaps without reading the full findings narrative.

Each gap entry:
```json
{
  "gap_id": "G-001",
  "section": "Investor relations",
  "description": "No investment case or equity story visible in reviewed IR pages",
  "scope": "IR landing page and IR sub-navigation (reviewed pages)",
  "audience": ["institutional_investor", "analyst"],
  "severity": "significant",
  "claim_ids": ["C-005"]
}
```

### Step 8 — Strategic implications

The strategic implications section synthesises the most important patterns into 3–5 high-level statements about what the evidence means for the company's digital communications position.

These are `[JUDGEMENT]`-tagged statements. They are the only section where judgement-type claims appear. They must reference the finding IDs that support them.

**What makes a strong strategic implication:**
- It speaks to audience effect, not page structure
- It identifies a pattern across multiple findings, not a single observation
- It points towards an outcome (what could change and why it matters), not a prescription (what to do)

### Step 9 — Compile findings artefact

Save `{company}-ms-findings-artefact.json` using the schema in `FINDINGS_TEMPLATE.md`.

The artefact contains:
- Evidence loading summary
- Claims ledger (`claims[]` and `claim_builder_errors[]`)
- Archetype check results (including confidence levels and what was discarded)
- Audience assessment results
- Findings (`findings[]`)
- Gap summary (`gaps[]`)
- Strategic implications (`synthesis.implications[]`)
- Limitations
- Compliance record

### Step 10 — Rendered report

Assemble the final markdown report from the validated artefact. Follow the section structure in `FINDINGS_TEMPLATE.md` exactly.

**Section order:**
1. Company context
2. Strategic implications (lead with the most important)
3. Findings by theme (main body — implications only, no criterion lists)
4. Gap summary (referenced inventory)
5. Audience assessment highlights
6. Limitations
7. Appendix A: medium-confidence archetype notes
8. Appendix B: claims and evidence register

### Step 11 — Compliance self-check

Before saving, run these checks:

| Check | Rule |
|-------|------|
| No criterion lists in findings body | Findings express implications, not component checks |
| No IQ scores or percentage scores | Not permitted |
| No "best practice" language | Replace with named archetype expectation or audience need |
| No site-wide claims without multi-section evidence | Scope discipline |
| Every finding has claim_ids | Traceability |
| Every gap is bounded to assessed scope | Bounded absence |
| Archetype confidence thresholds applied | Low-confidence archetypes discarded |
| No tool calls made after Phase A | Collection/reasoning separation |

---

## Output files

- `{company}-ms-findings-artefact.json` — structured findings with claims, gaps, and synthesis
- `{company}-ms-findings.md` — rendered markdown report

---

## Response guidelines for the consultant

After saving the artefact and report, present a clean summary:

- Stage name and company
- Number of findings by severity (significant / moderate / minor)
- Number of gaps identified
- Top 3 strategic implications (one sentence each)
- Limitations declared (what was not assessed)

Do not show raw JSON or artefact structure. Do not list criterion-level observations. Lead with the implications.

Offer: download as HTML / Word / Slides.
