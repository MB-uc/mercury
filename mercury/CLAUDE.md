# Mercury v6 — IDX consultant engagement preparation

Mercury prepares IDX consultants for client engagements using proprietary IDX data. It provides two pipelines:

- **Mercury** (original) — four-stage pipeline: briefing, competitive landscape, sitemap recommendation, and meeting pack. Each stage produces an evidence-backed report with classified findings and a citation register.
- **Mercury Strategy** — three-stage pipeline: ms-brief, ms-crawl, ms-findings. Structured corporate website assessment with collection/reasoning separation, bounded claims, and archetype-based analysis.

## Commands

| Command | What it does |
|---------|-------------|
| `/mercury:brief <company>` | Consultant briefing — company research, benchmarks, website audit |
| `/mercury:compete <company>` | Competitive landscape — peer comparison with IQ scores |
| `/mercury:sitemap <company>` | Sitemap recommendation — IA proposal grounded in Playbook and peers |
| `/mercury:meeting <company>` | Meeting pack — agenda, pre-read, and facilitator guide |
| `/mercury:all <company>` | Full pipeline — runs all four stages in sequence |
| `/mercury:present <company>` | Render findings as an interactive HTML presentation |
| `/ms-brief <company>` | Mercury Strategy — company intelligence and evidence manifest |
| `/ms-crawl <company>` | Mercury Strategy — five-pass site discovery and structure |
| `/ms-findings <company>` | Mercury Strategy — strategic synthesis and findings report |

## Skills

This plugin provides five skills:

### mercury (core analysis)
- **Skill file:** `skills/mercury/SKILL.md` — read this for the full protocol
- **References:** `skills/mercury/references/` — Playbook, IQ criteria, claim schema, document checklist, site configs
- **Benchmark data:** `skills/mercury/data/benchmarks/` — IQ scoring model, audit lenses, page archetypes
- **Commands:** `commands/` — slash command definitions for each stage

### ms-brief (Mercury Strategy — company intelligence)
- **Skill file:** `skills/ms-brief/SKILL.md` — company research, evidence manifest, document inventory
- **Pipeline position:** Stage 1 of Mercury Strategy. Produces `{company}-ms-brief-evidence.json`
- **Key features:** Firecrawl agent news sweep, 130-item document checklist, material events detection, site map via firecrawl_map

### ms-crawl (Mercury Strategy — site discovery)
- **Skill file:** `skills/ms-crawl/SKILL.md` — five-pass structured website crawl
- **Pipeline position:** Stage 2 of Mercury Strategy. Produces page evidence files, crawl manifest, and D3-treemap-compatible site structure
- **Key features:** Collection-only (no evaluation), escalation protocol (web_fetch → firecrawl_scrape → firecrawl_browser), credit budgeting

### ms-findings (Mercury Strategy — strategic synthesis)
- **Skill file:** `skills/ms-findings/SKILL.md` — archetype checks, audience assessment, claim construction, findings
- **Pipeline position:** Stage 3 of Mercury Strategy. Produces findings artefact and rendered report
- **Key features:** No tool calls after evidence loading, implication-level findings (not criterion lists), bounded claims, archetype confidence thresholds

### mercury-render (document rendering)
- **Skill file:** `skills/mercury-render/SKILL.md` — read this for rendering instructions
- **References:** `skills/mercury-render/references/` — report structures, markdown templates
- **Scripts:** `skills/mercury-render/scripts/` — Node.js rendering (docx, pptx, html)
- **Assets:** `skills/mercury-render/assets/` — IDX fonts, logos, and Word template
- **Brand guide:** `skills/mercury-render/references/mercury-brand-guide.md`

### Shared references
- **References:** `references/` — shared across Mercury Strategy skills (DOCUMENT_CHECKLIST.md, MATERIAL_EVENTS_CHECKLIST.md, NEGATIVE_VERIFICATION_CONCEPTS.md, and per-skill reference files)

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
