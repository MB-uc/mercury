# Claim Schema and Claim Builder — Mercury vNext

This document defines the claim-ledger governance layer that sits between evidence and findings. It is normative: every stage must follow these rules at construction time.

---

## 1. Claim schema

Every stage artefact contains a top-level `"claims": []` array. Each claim is an atomic, bounded statement about the entity under analysis.

```json
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
}
```

### Field definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `claim_id` | string | yes | Stable identifier, format `C-NNN` |
| `entity` | string | yes | Company or peer the claim concerns |
| `domain` | string | yes | Site domain (e.g. `rolls-royce.com`) |
| `stage` | enum | yes | `brief` / `compete` / `sitemap` / `meeting` |
| `statement` | string | yes | Tightly bounded claim sentence |
| `claim_type` | enum | yes | See §2 |
| `scope` | string | yes | Explicit boundary of what was assessed |
| `certainty` | enum | yes | See §3 |
| `method` | enum | yes | See §4 |
| `evidence_ids` | array | conditional | Required unless method is `prior_stage_artefact` |
| `source_finding_ids` | array | no | Finding IDs this claim supports |
| `status` | enum | yes | See §5 |
| `supersedes_claim_id` | string | no | ID of claim this one replaces |
| `created_at` | string | yes | ISO 8601 timestamp |

---

## 2. Claim types

| Value | Meaning | Rules |
|-------|---------|-------|
| `fact` | Directly verifiable from evidence | Must have ≥1 evidence_id |
| `inference` | Reasonable conclusion from evidence | Must have ≥1 evidence_id + scope must not exceed evidence boundary |
| `gap` | Bounded absence — something expected but not found | Scope must name exactly what was searched |
| `recommendation_support` | Evidence supporting a recommendation | Must reference the gap or inference it supports |
| `judgement_support` | Professional opinion grounded in claims | Permitted only for synthesis; must reference ≥1 prior claim |

---

## 3. Certainty values

Only these values are permitted:

| Value | Meaning |
|-------|---------|
| `confirmed` | Verified from primary source |
| `observed` | Seen directly but not independently verified |
| `inferred` | Derived from indirect evidence |
| `not_assessed` | Explicitly not evaluated |

No other certainty values may appear. The claim builder must reject any claim with an unlisted certainty value.

---

## 4. Method values

| Value | Meaning |
|-------|---------|
| `web_fetch` | Page content retrieved directly |
| `web_search` | Found via search query |
| `benchmark_snapshot` | From offline benchmark data |
| `prior_stage_artefact` | Carried forward from earlier stage claim |
| `manual_override` | Analyst override with justification |

---

## 5. Status values

| Value | Meaning |
|-------|---------|
| `active` | Current and valid |
| `superseded` | Replaced by a newer claim (see `supersedes_claim_id`) |
| `disputed` | Under review or contradicted by later evidence |
| `withdrawn` | Retracted |
| `provisional_legacy` | Derived from legacy artefact without claims — see §8 |

---

## 6. Claim builder — construction-time enforcement

The claim builder runs between evidence collection (Phase A) and findings generation (Phase B). It is a validation gate: claims that fail construction rules are **rejected and never enter the artefact**.

### Builder responsibilities

1. Build atomic claims from evidence items
2. Enforce explicit scope on every claim
3. Enforce allowed certainty vocabulary
4. Enforce evidence linkage
5. **Reject** unsupported site-wide claims at construction time
6. Record all rejected claims in `claim_builder_errors[]`

### Construction sequence

```
For each evidence item:
  1. Draft candidate claim(s)
  2. Validate required fields (claim_id, entity, domain, stage, statement, claim_type, scope, certainty, method, created_at)
  3. Validate certainty ∈ {confirmed, observed, inferred, not_assessed}
  4. Validate claim_type ∈ {fact, inference, gap, recommendation_support, judgement_support}
  5. Validate method ∈ {web_fetch, web_search, benchmark_snapshot, prior_stage_artefact, manual_override}
  6. Validate evidence linkage (evidence_ids required unless method = prior_stage_artefact)
  7. Run scope inflation check (Rule 2)
  8. Run negative claim boundary check (Rule 3)
  9. If all pass → add to claims[]
  10. If any fail → add rejection record to claim_builder_errors[]
```

---

## 7. Hard enforcement rules

These rules are enforced at claim construction time. Violations cause rejection, not warnings.

### Rule 1 — Required fields

Every claim must include all required fields from §1. Missing `scope`, `certainty`, or `evidence_ids` (when required) causes immediate rejection.

### Rule 2 — Site-wide claims must be justified

**Reject** any claim whose `statement` uses site-wide or domain-wide language unless the claim is supported by evidence from **two or more distinct site sections** or evidence sources.

Trigger phrases (case-insensitive):

- "the site"
- "the company website"
- "anywhere on the site"
- "there is no"
- "does not have"
- "nowhere on"
- "across the site"
- "the entire site"
- "site-wide"
- "no evidence of" (when scope is not bounded)

**Action on detection:**

1. Check whether `evidence_ids` reference items from ≥2 distinct site sections
2. If yes → allow, but scope must name the sections assessed
3. If no → **reject** the claim
4. Log rejection in `claim_builder_errors[]` with reason `"unsupported_site_wide_claim"`

### Rule 3 — Negative claims must remain bounded

Claims asserting absence must use bounded language that matches the actual scope of assessment.

**Allowed:**
```
"No dedicated investment case page was identified in the reviewed IR pages"
scope: "reviewed IR pages"
```

**Rejected:**
```
"There is no investment case page on the site"
scope: "rolls-royce.com"  ← scope too broad for evidence
```

**Enforcement:** If a claim's `statement` asserts absence and its `scope` does not match the actual evidence boundary, **reject** the claim with reason `"unbounded_negative_claim"`.

### Rule 4 — searched_not_found behaviour

When an evidence item has type `searched_not_found` or equivalent, any derived claim must:

- Use certainty `observed` or `inferred` (never `confirmed`)
- Use scope that names what was actually searched
- Render as bounded absence, never universal absence

### Rule 5 — Renderer must be claim-backed

The renderer must compose output from claims and claim-backed findings. It must not generate prose first and validate against claims afterwards. This is enforced at the rendering layer, not the claim builder.

### Rule 6 — Stage 4 synthesis

Stage 4 must synthesise from `claims[]` as the primary knowledge layer. Findings provide interpretive context. The meeting pre-read must not exceed claim scope.

---

## 8. Legacy compatibility shim

Artefacts produced before vNext will not contain a `claims[]` array. When Stage 4 or the renderer encounters a legacy artefact:

1. Derive provisional claims from `findings[]` entries
2. Mark every derived claim with `status: "provisional_legacy"`
3. Apply these restrictions to provisional legacy claims:
   - Cannot support `certainty: "confirmed"` rendering — downgrade to `"inferred"`
   - Cannot support site-wide claims — scope must be `"legacy artefact — scope unknown"`
   - Cannot support universal absence statements
   - Cannot be used as the sole basis for high-confidence synthesis
4. Log the derivation in `claim_builder_errors[]` with reason `"legacy_artefact_derivation"`

---

## 9. Claim builder errors schema

Every artefact includes a `"claim_builder_errors": []` array alongside `claims[]`.

```json
{
  "error_id": "CBE-001",
  "candidate_statement": "There is no investment case page on the site",
  "candidate_scope": "rolls-royce.com",
  "rejection_reason": "unsupported_site_wide_claim",
  "evidence_ids": ["E-010"],
  "detail": "Claim uses site-wide language but evidence covers only reviewed IR pages (1 section). Requires ≥2 distinct sections.",
  "suggested_revision": "No dedicated investment case page was identified in the reviewed IR pages",
  "suggested_scope": "reviewed IR pages"
}
```

### Rejection reasons

| Reason | Trigger |
|--------|---------|
| `missing_required_field` | A required field is absent or empty |
| `invalid_certainty` | Certainty value not in allowed set |
| `invalid_claim_type` | Claim type not in allowed set |
| `invalid_method` | Method not in allowed set |
| `missing_evidence_linkage` | No evidence_ids and method ≠ prior_stage_artefact |
| `unsupported_site_wide_claim` | Site-wide language without multi-section evidence |
| `unbounded_negative_claim` | Negative assertion with scope broader than evidence |
| `legacy_artefact_derivation` | Claim derived from legacy artefact without native claims |

---

## 10. Artefact schema changes

The stage artefact gains two new top-level arrays:

```json
{
  "company": "...",
  "domain": "...",
  "stage": "...",
  "claims": [],
  "claim_builder_errors": [],
  "findings": [],
  "gap_analysis": [],
  "synthesis": {},
  "...existing fields..."
}
```

### Finding linkage

Every finding must now include a `claim_ids` array referencing the claims it is derived from:

```json
{
  "id": "F-001",
  "classification": "FACT",
  "claim": "The IR landing page lists three upcoming results dates",
  "claim_ids": ["C-001"],
  "evidence": ["E-001"],
  "citations": [1],
  "severity": "positive",
  "section": "website_assessment"
}
```

Findings without `claim_ids` are non-compliant under check J.

### Gap analysis linkage

Gap analysis entries must reference claim IDs:

```json
{
  "category": "Investment case page",
  "status": "not_found",
  "detail": "No dedicated investment case page was identified in the reviewed IR pages",
  "claim_ids": ["C-010"],
  "evidence": ["E-010"],
  "citations": [10]
}
```

### Synthesis linkage

Synthesis priorities must reference claim IDs:

```json
{
  "priority": 1,
  "recommendation": "Add a dedicated investment case page",
  "rationale": "Based on C-010 (gap) and C-005 (peer comparison)",
  "claim_ids": ["C-010", "C-005"],
  "effort": "medium",
  "impact": "high"
}
```

### Rendered units

Before final markdown assembly, build discrete rendered units — each a narrative chunk
linked to its source claims. This is the validator checkpoint.

```json
{
  "rendered_units": [
    {
      "unit_id": "RU-001",
      "text": "No dedicated investment case page was identified in the reviewed IR pages.",
      "claim_ids": ["C-010"],
      "section": "gap_analysis"
    }
  ]
}
```

Rendered units are validated by the artefact validator (`validators/validate_artefact.py`)
before final markdown is assembled. The validator checks:

- Every rendered unit has `claim_ids` referencing existing claims (V011)
- Rendered text does not exceed claim scope (V012)
- Rendered units do not reference only superseded/withdrawn claims (V013)

---

## 11. Artefact validator

The artefact validator provides **hard enforcement** — deterministic, code-level validation
that rejects artefacts violating claim governance rules.

**Usage:**
```bash
python validators/validate_artefact.py {company}-{stage}-artefact.json
```

**Exit codes:**
- `0` — PASS or PASS_WITH_WARNINGS
- `1` — FAIL (artefact is rejected)

**Rules enforced:**

| Code | Rule | Severity |
|------|------|----------|
| V001 | Required top-level fields present | error |
| V002 | Claim required fields present | error |
| V003 | Certainty vocabulary valid | error |
| V004 | Status vocabulary valid | error |
| V005 | Claim IDs unique | error |
| V006 | Negative claims explicitly bounded | error |
| V007 | Site-wide claims have multi-section evidence | error |
| V008 | Provisional legacy claims restricted | error/warning |
| V009 | Findings map to claims | error |
| V010 | Recommendations map to claims | error |
| V011 | Rendered units map to claims | error |
| V012 | Rendered language does not exceed claim scope | error |
| V013 | Superseded claims not driving active rendering | error |

The validator runs after artefact compilation (Phase B step 11) and before final
markdown assembly. A failing artefact cannot proceed to the next stage.

See `schemas/artefact.schema.json`, `schemas/claim.schema.json`, and
`schemas/rendered_unit.schema.json` for the formal JSON schemas.
