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
  // Logo placement (white-standard, top-right on all slides)
  LOGO_X: 11.8,
  LOGO_Y: 0.15,
  LOGO_W: 1.2,
  LOGO_H: 0.36,
  // Accent bar at top of slides
  ACCENT_H: 0.06,
  // Rose underline on content slides
  UNDERLINE_W: 1.5,
};

const FONT_SIZES = {
  TITLE:      44,
  SECTION:    36,
  SUBTITLE:   26,
  THIRD_LINE: 18,
  HEADING:    22,
  SUBHEADING: 16,
  COLUMN_HEAD: 14,
  BULLET_TITLE: 13,
  BODY:       12,
  BULLET_DETAIL: 11,
  TABLE_CELL: 10,
  META:        9,
  FOOTER:      9,
  TAGLINE:     8,
};

// Table border color (dark purple, subtle on dark bg)
const TABLE_BORDER_COLOR = "2A1535";

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

  // Shared master objects
  const accentBar = (color) => ({ rect: { x: 0, y: 0, w: LAYOUT.WIDTH, h: LAYOUT.ACCENT_H, fill: { color } } });
  const footerBar = { rect: { x: 0, y: LAYOUT.FOOTER_Y, w: LAYOUT.WIDTH, h: LAYOUT.FOOTER_H, fill: { color: COLORS.LICORICE } } };
  const footerDivider = { rect: { x: 0, y: LAYOUT.FOOTER_Y, w: LAYOUT.WIDTH, h: 0.01, fill: { color: COLORS.ROSE } } };
  const footerBrand = { text: {
    text: "MERCURY",
    options: {
      x: LAYOUT.CONTENT_X, y: LAYOUT.FOOTER_Y + 0.04, w: 3, h: 0.3,
      fontSize: FONT_SIZES.FOOTER, fontFace: FONTS.DISPLAY,
      color: COLORS.ROSE, bold: true,
    },
  }};

  // ---- TITLE slide master (Licorice background) ----
  pptx.defineSlideMaster({
    title: "MERCURY_TITLE",
    background: { color: COLORS.LICORICE },
    objects: [accentBar(COLORS.ROSE)],
  });

  // ---- CONTENT slide master (Dark Licorice background — v3.1 dark theme) ----
  pptx.defineSlideMaster({
    title: "MERCURY_CONTENT",
    background: { color: COLORS.LICORICE },
    objects: [accentBar(COLORS.ROSE), footerBar, footerDivider, footerBrand],
  });

  // ---- DARK CONTENT alias (same as MERCURY_CONTENT, for clarity in code) ----
  pptx.defineSlideMaster({
    title: "MERCURY_DARK_CONTENT",
    background: { color: COLORS.LICORICE },
    objects: [accentBar(COLORS.ROSE), footerBar, footerDivider, footerBrand],
  });

  // ---- SECTION divider masters ----
  // Rose variant (default)
  pptx.defineSlideMaster({
    title: "MERCURY_SECTION",
    background: { color: COLORS.ROSE },
    objects: [accentBar(COLORS.LICORICE), footerBar],
  });

  // Blue variant
  pptx.defineSlideMaster({
    title: "MERCURY_SECTION_BLUE",
    background: { color: COLORS.BLUE },
    objects: [accentBar(COLORS.LICORICE), footerBar],
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
  const logoPath = getLogoPath("white", "standard");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: LAYOUT.LOGO_X, y: LAYOUT.LOGO_Y, w: LAYOUT.LOGO_W, h: LAYOUT.LOGO_H });
  }

  // Title — uses display font
  slide.addText(title || "", {
    x: LAYOUT.CONTENT_X, y: 2.0, w: 12, h: 1.2,
    fontSize: FONT_SIZES.TITLE, fontFace: FONTS.DISPLAY,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  // Rose accent divider
  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 3.3, w: 3, h: 0,
    line: { color: COLORS.ROSE, width: 3 },
  });

  // Subtitle (Rose)
  slide.addText(subtitle || "", {
    x: LAYOUT.CONTENT_X, y: 3.45, w: 12, h: 0.7,
    fontSize: FONT_SIZES.SUBTITLE, fontFace: FONTS.HEADING,
    color: COLORS.ROSE,
    margin: 0,
  });

  // Optional third line
  if (opts.thirdLine) {
    slide.addText(opts.thirdLine, {
      x: LAYOUT.CONTENT_X, y: 4.15, w: 12, h: 0.5,
      fontSize: FONT_SIZES.THIRD_LINE, fontFace: FONTS.BODY,
      color: COLORS.MEDIUM,
      margin: 0,
    });
  }

  // Meta pairs
  if (meta && meta.length > 0) {
    const metaY = opts.thirdLine ? 4.7 : 4.3;
    const metaRows = meta.map(([label, value]) => [
      { text: label || "", options: { fontSize: FONT_SIZES.META, fontFace: FONTS.BODY, color: COLORS.MEDIUM, bold: true } },
      { text: value || "", options: { fontSize: FONT_SIZES.META, fontFace: FONTS.BODY, color: COLORS.PURE_WHITE } },
    ]);
    slide.addTable(metaRows, {
      x: LAYOUT.CONTENT_X, y: metaY, w: 5, h: meta.length * 0.3,
      border: { type: "none" },
      colW: [2, 3],
    });
  }

  // Tagline — uses serif font
  slide.addText("Prepared by IDX using the Mercury platform", {
    x: LAYOUT.CONTENT_X, y: 6.5, w: 12, h: 0.3,
    fontSize: FONT_SIZES.TAGLINE, fontFace: FONTS.SERIF,
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
 * @param {object} opts - {variant: "rose"|"blue"} — defaults to "rose"
 */
function sectionSlide(pptx, heading, subheading, opts = {}) {
  const variant = (opts && opts.variant) || "rose";
  const masterName = variant === "blue" ? "MERCURY_SECTION_BLUE" : "MERCURY_SECTION";
  const slide = pptx.addSlide({ masterName });

  // White IDX logo on dark accent background
  const logoPath = getLogoPath("white", "standard");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: LAYOUT.LOGO_X, y: LAYOUT.LOGO_Y, w: LAYOUT.LOGO_W, h: LAYOUT.LOGO_H });
  }

  slide.addText(heading || "", {
    x: LAYOUT.CONTENT_X, y: 2.5, w: 12, h: 1.0,
    fontSize: FONT_SIZES.SECTION, fontFace: FONTS.HEADING,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  // White underline
  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 3.55, w: 2.5, h: 0,
    line: { color: COLORS.PURE_WHITE, width: 3 },
  });

  if (subheading) {
    slide.addText(subheading, {
      x: LAYOUT.CONTENT_X, y: 3.7, w: 12, h: 0.5,
      fontSize: FONT_SIZES.SUBHEADING, fontFace: FONTS.BODY,
      color: COLORS.PURE_WHITE,
      margin: 0,
    });
  }

  // Mercury branding in footer area
  slide.addText("MERCURY", {
    x: LAYOUT.CONTENT_X, y: LAYOUT.FOOTER_Y + 0.04, w: 3, h: 0.3,
    fontSize: FONT_SIZES.FOOTER, fontFace: FONTS.DISPLAY,
    color: COLORS.ROSE, bold: true,
  });

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
  const logoPath = getLogoPath("white", "standard");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: LAYOUT.LOGO_X, y: LAYOUT.LOGO_Y, w: LAYOUT.LOGO_W, h: LAYOUT.LOGO_H });
  }

  // Heading — Pure White on dark bg
  slide.addText(heading || "", {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W - LAYOUT.UNDERLINE_W, h: 0.7,
    fontSize: FONT_SIZES.HEADING, fontFace: FONTS.HEADING,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  // Rose accent underline
  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 0.98, w: LAYOUT.UNDERLINE_W, h: 0,
    line: { color: COLORS.ROSE, width: 2 },
  });

  // Body — Floral White on dark bg
  const bodyY = opts.bodyY || 1.15;
  const bodyH = LAYOUT.FOOTER_Y - bodyY - 0.2;
  slide.addText(body || "", {
    x: LAYOUT.CONTENT_X, y: bodyY, w: LAYOUT.CONTENT_W, h: bodyH,
    fontSize: opts.fontSize || FONT_SIZES.BODY, fontFace: FONTS.BODY,
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
  if (!bullets || !Array.isArray(bullets)) bullets = [];
  const slide = pptx.addSlide({ masterName: "MERCURY_CONTENT" });

  // White IDX logo
  const logoPath = getLogoPath("white", "standard");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: LAYOUT.LOGO_X, y: LAYOUT.LOGO_Y, w: LAYOUT.LOGO_W, h: LAYOUT.LOGO_H });
  }

  slide.addText(heading || "", {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W - LAYOUT.UNDERLINE_W, h: 0.7,
    fontSize: FONT_SIZES.HEADING, fontFace: FONTS.HEADING,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 0.98, w: LAYOUT.UNDERLINE_W, h: 0,
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
          fontSize: FONT_SIZES.BODY, fontFace: FONTS.BODY, color: COLORS.FLORAL_WHITE,
          paraSpaceAfter: 8,
        },
      });
    } else {
      textItems.push({
        text: item.title || "",
        options: {
          bullet: opts.numbered ? { type: "number" } : { code: "2022" },
          breakLine: true,
          fontSize: FONT_SIZES.BULLET_TITLE, fontFace: FONTS.HEADING, color: COLORS.PURE_WHITE, bold: true,
          paraSpaceAfter: 2,
        },
      });
      if (item.detail) {
        textItems.push({
          text: item.detail,
          options: {
            breakLine: true, indentLevel: 1,
            fontSize: FONT_SIZES.BULLET_DETAIL, fontFace: FONTS.BODY, color: COLORS.FLORAL_WHITE,
            paraSpaceAfter: 10,
          },
        });
      }
    }
  });

  slide.addText(textItems, {
    x: LAYOUT.CONTENT_X, y: 1.15, w: LAYOUT.CONTENT_W, h: LAYOUT.CONTENT_H,
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
  if (!headers || !Array.isArray(headers)) headers = [];
  if (!rows || !Array.isArray(rows)) rows = [];
  const slide = pptx.addSlide({ masterName: "MERCURY_CONTENT" });

  // White IDX logo
  const logoPath = getLogoPath("white", "standard");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: LAYOUT.LOGO_X, y: LAYOUT.LOGO_Y, w: LAYOUT.LOGO_W, h: LAYOUT.LOGO_H });
  }

  slide.addText(heading || "", {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W - LAYOUT.UNDERLINE_W, h: 0.7,
    fontSize: FONT_SIZES.HEADING, fontFace: FONTS.HEADING,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 0.98, w: LAYOUT.UNDERLINE_W, h: 0,
    line: { color: COLORS.ROSE, width: 2 },
  });

  // Build table data — Rose header row on dark background
  const headerRow = headers.map(h => ({
    text: h,
    options: {
      fontSize: FONT_SIZES.TABLE_CELL, fontFace: FONTS.HEADING,
      color: COLORS.PURE_WHITE, bold: true,
      fill: { color: COLORS.ROSE },
      border: { pt: 0.5, color: TABLE_BORDER_COLOR },
      valign: "middle",
    },
  }));

  // Body rows alternate between dark shades with Floral White text
  const dataRows = rows.map((row, ri) => {
    const fill = ri % 2 === 0 ? COLORS.DARK_ROW_A : COLORS.DARK_ROW_B;
    return (row || []).map((val, ci) => {
      const cellOptions = opts.cellOpts ? opts.cellOpts(ri, ci, val) : {};
      const isTextObj = typeof val === "object" && val !== null && val.text;
      const text = isTextObj ? val.text : String(val != null ? val : "");
      const valOpts = isTextObj ? (val.options || {}) : {};
      return {
        text,
        options: {
          fontSize: FONT_SIZES.TABLE_CELL, fontFace: FONTS.BODY,
          color: valOpts.color || cellOptions.color || COLORS.FLORAL_WHITE,
          bold: valOpts.bold || cellOptions.bold || false,
          fill: { color: valOpts.fill ? (valOpts.fill.color || valOpts.fill) : (cellOptions.fill || fill) },
          border: { pt: 0.5, color: TABLE_BORDER_COLOR },
          valign: "middle",
          ...cellOptions,
        },
      };
    });
  });

  const tableData = [headerRow, ...dataRows];
  const tableH = Math.min(0.35 + rows.length * 0.32, LAYOUT.CONTENT_H);

  slide.addTable(tableData, {
    x: LAYOUT.CONTENT_X, y: 1.15, w: LAYOUT.CONTENT_W, h: tableH,
    colW: opts.colW || undefined,
    border: { pt: 0.5, color: TABLE_BORDER_COLOR },
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
  const logoPath = getLogoPath("white", "standard");
  if (logoPath) {
    slide.addImage({ path: logoPath, x: LAYOUT.LOGO_X, y: LAYOUT.LOGO_Y, w: LAYOUT.LOGO_W, h: LAYOUT.LOGO_H });
  }

  slide.addText(heading || "", {
    x: LAYOUT.CONTENT_X, y: 0.25, w: LAYOUT.CONTENT_W - LAYOUT.UNDERLINE_W, h: 0.7,
    fontSize: FONT_SIZES.HEADING, fontFace: FONTS.HEADING,
    color: COLORS.PURE_WHITE, bold: true,
    margin: 0,
  });

  slide.addShape(pptx.shapes.LINE, {
    x: LAYOUT.CONTENT_X, y: 0.98, w: LAYOUT.UNDERLINE_W, h: 0,
    line: { color: COLORS.ROSE, width: 2 },
  });

  const colGap = 0.5;
  const colW = (LAYOUT.CONTENT_W - colGap) / 2;  // 5.815
  const colY = 1.2;
  const colH = 5.3;

  // Left column heading
  if (opts.leftHeading) {
    slide.addText(opts.leftHeading, {
      x: LAYOUT.CONTENT_X, y: colY, w: colW, h: 0.4,
      fontSize: FONT_SIZES.COLUMN_HEAD, fontFace: FONTS.HEADING,
      color: COLORS.ROSE, bold: true,
      margin: 0,
    });
  }

  const leftBodyY = opts.leftHeading ? colY + 0.45 : colY;
  slide.addText(leftContent || "", {
    x: LAYOUT.CONTENT_X, y: leftBodyY, w: colW, h: colH - (leftBodyY - colY),
    fontSize: FONT_SIZES.BULLET_DETAIL, fontFace: FONTS.BODY,
    color: COLORS.FLORAL_WHITE, valign: "top",
  });

  const rightX = LAYOUT.CONTENT_X + colW + colGap;
  if (opts.rightHeading) {
    slide.addText(opts.rightHeading, {
      x: rightX, y: colY, w: colW, h: 0.4,
      fontSize: FONT_SIZES.COLUMN_HEAD, fontFace: FONTS.HEADING,
      color: COLORS.ROSE, bold: true,
      margin: 0,
    });
  }

  const rightBodyY = opts.rightHeading ? colY + 0.45 : colY;
  slide.addText(rightContent || "", {
    x: rightX, y: rightBodyY, w: colW, h: colH - (rightBodyY - colY),
    fontSize: FONT_SIZES.BULLET_DETAIL, fontFace: FONTS.BODY,
    color: COLORS.FLORAL_WHITE, valign: "top",
  });

  return slide;
}

/**
 * Add a rating table slide (for exec summary ratings — dark theme).
 */
function ratingSlide(pptx, heading, ratings) {
  if (!ratings || !Array.isArray(ratings)) ratings = [];
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
    const colors = ratingColor(r.rating || "");
    return [
      r.label || r.dimension || r.area || "",
      { text: r.rating || "", options: { color: colors.fg, bold: true, fill: { color: colors.bg } } },
    ];
  });

  return tableSlide(pptx, heading, headers, rows, { colW: [7, 5] });
}

/**
 * Add a gaps priority slide (dark theme).
 */
function gapsSlide(pptx, heading, gaps) {
  if (!gaps || !Array.isArray(gaps)) gaps = [];
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
  try {
    await pptx.writeFile({ fileName: outputPath });
    const stats = fs.statSync(outputPath);
    console.log(`Mercury presentation saved: ${outputPath} (${stats.size} bytes)`);
    return outputPath;
  } catch (err) {
    console.error(`Failed to build PPTX at ${outputPath}: ${err.message}`);
    throw err;
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Design system
  COLORS,
  FONTS,
  LAYOUT,
  FONT_SIZES,
  TABLE_BORDER_COLOR,

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
