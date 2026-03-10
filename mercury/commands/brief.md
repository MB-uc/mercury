---
description: Run stage 1 — consultant briefing with benchmarks, website audit, and gap analysis
argument-hint: "<company name>"
---

# /mercury:brief

Run stage 1 — consultant briefing for the specified company.

## Usage

```
/mercury:brief <company name>
```

## What it produces

An internal IDX briefing document covering: company identification, Connect.IQ benchmark position, situational awareness (recent 6 months), website assessment against the Playbook, gap framing as IDX opportunities, and case study matches.

## Output files

- `{company}-brief-evidence.json` — what was collected, how, when
- `{company}-brief-artefact.json` — structured findings with classifications and citations
- `{company}-brief.md` — human-readable markdown report

## Instructions

Read `SKILL.md` and follow the stage 1 protocol. Begin with capability detection, then intake, then run the collection and reasoning phases in order.

## Stage completion protocol

After saving the artefact JSON and markdown report, do NOT show raw JSON or long markdown output to the user. Instead:

1. **Show a clean summary** — stage name, key counts (strengths, gaps, priorities, claims), and a one-line overall assessment.

2. **Offer output formats** — present the user with these options:
   - **HTML** — interactive presentation (opens in browser)
   - **Word** — branded document (.docx)
   - **Slides** — branded presentation (.pptx)

3. **Offer the next stage** — suggest continuing to `/mercury:compete` (stage 2).

4. **Render on request** — when the user picks a format, use `mercury-output.js` to render it:
   ```javascript
   const MO = require('./skills/mercury-render/scripts/mercury-output.js');
   const result = await MO.renderStage({
     dir: '<artefact directory>',
     company: '<company slug>',
     stage: 'brief',
     formats: ['html'],  // or ['docx'], ['pptx'], or multiple
     opts: { sector: '...', index: '...' },
   });
   ```

5. **Update the hub** — `renderStage` automatically rebuilds the cumulative HTML hub with a Documents tab listing all rendered files.

The user should feel like they're progressing through a guided workflow, not reading raw data.
