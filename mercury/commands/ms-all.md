---
description: Run the full Mercury Strategy pipeline — brief, crawl, and findings in sequence
argument-hint: "<company name>"
---

# /ms-all

Run the full Mercury Strategy pipeline for the specified company.

## Usage

```
/ms-all <company name>
```

## What happens

1. **Stage 1 — Brief** (`/ms-brief`): Company identity, benchmark check, situational awareness, website inventory, document extraction
2. **Stage 2 — Crawl** (`/ms-crawl`): Four-source site discovery producing a page-level evidence pack
3. **Stage 3 — Findings** (`/ms-findings`): Strategic synthesis — archetype checks, audience assessment, findings, strategic implications

Each stage saves its output files before the next stage begins. The only pauses are:
- End of Stage 1: document extraction confirmation (consultant approval required before extracting documents)
- End of Stage 2: confirmation before proceeding to findings (optional — can auto-continue)

## Instructions

Read `skills/ms-brief/SKILL.md`, `skills/ms-crawl/SKILL.md`, and `skills/ms-findings/SKILL.md` in turn. Run each stage in sequence. Follow the stage completion protocol for each.

## After each stage

Show a clean summary and offer the consultant a choice:
- **Continue to next stage**
- **Pause here** (artefact is saved — can resume later with the individual command)

Do not show raw JSON at any stage. Do not produce findings or evaluations during the collection stages.

## After all stages complete

1. **Show final summary** — findings by severity, top strategic implications, gaps declared.
2. **Offer output formats** — HTML / Word / Slides.
3. **Render on request.**

## Two-agent separation — critical

Stages 1 and 2 are collection stages. Stage 3 is the reasoning stage. This boundary is hard:
- No findings or evaluations are produced during Stages 1 or 2
- Stage 3 makes no tool calls to fetch additional evidence
- If a gap exists in the evidence at Stage 3, it is recorded as a limitation — not filled

This separation is the foundation of Mercury Strategy's provenance model. Do not collapse it.
