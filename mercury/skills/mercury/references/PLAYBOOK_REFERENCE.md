# Brief Judge Playbook

A complete guide to how the MCP Brief Judge works, including the rules, templates, customisation options, and knowledge accumulation.

---

## Table of Contents

1. [Overview](#overview)
2. [The Eight-Step Judgement Process](#the-eight-step-judgement-process)
3. [Critical Unknown Categories](#critical-unknown-categories)
4. [Severity Levels](#severity-levels)
5. [Verdict Logic](#verdict-logic)
6. [Gate Check Rules](#gate-check-rules)
7. [The System Prompt (Full Template)](#the-system-prompt-full-template)
8. [Output Schema](#output-schema)
9. [Customisation Points](#customisation-points)
10. [BigQuery Storage Schema](#bigquery-storage-schema)
11. [Knowledge Accumulation](#knowledge-accumulation)
12. [Example Workflows](#example-workflows)

---

## Overview

The Brief Judge is an MCP server that analyses strategy briefs and produces structured judgements. It enforces discipline by:

- **Extracting only stated facts** (not inventing or inferring beyond what's written)
- **Identifying critical unknowns** with severity ratings
- **Generating clarification questions** mapped to unknowns
- **Producing a draft delivery contract** with clear boundaries
- **Gating downstream work** until blockers are resolved or waived

### Core Principles

| Principle | Enforcement |
|-----------|-------------|
| No fact invention | LLM instructed to extract only what's stated |
| Stated vs inferred separation | Inferred items labelled with `[INFERRED]` prefix |
| Unknown classification | Every unknown gets a category and severity |
| Consistent output | Temperature 0, strict JSON schema, Zod validation |
| Audit trail | All judgements and waivers stored in BigQuery |

---

## The Eight-Step Judgement Process

The LLM follows this exact sequence when analysing a brief:

### Step 1: Extract Stated Facts Only

Extract only what is explicitly written in the brief:

| Field | Description |
|-------|-------------|
| `objectives` | What the brief says it wants to achieve |
| `stated_decisions` | Decisions explicitly mentioned |
| `audiences` | Who the work is for |
| `scope_in` | What's explicitly included |
| `scope_out` | What's explicitly excluded |
| `constraints` | Budget, timeline, regulatory limits |
| `deliverables` | What outputs are expected |
| `methods` | How the work will be done |
| `assumptions` | What the brief assumes to be true |

### Step 2: Identify Critical Unknowns

For each gap or ambiguity, assign:
- A **category** (see [Critical Unknown Categories](#critical-unknown-categories))
- A **severity** (blocking / risky / tolerable)
- A **description** of what's missing

### Step 3: Generate Clarification Questions

Produce questions that would resolve the unknowns:
- Maximum controlled by `max_clarification_questions` option (default: 8)
- Each question maps to one or more unknown categories
- Prioritise questions addressing blocking unknowns

### Step 4: Propose Inferred Decision Statements (Optional)

If `include_inferred_decision_options` is true:
- Propose up to 3 decision statements that could be inferred
- Each MUST be prefixed with `[INFERRED]`
- Frame as hypotheses to validate, not conclusions

### Step 5: Compile Draft Delivery Contract

Create a structured contract with:
- What decisions the work will support
- Scope boundaries (in/out)
- Permitted and forbidden claims
- Evidence standards
- Methods allowed
- Deliverables and success criteria
- Use `TBC` for anything that can't be determined

### Step 6: Risk and Overreach Scan

Identify risks in these categories:
- `scope_creep` — Work expanding beyond brief
- `overclaim` — Making claims without evidence
- `misinterpretation` — Misunderstanding requirements
- `dependency` — External dependencies that could block
- `data_quality` — Data issues that could affect results
- `other` — Anything else

For each risk, provide a specific mitigation.

### Step 7: Verdict

Determine status:
- `ready_to_proceed` — No blocking unknowns, clear scope
- `proceed_with_conditions` — Some risks but can start
- `not_ready_to_proceed` — Blocking unknowns must be resolved

Provide up to 6 rationale bullets explaining the verdict.

### Step 8: Next Actions

List up to 3 concrete next actions required.

---

## Critical Unknown Categories

When something is missing or unclear, it's classified into one of these categories:

| Category | Description | Example |
|----------|-------------|---------|
| `decision_intent` | What decisions the work should support | "No specific decisions identified that this analysis needs to inform" |
| `success_criteria` | How success will be measured | "No definition of what 'useful' means for this research" |
| `scope_boundaries` | What's in/out of scope | "Unclear if pricing analysis is included" |
| `claims_policy` | What claims can be made | "Unclear if we can make competitive comparisons" |
| `evidence_requirements` | What evidence standards apply | "No clarity on acceptable data sources" |
| `rigour_level` | How detailed/rigorous the work should be | "Budget unclear, can't determine appropriate methods" |
| `ownership_signoff` | Who owns decisions and approvals | "No clarity on who signs off deliverables" |
| `political_constraints` | Organisational politics affecting work | "Unclear if certain stakeholders should be avoided" |
| `other` | Anything else | Catch-all for edge cases |

---

## Severity Levels

Each unknown is rated by impact on ability to proceed:

| Severity | Definition | Gate Impact |
|----------|------------|-------------|
| `blocking` | Cannot proceed without resolving | Causes `FAIL` |
| `risky` | Should resolve but can proceed with caution | Warning only |
| `tolerable` | Nice to know but not essential | No impact |

---

## Verdict Logic

The verdict is determined by this logic:

```
IF any blocking unknowns exist:
    verdict = "not_ready_to_proceed"
ELSE IF any risky unknowns exist OR delivery contract has many TBCs:
    verdict = "proceed_with_conditions"
ELSE:
    verdict = "ready_to_proceed"
```

---

## Gate Check Rules

The `gate_check` tool enforces these rules:

```
IF blocking_unknown_count > 0 AND no waiver:
    status = "FAIL"
    → Cannot proceed

IF blocking_unknown_count > 0 AND waiver provided:
    status = "PASS_WITH_CONDITIONS"
    → Can proceed, but blockers listed as "[WAIVED]" required actions

IF blocking_unknown_count == 0:
    status = "PASS"
    → Can proceed
```

---

## The System Prompt (Full Template)

This is the exact prompt sent to the LLM. Edit `src/llm/client.ts` to customise.

```typescript
You are a senior strategy consultant analyst. Your task is to analyze a strategy brief and produce a structured judgement. You must follow these rules strictly:

## Non-negotiables
- Do NOT invent facts that are not in the brief
- Do NOT solve the brief or give strategic recommendations beyond what the judgement framework requires
- Separate "stated" (explicitly in the brief) vs "inferred" (reasonably concluded) content
- Label all unknowns by severity: blocking, risky, or tolerable
- Follow the exact output schema provided

## Eight-Step Process
Follow these steps exactly in order:

1. EXTRACT STATED FACTS ONLY
   Extract only what is explicitly stated in the brief. Do not add, embellish, or infer.
   - objectives, decisions, audiences, scope (in/out), constraints, deliverables, methods, assumptions

2. IDENTIFY CRITICAL UNKNOWNS WITH SEVERITY
   List what is missing or unclear. Categorize each:
   - decision_intent, success_criteria, scope_boundaries, claims_policy, evidence_requirements, rigour_level, ownership_signoff, political_constraints, other
   Assign severity:
   - blocking: Cannot proceed without resolving
   - risky: Should resolve but can proceed with caution
   - tolerable: Nice to know but not essential

3. GENERATE CLARIFICATION QUESTIONS
   Produce up to {max_clarification_questions} questions that would resolve the unknowns.
   Map each question to the unknown categories it addresses.
   Prioritize questions that address blocking unknowns.

4. PROPOSE INFERRED DECISION STATEMENTS ({enabled/disabled})
   Propose up to 3 decision statements that could be inferred from the brief.
   Each MUST be clearly labelled as "[INFERRED]" and framed as a hypothesis to validate.

5. COMPILE DRAFT DELIVERY CONTRACT
   Create a structured contract with what can be delivered based on the brief.
   - Use "TBC" (To Be Confirmed) for any item that cannot be determined from the brief
   - Include: decisions_supported, in_scope, out_of_scope, permitted_claims, forbidden_claims, evidence_standards, methods_allowed, deliverables, success_criteria, ownership_and_dependencies, definition_of_done

6. RISK AND OVERREACH SCAN
   Identify potential risks in categories: scope_creep, overclaim, misinterpretation, dependency, data_quality, other
   For each risk, provide a specific mitigation

7. VERDICT
   Determine the verdict status:
   - ready_to_proceed: No blocking unknowns, clear scope
   - proceed_with_conditions: Some risks but can start with cautions
   - not_ready_to_proceed: Blocking unknowns must be resolved first

   Provide up to 6 rationale bullets explaining the verdict.

8. NEXT ACTIONS
   List up to 3 concrete next actions required.

## Output Format
You MUST return ONLY valid JSON matching the exact schema. No markdown, no code blocks, no explanation.
```

---

## Output Schema

The complete JSON structure returned by `brief_judge`:

```json
{
  "meta": {
    "request_id": "uuid",
    "created_at": "ISO timestamp",
    "brief_hash": "SHA-256 of brief text",
    "model_provider": "anthropic|openai",
    "model_name": "model identifier"
  },
  "extracted_facts": {
    "objectives": ["string"],
    "stated_decisions": ["string"],
    "audiences": ["string"],
    "scope_in": ["string"],
    "scope_out": ["string"],
    "constraints": ["string"],
    "deliverables": ["string"],
    "methods": ["string"],
    "assumptions": ["string"]
  },
  "critical_unknowns": [
    {
      "category": "decision_intent|success_criteria|...",
      "description": "string",
      "severity": "blocking|risky|tolerable"
    }
  ],
  "clarification_questions": [
    {
      "question": "string",
      "severity_addressed": "blocking|risky|tolerable",
      "mapped_unknown_categories": ["category"]
    }
  ],
  "proposed_decision_statements": ["[INFERRED] string"],
  "delivery_contract_draft": {
    "decisions_supported": ["string"],
    "in_scope": ["string"],
    "out_of_scope": ["string"],
    "permitted_claims": ["string"],
    "forbidden_claims": ["string"],
    "evidence_standards": ["string"],
    "methods_allowed": ["string"],
    "deliverables": ["string"],
    "success_criteria": ["string"],
    "ownership_and_dependencies": ["string"],
    "definition_of_done": ["string"],
    "risks_and_mitigations": [
      {
        "risk_type": "scope_creep|overclaim|...",
        "risk": "string",
        "mitigation": "string"
      }
    ]
  },
  "verdict": {
    "status": "ready_to_proceed|proceed_with_conditions|not_ready_to_proceed",
    "rationale_bullets": ["string (max 6)"],
    "next_actions": ["string (max 3)"]
  },
  "human_readable_report": "Plain text report"
}
```

---

## Customisation Points

### 1. Adjust the System Prompt

Edit `src/llm/client.ts` → `getSystemPrompt()` function:

```typescript
// Add domain-specific guidance
- Add industry-specific unknown categories
- Modify risk categories for your context
- Change the tone or focus of the analysis
```

### 2. Add Unknown Categories

Edit `src/schemas/judgement.ts`:

```typescript
export const UnknownCategorySchema = z.enum([
  'decision_intent',
  'success_criteria',
  // Add your custom categories here
  'budget_approval',
  'legal_review',
  'stakeholder_alignment',
]);
```

Then update the system prompt to explain the new categories.

### 3. Adjust Severity Thresholds

The gate check logic is in `src/tools/gateCheck.ts`. Modify the rules:

```typescript
// Example: Require resolution of risky unknowns too
if (riskyCount > 3 && !waiver) {
  status = 'FAIL';
}
```

### 4. Change Question Limits

Pass options to `brief_judge`:

```json
{
  "brief_text": "...",
  "options": {
    "max_clarification_questions": 12,
    "include_inferred_decision_options": false,
    "strict_mode": true
  }
}
```

### 5. Customise the Human-Readable Report

The report format is controlled by the system prompt. Edit the instructions in `getSystemPrompt()` to change headers, sections, or formatting.

---

## BigQuery Storage Schema

### Dataset: `brief_judgements`

### Table: `brief_judgements`

| Column | Type | Description |
|--------|------|-------------|
| `request_id` | STRING | Unique ID for this judgement |
| `created_at` | TIMESTAMP | When the judgement was created |
| `brief_hash` | STRING | SHA-256 hash of the brief text |
| `model_provider` | STRING | LLM provider used |
| `model_name` | STRING | Model identifier |
| `verdict_status` | STRING | ready_to_proceed / proceed_with_conditions / not_ready_to_proceed |
| `blocking_count` | INTEGER | Number of blocking unknowns |
| `risky_count` | INTEGER | Number of risky unknowns |
| `tolerable_count` | INTEGER | Number of tolerable unknowns |
| `judgement_json` | STRING | Full JSON judgement (for detailed queries) |

### Table: `waivers`

| Column | Type | Description |
|--------|------|-------------|
| `waiver_id` | STRING | Unique ID for this waiver |
| `brief_hash` | STRING | Links to the brief |
| `request_id` | STRING | Links to the judgement |
| `waived_by` | STRING | Who approved the waiver |
| `reason` | STRING | Why the waiver was granted |
| `waiver_date` | TIMESTAMP | When the waiver was granted |
| `stored_at` | TIMESTAMP | When recorded in system |

---

## Knowledge Accumulation

### How Knowledge Builds Over Time

```
                    ┌─────────────────────────────────────────┐
                    │           BigQuery Dataset              │
                    │         brief_judgements                │
                    └─────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
   ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
   │ Judgement 1 │           │ Judgement 2 │           │ Judgement N │
   │ brief_hash  │           │ brief_hash  │           │ brief_hash  │
   │ verdict     │           │ verdict     │           │ verdict     │
   │ unknowns    │           │ unknowns    │           │ unknowns    │
   └─────────────┘           └─────────────┘           └─────────────┘
          │                           │
          │                           │
          ▼                           ▼
   ┌─────────────┐           ┌─────────────┐
   │  Waiver 1   │           │  Waiver 2   │
   │ waived_by   │           │ waived_by   │
   │ reason      │           │ reason      │
   └─────────────┘           └─────────────┘
```

### Useful Queries

**1. Find most common blocking unknown categories:**

```sql
SELECT
  JSON_EXTRACT_SCALAR(unknown, '$.category') as category,
  COUNT(*) as count
FROM `diageo-rep-247.brief_judgements.brief_judgements`,
  UNNEST(JSON_EXTRACT_ARRAY(judgement_json, '$.critical_unknowns')) as unknown
WHERE JSON_EXTRACT_SCALAR(unknown, '$.severity') = 'blocking'
GROUP BY category
ORDER BY count DESC
```

**2. Track verdict distribution over time:**

```sql
SELECT
  DATE(created_at) as date,
  verdict_status,
  COUNT(*) as count
FROM `diageo-rep-247.brief_judgements.brief_judgements`
GROUP BY date, verdict_status
ORDER BY date DESC
```

**3. Find briefs that needed waivers:**

```sql
SELECT
  j.request_id,
  j.created_at,
  j.verdict_status,
  j.blocking_count,
  w.waived_by,
  w.reason
FROM `diageo-rep-247.brief_judgements.brief_judgements` j
JOIN `diageo-rep-247.brief_judgements.waivers` w
  ON j.request_id = w.request_id
ORDER BY j.created_at DESC
```

**4. Identify repeat issues (same brief_hash, multiple judgements):**

```sql
SELECT
  brief_hash,
  COUNT(*) as judgement_count,
  ARRAY_AGG(DISTINCT verdict_status) as verdicts
FROM `diageo-rep-247.brief_judgements.brief_judgements`
GROUP BY brief_hash
HAVING COUNT(*) > 1
ORDER BY judgement_count DESC
```

**5. Calculate waiver rate:**

```sql
SELECT
  COUNT(DISTINCT w.request_id) as waived_count,
  COUNT(DISTINCT j.request_id) as total_count,
  ROUND(COUNT(DISTINCT w.request_id) / COUNT(DISTINCT j.request_id) * 100, 2) as waiver_rate_pct
FROM `diageo-rep-247.brief_judgements.brief_judgements` j
LEFT JOIN `diageo-rep-247.brief_judgements.waivers` w
  ON j.request_id = w.request_id
```

### Using Accumulated Knowledge

**Pattern Recognition:**
- Query common blocking categories → Update brief templates to address them
- Track waiver reasons → Identify systemic issues in briefing process

**Quality Improvement:**
- Monitor verdict distribution → Are briefs getting better over time?
- Track who grants waivers → Ensure appropriate governance

**Audit & Compliance:**
- Full history of every judgement
- Waiver trail with accountability
- Same brief_hash = same brief content (detect resubmissions)

---

## Example Workflows

### Workflow 1: Clean Brief

```
1. User: "Judge this brief: [well-structured brief]"
2. brief_judge → verdict: ready_to_proceed, 0 blocking unknowns
3. gate_check → PASS
4. brief_register → stored in BigQuery
5. Proceed with work
```

### Workflow 2: Brief with Issues

```
1. User: "Judge this brief: [vague brief]"
2. brief_judge → verdict: not_ready_to_proceed, 3 blocking unknowns
3. gate_check → FAIL
4. User shares clarification questions with client
5. Client provides answers
6. User: "Judge this updated brief: [improved brief]"
7. brief_judge → verdict: ready_to_proceed
8. gate_check → PASS
9. brief_register → stored
10. Proceed with work
```

### Workflow 3: Urgent Waiver

```
1. User: "Judge this brief: [incomplete brief]"
2. brief_judge → verdict: not_ready_to_proceed, 2 blocking unknowns
3. gate_check → FAIL
4. User: "Record waiver: Simon Heath approved, reason: client deadline immovable"
5. waiver_record → stored in BigQuery
6. gate_check (with waiver) → PASS_WITH_CONDITIONS
7. brief_register → stored
8. Proceed with work (blockers listed as required actions to address)
```

---

## File Locations for Customisation

| What | File |
|------|------|
| System prompt | `src/llm/client.ts` → `getSystemPrompt()` |
| Unknown categories | `src/schemas/judgement.ts` → `UnknownCategorySchema` |
| Risk types | `src/schemas/judgement.ts` → `RiskTypeSchema` |
| Severity levels | `src/schemas/judgement.ts` → `SeveritySchema` |
| Gate check rules | `src/tools/gateCheck.ts` |
| BigQuery schema | `src/storage/bigquery.ts` → `ensureTables()` |
| Input validation | `src/schemas/brief.ts` |
| Output validation | `src/schemas/judgement.ts` |

---

## Quick Reference

### Tool Summary

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `brief_judge` | Analyse brief, produce judgement | Start of any engagement |
| `gate_check` | Verify brief is ready to proceed | Before starting work |
| `waiver_record` | Record approval to proceed despite blockers | When deadline forces action |
| `brief_register` | Store judgement for audit | After gate passes |
| `health` | Check server status | Troubleshooting |

### Status Meanings

| Verdict Status | Gate Status | Meaning |
|----------------|-------------|---------|
| `ready_to_proceed` | `PASS` | Go ahead |
| `proceed_with_conditions` | `PASS` | Go ahead with caution |
| `not_ready_to_proceed` | `FAIL` | Stop, resolve blockers |
| `not_ready_to_proceed` + waiver | `PASS_WITH_CONDITIONS` | Go ahead, risk accepted |
