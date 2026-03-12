---
description: Run the Mercury Strategy synthesis stage — archetype checks, audience assessment, and strategic findings
argument-hint: "<company name>"
---

# /ms-findings

Run the Mercury Strategy synthesis stage for the specified company.

## Usage

```
/ms-findings <company name>
```

## Prerequisites

Both of the following must exist:
- `{company}-ms-brief-evidence.json`
- `{company}-ms-crawl-manifest.json` and the pages directory it references

If either is missing, surface a clear message. If only the brief manifest exists (no crawl), offer to run MS-Findings from brief evidence only with a declared limitation.

## What it produces

A structured findings artefact and rendered report covering: company context, strategic implications, findings by theme (implications only — no criterion lists), gap summary, audience assessment highlights, and limitations.

## Output files

- `{company}-ms-findings-artefact.json` — structured findings with claims, gaps, and synthesis
- `{company}-ms-findings.md` — rendered markdown report

## Instructions

Read `skills/ms-findings/SKILL.md` and follow the reasoning protocol. Load all evidence first. Make no tool calls after the evidence loading step. Follow the archetype confidence thresholds. Apply the elevation principle — implications only in the findings body.

## Stage completion protocol

After saving the artefact and report:

1. **Show a clean summary** — findings by severity (significant / moderate / minor), gaps identified, top 3 strategic implications.

2. **Offer output formats:**
   - **HTML** — interactive presentation (opens in browser)
   - **Word** — branded document (.docx)
   - **Slides** — branded presentation (.pptx)

3. **Render on request** — when the consultant picks a format, render using the appropriate output script.

Do not show raw JSON or criterion-level observations. Lead with the strategic implications.
