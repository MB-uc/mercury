---
description: Run stage 3 — sitemap recommendation grounded in Playbook and peer evidence
argument-hint: "<company name>"
---

# /mercury:sitemap

Run stage 3 — sitemap recommendation for the specified company.

## Usage

```
/mercury:sitemap <company name>
```

## What it produces

A concrete proposed information architecture. Every structural recommendation is grounded in Playbook criteria and/or peer evidence. Includes current structure, recommended structure, change rationale, priority tiers, and IDX service mapping.

## Prerequisites

Stage 1 artefact recommended (provides current website structure). Stage 2 artefact recommended (provides peer evidence for "what top performers do"). If missing, prompt the consultant. Do not silently trigger.

## Output files

- `{company}-sitemap-evidence.json`
- `{company}-sitemap-artefact.json`
- `{company}-sitemap.md`

## Instructions

Read `SKILL.md` and follow the stage 3 protocol. Every recommended change must cite at least one source (Playbook criteria ID, peer URL, or IDX sector knowledge).

## Stage completion protocol

After saving the artefact JSON, markdown report, and Excel sitemap, do NOT show raw JSON or long markdown output to the user. Instead:

1. **Show a clean summary** — stage name, number of recommended changes (new/restructured/merged), priority tier breakdown, key structural recommendations.

2. **Offer output formats** — present the user with these options:
   - **HTML** — interactive presentation with treemap visualisation (opens in browser)
   - **Word** — branded document (.docx)
   - **Slides** — branded presentation (.pptx)
   - **Excel** — sitemap workbook (already generated as part of the stage)

3. **Offer the next stage** — suggest continuing to `/mercury:meeting` (stage 4).

4. **Render on request** — when the user picks a format, use `mercury-output.js` to render it:
   ```javascript
   const MO = require('./skills/mercury-render/scripts/mercury-output.js');
   const result = await MO.renderStage({
     dir: '<artefact directory>',
     company: '<company slug>',
     stage: 'sitemap',
     formats: ['html'],
     opts: { sector: '...', index: '...' },
   });
   ```

5. **Update the hub** — `renderStage` automatically rebuilds the cumulative HTML hub. The hub now includes brief, compete, and sitemap sections (with interactive treemap), plus a Documents tab.

The user should feel like they're progressing through a guided workflow, not reading raw data.
