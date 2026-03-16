# Mercury brand guide

Reference document for Mercury document rendering. Derived from the IDX 2024 brand templates (IDX2024_core_v1.pptx, Word Generic — A4.docx) and the IDX brand identity system.

Mercury is a product of IDX. All Mercury deliverables follow the IDX visual identity.

---

## Colour palette

### Core colours

| Token | Hex | Name | Usage |
|-------|-----|------|-------|
| `LICORICE` | `#12061A` | Licorice | Primary dark — backgrounds, headings, table headers |
| `FLORAL_WHITE` | `#F7F6EE` | Floral White | Primary light — body text on dark, soft backgrounds |
| `PURE_WHITE` | `#FFFFFF` | Pure White | Text on dark backgrounds where maximum contrast needed |
| `PURE_BLACK` | `#000000` | Pure Black | Avoid — use Licorice instead per brand guidelines |

### Accent colours

| Token | Hex | Name | Usage |
|-------|-----|------|-------|
| `ROSE` | `#FF006F` | Rose | Primary accent — dividers, highlights, hyperlinks, table headers |
| `LEMON_LIME` | `#EEFF00` | Lemon Lime | Section divider backgrounds, secondary accent |
| `AQUAMARINE` | `#00FFC9` | Aquamarine | "Strong" rating indicator, positive signals |
| `ORANGE` | `#FF6500` | Orange | Tertiary accent (sparingly) |
| `GREEN` | `#00FF00` | Green | Reserved (use sparingly — high visual intensity) |
| `BLUE` | `#0068FF` | Blue | Reserved (use sparingly) |

### Semantic colours

| Token | Hex | Usage |
|-------|-----|-------|
| `HIGH_RED` | `#CC3333` | High priority gaps, "Weak" and "Absent" ratings |
| `MED_AMBER` | `#E8A317` | Medium priority gaps, "Adequate" ratings |
| `LOW_GREEN` | `#27AE60` | Low priority gaps |
| `MEDIUM` | `#666666` | Meta text, captions, footers, timestamps |
| `MERCURY_GRAY` | `#F5F5F5` | Alternating table rows (light theme only) |

### Colour pairing rules

These rules are derived from the IDX brand template colour guidance:

1. **Floral White over Pure White** — Use Floral White (`#F7F6EE`) as the preferred light background, not Pure White. Pure White is reserved for text on dark backgrounds and small UI elements.

2. **Licorice over Pure Black** — Never use Pure Black (`#000000`) for backgrounds or large text areas. Use Licorice (`#12061A`) which has a subtle warmth that is central to the brand identity.

3. **Rose is the primary accent** — Rose (`#FF006F`) is the workhorse accent colour. It is used for hyperlinks, divider lines, table header fills (on dark backgrounds), and call-to-action elements.

4. **Lemon Lime for section breaks only** — Lemon Lime (`#EEFF00`) is a high-impact colour reserved for section divider slides. Do not use it for body text, table cells, or inline highlights.

5. **Aquamarine for positive indicators** — Use Aquamarine (`#00FFC9`) exclusively for "Strong" ratings and positive performance indicators. On dark backgrounds it provides excellent readability.

6. **Contrast requirements** — All text must maintain WCAG AA contrast ratio (4.5:1 for body text, 3:1 for large text). On Licorice backgrounds: use Pure White or Floral White for body text, Rose for accent text. On Floral White backgrounds: use Licorice for all text.

### Dark theme table colours

For tables on dark (Licorice) backgrounds:

| Element | Colour | Notes |
|---------|--------|-------|
| Header row fill | Rose `#FF006F` | White bold text |
| Body row A | `#1A1025` | Slightly lighter than Licorice |
| Body row B | `#12061A` | Same as Licorice |
| Body text | Floral White `#F7F6EE` | |
| Cell borders | `#2A1535` | Subtle, low-contrast |

### Light theme table colours

For tables on light (Floral White or white) backgrounds:

| Element | Colour | Notes |
|---------|--------|-------|
| Header row fill | Licorice `#12061A` | White bold text |
| Body row A | Mercury Gray `#F5F5F5` | |
| Body row B | Pure White `#FFFFFF` | |
| Body text | Licorice `#12061A` | |
| Cell borders | `#CCCCCC` | Light grey |

---

## Typography

### Font family

Mercury uses the IDX custom type family. Four font files are included in `assets/fonts/`:

| Font file | Family name | Weight | Usage |
|-----------|------------|--------|-------|
| `IDXSans-Regular.otf` | IDX Sans | Regular (400) | Body copy, table cells, meta text, captions |
| `IDXSans-Bold.otf` | IDX Sans | Bold (700) | Headings (H1–H3), table headers, emphasis |
| `IDXHeadline-Heavy.otf` | IDX Headline | Heavy (900) | Cover page titles, display text (use sparingly) |
| `IDXSerif-Regular.otf` | IDX Serif | Regular (400) | Pull quotes, taglines, product names (rare) |

**Fallback**: Arial is the universal fallback font. When IDX Sans is not installed on the recipient's machine, Word and PowerPoint will automatically substitute Arial.

**HTML presentations**: Fonts are embedded as base64 `@font-face` declarations, so they render correctly without font installation.

### Type scale

| Element | Font | Size | Weight | Colour (light bg) | Colour (dark bg) |
|---------|------|------|--------|--------------------|-------------------|
| Cover title | IDX Headline | 28pt | Heavy | Licorice | Pure White |
| H1 | IDX Sans | 16pt | Bold | Licorice | Pure White |
| H2 | IDX Sans | 13pt | Bold | Licorice | Pure White |
| H3 | IDX Sans | 10pt | Bold | Licorice | Pure White |
| Body text | IDX Sans | 11pt | Regular | Licorice | Floral White |
| Table body | IDX Sans | 10pt | Regular | Licorice | Floral White |
| Table header | IDX Sans | 10pt | Bold | Pure White | Pure White |
| Caption/meta | IDX Sans | 9pt | Regular | Medium grey | Medium grey |
| Footer | IDX Sans | 8pt | Regular | Medium grey | Pure White |
| Tagline | IDX Serif | 9pt | Regular italic | Medium grey | Medium grey |

### Typography rules

1. **IDX Headline is display-only** — Use IDX Headline Heavy exclusively for cover page titles and major display text. Never use it for body copy, headings within content pages, or table text.

2. **IDX Serif is rare** — IDX Serif Regular is reserved for taglines (e.g. "Prepared by IDX using the Mercury platform"), pull quotes, and product name treatments. Maximum one or two uses per document.

3. **No underlines for emphasis** — Use bold weight for emphasis. Underlines are reserved for hyperlinks only.

4. **Sentence case for headings** — All headings use sentence case (capitalise first word only), not title case.

5. **Tracking at small sizes** — IDX Sans benefits from slightly looser tracking at sizes below 9pt. The font was designed with this in mind.

---

## Logo usage

### Available variants

Logos are stored in `assets/logos/` in three sizes and two colour variants:

| File | Size (approx.) | Use case |
|------|----------------|----------|
| `IDX-black.png` | 200×55 px | Standard placement on light backgrounds |
| `IDX-black-tiny.png` | 80×21 px | Headers, footers on light backgrounds |
| `IDX-black-large.png` | 400×110 px | Cover pages on light backgrounds |
| `IDX-white.png` | 200×55 px | Standard placement on dark backgrounds |
| `IDX-white-tiny.png` | 80×21 px | Headers, footers on dark backgrounds |
| `IDX-white-large.png` | 400×110 px | Cover pages on dark backgrounds |

SVG variants (`IDX-black.svg`, `IDX-white.svg`) are also available for HTML rendering where scalability matters.

### Placement rules

1. **Dark backgrounds → white logo** — Always use the white variant on Licorice, dark, or photographic backgrounds.

2. **Light backgrounds → black logo** — Always use the black variant on Floral White, white, or Lemon Lime backgrounds.

3. **Cover page** — Place tiny logo near the top of the cover page, left-aligned or right-aligned depending on layout.

4. **Content page headers** — Tiny logo in the right portion of the header bar. In Word documents, the logo appears in the header alongside the "Mercury | {context}" text.

5. **Slide presentations** — Tiny logo top-right on all slides. White variant on dark slides (title + content), black variant on Lemon Lime section dividers.

6. **Minimum clear space** — Maintain at least the width of the "I" in IDX as clear space around all sides of the logo.

---

## Page layout

### Word documents (A4)

| Property | Value | Notes |
|----------|-------|-------|
| Page size | A4 (210 × 297 mm) | 11906 × 16838 DXA |
| Margins | 1 inch all sides | 1440 DXA |
| Content width | 9026 DXA | A4 minus margins |
| Header | "Mercury" (Rose) + context (grey) + IDX logo (right) | |
| Footer | "Confidential \| Page N" right-aligned | |

### Cover page structure (Word)

1. Top spacer (2400 DXA)
2. IDX logo (tiny, black on light covers, white on dark)
3. Rose accent divider line
4. Title — IDX Headline Heavy, 28pt
5. Subtitle — Rose, IDX Sans, 18pt
6. Optional third line — grey, 14pt
7. Meta table — borderless label/value pairs
8. Bottom taglines — IDX Serif Regular italic

### Slide layout (PowerPoint)

| Property | Value |
|----------|-------|
| Slide size | LAYOUT_WIDE (13.33" × 7.50") |
| Title slides | Licorice background, Rose top bar, white IDX logo |
| Content slides | Licorice background (dark theme), Floral White text |
| Section dividers | Lemon Lime background, black IDX logo |
| Top accent bar | Rose, 0.06" height |
| Footer bar | Licorice, 0.4" height |
| Footer text | "Mercury \| Confidential" left, "idx.inc" centre |
| IDX logo | White-tiny on dark slides, black-tiny on Lemon Lime |

### HTML presentation layout

| Property | Value |
|----------|-------|
| Background | Licorice `#12061A` |
| Text | Floral White `#F7F6EE` |
| Accent | Rose `#FF006F` |
| Navigation sidebar | Fixed left, 260px wide |
| Content max-width | 900px, centred |
| Card/panel background | `rgba(255,255,255,0.04)` on Licorice |
| Fonts | Embedded as base64 `@font-face` (zero-dependency) |

---

## Rating and priority colours

### Assessment ratings

| Rating | Background | Text | Usage |
|--------|------------|------|-------|
| Strong | Aquamarine `#00FFC9` | Licorice | Best-in-class performance |
| Adequate | Amber `#E8A317` | Licorice (light bg) or White (dark bg) | Meets basic expectations |
| Weak | Red `#CC3333` | White | Below standard |
| Absent | Red `#CC3333` | White | Feature or content missing entirely |

### Gap priorities

| Priority | Colour | Token |
|----------|--------|-------|
| High | `#CC3333` | `HIGH_RED` |
| Medium | `#E8A317` | `MED_AMBER` |
| Low | `#27AE60` | `LOW_GREEN` |

These colours have been verified for sufficient contrast on both Licorice (dark) and Floral White (light) backgrounds.

---

## Format-specific notes

### Word (.docx)

- Fonts are referenced by family name. Recipients need IDX Sans installed, or Word substitutes Arial automatically.
- The Word template at `assets/templates/word-generic-a4.docx` contains embedded IDX Sans fonts and can be used as a style reference.
- Hyperlinks use Rose (`#FF006F`) with bold weight, matching the brand template.
- Table cell padding: top/bottom 80 DXA, left/right 120 DXA.
- Always use `WidthType.DXA` for table widths, never percentages.
- Always set both `columnWidths` on the table AND `width` on each cell.
- Use `ShadingType.CLEAR` for table fills, never `SOLID`.

### PowerPoint (.pptx)

- All content slides use the dark Licorice master (v3.1).
- Table header rows use Rose fill (not Licorice) for visual distinction on dark backgrounds.
- Table body rows alternate between `#1A1025` and `#12061A` for subtle zebra striping.
- Table borders use `#2A1535` (subtle dark purple) rather than grey.
- IDX Headline font is used only on title slides. Content slide headings use IDX Sans Bold.
- The section divider master (Lemon Lime) is the only light-background slide type.

### HTML presentation

- All IDX fonts are embedded as base64 `@font-face` — no external font loading needed.
- No external JavaScript dependencies — site structure renders as a native HTML directory tree.
- CSS custom properties map to the IDX colour tokens for easy theming.
- Print stylesheet optimises for PDF export from the browser.
- Scroll-triggered animations use `IntersectionObserver` (no library dependency).
- Navigation sidebar collapses to a top bar below 900px viewport width.

---

## Quick reference: colour pairings cheat sheet

| Background | Body text | Heading text | Accent | Table header | Logo |
|------------|-----------|--------------|--------|--------------|------|
| Licorice | Floral White | Pure White | Rose | Rose fill | White |
| Floral White | Licorice | Licorice | Rose | Licorice fill | Black |
| Lemon Lime | Licorice | Licorice | Licorice | — | Black |
| Pure White | Licorice | Licorice | Rose | Licorice fill | Black |
