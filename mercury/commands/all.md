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

## After each stage

After each stage completes, show a clean summary and offer the user a choice:

- **Download this stage** as HTML, Word, or Slides
- **Continue to the next stage**

Do NOT show raw JSON or markdown. Use the stage completion protocol defined in each individual command file.

## After all stages complete

Offer the full integrated report in all formats (HTML hub, Word, Slides). The HTML hub is cumulative — it already contains all stages and a Documents tab with links to every rendered file.

## Instructions

Read `SKILL.md` and follow the full pipeline protocol. Run each stage in sequence. The only pause is stage 2, step 1 (peer confirmation).

At the end of each stage, follow the stage completion protocol:
1. Show clean summary (counts, key findings)
2. Offer output formats (HTML / Word / Slides)
3. Offer next stage or full report
4. Render on demand via `mercury-output.js`
5. Cumulative HTML hub is always updated automatically
