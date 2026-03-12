---
description: Run the Mercury Strategy site discovery stage — five-pass structured crawl producing a page-level evidence pack
argument-hint: "<company name>"
---

# /ms-crawl

Run the Mercury Strategy site discovery stage for the specified company.

## Usage

```
/ms-crawl <company name>
```

## Prerequisites

Stage 1 evidence manifest (`{company}-ms-brief-evidence.json`) must exist. If missing, prompt the consultant to run `/ms-brief` first. Do not silently trigger it.

## What it produces

A page-level evidence pack: one JSON file per page crawled, organised across five passes (corporate, IR, sustainability, careers, news/governance). A crawl manifest summarises what was collected, what was not, and credit usage.

## Output files

- `{company}-ms-crawl-manifest.json` — crawl summary, pass counts, gaps, credit usage
- `{company}-crawl/pages/p-NNN.json` — one file per page crawled

## Instructions

Read `skills/ms-crawl/SKILL.md` and follow the five-pass protocol. Check `references/CRAWL_CONFIG.md` for domain-specific Firecrawl overrides before any scrape call. Save the crawl manifest on completion.

## Stage completion protocol

After saving the crawl manifest:

1. **Show a clean summary** — pages crawled per pass, documents extracted, gaps encountered, total credits used.

2. **Confirm readiness for ms-findings** — offer to continue to `/ms-findings` or pause here.

3. **Surface any gaps** — if pages failed to load or documents were not extracted, note them clearly. Do not attempt to fill gaps by fetching additional pages after the crawl is complete.

Do not show raw JSON. Do not produce findings or evaluations — this stage collects only.
