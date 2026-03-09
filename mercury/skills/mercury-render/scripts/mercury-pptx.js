/**
 * Mercury PPTX Components — reusable pptxgenjs building blocks for Mercury-branded presentations.
 *
 * Design system derived from IDX brand templates (IDX2024_core_v1.pptx).
 * Uses LAYOUT_WIDE (13.33" × 7.50") to match the IDX core template.
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
  LICORICE:       "12061A",   // Primary dark
  FLORAL_WHITE:   "F7F6EE",   // Primary light / background
  PURE_BLACK:     "000000",
  PURE_WHITE:     "FFFFFF",

  // Accents
  LEMON_LIME:     "EEFF00",   // Accent 1
  ROSE:           "FF006F",   // Accent 2 — primary accent for Mercury
  AQUAMARINE:     "00FFC9",   // Accent 3
  ORANGE:         "FF6500",   // Accent 4
  GREEN:          "00FF00",   // Accent 5
  BLUE:           "0068FF",   // Accent 6
  HYPERLINK:      "00A6EB",   // Link blue

  // Semantic
  DARK:           "12061A",
  MEDIUM:         "666666",
  HIGH_RED:       "CC3333",
  MED_AMBER:      "E8A317",
  LOW_GREEN:      "27AE60",
  ZEBRA:          "F5F5F5",
};

const FONTS = {
  HEADING: "Arial",   // IDX Sans is the brand font; Arial is the safe fallback
  BODY:    "Arial",
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
 * @param {"standard"|"tiny"} size
 * @returns {string|null} absolute file path
 */
function getLogoPath(variant = "black", size = "standard") {
  const filename = size === "tiny"
    ? `IDX-${variant}-tiny.png`
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

  // ---- CONTENT slide master (Floral White background) ----
  pptx.defineSlideMaster({
    title: "MERCURY_CONTENT",
    background: { color: COLORS.FLORAL_WHITE },
    objects: [
      // Rose accent bar at top
      { rect: { x: 0, y: 0, w: LAYOUT.WIDTH, h: 0.06, fill: { color: COLORS.ROSE } } },
      // Footer bar
      { rect: { x: 0, y: LAYOUT.FOOTER_Y, w: LAYOUT.WIDTH, h: LAYOUT.FOOTER_H, fill: { color: COLORS.LICORICE } } },
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

  // ---- SECTION divider master (Lemon Lime background) ----
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

  // IDX logo (white, top-right)
  const logoPath = getLogoPath("white", "tiny");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: 11.8, y: 0.3, w: 1.2, h: 0.4 });
  }

  // Title
  slide.addText(title, {
    x: 0.6, y: 2.0, w: 12, h: 1.2,
    fontSize: 44, fontFace: FONTS.HEADING,
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

  // Tagline
  slide.addText("Prepared by IDX using the Mercury platform", {
    x: 0.6, y: 6.5, w: 12, h: 0.3,
    fontSize: 8, fontFace: FONTS.BODY,
    color: COLORS.MEDIUM, italic: true,
    margin: 0,
  });

  return slide;
}

/**
 * Add a section divider slide.
 * @param {pptxgen} pptx
 * @param {string} heading - Section heading
 * @param {string} subheading - Optional subheading
 */
function sectionSlide(pptx, heading, subheading) {
  const slide = pptx.addSlide({ masterName: "MERCURY_SECTION" });

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
 * Add a content slide with heading and body text.
 * @param {pptxgen} pptx
 * @param {string} heading - Slide heading
 * @param {string|Array} body - Body text string or array of rich text objects
 * @param {object} opts - {fontSize, bodyY}
 */
function contentSlide(pptx, heading, body, opts = {}) {
  const slide = pptx.addSlide({ masterName: "MERCURY_CONTENT" });

  // Heading
  slide.addText(heading, {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W, h: 0.7,
    fontSize: 22, fontFace: FONTS.HEADING,
    color: COLORS.LICORICE, bold: true,
    margin: 0,
  });

  // Rose accent underline
  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 0.98, w: 1.5, h: 0,
    line: { color: COLORS.ROSE, width: 2 },
  });

  // Body
  const bodyY = opts.bodyY || 1.15;
  const bodyH = LAYOUT.FOOTER_Y - bodyY - 0.2;
  slide.addText(body, {
    x: LAYOUT.CONTENT_X, y: bodyY, w: LAYOUT.CONTENT_W, h: bodyH,
    fontSize: opts.fontSize || 12, fontFace: FONTS.BODY,
    color: COLORS.DARK, valign: "top",
  });

  return slide;
}

/**
 * Add a slide with bullet points.
 * @param {pptxgen} pptx
 * @param {string} heading - Slide heading
 * @param {Array} bullets - Array of {title, detail} objects or plain strings
 * @param {object} opts - {numbered}
 */
function bulletSlide(pptx, heading, bullets, opts = {}) {
  const slide = pptx.addSlide({ masterName: "MERCURY_CONTENT" });

  slide.addText(heading, {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W, h: 0.7,
    fontSize: 22, fontFace: FONTS.HEADING,
    color: COLORS.LICORICE, bold: true,
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
          bullet: opts.numbered ? { type: "number" } : true,
          breakLine: true,
          fontSize: 12, fontFace: FONTS.BODY, color: COLORS.DARK,
          paraSpaceAfter: 8,
        },
      });
    } else {
      textItems.push({
        text: item.title,
        options: {
          bullet: opts.numbered ? { type: "number" } : true,
          breakLine: true,
          fontSize: 13, fontFace: FONTS.HEADING, color: COLORS.LICORICE, bold: true,
          paraSpaceAfter: 2,
        },
      });
      if (item.detail) {
        textItems.push({
          text: item.detail,
          options: {
            breakLine: true, indentLevel: 1,
            fontSize: 11, fontFace: FONTS.BODY, color: COLORS.DARK,
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
 * Add a data table slide.
 * @param {pptxgen} pptx
 * @param {string} heading - Slide heading
 * @param {string[]} headers - Column headers
 * @param {Array[]} rows - 2D array of cell values (strings)
 * @param {object} opts - {colW, cellOpts(rowIdx, colIdx, value)}
 */
function tableSlide(pptx, heading, headers, rows, opts = {}) {
  const slide = pptx.addSlide({ masterName: "MERCURY_CONTENT" });

  slide.addText(heading, {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W, h: 0.7,
    fontSize: 22, fontFace: FONTS.HEADING,
    color: COLORS.LICORICE, bold: true,
    margin: 0,
  });

  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 0.98, w: 1.5, h: 0,
    line: { color: COLORS.ROSE, width: 2 },
  });

  // Build table data
  const headerRow = headers.map(h => ({
    text: h,
    options: {
      fontSize: 10, fontFace: FONTS.HEADING,
      color: COLORS.PURE_WHITE, bold: true,
      fill: { color: COLORS.LICORICE },
      border: { pt: 0.5, color: "CCCCCC" },
      valign: "middle",
    },
  }));

  const dataRows = rows.map((row, ri) => {
    const fill = ri % 2 === 0 ? COLORS.ZEBRA : COLORS.PURE_WHITE;
    return row.map((val, ci) => {
      const cellOptions = opts.cellOpts ? opts.cellOpts(ri, ci, val) : {};
      return {
        text: String(val),
        options: {
          fontSize: 10, fontFace: FONTS.BODY,
          color: cellOptions.color || COLORS.DARK,
          bold: cellOptions.bold || false,
          fill: { color: cellOptions.fill || fill },
          border: { pt: 0.5, color: "CCCCCC" },
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
    border: { pt: 0.5, color: "CCCCCC" },
    autoPage: false,
  });

  return slide;
}

/**
 * Add a two-column content slide.
 * @param {pptxgen} pptx
 * @param {string} heading - Slide heading
 * @param {string|Array} leftContent - Left column text/rich text
 * @param {string|Array} rightContent - Right column text/rich text
 * @param {object} opts - {leftHeading, rightHeading}
 */
function twoColumnSlide(pptx, heading, leftContent, rightContent, opts = {}) {
  const slide = pptx.addSlide({ masterName: "MERCURY_CONTENT" });

  slide.addText(heading, {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W, h: 0.7,
    fontSize: 22, fontFace: FONTS.HEADING,
    color: COLORS.LICORICE, bold: true,
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
    color: COLORS.DARK, valign: "top",
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
    color: COLORS.DARK, valign: "top",
  });

  return slide;
}

/**
 * Add a rating table slide (for exec summary ratings).
 */
function ratingSlide(pptx, heading, ratings) {
  const ratingColor = (r) => {
    switch (r) {
      case "Strong":   return { bg: COLORS.AQUAMARINE, fg: COLORS.LICORICE };
      case "Adequate": return { bg: COLORS.MED_AMBER, fg: COLORS.PURE_WHITE };
      case "Weak":     return { bg: COLORS.HIGH_RED, fg: COLORS.PURE_WHITE };
      case "Absent":   return { bg: COLORS.HIGH_RED, fg: COLORS.PURE_WHITE };
      default:         return { bg: COLORS.ZEBRA, fg: COLORS.DARK };
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
 * Add a gaps priority slide.
 */
function gapsSlide(pptx, heading, gaps) {
  const prioColor = (p) => {
    switch (p) {
      case "High":   return COLORS.HIGH_RED;
      case "Medium": return COLORS.MED_AMBER;
      case "Low":    return COLORS.LOW_GREEN;
      default:       return COLORS.DARK;
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
  console.log(`Mercury presentation saved: ${outputPath}`);
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
