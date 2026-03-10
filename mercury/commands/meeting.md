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

## Stage completion protocol

After saving the artefact JSON and meeting pack markdown files, do NOT show raw JSON or long markdown output to the user. Instead:

1. **Show a clean summary** — stage name, agenda duration, number of talking points per section, documents generated (agenda, pre-read, facilitator guide).

2. **Offer output formats** — present the user with these options:
   - **HTML** — interactive presentation with timeline visualisation (opens in browser)
   - **Word** — branded document (.docx)
   - **Slides** — branded presentation (.pptx)

3. **Offer the full report** — this is the final stage. Offer to download the complete integrated report in all formats.

4. **Render on request** — when the user picks a format, use `mercury-output.js` to render it:
   ```javascript
   const MO = require('./skills/mercury-render/scripts/mercury-output.js');
   const result = await MO.renderStage({
     dir: '<artefact directory>',
     company: '<company slug>',
     stage: 'meeting',
     formats: ['html', 'docx', 'pptx'],
     opts: { sector: '...', index: '...' },
   });
   ```

5. **Update the hub** — `renderStage` automatically rebuilds the cumulative HTML hub. The hub now includes all completed stages with a Documents tab listing every rendered file.

The user should feel like they're progressing through a guided workflow, not reading raw data.
