---
description: Run stage 2 — competitive landscape comparing the client to sector peers
argument-hint: "<company name>"
---

# /mercury:compete

Run stage 2 — competitive landscape for the specified company.

## Usage

```
/mercury:compete <company name>
```

## What it produces

A competitive landscape mapping the client against 4–5 sector peers. Includes comparison matrix, where the client leads and lags (with page-level evidence), white space opportunities, and sector patterns.

## Prerequisites

Stage 1 artefact (`{company}-brief-artefact.json`) is recommended. If missing, prompt the consultant to run `/mercury:brief` first. Do not silently trigger it.

## Output files

- `{company}-compete-evidence.json`
- `{company}-compete-artefact.json`
- `{company}-compete.md`

## Instructions

Read `SKILL.md` and follow the stage 2 protocol. Suggest peers and wait for confirmation before running any research.
