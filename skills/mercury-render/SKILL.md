---
name: mercury-render
description: "Renders branded Mercury documents from structured audit data. Use this skill whenever you need to produce a Word document, PowerPoint presentation, or markdown report from Mercury audit findings. Triggers on: generate a document, create a report, make a presentation, export findings, render results, produce a deck, write up the audit. Also trigger when the sector-intelligence skill has completed an audit and the user wants output in any document format. This skill owns the visual layer — it takes structured findings (strengths, gaps, benchmarks, talking points) and produces branded, professional documents. The sector-intelligence skill owns the analysis; this skill owns the rendering."
---

# Mercury render

Produces branded documents from structured Mercury audit data. Supports three output formats: Word (.docx), PowerPoint (.pptx), and markdown (.md).

## Setup (run once per session)

Before using any mercury-render scripts, install the required npm packages. Run this at the start of every session — it takes a few seconds and is safe to re-run:

```bash
npm install docx pptxgenjs
```

These are the only dependencies. Both are pure JavaScript with no native bindings. The scripts also use Node built-ins (fs, path) which need no installation.

**You must run this before requiring mercury-components.js or mercury-pptx.js, or they will fail with MODULE_NOT_FOUND.**

## When to use this skill

Use mercury-render whenever you have audit findings ready and need to produce a deliverable. The typical flow is:

1. Sector-intelligence skill completes an audit (quick audit, peer comparison, deep dive)
2. User asks for a document, report, deck, or export
3. This skill takes over to handle rendering

You can also use it standalone if you have structured findings from any source and want Mercury-branded output.

## Architecture

```
mercury-render/
├── SKILL.md                        ← You are here
├── scripts/
│   ├── mercury-components.js       ← Reusable docx-js building blocks (require this)
│   ├── mercury-pptx.js             ← Reusable pptxgenjs building blocks (require this)
│   └── build-pipeline.sh           ← Validate → convert → verify pipeline
├── references/
│   ├── report-structures.md        ← Section order and content for each report type
│   └── markdown-templates.md       ← Markdown output templates
└── assets/
    └── logos/
        ├── IDX-black.png             ← Logo for light backgrounds
        ├── IDX-white.png             ← Logo for dark backgrounds
        ├── IDX-black-tiny.png        ← Small logo for headers/footers
        └── IDX-white-tiny.png        ← Small logo for dark headers
```

## How rendering works

### Step 1: Identify the report type

Mercury has three report types, each with a different document structure:

| Type | Sections | Typical length |
|------|----------|----------------|
| **Quick audit** | Cover, exec summary, strengths, gaps, benchmarks, talking points, pages analysed, methodology | 5-6 pages |
| **Peer comparison** | Cover, exec summary, comparison matrix, where A leads, where B leads, gaps, benchmarks, talking points, pages analysed, methodology | 8-10 pages |
| **Deep dive** | Cover, exec summary, section-by-section analysis, gaps, benchmarks, recommendations, talking points, pages analysed, methodology | 12-20 pages |

See `references/report-structures.md` for the full section-by-section breakdown of each type.

### Step 2: Prepare structured data

Before rendering, organise your findings into a data object. The component library expects this shape:

```javascript
const reportData = {
  // Meta
  type: "quick_audit" | "peer_comparison" | "deep_dive",
  title: "Site audit",                    // Cover page title
  subtitle: "Inchcape plc",              // Cover page subtitle
  date: "February 2026",
  meta: [                                 // Cover page metadata pairs
    ["Sector", "Automotive distribution"],
    ["Index", "FTSE 250"],
    ["Pages analysed", "10 key pages"],
  ],

  // Findings (quick audit)
  executiveSummary: "string",
  strengths: [{ title: "...", detail: "..." }],
  gaps: [{ gap: "...", section: "...", priority: "High|Medium|Low", detail: "..." }],
  benchmarks: { rows: [["Category", "Median", "P75", "Estimate", "Assessment"]] },
  talkingPoints: [{ title: "...", detail: "..." }],
  pagesAnalysed: [["URL", "Page type", "Assessment"]],

  // Findings (peer comparison) — adds:
  companyA: "Rolls-Royce",
  companyB: "GE Aerospace",
  summaryRatings: [{ dimension: "...", ratingA: "...", ratingB: "...", edge: "..." }],
  comparisonMatrix: [{ dimension: "...", a: "...", b: "...", edge: "..." }],
  whereALeads: [{ title: "...", detail: "..." }],
  whereBLeads: [{ title: "...", detail: "..." }],
  pagesA: [["URL", "Page type"]],
  pagesB: [["URL", "Page type"]],
};
```

### Step 3: Choose format and render

#### Word document (.docx)

The component library at `scripts/mercury-components.js` provides all the building blocks. Use it like this:

```javascript
const M = require('./scripts/mercury-components.js');

// M exposes:
// - Design system: M.COLORS, M.BORDERS, M.CELL_MARGINS, M.PAGE_A4
// - Text helpers: M.t(text, opts), M.p(children, opts)
// - Table helpers: M.cell(children, opts), M.hCell(text, width), M.dataTable(headers, rows, columnWidths)
// - Section builders: M.coverPage(title, subtitle, meta), M.headerFooter(left, right)
// - Document builder: M.createDocument(sections)
// - Build: M.build(doc, outputPath)

const sections = [
  M.coverPage("Site audit", "Inchcape plc", reportData.meta),
  {
    ...M.contentSection("Inchcape plc | Mercury site audit"),
    children: [
      M.heading1("Executive summary"),
      M.bodyText(reportData.executiveSummary),
      // ... build content using M helpers
    ]
  }
];

const doc = M.createDocument(sections);
await M.build(doc, "output.docx");
```

The component library handles all Mercury branding automatically — colours, fonts, table styles, page sizing, headers, footers. You focus on content structure, not styling.

#### PowerPoint (.pptx)

The pptx component library at `scripts/mercury-pptx.js` provides equivalent building blocks for presentations:

```javascript
const MP = require('./scripts/mercury-pptx.js');

// MP exposes:
// - MP.createPresentation()     → configured pptxgenjs instance with Mercury master slides
// - MP.titleSlide(pptx, title, subtitle, meta)
// - MP.sectionSlide(pptx, heading)
// - MP.contentSlide(pptx, heading, bodyText)
// - MP.tableSlide(pptx, heading, headers, rows)
// - MP.twoColumnSlide(pptx, heading, leftContent, rightContent)
// - MP.build(pptx, outputPath)
```

#### Markdown (.md)

For markdown output, see `references/markdown-templates.md` for the template structures. Markdown reports use the same section order as Word documents but with simple formatting — no component library needed.

### Step 4: Validate and verify

After generating any document, run the build pipeline:

```bash
# For .docx files:
bash scripts/build-pipeline.sh docx output.docx

# For .pptx files:
bash scripts/build-pipeline.sh pptx output.pptx
```

The pipeline validates the file, converts to PDF, extracts page images, and reports the page count. For .docx it uses the docx skill's `validate.py`; for .pptx it uses LibreOffice conversion.

Always visually verify at least the cover page, first content page, and a table page by reading the generated JPG images.

## Design system

Derived from the IDX brand templates (IDX2024_core_v1.pptx, About us.dotx). The design system is codified in the component libraries but documented here for reference.

### Colours (IDX brand palette)

| Token | Hex | Name | Usage |
|-------|-----|------|-------|
| `LICORICE` | `#12061A` | Licorice | Primary dark — headings, table headers, cover bg |
| `FLORAL_WHITE` | `#F7F6EE` | Floral White | Primary light — slide backgrounds |
| `ROSE` | `#FF006F` | Rose | Primary accent — dividers, highlights, links |
| `LEMON_LIME` | `#EEFF00` | Lemon Lime | Accent 1 — section divider backgrounds |
| `AQUAMARINE` | `#00FFC9` | Aquamarine | Accent 3 — "Strong" rating indicator |
| `MERCURY_GRAY` | `#F5F5F5` | — | Alternating table row fill |
| `WHITE` | `#FFFFFF` | Pure White | Text on dark backgrounds |
| `MEDIUM` | `#666666` | — | Meta text, footers, captions |
| `HIGH_RED` | `#CC3333` | — | High priority gaps |
| `MED_AMBER` | `#E8A317` | — | Medium priority gaps |
| `LOW_GREEN` | `#27AE60` | — | Low priority gaps |

The full IDX palette also includes Orange (#FF6500), Green (#00FF00), Blue (#0068FF), and Hyperlink blue (#00A6EB), all available as `COLORS.*` constants.

### Typography

- **Brand font**: IDX Sans (custom, may not be installed on all machines)
- **Fallback font**: Arial (used by default in programmatic docs for guaranteed rendering)
- **To use IDX Sans**: Set `FONT_PRIMARY = "IDX Sans"` in mercury-components.js
- **Body text**: 11pt (size: 22 in half-points)
- **H1**: 14pt bold, Licorice (matches Word template: 14pt, bold, spaceBefore 600)
- **H2**: 12pt bold, Licorice (matches Word template: 12pt, spaceBefore 150)
- **H3**: 10pt bold, Licorice (matches Word template: 10pt, bold, spaceBefore 200)
- **Table body**: 10pt (size: 20)
- **Table header**: 10pt bold, white on Licorice
- **Captions/meta**: 9pt (size: 18), MEDIUM
- **Footer**: 8pt (size: 16), MEDIUM

### Page layout (Word)

- **Page size**: A4 (11906 × 16838 DXA)
- **Margins**: 1 inch all sides (1440 DXA)
- **Content width**: 9026 DXA (A4 minus margins)
- **Header**: "Mercury" in Rose left, report context right
- **Footer**: "Confidential | Page N" right-aligned

### Slide layout (PowerPoint)

- **Slide size**: LAYOUT_WIDE (13.33" × 7.50") matching IDX core template
- **Background**: Floral White (#F7F6EE) for content slides
- **Title slides**: Licorice (#12061A) background
- **Section dividers**: Lemon Lime (#EEFF00) background
- **Top accent bar**: Rose (#FF006F), 0.06" height
- **Footer bar**: Licorice, 0.4" height, with "Mercury | Confidential" and "idx.inc"
- **IDX logo**: White variant on dark slides (top-right), Black variant on light slides

### Tables

- **Header row**: Licorice fill, white bold text
- **Body rows**: Alternating MERCURY_GRAY / WHITE
- **Borders**: 0.5pt light grey (#CCCCCC)
- **Cell padding**: top/bottom 80 DXA, left/right 120 DXA
- **Priority colours**: High = HIGH_RED, Medium = MED_AMBER, Low = LOW_GREEN
- **Always use WidthType.DXA**, never percentages
- **Always set both columnWidths on table AND width on each cell**

### Cover page pattern (Word)

1. Top spacer (2400 DXA)
2. "IDX" in Rose, bold
3. Rose-coloured divider line (single-cell table with bottom border)
4. Title in white (dark cover) or Licorice (light cover), 26pt bold
5. Subtitle in Rose, 18pt
6. Optional third line in MEDIUM, 14pt
7. Meta table (borderless, label/value pairs)
8. Bottom tagline in italics ("Prepared by IDX using the Mercury platform")

### Logo usage

The skill includes IDX logos in `assets/logos/`:
- `IDX-black.png` — for light backgrounds (Word cover, content headers)
- `IDX-white.png` — for dark backgrounds (PPTX title slides)
- Tiny variants for header/footer placement
- Use `M.getLogoBuffer("black"|"white")` in docx or `MP.getLogoPath("black"|"white")` in pptx

## Important notes

- **FIRST**: Run `npm install docx pptxgenjs` before using any scripts (see Setup section above)
- Always use `ShadingType.CLEAR` for table fills, never `SOLID`
- Never use unicode bullet characters — use `LevelFormat.BULLET` via numbering config
- PageBreak must be inside a Paragraph
- Tables need dual widths (columnWidths array AND cell width)
- Table width must equal sum of columnWidths
- For the docx validation script path, check the docx skill at the standard location
