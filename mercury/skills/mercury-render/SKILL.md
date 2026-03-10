---
name: mercury-render
description: "Renders branded Mercury documents from structured audit data. Use this skill whenever you need to produce a Word document, PowerPoint presentation, or markdown report from Mercury audit findings. Triggers on: generate a document, create a report, make a presentation, export findings, render results, produce a deck, write up the audit. Also trigger when the sector-intelligence skill has completed an audit and the user wants output in any document format. This skill owns the visual layer — it takes structured findings (strengths, gaps, benchmarks, talking points) and produces branded, professional documents. The sector-intelligence skill owns the analysis; this skill owns the rendering."
---

# Mercury render

Produces branded documents from structured Mercury audit data. Supports four output formats: Word (.docx), PowerPoint (.pptx), interactive HTML (.html), and markdown (.md).

## Setup (run once per session)

Before using any mercury-render scripts, install the required npm packages. Run this at the start of every session — it takes a few seconds and is safe to re-run:

```bash
npm install docx pptxgenjs exceljs
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
│   ├── mercury-components.js       ← Reusable docx-js building blocks
│   ├── mercury-pptx.js             ← Reusable pptxgenjs building blocks
│   ├── mercury-html.js             ← Interactive HTML presentation builder
│   ├── mercury-adapter.js          ← Artefact → reportData transformer (all stages)
│   └── build-pipeline.sh           ← Validate → convert → verify pipeline
├── references/
│   ├── report-structures.md        ← Section order and content for each report type
│   ├── markdown-templates.md       ← Markdown output templates
│   └── mercury-brand-guide.md      ← IDX brand system reference
└── assets/
    ├── fonts/
    │   ├── IDXHeadline-Heavy.otf   ← Display font
    │   ├── IDXSans-Bold.otf        ← Heading font
    │   ├── IDXSans-Regular.otf     ← Body font
    │   └── IDXSerif-Regular.otf    ← Quote/accent font
    ├── logos/
    │   ├── IDX-black.png           ← Logo for light backgrounds
    │   ├── IDX-black-large.png     ← Large logo for covers
    │   ├── IDX-white.png           ← Logo for dark backgrounds
    │   ├── IDX-white-large.png     ← Large logo for dark covers
    │   └── (tiny and SVG variants)
    └── templates/
        └── word-generic-a4.docx    ← IDX branded Word template
```

## How rendering works

### Claim-backed rendering (vNext)

**Critical rule:** The renderer must compose output from claims and claim-backed findings. It
must not generate free prose first and then validate or annotate it afterwards.

The rendering flow is:

```
claims[] → findings (with claim_ids) → prose sections
```

Not:

```
findings → prose → check against claims (WRONG)
```

**Scope inheritance:** When rendering a finding or gap, the output text must not exceed the
scope of its source claim(s). If a claim says `scope: "reviewed IR pages"`, the rendered
prose must say "in the reviewed IR pages", not "on the site".

**Negative claim rendering:** Negative findings (gaps, absences) must render as bounded
absence statements that match their source claim scope. "No dedicated investment case page
was identified in the reviewed IR pages" — never "There is no investment case page on the
site" unless the claim has multi-section evidence.

**Provisional legacy claims:** Findings backed only by `provisional_legacy` claims must
render with hedged language ("based on available evidence", "in the material reviewed") and
cannot render as high-confidence or site-wide statements.

### Step 1: Identify the report type

Mercury has three report types, each with a different document structure:

| Type | Sections | Typical length |
|------|----------|----------------|
| **Quick audit** | Cover, exec summary, strengths, gaps, benchmarks, talking points, pages analysed, methodology | 5-6 pages |
| **Peer comparison** | Cover, exec summary, comparison matrix, where A leads, where B leads, gaps, benchmarks, talking points, pages analysed, methodology | 8-10 pages |
| **Deep dive** | Cover, exec summary, section-by-section analysis, gaps, benchmarks, recommendations, talking points, pages analysed, methodology | 12-20 pages |

See `references/report-structures.md` for the full section-by-section breakdown of each type.

### Step 2: Prepare structured data (use the adapter)

The adapter at `scripts/mercury-adapter.js` transforms one or more stage artefact JSONs into the unified `reportData` shape consumed by all three renderers. **Always use the adapter** — do not manually map artefact fields.

```javascript
const { buildReportData, loadAndBuild } = require('./scripts/mercury-adapter.js');

// Option A: Load from files by naming convention
const reportData = loadAndBuild('/path/to/artefacts', 'company-name', {
  sector: "Business Services",
  index: "FTSE 100",
});

// Option B: Pass artefact objects directly (any combination of stages)
const reportData = buildReportData({
  brief: briefArtefact,       // optional
  compete: competeArtefact,   // optional
  sitemap: sitemapArtefact,   // optional
  meeting: meetingArtefact,   // optional
}, { sector: "...", index: "..." });

// Then pass reportData to any renderer
```

The adapter handles all field mapping from artefact schema to renderer schema:
- `findings` (severity=positive) → `strengths`
- `gap_analysis` (status=searched_not_found) → `gaps`
- `synthesis.priorities` → `talkingPoints`
- `citations` (type=web_page) → `pagesAnalysed`
- `comparison_matrix` → `comparisonMatrix` (compete stage)
- `sitemap_data` / `recommended_architecture` → `sitemapData` (sitemap stage)

Sections only appear when their stage data exists. The report type is auto-detected from which stages are provided.

The full `reportData` schema expected by the renderers is below. **vNext:** The `claims` array from the artefact must be included; findings reference claim IDs.

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

  // Claims (vNext) — the authoritative bounded knowledge layer
  claims: [
    {
      claim_id: "C-001",
      statement: "The IR landing page lists three upcoming results dates",
      claim_type: "fact",
      scope: "IR landing page only",
      certainty: "confirmed",
      status: "active",
      evidence_ids: ["E-001"]
    }
  ],

  // Findings — must reference claim_ids
  executiveSummary: "string",
  strengths: [{ title: "...", detail: "...", claim_ids: ["C-001"] }],
  gaps: [{ gap: "...", section: "...", priority: "High|Medium|Low", detail: "...", claim_ids: ["C-003"] }],
  benchmarks: { rows: [["Category", "Median", "P75", "Estimate", "Assessment"]] },
  talkingPoints: [{ title: "...", detail: "...", claim_ids: ["C-001", "C-003"] }],
  pagesAnalysed: [["URL", "Page type", "Assessment"]],

  // Findings (peer comparison) — adds:
  companyA: "Rolls-Royce",
  companyB: "GE Aerospace",
  summaryRatings: [{ dimension: "...", ratingA: "...", ratingB: "...", edge: "..." }],
  comparisonMatrix: [{ dimension: "...", a: "...", b: "...", edge: "..." }],
  whereALeads: [{ title: "...", detail: "...", claim_ids: [] }],
  whereBLeads: [{ title: "...", detail: "...", claim_ids: [] }],
  pagesA: [["URL", "Page type"]],
  pagesB: [["URL", "Page type"]],
};
```

### Rendering scope guard

When building prose from a finding, look up its `claim_ids` and apply this guard:

1. Read the `scope` field from each referenced claim
2. The rendered prose must not make assertions broader than the narrowest claim scope
3. If the claim `certainty` is `inferred` or `not_assessed`, the prose must use hedged language
4. If the claim `status` is `provisional_legacy`, the prose must use hedged language and cannot assert site-wide conclusions

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

#### Interactive HTML presentation (.html)

The HTML renderer at `scripts/mercury-html.js` produces self-contained browser presentations:

```javascript
const MH = require('./scripts/mercury-html.js');

// MH exposes:
// - MH.buildPresentation(reportData)  → complete HTML string
// - MH.COLORS                         → IDX colour tokens
// - MH.FONTS                          → IDX font family names

const html = MH.buildPresentation(reportData);
require('fs').writeFileSync('output.html', html);
```

HTML presentations include all brand fonts embedded as base64, so they render correctly on any machine without font installation. The dark theme (Licorice background) matches the PPTX master for visual consistency across formats.

Optional data-driven sections:
- **Treemap**: Include `reportData.sitemapData` (hierarchical structure from sitemap stage) to render a D3.js treemap
- **Peer comparison matrix**: Include `reportData.comparisonMatrix` for interactive comparison tables

#### Markdown (.md)

For markdown output, see `references/markdown-templates.md` for the template structures. Markdown reports use the same section order as Word documents but with simple formatting — no component library needed.

### Step 4: Validate and verify

After generating any document, run the build pipeline:

```bash
# For .docx files:
bash scripts/build-pipeline.sh docx output.docx

# For .pptx files:
bash scripts/build-pipeline.sh pptx output.pptx

# For .html files:
bash scripts/build-pipeline.sh html output.html
```

The pipeline validates the file, converts to PDF (docx/pptx), extracts page images, and reports the page count. For .docx it validates with `python-docx` (inline); for .pptx it uses LibreOffice conversion. For .html it validates structure and font embedding — no PDF conversion needed.

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

Mercury uses the IDX custom type family across all formats:

| Font | Weight | Usage | Fallback |
|------|--------|-------|----------|
| **IDX Sans** | Regular | Body copy, table cells, meta text | Arial |
| **IDX Sans** | Bold | Headings (H1-H3), table headers, emphasis | Arial Bold |
| **IDX Headline** | Heavy | Cover page titles, display text (sparingly) | Arial Black |
| **IDX Serif** | Regular | Pull quotes, product names (rare) | Georgia |

Font files are in `assets/fonts/` (OTF format). For Word documents, the fonts are referenced by name — recipients need IDX Sans installed, or Word substitutes Arial automatically. For HTML presentations, fonts are embedded as base64 `@font-face` so no installation is needed.

- **Body text**: 11pt IDX Sans Regular
- **H1**: 16pt IDX Sans Bold, Licorice
- **H2**: 13pt IDX Sans Bold, Licorice
- **H3**: 10pt IDX Sans Bold, Licorice
- **Cover title**: 28pt IDX Headline Heavy
- **Table body**: 10pt IDX Sans Regular
- **Table header**: 10pt IDX Sans Bold, white on Licorice

### Page layout (Word)

- **Page size**: A4 (11906 × 16838 DXA)
- **Margins**: 1 inch all sides (1440 DXA)
- **Content width**: 9026 DXA (A4 minus margins)
- **Header**: "Mercury" in Rose left, report context right
- **Footer**: "Confidential | Page N" right-aligned

### Slide layout (PowerPoint)

- **Slide size**: LAYOUT_WIDE (13.33" × 7.50") matching IDX core template
- **Title slides**: Licorice (#12061A) background, Rose top bar, white IDX logo
- **Content slides**: Licorice (#12061A) background (dark theme), Floral White text
- **Section dividers**: Lemon Lime (#EEFF00) background
- **Top accent bar**: Rose (#FF006F), 0.06" height
- **Footer bar**: Licorice, 0.4" height, with "Mercury | Confidential" and "idx.inc"
- **IDX logo**: White variant on all dark slides (content + title), black on Lemon Lime dividers
- **Table headers**: Rose fill with white text (on dark background)
- **Table body**: Alternating dark shades (#1A1025 / #12061A) with Floral White text

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
- `IDX-black.png` / `IDX-black.svg` — for light backgrounds (Word cover, Lemon Lime dividers)
- `IDX-white.png` / `IDX-white.svg` — for dark backgrounds (PPTX content + title slides, HTML)
- `IDX-black-large.png` / `IDX-white-large.png` — large variants for cover pages
- Tiny variants (`-tiny`) for header/footer placement
- Use `M.getLogoBuffer("black"|"white")` in docx or `MP.getLogoPath("black"|"white", "large"|"tiny")` in pptx

## Important notes

- **FIRST**: Run `npm install docx pptxgenjs exceljs` before using any scripts (see Setup section above)
- Always use `ShadingType.CLEAR` for table fills, never `SOLID`
- Never use unicode bullet characters — use `LevelFormat.BULLET` via numbering config
- PageBreak must be inside a Paragraph
- Tables need dual widths (columnWidths array AND cell width)
- Table width must equal sum of columnWidths
- For docx validation, the build pipeline uses `python-docx` inline (no external dependency needed)
