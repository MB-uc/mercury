---
description: Run the Mercury Strategy briefing stage — company identity, benchmarks, situational awareness, and website inventory
argument-hint: "<company name>"
---

# /ms-brief

Run the Mercury Strategy briefing stage for the specified company.

## Usage

```
/ms-brief <company name>
```

## What it produces

A structured evidence manifest covering: company identity and listing status, Connect.IQ benchmark position (if available), situational awareness from the last six months, a high-level website inventory, and a document extraction log. This is a collection output — it does not contain findings or recommendations.

## Output files

- `{company}-ms-brief-evidence.json` — complete evidence manifest

## Instructions

Read `skills/ms-brief/SKILL.md` and follow the collection protocol. Confirm scope with the consultant before beginning. Save the evidence manifest on completion.

## Stage completion protocol

After saving the evidence manifest:

1. **Show a clean summary** — company confirmed, sections identified, documents found, material events flagged (if any), any gaps or limitations.

2. **Confirm readiness for ms-crawl** — offer to continue to `/ms-crawl` or pause here.

3. **Surface any decisions needed** — if document extraction is pending consultant approval, present the document list now and wait for instruction before proceeding.

Do not show raw JSON. Do not produce findings or recommendations — this stage collects only.
