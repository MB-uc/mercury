---
description: Render Mercury findings as an interactive HTML presentation
argument-hint: "<company name>"
---

# /mercury:present

Render existing Mercury findings as an interactive HTML presentation for browser-based delivery.

## Usage

```
/mercury:present <company name>
```

## Prerequisites

This command requires that at least one Mercury stage has been completed for the specified company. It reads from the existing artefact JSON files:

- `{company}-brief-artefact.json`
- `{company}-compete-artefact.json` (if available)
- `{company}-sitemap-artefact.json` (if available)
- `{company}-meeting-artefact.json` (if available)

## What it produces

A single self-contained HTML file with:

- Interactive scroll-based presentation of all completed Mercury stages
- IDX brand typography (IDX Sans, IDX Headline) embedded as web fonts
- Dark theme (Licorice) with Rose accents
- Treemap visualisation of recommended site architecture (if sitemap stage completed)
- Peer comparison matrix (if compete stage completed)
- Print-optimised layout for PDF export

## Output files

- `{company}-mercury-presentation.html` — self-contained HTML presentation

## Instructions

1. Read `skills/mercury-render/SKILL.md` for the rendering protocol
2. Load the artefact JSON files for the company
3. Assemble `reportData` from the artefacts (same schema as docx/pptx)
4. Use `mercury-html.js` to generate the HTML
5. Run `bash scripts/build-pipeline.sh html {output}.html` to validate
