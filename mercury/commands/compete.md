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

## Stage completion protocol

After saving the artefact JSON and markdown report, do NOT show raw JSON or long markdown output to the user. Instead:

1. **Show a clean summary** — stage name, peer count, key comparison dimensions, where the client leads/lags.

2. **Offer output formats** — present the user with these options:
   - **HTML** — interactive presentation (opens in browser)
   - **Word** — branded document (.docx)
   - **Slides** — branded presentation (.pptx)

3. **Offer the next stage** — suggest continuing to `/mercury:sitemap` (stage 3).

4. **Render on request** — when the user picks a format, use `mercury-output.js` to render it:
   ```javascript
   const MO = require('./skills/mercury-render/scripts/mercury-output.js');
   const result = await MO.renderStage({
     dir: '<artefact directory>',
     company: '<company slug>',
     stage: 'compete',
     formats: ['html'],
     opts: { sector: '...', index: '...' },
   });
   ```

5. **Update the hub** — `renderStage` automatically rebuilds the cumulative HTML hub. The hub now includes both brief and compete sections, with a Documents tab listing all rendered files across stages.

The user should feel like they're progressing through a guided workflow, not reading raw data.
