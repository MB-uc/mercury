/**
 * Mercury Components — reusable docx-js building blocks for Mercury-branded documents.
 *
 * Design system derived from IDX brand templates (IDX2024_core_v1.pptx, About us.dotx).
 *
 * Usage:
 *   const M = require('./mercury-components.js');
 *   const sections = [M.coverPage("Title", "Subtitle", [["Date", "Feb 2026"]])];
 *   const doc = M.createDocument(sections);
 *   await M.build(doc, "output.docx");
 */

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, ImageRun
} = require("docx");

// ============================================================
// DESIGN SYSTEM  (IDX Brand)
// ============================================================

const COLORS = {
  // Core brand
  LICORICE:       "12061A",   // Primary dark (near-black with purple tint)
  FLORAL_WHITE:   "F7F6EE",   // Primary light / background
  PURE_BLACK:     "000000",
  PURE_WHITE:     "FFFFFF",

  // Accents
  LEMON_LIME:     "EEFF00",   // Accent 1 — vivid yellow-green
  ROSE:           "FF006F",   // Accent 2 — hot pink
  AQUAMARINE:     "00FFC9",   // Accent 3 — bright teal
  ORANGE:         "FF6500",   // Accent 4
  GREEN:          "00FF00",   // Accent 5
  BLUE:           "0068FF",   // Accent 6
  HYPERLINK:      "00A6EB",   // Link blue

  // Mercury product palette (derived from IDX)
  MERCURY_BLUE:   "12061A",   // = Licorice — primary headings, cover bg
  MERCURY_ACCENT: "FF006F",   // = Rose — accent lines, highlights
  MERCURY_LIGHT:  "F7F6EE",   // = Floral White — backgrounds
  MERCURY_GRAY:   "F5F5F5",   // Table zebra stripe

  // Semantic
  WHITE:          "FFFFFF",
  DARK:           "12061A",   // Body text = Licorice
  MEDIUM:         "666666",   // Secondary text
  HIGH_RED:       "CC3333",   // Priority: High
  MED_AMBER:      "E8A317",   // Priority: Medium
  LOW_GREEN:      "27AE60",   // Priority: Low
};

// Font stack: IDX Sans is the brand font; Arial is the safe fallback.
// The Word template uses IDX Sans at 8.5pt body. Since IDX Sans may not be
// installed on all machines, we use Arial for programmatic docs to guarantee
// consistent rendering. If IDX Sans is available, swap FONT_PRIMARY below.
const FONT_PRIMARY = "Arial";
const FONT_FALLBACK = "Arial";

const BORDER_THIN = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const BORDERS = { top: BORDER_THIN, bottom: BORDER_THIN, left: BORDER_THIN, right: BORDER_THIN };
const BORDER_NONE = { style: BorderStyle.NONE, size: 0 };
const BORDERS_NONE = { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE };
const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };

const PAGE_A4 = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
};
const CONTENT_WIDTH = 9026; // A4 minus 1-inch margins

const STYLES = {
  default: { document: { run: { font: FONT_PRIMARY, size: 22 } } },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 28, bold: true, font: FONT_PRIMARY, color: COLORS.LICORICE },
      paragraph: { spacing: { before: 600, after: 240 }, outlineLevel: 0 },
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 24, bold: true, font: FONT_PRIMARY, color: COLORS.LICORICE },
      paragraph: { spacing: { before: 150, after: 160 }, outlineLevel: 1 },
    },
    {
      id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 20, bold: true, font: FONT_PRIMARY, color: COLORS.LICORICE },
      paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 },
    },
  ],
};

const NUMBERING = {
  config: [
    {
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
    {
      reference: "numbers",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
  ],
};

// ============================================================
// LOGO HELPER
// ============================================================

/**
 * Get the IDX logo as a base64 data string for embedding in documents.
 * @param {"black"|"white"} variant - Logo colour variant
 * @param {"standard"|"tiny"} size - Logo size
 * @returns {Buffer|null} PNG buffer, or null if not found
 */
function getLogoBuffer(variant = "black", size = "standard") {
  const filename = size === "tiny"
    ? `IDX-${variant}-tiny.png`
    : `IDX-${variant}.png`;
  const logoPath = path.join(__dirname, "..", "assets", "logos", filename);
  try {
    return fs.readFileSync(logoPath);
  } catch {
    return null;
  }
}

// ============================================================
// TEXT & PARAGRAPH HELPERS
// ============================================================

/**
 * Create a TextRun with Mercury defaults.
 * @param {string} text - The text content
 * @param {object} opts - {size, color, bold, italics, font}
 */
function t(text, opts = {}) {
  return new TextRun({
    text,
    font: opts.font || FONT_PRIMARY,
    size: opts.size || 22,
    color: opts.color || COLORS.DARK,
    bold: opts.bold || false,
    italics: opts.italics || false,
  });
}

/**
 * Create a Paragraph with Mercury spacing defaults.
 * @param {Array|TextRun} children - TextRun(s) to include
 * @param {object} opts - {before, after, align, heading, pageBreakBefore, numbering}
 */
function p(children, opts = {}) {
  const config = {
    children: Array.isArray(children) ? children : [children],
    spacing: { before: opts.before || 120, after: opts.after || 120 },
    alignment: opts.align || AlignmentType.LEFT,
  };
  if (opts.heading) config.heading = opts.heading;
  if (opts.pageBreakBefore) config.pageBreakBefore = true;
  if (opts.numbering) config.numbering = opts.numbering;
  return new Paragraph(config);
}

/** Shortcut: H1 paragraph */
function heading1(text, opts = {}) {
  return p([t(text)], { heading: HeadingLevel.HEADING_1, ...opts });
}

/** Shortcut: H2 paragraph */
function heading2(text, opts = {}) {
  return p([t(text)], { heading: HeadingLevel.HEADING_2, ...opts });
}

/** Shortcut: H3 paragraph */
function heading3(text, opts = {}) {
  return p([t(text)], { heading: HeadingLevel.HEADING_3, ...opts });
}

/** Shortcut: body text paragraph */
function bodyText(text, opts = {}) {
  return p([t(text)], opts);
}

/** Shortcut: empty spacer paragraph */
function spacer(before = 120, after = 0) {
  return p([t("")], { before, after });
}

// ============================================================
// TABLE HELPERS
// ============================================================

/**
 * Create a table cell.
 * @param {Array|TextRun} children - Content (TextRun or array of TextRuns/Paragraphs)
 * @param {object} opts - {width, fill, borders, vAlign}
 */
function cell(children, opts = {}) {
  const paras = Array.isArray(children) ? children : [children];
  return new TableCell({
    borders: opts.borders || BORDERS,
    width: { size: opts.width || 2000, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: CELL_MARGINS,
    verticalAlign: opts.vAlign || undefined,
    children: paras.map(c =>
      (c instanceof Paragraph) ? c : p([c], { before: 40, after: 40 })
    ),
  });
}

/**
 * Create a header row cell (Licorice background, white text).
 */
function hCell(text, width, fill) {
  return cell(
    [t(text, { bold: true, color: COLORS.WHITE, size: 20 })],
    { width, fill: fill || COLORS.LICORICE }
  );
}

/**
 * Create a standard data table with header row and alternating shading.
 * @param {string[]} headers - Column header labels
 * @param {Array[]} rows - 2D array of string cell values
 * @param {number[]} columnWidths - DXA widths for each column
 * @param {object} opts - {tableWidth, cellOpts(rowIdx, colIdx, value)}
 */
function dataTable(headers, rows, columnWidths, opts = {}) {
  const tableWidth = opts.tableWidth || CONTENT_WIDTH;
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths,
    rows: [
      new TableRow({
        children: headers.map((h, i) => hCell(h, columnWidths[i])),
      }),
      ...rows.map((row, ri) => {
        const fill = ri % 2 === 0 ? COLORS.MERCURY_GRAY : COLORS.WHITE;
        return new TableRow({
          children: row.map((val, ci) => {
            const cellOptions = opts.cellOpts ? opts.cellOpts(ri, ci, val) : {};
            const textOpts = cellOptions.textOpts || { size: 20 };
            return cell(
              [t(String(val), textOpts)],
              { width: columnWidths[ci], fill, ...cellOptions }
            );
          }),
        });
      }),
    ],
  });
}

/**
 * Create a gaps/priority table.
 * @param {Array} gaps - [{gap, section?, priority, applies?, detail}]
 * @param {number[]} columnWidths - column widths
 * @param {string[]} headers - column headers
 */
function gapsTable(gaps, columnWidths, headers) {
  const cols = columnWidths || [800, 3226, 1000, 4000];
  const hdrs = headers || ["#", "Gap", "Priority", "Applies to"];

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({ children: hdrs.map((h, i) => hCell(h, cols[i])) }),
      ...gaps.map((g, i) => {
        const fill = i % 2 === 0 ? COLORS.MERCURY_GRAY : COLORS.WHITE;
        const prioColor = g.priority === "High" ? COLORS.HIGH_RED
          : g.priority === "Medium" ? COLORS.MED_AMBER
          : COLORS.LOW_GREEN;
        const appliesTo = g.applies || g.section || "";
        return new TableRow({
          children: [
            cell([t(String(i + 1), { size: 20, bold: true })], { width: cols[0], fill }),
            cell([t(g.gap, { size: 20, bold: true })], { width: cols[1], fill }),
            cell([t(g.priority, { size: 20, bold: true, color: prioColor })], { width: cols[2], fill }),
            cell([t(appliesTo, { size: 20 })], { width: cols[3], fill }),
          ],
        });
      }),
    ],
  });
}

// ============================================================
// SECTION BUILDERS
// ============================================================

/**
 * Create a Mercury cover page section.
 * Uses Licorice background with white text for a premium feel.
 * @param {string} title - Main title (e.g. "Site audit")
 * @param {string} subtitle - Subtitle (e.g. "Inchcape plc")
 * @param {Array} meta - Array of [label, value] pairs
 * @param {object} opts - {thirdLine, taglines, lightCover}
 */
function coverPage(title, subtitle, meta, opts = {}) {
  // Cover page can be dark (Licorice bg) or light (Floral White bg)
  const isDark = !opts.lightCover;
  const titleColor = isDark ? COLORS.WHITE : COLORS.LICORICE;
  const subtitleColor = COLORS.ROSE;
  const metaLabelColor = COLORS.MEDIUM;
  const metaValueColor = isDark ? COLORS.WHITE : COLORS.DARK;
  const taglineColor = isDark ? COLORS.MEDIUM : COLORS.MEDIUM;

  const children = [
    // Top spacer
    spacer(2400),
    // IDX brand mark
    p([t("IDX", { size: 20, color: COLORS.ROSE, bold: true })], { before: 0, after: 80 }),
    // Accent divider line (Rose)
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [CONTENT_WIDTH],
      rows: [new TableRow({
        children: [new TableCell({
          borders: {
            top: BORDER_NONE,
            bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.ROSE },
            left: BORDER_NONE,
            right: BORDER_NONE,
          },
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          children: [p([t("")], { before: 0, after: 0 })],
        })],
      })],
    }),
    // Title
    p([t(title, { size: 52, bold: true, color: titleColor })], { before: 400, after: 40 }),
    // Subtitle
    p([t(subtitle, { size: 36, color: subtitleColor })], { before: 0, after: 200 }),
  ];

  // Optional third line
  if (opts.thirdLine) {
    children.push(p([t(opts.thirdLine, { size: 28, color: metaLabelColor })], { before: 0, after: 400 }));
  } else {
    children.push(spacer(400));
  }

  // Meta table
  if (meta && meta.length > 0) {
    children.push(new Table({
      width: { size: 5400, type: WidthType.DXA },
      columnWidths: [2000, 3400],
      rows: meta.map(([label, value]) => new TableRow({
        children: [
          cell([t(label, { size: 18, bold: true, color: metaLabelColor })], { width: 2000, borders: BORDERS_NONE }),
          cell([t(value, { size: 18, color: metaValueColor })], { width: 3400, borders: BORDERS_NONE }),
        ],
      })),
    }));
  }

  // Taglines
  const taglines = opts.taglines || [
    "Prepared by IDX using the Mercury platform",
    "Assessed against the IDX Corporate Website Playbook",
  ];
  children.push(spacer(1200));
  taglines.forEach(line => {
    children.push(p([t(line, { size: 18, color: taglineColor, italics: true })]));
  });

  return {
    properties: { page: PAGE_A4 },
    children,
  };
}

/**
 * Create header and footer configuration for a content section.
 * @param {string} headerLeft - Left text (e.g. "Mercury")
 * @param {string} headerRight - Right text (e.g. "Inchcape plc | February 2026")
 */
function contentSection(headerLeft, headerRight) {
  return {
    properties: { page: PAGE_A4 },
    headers: {
      default: new Header({
        children: [p([
          t("Mercury  ", { size: 16, color: COLORS.ROSE, bold: true }),
          t(`|  ${headerRight || headerLeft}`, { size: 16, color: COLORS.MEDIUM }),
        ], { before: 0, after: 0 })],
      }),
    },
    footers: {
      default: new Footer({
        children: [p([
          t("Confidential  |  Page ", { size: 16, color: COLORS.MEDIUM }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT_PRIMARY, size: 16, color: COLORS.MEDIUM }),
        ], { before: 0, after: 0, align: AlignmentType.RIGHT })],
      }),
    },
    children: [], // Caller populates this
  };
}

// ============================================================
// DOCUMENT BUILDER
// ============================================================

/**
 * Create a complete Mercury Document from sections.
 * @param {Array} sections - Array of section objects (from coverPage, contentSection, etc.)
 */
function createDocument(sections) {
  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections,
  });
}

/**
 * Build the document to a file.
 * @param {Document} doc - The document object
 * @param {string} outputPath - File path to write
 */
async function build(doc, outputPath) {
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Mercury document saved: ${outputPath} (${buffer.length} bytes)`);
  return buffer;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Design system
  COLORS,
  FONT_PRIMARY,
  FONT_FALLBACK,
  BORDERS,
  BORDERS_NONE,
  BORDER_THIN,
  BORDER_NONE,
  CELL_MARGINS,
  PAGE_A4,
  CONTENT_WIDTH,
  STYLES,
  NUMBERING,

  // Logos
  getLogoBuffer,

  // Text and paragraphs
  t, p,
  heading1, heading2, heading3,
  bodyText, spacer,

  // Tables
  cell, hCell,
  dataTable, gapsTable,

  // Sections
  coverPage, contentSection,

  // Document
  createDocument, build,

  // Re-exports from docx (so consumers don't need to import docx separately)
  HeadingLevel, AlignmentType, PageBreak, TextRun, Paragraph,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageNumber, ImageRun,
};
