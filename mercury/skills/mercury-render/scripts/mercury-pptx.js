/**
 * Mercury PPTX Components v3.1 — reusable pptxgenjs building blocks for Mercury-branded presentations.
 *
 * Design system derived from IDX brand templates (IDX2024_core_v1.pptx).
 * Uses LAYOUT_WIDE (13.33" × 7.50") to match the IDX core template.
 *
 * v3.1 changes:
 *   - Fonts switched from Arial to IDX Sans (with IDX Headline for display)
 *   - Content slides now use dark Licorice background (was Floral White)
 *   - Table headers use Rose fill (was Licorice) for better contrast on dark bg
 *   - Table body rows alternate dark shades (#1A1025 / #12061A) with Floral White text
 *   - IDX logo on content slides uses white-tiny variant
 *   - Added MERCURY_DARK_CONTENT alias for clarity
 *
 * Usage:
 *   const MP = require('./mercury-pptx.js');
 *   const pptx = MP.createPresentation("Site audit", "Inchcape plc");
 *   MP.titleSlide(pptx, "Site audit", "Inchcape plc", [["Sector", "Automotive"], ["Date", "Feb 2026"]]);
 *   MP.contentSlide(pptx, "Executive summary", "Body text here...");
 *   await MP.build(pptx, "output.pptx");
 */

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

// ============================================================
// DESIGN SYSTEM  (IDX Brand)
// ============================================================

const COLORS = {
  // Core brand
  LICORICE:       "12061A",   // Primary dark — slide backgrounds, headings
  FLORAL_WHITE:   "F7F6EE",   // Primary light — body text on dark bg
  PURE_BLACK:     "000000",
  PURE_WHITE:     "FFFFFF",

  // Accents
  LEMON_LIME:     "EEFF00",   // Accent 1 — section dividers
  ROSE:           "FF006F",   // Accent 2 — primary accent for Mercury
  AQUAMARINE:     "00FFC9",   // Accent 3 — "Strong" rating
  ORANGE:         "FF6500",   // Accent 4
  GREEN:          "00FF00",   // Accent 5
  BLUE:           "0068FF",   // Accent 6
  HYPERLINK:      "FF006F",   // Rose — matches brand template

  // Dark theme table alternation
  DARK_ROW_A:     "1A1025",   // Slightly lighter than Licorice
  DARK_ROW_B:     "12061A",   // Same as Licorice

  // Semantic
  DARK:           "12061A",
  MEDIUM:         "666666",
  HIGH_RED:       "CC3333",
  MED_AMBER:      "E8A317",
  LOW_GREEN:      "27AE60",
  ZEBRA:          "F5F5F5",
};

const FONTS = {
  HEADING: "IDX Sans",        // IDX Sans Bold weight implied by bold: true
  BODY:    "IDX Sans",        // IDX Sans Regular for body copy
  DISPLAY: "IDX Headline",   // IDX Headline Heavy for title slides
  SERIF:   "IDX Serif",      // Pull quotes, product names (rare)
  FALLBACK: "Arial",         // Safe fallback for all contexts
};

// IDX template uses LAYOUT_WIDE (13.33" × 7.50")
const LAYOUT = {
  WIDTH:     13.33,
  HEIGHT:    7.50,
  MARGIN:    0.6,
  CONTENT_X: 0.6,
  CONTENT_Y: 1.2,
  CONTENT_W: 12.13,    // WIDTH - 2 * MARGIN
  CONTENT_H: 5.5,
  FOOTER_Y:  7.0,
  FOOTER_H:  0.4,
};

// ============================================================
// LOGO HELPER
// ============================================================

/**
 * Get a logo path for embedding.
 * @param {"black"|"white"} variant
 * @param {"standard"|"tiny"|"large"} size
 * @returns {string|null} absolute file path
 */
function getLogoPath(variant = "black", size = "standard") {
  const sizeMap = { tiny: "tiny", standard: "", large: "large" };
  const suffix = sizeMap[size];
  const filename = suffix
    ? `IDX-${variant}-${suffix}.png`
    : `IDX-${variant}.png`;
  const logoPath = path.join(__dirname, "..", "assets", "logos", filename);
  return fs.existsSync(logoPath) ? logoPath : null;
}

// ============================================================
// PRESENTATION FACTORY
// ============================================================

/**
 * Create a new Mercury-branded presentation.
 * @param {string} title - Presentation title (metadata)
 * @param {string} author - Author name
 * @returns {pptxgen} Configured pptxgenjs instance
 */
function createPresentation(title, author) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = author || "IDX Mercury";
  pptx.title = title || "Mercury Report";

  // ---- TITLE slide master (Licorice background) ----
  pptx.defineSlideMaster({
    title: "MERCURY_TITLE",
    background: { color: COLORS.LICORICE },
    objects: [
      // Rose accent bar at top
      { rect: { x: 0, y: 0, w: LAYOUT.WIDTH, h: 0.06, fill: { color: COLORS.ROSE } } },
    ],
  });

  // ---- CONTENT slide master (Dark Licorice background — v3.1 dark theme) ----
  pptx.defineSlideMaster({
    title: "MERCURY_CONTENT",
    background: { color: COLORS.LICORICE },
    objects: [
      // Rose accent bar at top
      { rect: { x: 0, y: 0, w: LAYOUT.WIDTH, h: 0.06, fill: { color: COLORS.ROSE } } },
      // Footer bar
      { rect: { x: 0, y: LAYOUT.FOOTER_Y, w: LAYOUT.WIDTH, h: LAYOUT.FOOTER_H, fill: { color: COLORS.LICORICE } } },
      // Footer divider line (subtle separation)
      { rect: { x: 0, y: LAYOUT.FOOTER_Y, w: LAYOUT.WIDTH, h: 0.01, fill: { color: COLORS.ROSE } } },
      // Footer text
      { text: {
        text: "Mercury  |  Confidential",
        options: {
          x: 0.6, y: LAYOUT.FOOTER_Y + 0.04, w: 5, h: 0.3,
          fontSize: 8, fontFace: FONTS.BODY,
          color: COLORS.PURE_WHITE,
        },
      }},
      // Footer right — idx.inc
      { text: {
        text: "idx.inc",
        options: {
          x: 5.5, y: LAYOUT.FOOTER_Y + 0.04, w: 3, h: 0.3,
          fontSize: 8, fontFace: FONTS.BODY, bold: true,
          color: COLORS.PURE_WHITE, align: "center",
        },
      }},
    ],
  });

  // ---- DARK CONTENT alias (same as MERCURY_CONTENT, for clarity in code) ----
  pptx.defineSlideMaster({
    title: "MERCURY_DARK_CONTENT",
    background: { color: COLORS.LICORICE },
    objects: [
      { rect: { x: 0, y: 0, w: LAYOUT.WIDTH, h: 0.06, fill: { color: COLORS.ROSE } } },
      { rect: { x: 0, y: LAYOUT.FOOTER_Y, w: LAYOUT.WIDTH, h: LAYOUT.FOOTER_H, fill: { color: COLORS.LICORICE } } },
      { rect: { x: 0, y: LAYOUT.FOOTER_Y, w: LAYOUT.WIDTH, h: 0.01, fill: { color: COLORS.ROSE } } },
      { text: {
        text: "Mercury  |  Confidential",
        options: {
          x: 0.6, y: LAYOUT.FOOTER_Y + 0.04, w: 5, h: 0.3,
          fontSize: 8, fontFace: FONTS.BODY,
          color: COLORS.PURE_WHITE,
        },
      }},
      { text: {
        text: "idx.inc",
        options: {
          x: 5.5, y: LAYOUT.FOOTER_Y + 0.04, w: 3, h: 0.3,
          fontSize: 8, fontFace: FONTS.BODY, bold: true,
          color: COLORS.PURE_WHITE, align: "center",
        },
      }},
    ],
  });

  // ---- SECTION divider master (Lemon Lime background — unchanged) ----
  pptx.defineSlideMaster({
    title: "MERCURY_SECTION",
    background: { color: COLORS.LEMON_LIME },
    objects: [
      { rect: { x: 0, y: 0, w: LAYOUT.WIDTH, h: 0.06, fill: { color: COLORS.LICORICE } } },
      { rect: { x: 0, y: LAYOUT.FOOTER_Y, w: LAYOUT.WIDTH, h: LAYOUT.FOOTER_H, fill: { color: COLORS.LICORICE } } },
    ],
  });

  return pptx;
}

// ============================================================
// SLIDE BUILDERS
// ============================================================

/**
 * Add a title slide (cover page).
 * @param {pptxgen} pptx
 * @param {string} title - Main title
 * @param {string} subtitle - Subtitle
 * @param {Array} meta - Array of [label, value] pairs
 * @param {object} opts - {thirdLine}
 */
function titleSlide(pptx, title, subtitle, meta, opts = {}) {
  const slide = pptx.addSlide({ masterName: "MERCURY_TITLE" });

  // IDX logo (white variant on dark bg, top-right)
  const logoPath = getLogoPath("white", "tiny");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: 11.8, y: 0.3, w: 1.2, h: 0.4 });
  }

  // Title — uses display font
  slide.addText(title, {
    x: 0.6, y: 2.0, w: 12, h: 1.2,
    fontSize: 44, fontFace: FONTS.DISPLAY,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  // Rose accent divider
  slide.addShape(pptx.shapes.LINE, {
    x: 0.6, y: 3.3, w: 3, h: 0,
    line: { color: COLORS.ROSE, width: 3 },
  });

  // Subtitle (Rose)
  slide.addText(subtitle, {
    x: 0.6, y: 3.45, w: 12, h: 0.7,
    fontSize: 26, fontFace: FONTS.HEADING,
    color: COLORS.ROSE,
    margin: 0,
  });

  // Optional third line
  if (opts.thirdLine) {
    slide.addText(opts.thirdLine, {
      x: 0.6, y: 4.15, w: 12, h: 0.5,
      fontSize: 18, fontFace: FONTS.BODY,
      color: COLORS.MEDIUM,
      margin: 0,
    });
  }

  // Meta pairs
  if (meta && meta.length > 0) {
    const metaY = opts.thirdLine ? 4.7 : 4.3;
    const metaRows = meta.map(([label, value]) => [
      { text: label, options: { fontSize: 9, fontFace: FONTS.BODY, color: COLORS.MEDIUM, bold: true } },
      { text: value, options: { fontSize: 9, fontFace: FONTS.BODY, color: COLORS.PURE_WHITE } },
    ]);
    slide.addTable(metaRows, {
      x: 0.6, y: metaY, w: 5, h: meta.length * 0.3,
      border: { type: "none" },
      colW: [2, 3],
    });
  }

  // Tagline — uses serif font
  slide.addText("Prepared by IDX using the Mercury platform", {
    x: 0.6, y: 6.5, w: 12, h: 0.3,
    fontSize: 8, fontFace: FONTS.SERIF,
    color: COLORS.MEDIUM, italic: true,
    margin: 0,
  });

  return slide;
}

/**
 * Add a section divider slide (Lemon Lime — unchanged).
 * @param {pptxgen} pptx
 * @param {string} heading - Section heading
 * @param {string} subheading - Optional subheading
 */
function sectionSlide(pptx, heading, subheading) {
  const slide = pptx.addSlide({ masterName: "MERCURY_SECTION" });

  // Black IDX logo on Lemon Lime background
  const logoPath = getLogoPath("black", "tiny");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: 11.8, y: 0.3, w: 1.2, h: 0.4 });
  }

  slide.addText(heading, {
    x: 0.6, y: 2.5, w: 12, h: 1.0,
    fontSize: 36, fontFace: FONTS.HEADING,
    color: COLORS.LICORICE, bold: true,
    margin: 0,
  });

  // Licorice underline
  slide.addShape(pptx.shapes.LINE, {
    x: 0.6, y: 3.55, w: 2.5, h: 0,
    line: { color: COLORS.LICORICE, width: 3 },
  });

  if (subheading) {
    slide.addText(subheading, {
      x: 0.6, y: 3.7, w: 12, h: 0.5,
      fontSize: 16, fontFace: FONTS.BODY,
      color: COLORS.LICORICE,
      margin: 0,
    });
  }

  return slide;
}

/**
 * Add a content slide with heading and body text (dark theme).
 * @param {pptxgen} pptx
 * @param {string} heading - Slide heading
 * @param {string|Array} body - Body text string or array of rich text objects
 * @param {object} opts - {fontSize, bodyY}
 */
function contentSlide(pptx, heading, body, opts = {}) {
  const slide = pptx.addSlide({ masterName: "MERCURY_CONTENT" });

  // White IDX logo on dark background
  const logoPath = getLogoPath("white", "tiny");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: 11.8, y: 0.3, w: 1.0, h: 0.3 });
  }

  // Heading — Pure White on dark bg
  slide.addText(heading, {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W - 1.5, h: 0.7,
    fontSize: 22, fontFace: FONTS.HEADING,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  // Rose accent underline
  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 0.98, w: 1.5, h: 0,
    line: { color: COLORS.ROSE, width: 2 },
  });

  // Body — Floral White on dark bg
  const bodyY = opts.bodyY || 1.15;
  const bodyH = LAYOUT.FOOTER_Y - bodyY - 0.2;
  slide.addText(body, {
    x: LAYOUT.CONTENT_X, y: bodyY, w: LAYOUT.CONTENT_W, h: bodyH,
    fontSize: opts.fontSize || 12, fontFace: FONTS.BODY,
    color: COLORS.FLORAL_WHITE, valign: "top",
  });

  return slide;
}

/**
 * Add a slide with bullet points (dark theme).
 * @param {pptxgen} pptx
 * @param {string} heading - Slide heading
 * @param {Array} bullets - Array of {title, detail} objects or plain strings
 * @param {object} opts - {numbered}
 */
function bulletSlide(pptx, heading, bullets, opts = {}) {
  const slide = pptx.addSlide({ masterName: "MERCURY_CONTENT" });

  // White IDX logo
  const logoPath = getLogoPath("white", "tiny");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: 11.8, y: 0.3, w: 1.0, h: 0.3 });
  }

  slide.addText(heading, {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W - 1.5, h: 0.7,
    fontSize: 22, fontFace: FONTS.HEADING,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 0.98, w: 1.5, h: 0,
    line: { color: COLORS.ROSE, width: 2 },
  });

  const textItems = [];
  bullets.forEach((item) => {
    if (typeof item === "string") {
      textItems.push({
        text: item,
        options: {
          bullet: opts.numbered ? { type: "number" } : { code: "2022" },
          breakLine: true,
          fontSize: 12, fontFace: FONTS.BODY, color: COLORS.FLORAL_WHITE,
          paraSpaceAfter: 8,
        },
      });
    } else {
      textItems.push({
        text: item.title,
        options: {
          bullet: opts.numbered ? { type: "number" } : { code: "2022" },
          breakLine: true,
          fontSize: 13, fontFace: FONTS.HEADING, color: COLORS.PURE_WHITE, bold: true,
          paraSpaceAfter: 2,
        },
      });
      if (item.detail) {
        textItems.push({
          text: item.detail,
          options: {
            breakLine: true, indentLevel: 1,
            fontSize: 11, fontFace: FONTS.BODY, color: COLORS.FLORAL_WHITE,
            paraSpaceAfter: 10,
          },
        });
      }
    }
  });

  slide.addText(textItems, {
    x: LAYOUT.CONTENT_X, y: 1.15, w: LAYOUT.CONTENT_W, h: 5.5,
    valign: "top",
  });

  return slide;
}

/**
 * Add a data table slide (dark theme with Rose headers).
 * @param {pptxgen} pptx
 * @param {string} heading - Slide heading
 * @param {string[]} headers - Column headers
 * @param {Array[]} rows - 2D array of cell values (strings)
 * @param {object} opts - {colW, cellOpts(rowIdx, colIdx, value)}
 */
function tableSlide(pptx, heading, headers, rows, opts = {}) {
  const slide = pptx.addSlide({ masterName: "MERCURY_CONTENT" });

  // White IDX logo
  const logoPath = getLogoPath("white", "tiny");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: 11.8, y: 0.3, w: 1.0, h: 0.3 });
  }

  slide.addText(heading, {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W - 1.5, h: 0.7,
    fontSize: 22, fontFace: FONTS.HEADING,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 0.98, w: 1.5, h: 0,
    line: { color: COLORS.ROSE, width: 2 },
  });

  // Build table data — Rose header row on dark background
  const headerRow = headers.map(h => ({
    text: h,
    options: {
      fontSize: 10, fontFace: FONTS.HEADING,
      color: COLORS.PURE_WHITE, bold: true,
      fill: { color: COLORS.ROSE },
      border: { pt: 0.5, color: "2A1535" },
      valign: "middle",
    },
  }));

  // Body rows alternate between dark shades with Floral White text
  const dataRows = rows.map((row, ri) => {
    const fill = ri % 2 === 0 ? COLORS.DARK_ROW_A : COLORS.DARK_ROW_B;
    return row.map((val, ci) => {
      const cellOptions = opts.cellOpts ? opts.cellOpts(ri, ci, val) : {};
      const isTextObj = typeof val === "object" && val !== null && val.text;
      const text = isTextObj ? val.text : String(val);
      const valOpts = isTextObj ? (val.options || {}) : {};
      return {
        text,
        options: {
          fontSize: 10, fontFace: FONTS.BODY,
          color: valOpts.color || cellOptions.color || COLORS.FLORAL_WHITE,
          bold: valOpts.bold || cellOptions.bold || false,
          fill: { color: valOpts.fill ? (valOpts.fill.color || valOpts.fill) : (cellOptions.fill || fill) },
          border: { pt: 0.5, color: "2A1535" },
          valign: "middle",
          ...cellOptions,
        },
      };
    });
  });

  const tableData = [headerRow, ...dataRows];
  const tableH = Math.min(0.35 + rows.length * 0.32, 5.5);

  slide.addTable(tableData, {
    x: LAYOUT.CONTENT_X, y: 1.15, w: LAYOUT.CONTENT_W, h: tableH,
    colW: opts.colW || undefined,
    border: { pt: 0.5, color: "2A1535" },
    autoPage: false,
  });

  return slide;
}

/**
 * Add a two-column content slide (dark theme).
 * @param {pptxgen} pptx
 * @param {string} heading - Slide heading
 * @param {string|Array} leftContent - Left column text/rich text
 * @param {string|Array} rightContent - Right column text/rich text
 * @param {object} opts - {leftHeading, rightHeading}
 */
function twoColumnSlide(pptx, heading, leftContent, rightContent, opts = {}) {
  const slide = pptx.addSlide({ masterName: "MERCURY_CONTENT" });

  // White IDX logo
  const logoPath = getLogoPath("white", "tiny");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: 11.8, y: 0.3, w: 1.0, h: 0.3 });
  }

  slide.addText(heading, {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W - 1.5, h: 0.7,
    fontSize: 22, fontFace: FONTS.HEADING,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 0.98, w: 1.5, h: 0,
    line: { color: COLORS.ROSE, width: 2 },
  });

  const colW = 5.7;
  const colGap = 0.5;
  const colY = 1.2;
  const colH = 5.3;

  // Left column heading
  if (opts.leftHeading) {
    slide.addText(opts.leftHeading, {
      x: LAYOUT.CONTENT_X, y: colY, w: colW, h: 0.4,
      fontSize: 14, fontFace: FONTS.HEADING,
      color: COLORS.ROSE, bold: true,
      margin: 0,
    });
  }

  const leftBodyY = opts.leftHeading ? colY + 0.45 : colY;
  slide.addText(leftContent, {
    x: LAYOUT.CONTENT_X, y: leftBodyY, w: colW, h: colH - (leftBodyY - colY),
    fontSize: 11, fontFace: FONTS.BODY,
    color: COLORS.FLORAL_WHITE, valign: "top",
  });

  const rightX = LAYOUT.CONTENT_X + colW + colGap;
  if (opts.rightHeading) {
    slide.addText(opts.rightHeading, {
      x: rightX, y: colY, w: colW, h: 0.4,
      fontSize: 14, fontFace: FONTS.HEADING,
      color: COLORS.ROSE, bold: true,
      margin: 0,
    });
  }

  const rightBodyY = opts.rightHeading ? colY + 0.45 : colY;
  slide.addText(rightContent, {
    x: rightX, y: rightBodyY, w: colW, h: colH - (rightBodyY - colY),
    fontSize: 11, fontFace: FONTS.BODY,
    color: COLORS.FLORAL_WHITE, valign: "top",
  });

  return slide;
}

/**
 * Add a rating table slide (for exec summary ratings — dark theme).
 */
function ratingSlide(pptx, heading, ratings) {
  const ratingColor = (r) => {
    switch (r) {
      case "Strong":   return { bg: COLORS.AQUAMARINE, fg: COLORS.LICORICE };
      case "Adequate": return { bg: COLORS.MED_AMBER, fg: COLORS.LICORICE };
      case "Weak":     return { bg: COLORS.HIGH_RED, fg: COLORS.PURE_WHITE };
      case "Absent":   return { bg: COLORS.HIGH_RED, fg: COLORS.PURE_WHITE };
      default:         return { bg: COLORS.DARK_ROW_A, fg: COLORS.FLORAL_WHITE };
    }
  };

  const headers = ["Area", "Assessment"];
  const rows = ratings.map(r => {
    const colors = ratingColor(r.rating);
    return [
      r.label,
      { text: r.rating, options: { color: colors.fg, bold: true, fill: { color: colors.bg } } },
    ];
  });

  return tableSlide(pptx, heading, headers, rows, { colW: [7, 5] });
}

/**
 * Add a gaps priority slide (dark theme).
 */
function gapsSlide(pptx, heading, gaps) {
  const prioColor = (p) => {
    switch (p) {
      case "High":   return COLORS.HIGH_RED;
      case "Medium": return COLORS.MED_AMBER;
      case "Low":    return COLORS.LOW_GREEN;
      default:       return COLORS.FLORAL_WHITE;
    }
  };

  const headers = ["#", "Gap", "Priority", "Section"];
  const rows = gaps.map((g, i) => [
    String(i + 1),
    g.gap,
    { text: g.priority, options: { color: prioColor(g.priority), bold: true } },
    g.applies || g.section || "",
  ]);

  return tableSlide(pptx, heading, headers, rows, { colW: [0.6, 6, 1.5, 4] });
}

// ============================================================
// BUILD
// ============================================================

/**
 * Build the presentation to a file.
 * @param {pptxgen} pptx
 * @param {string} outputPath
 */
async function build(pptx, outputPath) {
  await pptx.writeFile({ fileName: outputPath });
  const stats = fs.statSync(outputPath);
  console.log(`Mercury presentation saved: ${outputPath} (${stats.size} bytes)`);
  return outputPath;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Design system
  COLORS,
  FONTS,
  LAYOUT,

  // Logos
  getLogoPath,

  // Presentation factory
  createPresentation,

  // Slide builders
  titleSlide,
  sectionSlide,
  contentSlide,
  bulletSlide,
  tableSlide,
  twoColumnSlide,
  ratingSlide,
  gapsSlide,

  // Build
  build,
};
