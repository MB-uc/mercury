# Mercury v5 — IDX consultant engagement preparation

Mercury prepares IDX consultants for client engagements using proprietary IDX data. It runs a four-stage pipeline — briefing, competitive landscape, sitemap recommendation, and meeting pack — each producing an evidence-backed report with classified findings and a citation register.

## Commands

| Command | What it does |
|---------|-------------|
| `/mercury:brief <company>` | Consultant briefing — company research, benchmarks, website audit |
| `/mercury:compete <company>` | Competitive landscape — peer comparison with IQ scores |
| `/mercury:sitemap <company>` | Sitemap recommendation — IA proposal grounded in Playbook and peers |
| `/mercury:meeting <company>` | Meeting pack — agenda, pre-read, and facilitator guide |
| `/mercury:all <company>` | Full pipeline — runs all four stages in sequence |
| `/mercury:present <company>` | Render findings as an interactive HTML presentation |

## Skills

This plugin provides two skills:

### mercury (core analysis)
- **Skill file:** `skills/mercury/SKILL.md` — read this for the full protocol
- **References:** `skills/mercury/references/` — Playbook, IQ criteria, claim schema, document checklist, site configs
- **Benchmark data:** `skills/mercury/data/benchmarks/` — IQ scoring model, audit lenses, page archetypes
- **Commands:** `commands/` — slash command definitions for each stage

### mercury-render (document rendering)
- **Skill file:** `skills/mercury-render/SKILL.md` — read this for rendering instructions
- **References:** `skills/mercury-render/references/` — report structures, markdown templates
- **Scripts:** `skills/mercury-render/scripts/` — Node.js rendering (docx, pptx, html)
- **Assets:** `skills/mercury-render/assets/` — IDX fonts, logos, and Word template
- **Brand guide:** `skills/mercury-render/references/mercury-brand-guide.md`

## Governance

Mercury enforces a strict governance protocol. Key components:

- **Claim builder:** Every finding is backed by validated claims with scope boundaries, certainty vocabulary, and evidence linkage. See `skills/mercury/references/CLAIM_SCHEMA.md`.
- **Artefact validator:** `validators/validate_artefact.py` — hard enforcement of claim structure, scope discipline, and traceability. A failing artefact cannot proceed.
- **Intervention logger:** `diagnostics/intervention_logger.py` — records when governance protocols fire (claim rejections, scope bounding, render modifications). Purely observability.
- **Protocol impact debug:** `diagnostics/protocol_impact_debug.py` — gated diagnostic showing what output would look like without governance constraints.

## Schemas

- `schemas/artefact.schema.json` — JSON Schema for Mercury artefacts
- `schemas/intervention.schema.json` — JSON Schema for protocol intervention entries

## Core rules

1. **The skill enforces the protocol, not the LLM.** Each stage has a defined contract.
2. **Contract-first artefacts.** Structured JSON artefact first, markdown rendering second.
3. **Deterministic where possible.** Benchmark lookups and structure extraction are mechanical.
4. **Provenance engine.** Every conclusion maps to evidence with a citation chain.
5. **Discipline before polish.** Process integrity over visual quality.

## Setup

For document rendering, install dependencies once per session:
```bash
npm install docx pptxgenjs exceljs
```
