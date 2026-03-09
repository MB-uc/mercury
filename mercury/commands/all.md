---
description: Run the full Mercury pipeline — briefing, competitive landscape, sitemap, and meeting pack
argument-hint: "<company name>"
---

# /mercury:all

Run the full Mercury pipeline for the specified company.

## Usage

```
/mercury:all <company name>
```

## What happens

1. **Stage 1 — Briefing** (`/mercury:brief`): Company identification, benchmark check, situational awareness, website audit, gap framing
2. **Stage 2 — Compete** (`/mercury:compete`): Peer identification (pauses for confirmation), per-peer research, comparative analysis
3. **Stage 3 — Sitemap** (`/mercury:sitemap`): Current structure, recommended IA, change rationale, priority tiers
4. **Stage 4 — Meeting** (`/mercury:meeting`): Agenda, client pre-read, facilitator guide

Each stage saves three files (evidence manifest, artefact JSON, markdown report). The artefact JSON is passed forward to the next stage.

## After completion

The skill offers to generate an integrated Word document combining all stage reports.

## Instructions

Read `SKILL.md` and follow the full pipeline protocol. Run each stage in sequence. The only pause is stage 2, step 1 (peer confirmation). All other stages run without intervention.
