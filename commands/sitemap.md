---
description: Run stage 3 — sitemap recommendation grounded in Playbook and peer evidence
argument-hint: "<company name>"
---

# /mercury:sitemap

Run stage 3 — sitemap recommendation for the specified company.

## Usage

```
/mercury:sitemap <company name>
```

## What it produces

A concrete proposed information architecture. Every structural recommendation is grounded in Playbook criteria and/or peer evidence. Includes current structure, recommended structure, change rationale, priority tiers, and IDX service mapping.

## Prerequisites

Stage 1 artefact recommended (provides current website structure). Stage 2 artefact recommended (provides peer evidence for "what top performers do"). If missing, prompt the consultant. Do not silently trigger.

## Output files

- `{company}-sitemap-evidence.json`
- `{company}-sitemap-artefact.json`
- `{company}-sitemap.md`

## Instructions

Read `SKILL.md` and follow the stage 3 protocol. Every recommended change must cite at least one source (Playbook criteria ID, peer URL, or IDX sector knowledge).
