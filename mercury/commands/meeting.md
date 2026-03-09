---
description: Run stage 4 — meeting pack with agenda, pre-read, and facilitator guide
argument-hint: "<company name>"
---

# /mercury:meeting

Run stage 4 — meeting pack for the specified company.

## Usage

```
/mercury:meeting <company name>
```

## What it produces

Everything needed to run a 2-hour stakeholder workshop: agenda, client pre-read (no IDX pitch language), and facilitator guide (talking points, evidence references, discussion questions).

## Prerequisites

Stage 1 artefact (`{company}-brief-artefact.json`) is REQUIRED. Stage 4 will not run without it. Stages 2 and 3 are optional — they enrich the meeting but are not blocking.

## Output files

- `{company}-meeting-artefact.json`
- `{company}-meeting-agenda.md`
- `{company}-meeting-preread.md`
- `{company}-meeting-guide.md`

## Instructions

Read `SKILL.md` and follow the stage 4 protocol. This is a pure synthesis stage — no collection phase. Read from prior artefact JSON files only.
