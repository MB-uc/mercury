/**
 * Mercury Components v3.1 — reusable docx-js building blocks for Mercury-branded documents.
 *
 * Design system derived from IDX brand templates (IDX2024_core_v1.pptx, Word Generic A4).
 * Uses IDX Sans as primary font with Arial fallback.
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
  LICORICE:       "12061A",
  FLORAL_WHITE:   "F7F6EE",
  PURE_BLACK:     "000000",
  PURE_WHITE:     "FFFFFF",

  // Accents
  LEMON_LIME:     "EEFF00",
  ROSE:           "FF006F",
  AQUAMARINE:     "00FFC9",
  ORANGE:         "FF6500",
  GREEN:          "00FF00",
  BLUE:           "0068FF",
  HYPERLINK:      "FF006F",   // Rose — matches brand template

  // Mercury product palette
  MERCURY_BLUE:   "12061A",
  MERCURY_ACCENT: "FF006F",
  MERCURY_LIGHT:  "F7F6EE",
  MERCURY_GRAY:   "F5F5F5",

  // Semantic
  WHITE:          "FFFFFF",
  DARK:           "12061A",
  MEDIUM:         "666666",
  HIGH_RED:       "CC3333",
  MED_AMBER:      "E8A317",
  LOW_GREEN:      "27AE60",
};

// IDX type family — brand fonts with safe fallbacks
const FONT_PRIMARY  = "IDX Sans";       // Body copy, tables, general text
const FONT_HEADING  = "IDX Sans";       // Headings (Bold weight via bold: true)
const FONT_DISPLAY  = "IDX Headline";   // Cover page titles, display text
const FONT_SERIF    = "IDX Serif";      // Pull quotes, product names
const FONT_FALLBACK = "Arial";          // Safe fallback for all contexts

const BORDER_THIN = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const BORDERS = { top: BORDER_THIN, bottom: BORDER_THIN, left: BORDER_THIN, right: BORDER_THIN };
const BORDER_NONE = { style: BorderStyle.NONE, size: 0 };
const BORDERS_NONE = { top: BORDER_NONE, bottom: BORDER_NONE, left: BORDER_NONE, right: BORDER_NONE };
const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };

const PAGE_A4 = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
};
const CONTENT_WIDTH = 9026;

const STYLES = {
  default: { document: { run: { font: FONT_PRIMARY, size: 22 } } },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 32, bold: true, font: FONT_HEADING, color: COLORS.LICORICE },
      paragraph: { spacing: { before: 600, after: 240 }, outlineLevel: 0 },
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 26, bold: true, font: FONT_HEADING, color: COLORS.LICORICE },
      paragraph: { spacing: { before: 150, after: 160 }, outlineLevel: 1 },
    },
    {
      id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 20, bold: true, font: FONT_HEADING, color: COLORS.LICORICE },
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
// LOGO & FONT HELPERS
// ============================================================

function getLogoBuffer(variant = "black", size = "standard") {
  const sizeMap = { tiny: "tiny", standard: "", large: "large" };
  const suffix = sizeMap[size];
  const filename = suffix ? `IDX-${variant}-${suffix}.png` : `IDX-${variant}.png`;
  const logoPath = path.join(__dirname, "..", "assets", "logos", filename);
  try {
    return fs.readFileSync(logoPath);
  } catch {
    return null;
  }
}

/**
 * Get font file buffer for embedding reference.
 * @param {string} fontFilename - e.g. "IDXSans-Regular.otf"
 * @returns {Buffer|null}
 */
function getFontBuffer(fontFilename) {
  const fontPath = path.join(__dirname, "..", "assets", "fonts", fontFilename);
  try {
    return fs.readFileSync(fontPath);
  } catch {
    return null;
  }
}

// ============================================================
// TEXT & PARAGRAPH HELPERS
// ============================================================

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

function heading1(text, opts = {}) {
  return p([t(text)], { heading: HeadingLevel.HEADING_1, ...opts });
}

function heading2(text, opts = {}) {
  return p([t(text)], { heading: HeadingLevel.HEADING_2, ...opts });
}

function heading3(text, opts = {}) {
  return p([t(text)], { heading: HeadingLevel.HEADING_3, ...opts });
}

function bodyText(text, opts = {}) {
  return p([t(text)], opts);
}

function spacer(before = 120, after = 0) {
  return p([t("")], { before, after });
}

// ============================================================
// TABLE HELPERS
// ============================================================

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

function hCell(text, width, fill) {
  return cell(
    [t(text, { bold: true, color: COLORS.WHITE, size: 20 })],
    { width, fill: fill || COLORS.LICORICE }
  );
}

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

function coverPage(title, subtitle, meta, opts = {}) {
  const isDark = !opts.lightCover;
  const titleColor = isDark ? COLORS.WHITE : COLORS.LICORICE;
  const subtitleColor = COLORS.ROSE;
  const metaLabelColor = COLORS.MEDIUM;
  const metaValueColor = isDark ? COLORS.WHITE : COLORS.DARK;
  const taglineColor = COLORS.MEDIUM;

  const children = [
    spacer(2400),
  ];

  // IDX logo
  const logoVariant = isDark ? "white" : "black";
  const logoBuf = getLogoBuffer(logoVariant, "tiny");
  if (logoBuf) {
    children.push(p([new ImageRun({ data: logoBuf, transformation: { width: 80, height: 21 } })], { before: 0, after: 200 }));
  } else {
    children.push(p([t("IDX", { size: 20, color: COLORS.ROSE, bold: true })], { before: 0, after: 80 }));
  }

  // Accent divider
  children.push(new Table({
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
  }));

  // Title — uses display font
  children.push(p([t(title, { size: 56, bold: true, color: titleColor, font: FONT_DISPLAY })], { before: 400, after: 40 }));

  // Subtitle
  children.push(p([t(subtitle, { size: 36, color: subtitleColor, font: FONT_HEADING })], { before: 0, after: 200 }));

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
    children.push(p([t(line, { size: 18, color: taglineColor, italics: true, font: FONT_SERIF })]));
  });

  return {
    properties: { page: PAGE_A4 },
    children,
  };
}

function contentSection(headerLeft, headerRight) {
  // Header with logo
  const logoBuffer = getLogoBuffer("black", "tiny");
  const headerChildren = [
    t("Mercury  ", { size: 16, color: COLORS.ROSE, bold: true, font: FONT_HEADING }),
    t(`|  ${headerRight || headerLeft}`, { size: 16, color: COLORS.MEDIUM }),
  ];
  if (logoBuffer) {
    headerChildren.push(new TextRun({ text: "    " }));
    headerChildren.push(new ImageRun({ data: logoBuffer, transformation: { width: 48, height: 13 } }));
  }

  return {
    properties: { page: PAGE_A4 },
    headers: {
      default: new Header({
        children: [p(headerChildren, { before: 0, after: 0 })],
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
    children: [],
  };
}

// ============================================================
// DOCUMENT BUILDER
// ============================================================

function createDocument(sections) {
  return new Document({
    styles: STYLES,
    numbering: NUMBERING,
    sections,
  });
}

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
  FONT_PRIMARY, FONT_HEADING, FONT_DISPLAY, FONT_SERIF, FONT_FALLBACK,
  BORDERS, BORDERS_NONE, BORDER_THIN, BORDER_NONE,
  CELL_MARGINS, PAGE_A4, CONTENT_WIDTH,
  STYLES, NUMBERING,

  // Logos & Fonts
  getLogoBuffer, getFontBuffer,

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

  // Re-exports from docx
  HeadingLevel, AlignmentType, PageBreak, TextRun, Paragraph,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageNumber, ImageRun,
};
