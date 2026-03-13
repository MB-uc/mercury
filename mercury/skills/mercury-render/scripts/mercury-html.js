/**
 * Mercury HTML Renderer — generates self-contained interactive HTML presentations.
 *
 * Design system: IDX brand (dark theme — Licorice base, Floral White text, Rose accents).
 * Fonts embedded as base64 @font-face for zero-dependency rendering.
 *
 * Usage:
 *   const MH = require('./mercury-html.js');
 *   const html = MH.buildPresentation(reportData);
 *   require('fs').writeFileSync('output.html', html);
 */

const fs = require("fs");
const path = require("path");

// ============================================================
// DESIGN SYSTEM  (IDX Brand — Dark Theme)
// ============================================================

const COLORS = {
  LICORICE:     "#12061A",
  FLORAL_WHITE: "#F7F6EE",
  PURE_BLACK:   "#000000",
  PURE_WHITE:   "#FFFFFF",
  LEMON_LIME:   "#EEFF00",
  ROSE:         "#FF006F",
  AQUAMARINE:   "#00FFC9",
  ORANGE:       "#FF6500",
  GREEN:        "#00FF00",
  BLUE:         "#0068FF",
  HYPERLINK:    "#00A6EB",
  DARK:         "#12061A",
  MEDIUM:       "#999999",
  HIGH_RED:     "#CC3333",
  MED_AMBER:    "#E8A317",
  LOW_GREEN:    "#27AE60",
  CARD_BG:      "rgba(255,255,255,0.04)",
  CARD_BORDER:  "rgba(255,255,255,0.08)",
  TABLE_ALT:    "rgba(255,255,255,0.03)",
};

const FONTS = {
  DISPLAY:  "'IDX Headline', 'Arial Black', sans-serif",
  HEADING:  "'IDX Sans', Arial, sans-serif",
  BODY:     "'IDX Sans', Arial, sans-serif",
  SERIF:    "'IDX Serif', Georgia, serif",
  MONO:     "'JetBrains Mono', 'Fira Code', monospace",
};

// ============================================================
// FONT EMBEDDING
// ============================================================

/**
 * Read a font file and return base64-encoded data URI for @font-face.
 */
function embedFont(fontFilename) {
  const fontPath = path.join(__dirname, "..", "assets", "fonts", fontFilename);
  try {
    const buffer = fs.readFileSync(fontPath);
    return `data:font/opentype;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Read a logo file and return base64 data URI.
 */
function embedLogo(logoFilename) {
  const logoPath = path.join(__dirname, "..", "assets", "logos", logoFilename);
  try {
    const buffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

// ============================================================
// HTML BUILDERS
// ============================================================

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function priorityClass(priority) {
  switch (priority) {
    case "High":   return "priority-high";
    case "Medium": return "priority-medium";
    case "Low":    return "priority-low";
    default:       return "";
  }
}

function ratingClass(rating) {
  switch (rating) {
    case "Strong":   return "rating-strong";
    case "Adequate": return "rating-adequate";
    case "Weak":     return "rating-weak";
    case "Absent":   return "rating-absent";
    default:         return "";
  }
}

// ============================================================
// SECTION RENDERERS
// ============================================================

function renderHero(data) {
  const logo = embedLogo("IDX-white.png");
  const logoImg = logo ? `<img src="${logo}" alt="IDX" class="hero-logo">` : "";
  const metaHtml = (data.meta || [])
    .map(([label, value]) => `<div class="meta-item"><span class="meta-label">${escapeHtml(label)}</span><span class="meta-value">${escapeHtml(value)}</span></div>`)
    .join("\n");

  return `
  <section id="hero" class="hero">
    <div class="hero-inner">
      ${logoImg}
      <div class="hero-accent"></div>
      <h1 class="hero-title">${escapeHtml(data.title)}</h1>
      <p class="hero-subtitle">${escapeHtml(data.subtitle)}</p>
      ${data.thirdLine ? `<p class="hero-third">${escapeHtml(data.thirdLine)}</p>` : ""}
      <div class="hero-meta">${metaHtml}</div>
      <p class="hero-tagline">Prepared by IDX using the Mercury platform</p>
    </div>
  </section>`;
}

function renderExecSummary(data) {
  let ratingsHtml = "";
  if (data.summaryRatings || data.ratings) {
    const ratings = data.summaryRatings || data.ratings;
    const rows = ratings.map(r => {
      const label = r.dimension || r.label || r.area;
      const rating = r.rating || r.ratingA || r.assessment;
      return `<tr><td>${escapeHtml(label)}</td><td><span class="rating-badge ${ratingClass(rating)}">${escapeHtml(rating)}</span></td></tr>`;
    }).join("\n");
    ratingsHtml = `<table class="rating-table"><thead><tr><th>Area</th><th>Assessment</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  return `
  <section id="executive-summary" class="content-section fade-in">
    <h2>Executive summary</h2>
    <div class="prose">${escapeHtml(data.executiveSummary)}</div>
    ${ratingsHtml}
  </section>`;
}

function renderStrengths(data) {
  if (!data.strengths || data.strengths.length === 0) return "";
  const items = data.strengths.map((s, i) => `
    <div class="finding-card fade-in">
      <span class="finding-number">${i + 1}</span>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.detail)}</p>
    </div>`).join("\n");

  return `
  <section id="strengths" class="content-section">
    <h2>What they do well</h2>
    <div class="findings-grid">${items}</div>
  </section>`;
}

function renderGaps(data) {
  if (!data.gaps || data.gaps.length === 0) return "";

  const tableRows = data.gaps.map((g, i) => `
    <tr class="fade-in">
      <td class="gap-number">${i + 1}</td>
      <td class="gap-title">${escapeHtml(g.gap)}</td>
      <td><span class="priority-badge ${priorityClass(g.priority)}">${escapeHtml(g.priority)}</span></td>
      <td>${escapeHtml(g.applies || g.section || "")}</td>
    </tr>`).join("\n");

  const detailCards = data.gaps.map((g, i) => `
    <div class="gap-detail-card fade-in">
      <div class="gap-header">
        <span class="priority-badge ${priorityClass(g.priority)}">${escapeHtml(g.priority)}</span>
        <h3>${escapeHtml(g.gap)}</h3>
      </div>
      <p>${escapeHtml(g.detail || "")}</p>
    </div>`).join("\n");

  return `
  <section id="gaps" class="content-section">
    <h2>Gaps versus best practice</h2>
    <table class="data-table">
      <thead><tr><th>#</th><th>Gap</th><th>Priority</th><th>Section</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="gap-details">${detailCards}</div>
  </section>`;
}

function renderBenchmarks(data) {
  if (!data.benchmarks || !data.benchmarks.rows) return "";

  const headers = data.benchmarks.headers || ["Category", "Median", "P75", "Estimate", "Assessment"];
  const headerHtml = headers.map(h => `<th>${escapeHtml(h)}</th>`).join("");
  const rowsHtml = data.benchmarks.rows.map(row => {
    const cells = row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("\n");

  return `
  <section id="benchmarks" class="content-section fade-in">
    <h2>Connect.IQ benchmark context</h2>
    <table class="data-table">
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </section>`;
}

function renderTalkingPoints(data) {
  if (!data.talkingPoints || data.talkingPoints.length === 0) return "";
  const items = data.talkingPoints.map((tp, i) => `
    <div class="talking-point-card fade-in">
      <span class="tp-number">${i + 1}</span>
      <h3>${escapeHtml(tp.title)}</h3>
      <p>${escapeHtml(tp.detail)}</p>
    </div>`).join("\n");

  return `
  <section id="talking-points" class="content-section">
    <h2>Talking points</h2>
    <div class="findings-grid">${items}</div>
  </section>`;
}

function renderPeerComparison(data) {
  if (!data.comparisonMatrix || data.comparisonMatrix.length === 0) return "";

  const rows = data.comparisonMatrix.map(row => `
    <tr class="fade-in">
      <td class="dimension-cell">${escapeHtml(row.dimension)}</td>
      <td>${escapeHtml(row.a)}</td>
      <td>${escapeHtml(row.b)}</td>
      <td class="edge-cell">${escapeHtml(row.edge)}</td>
    </tr>`).join("\n");

  return `
  <section id="peer-comparison" class="content-section">
    <h2>Detailed comparison</h2>
    <p class="comparison-subtitle">${escapeHtml(data.companyA || "")} vs ${escapeHtml(data.companyB || "")}</p>
    <table class="data-table comparison-table">
      <thead><tr><th>Dimension</th><th>${escapeHtml(data.companyA || "Company A")}</th><th>${escapeHtml(data.companyB || "Company B")}</th><th>Edge</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

/**
 * Render a directory-tree node recursively as HTML.
 * Returns an array of <li> strings.
 *
 * sitemapData node shape:
 *   { name, label?, url?, description?, children?: [...] }
 */
function renderTreeNode(node, depth) {
  const label = escapeHtml(node.label || node.name || "");
  const url   = node.url ? escapeHtml(node.url) : null;
  const desc  = node.description ? escapeHtml(node.description) : null;

  const nameEl = url
    ? `<a class="tree-link" href="${url}" target="_blank" rel="noopener">${label}</a>`
    : `<span class="tree-node-name">${label}</span>`;

  const descEl = desc ? ` <span class="tree-node-desc">— ${desc}</span>` : "";

  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const icon = hasChildren ? "📁" : "📄";

  let html = `<li class="tree-item depth-${depth}">`;
  html += `<span class="tree-icon">${icon}</span>${nameEl}${descEl}`;

  if (hasChildren) {
    html += `<ul class="tree-children">`;
    for (const child of node.children) {
      html += renderTreeNode(child, depth + 1);
    }
    html += `</ul>`;
  }

  html += `</li>`;
  return html;
}

function renderSiteTree(data) {
  if (!data.sitemapData) return "";

  const tree = data.sitemapData;
  const rootLabel = escapeHtml(tree.label || tree.name || "Site root");
  const hasChildren = Array.isArray(tree.children) && tree.children.length > 0;

  let treeHtml = `<ul class="site-tree">`;
  treeHtml += `<li class="tree-item depth-0 tree-root">`;
  treeHtml += `<span class="tree-icon">🌐</span><span class="tree-node-name tree-root-name">${rootLabel}</span>`;

  if (hasChildren) {
    treeHtml += `<ul class="tree-children">`;
    for (const child of tree.children) {
      treeHtml += renderTreeNode(child, 1);
    }
    treeHtml += `</ul>`;
  }

  treeHtml += `</li></ul>`;

  // Count totals for the summary line
  function countNodes(node) {
    let n = 1;
    if (Array.isArray(node.children)) {
      for (const c of node.children) n += countNodes(c);
    }
    return n;
  }
  const totalPages = countNodes(tree) - 1; // exclude root

  return `
  <section id="sitemap" class="content-section fade-in">
    <h2>Site structure</h2>
    <p class="section-meta">${totalPages} page${totalPages !== 1 ? "s" : ""} across ${(tree.children || []).length} top-level section${(tree.children || []).length !== 1 ? "s" : ""}</p>
    <div class="site-tree-container">
      ${treeHtml}
    </div>
  </section>`;
}

function isUrl(str) {
  return typeof str === "string" && /^https?:\/\//i.test(str.trim());
}

function renderUrlCell(value) {
  const str = String(value);
  if (isUrl(str)) {
    const display = str.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
    return `<td><a class="tree-link" href="${escapeHtml(str)}" target="_blank" rel="noopener">${escapeHtml(display)}</a></td>`;
  }
  return `<td>${escapeHtml(str)}</td>`;
}

function renderPagesAnalysed(data) {
  if (!data.pagesAnalysed || data.pagesAnalysed.length === 0) return "";

  const rows = data.pagesAnalysed.map(row => {
    const [url, ...rest] = row;
    const urlCell = renderUrlCell(url);
    const restCells = rest.map(cell => `<td>${escapeHtml(String(cell))}</td>`).join("");
    return `<tr>${urlCell}${restCells}</tr>`;
  }).join("\n");

  return `
  <section id="pages-analysed" class="content-section fade-in">
    <h2>Pages accessed</h2>
    <p class="section-meta">${data.pagesAnalysed.length} page${data.pagesAnalysed.length !== 1 ? "s" : ""}</p>
    <table class="data-table">
      <thead><tr><th>URL</th><th>Page type</th><th>Presence quality</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

function renderDocumentsAnalysed(data) {
  if (!data.documentsAnalysed || data.documentsAnalysed.length === 0) return "";

  const rows = data.documentsAnalysed.map(row => {
    const [url, ...rest] = row;
    const urlCell = renderUrlCell(url);
    const restCells = rest.map(cell => `<td>${escapeHtml(String(cell))}</td>`).join("");
    return `<tr>${urlCell}${restCells}</tr>`;
  }).join("\n");

  return `
  <section id="documents-accessed" class="content-section fade-in">
    <h2>Documents accessed</h2>
    <p class="section-meta">${data.documentsAnalysed.length} document${data.documentsAnalysed.length !== 1 ? "s" : ""}</p>
    <table class="data-table">
      <thead><tr><th>URL</th><th>Document type</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

function renderMethodology(data) {
  if (!data.methodology) return "";
  return `
  <section id="methodology" class="content-section fade-in methodology">
    <h2>Methodology</h2>
    <div class="prose methodology-text">${escapeHtml(data.methodology)}</div>
  </section>`;
}

// ============================================================
// DOCUMENTS TAB
// ============================================================

/**
 * Render the Documents section — a download hub listing all rendered files.
 * Only appears when data.documentsTab is provided (by mercury-output.js).
 */
function renderDocuments(data) {
  if (!data.documentsTab) return "";
  const tab = data.documentsTab;

  const formatIcons = {
    HTML: `<span class="doc-icon doc-html">HTML</span>`,
    DOCX: `<span class="doc-icon doc-docx">DOCX</span>`,
    PPTX: `<span class="doc-icon doc-pptx">PPTX</span>`,
    XLSX: `<span class="doc-icon doc-xlsx">XLSX</span>`,
  };

  let groupsHtml = "";
  for (const group of (tab.groups || [])) {
    const filesHtml = group.files.map(f => {
      const icon = formatIcons[f.format] || `<span class="doc-icon">${escapeHtml(f.format)}</span>`;
      const time = f.rendered_at ? new Date(f.rendered_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
      let href = "";
      if (f.path) {
        href = f.path.startsWith("/") ? `file://${f.path}` : f.path;
      }
      const linkOpen = href ? `<a class="doc-file" href="${escapeHtml(href)}" target="_blank" rel="noopener">` : `<div class="doc-file">`;
      const linkClose = href ? `</a>` : `</div>`;
      return `
        ${linkOpen}
          ${icon}
          <div class="doc-file-info">
            <span class="doc-filename">${escapeHtml(f.filename)}</span>
            <span class="doc-time">${escapeHtml(time)}</span>
          </div>
        ${linkClose}`;
    }).join("");

    groupsHtml += `
      <div class="doc-group">
        <h3>${escapeHtml(group.label)}</h3>
        <div class="doc-files">${filesHtml}</div>
      </div>`;
  }

  const stagesText = (tab.stages_completed || []).length > 0
    ? `${tab.stages_completed.length} stage${tab.stages_completed.length > 1 ? "s" : ""} completed: ${tab.stages_completed.join(", ")}`
    : "";

  return `
  <section id="documents" class="content-section fade-in">
    <h2>Documents</h2>
    <p class="prose doc-summary">${escapeHtml(stagesText)}</p>
    <div class="doc-groups">${groupsHtml}</div>
  </section>`;
}

// ============================================================
// NAV BUILDER
// ============================================================

function buildNav(data) {
  const logo = embedLogo("IDX-white-tiny.png");
  const sections = [
    { id: "hero", label: data.subtitle || "Cover" },
    { id: "executive-summary", label: "Executive summary" },
  ];

  if (data.strengths && data.strengths.length) sections.push({ id: "strengths", label: "Strengths" });
  if (data.comparisonMatrix && data.comparisonMatrix.length) sections.push({ id: "peer-comparison", label: "Comparison" });
  if (data.gaps && data.gaps.length) sections.push({ id: "gaps", label: "Gaps" });
  if (data.benchmarks) sections.push({ id: "benchmarks", label: "Benchmarks" });
  if (data.talkingPoints && data.talkingPoints.length) sections.push({ id: "talking-points", label: "Talking points" });
  if (data.sitemapData) sections.push({ id: "sitemap", label: "Site architecture" });
  if (data.pagesAnalysed && data.pagesAnalysed.length) sections.push({ id: "pages-analysed", label: "Pages accessed" });
  if (data.documentsAnalysed && data.documentsAnalysed.length) sections.push({ id: "documents-accessed", label: "Documents accessed" });
  if (data.methodology) sections.push({ id: "methodology", label: "Methodology" });
  if (data.documentsTab) sections.push({ id: "documents", label: "Documents" });

  const links = sections.map(s => `<a href="#${s.id}" class="nav-link" data-section="${s.id}">${escapeHtml(s.label)}</a>`).join("\n");
  const logoImg = logo ? `<img src="${logo}" alt="IDX" class="nav-logo">` : "";

  return `
  <nav class="sidebar-nav">
    <div class="nav-brand">
      ${logoImg}
    </div>
    <div class="nav-links">${links}</div>
    <div class="nav-footer">
      <span class="nav-mercury">Mercury</span>
    </div>
  </nav>`;
}

// ============================================================
// MAIN BUILD FUNCTION
// ============================================================

/**
 * Build a complete self-contained HTML presentation from Mercury report data.
 * @param {object} data - Report data (same schema as docx/pptx renderers)
 * @returns {string} Complete HTML document
 */
function buildPresentation(data) {
  // Embed fonts
  const fontFaces = [
    { name: "IDX Headline", file: "IDXHeadline-Heavy.otf", weight: 900 },
    { name: "IDX Sans", file: "IDXSans-Regular.otf", weight: 400 },
    { name: "IDX Sans", file: "IDXSans-Bold.otf", weight: 700 },
    { name: "IDX Serif", file: "IDXSerif-Regular.otf", weight: 400 },
  ].map(f => {
    const dataUri = embedFont(f.file);
    if (!dataUri) return `/* ${f.file} not found */`;
    return `@font-face { font-family: '${f.name}'; src: url('${dataUri}') format('opentype'); font-weight: ${f.weight}; font-style: normal; font-display: swap; }`;
  }).join("\n");

  // Build sections
  const nav = buildNav(data);
  const hero = renderHero(data);
  const execSummary = renderExecSummary(data);
  const strengths = renderStrengths(data);
  const peerComparison = renderPeerComparison(data);
  const gaps = renderGaps(data);
  const benchmarks = renderBenchmarks(data);
  const talkingPoints = renderTalkingPoints(data);
  const siteTree = renderSiteTree(data);
  const pagesAnalysed = renderPagesAnalysed(data);
  const documentsAnalysed = renderDocumentsAnalysed(data);
  const methodology = renderMethodology(data);
  const documents = renderDocuments(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(data.title)} — ${escapeHtml(data.subtitle)} | Mercury</title>
<style>
${fontFaces}

/* ============ RESET & BASE ============ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  font-family: ${FONTS.BODY};
  background: ${COLORS.LICORICE};
  color: ${COLORS.FLORAL_WHITE};
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

/* ============ NAV ============ */
.sidebar-nav {
  position: fixed; top: 0; left: 0; right: 0; height: 52px;
  background: ${COLORS.PURE_BLACK}; border-bottom: 1px solid ${COLORS.CARD_BORDER};
  display: flex; align-items: center; z-index: 100;
  padding: 0 1.5rem; gap: 1.5rem;
}
.nav-brand { padding: 0; flex-shrink: 0; display: flex; align-items: center; gap: 0.5rem; }
.nav-logo { height: 16px; opacity: 1; }
.nav-mercury { font-family: ${FONTS.DISPLAY}; font-weight: 900; font-size: 0.7rem; color: ${COLORS.ROSE}; letter-spacing: 0.08em; text-transform: uppercase; }
.nav-links { flex: 1; overflow-x: auto; overflow-y: hidden; display: flex; align-items: center; gap: 0.25rem; padding: 0; white-space: nowrap; }
.nav-link {
  display: inline-block; padding: 0.4rem 0.75rem; font-size: 0.75rem; color: ${COLORS.FLORAL_WHITE};
  text-decoration: none; transition: all 0.2s; border-bottom: 2px solid transparent;
}
.nav-link:hover, .nav-link.active {
  color: ${COLORS.PURE_WHITE}; border-bottom-color: ${COLORS.ROSE};
}
.nav-footer { flex-shrink: 0; padding: 0; display: flex; align-items: center; gap: 0.4rem; }


/* ============ MAIN CONTENT ============ */
main { margin-left: 0; margin-top: 52px; }

/* ============ HERO ============ */
.hero {
  min-height: 100vh; display: flex; align-items: flex-end;
  padding: 4rem 5rem; position: relative;
  background: ${COLORS.LICORICE};
}
.hero-inner { max-width: 800px; }
.hero-logo { height: 24px; margin-bottom: 2rem; opacity: 1; }
.hero-accent { width: 60px; height: 3px; background: ${COLORS.ROSE}; margin-bottom: 1.5rem; }
.hero-title {
  font-family: ${FONTS.DISPLAY}; font-weight: 900; font-size: 3.5rem;
  line-height: 1.05; color: ${COLORS.PURE_WHITE}; margin-bottom: 0.5rem;
}
.hero-subtitle { font-family: ${FONTS.HEADING}; font-size: 1.8rem; color: ${COLORS.ROSE}; margin-bottom: 0.25rem; }
.hero-third { font-size: 1.1rem; color: ${COLORS.MEDIUM}; margin-bottom: 1.5rem; }
.hero-meta { display: flex; flex-wrap: wrap; gap: 1.5rem; margin: 2rem 0; }
.meta-item { display: flex; flex-direction: column; }
.meta-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: ${COLORS.MEDIUM}; font-weight: 700; }
.meta-value { font-size: 0.95rem; color: ${COLORS.FLORAL_WHITE}; }
.hero-tagline { font-family: ${FONTS.SERIF}; font-style: italic; font-size: 0.85rem; color: ${COLORS.MEDIUM}; margin-top: 3rem; }

/* ============ CONTENT SECTIONS ============ */
.content-section { padding: 4rem 5rem; border-top: 1px solid ${COLORS.CARD_BORDER}; }
.content-section h2 {
  font-family: ${FONTS.HEADING}; font-weight: 700; font-size: 1.8rem;
  color: ${COLORS.PURE_WHITE}; margin-bottom: 0.5rem; position: relative; padding-bottom: 0.75rem;
}
.content-section h2::after {
  content: ''; position: absolute; bottom: 0; left: 0;
  width: 40px; height: 2px; background: ${COLORS.ROSE};
}
.prose { font-size: 1rem; color: ${COLORS.FLORAL_WHITE}; max-width: 720px; margin-top: 1.5rem; white-space: pre-line; }

/* ============ TABLES ============ */
.data-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
.data-table thead th {
  background: ${COLORS.ROSE}; color: ${COLORS.PURE_WHITE};
  padding: 0.75rem 1rem; text-align: left; font-weight: 700; font-size: 0.8rem;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.data-table tbody td { padding: 0.65rem 1rem; border-bottom: 1px solid ${COLORS.CARD_BORDER}; }
.data-table tbody tr:nth-child(even) { background: ${COLORS.TABLE_ALT}; }
.data-table tbody tr:hover { background: rgba(255,255,255,0.06); }

.rating-table { max-width: 500px; }

/* ============ BADGES ============ */
.priority-badge, .rating-badge {
  display: inline-block; padding: 0.2rem 0.6rem; border-radius: 3px;
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
}
.priority-high { background: ${COLORS.HIGH_RED}; color: white; }
.priority-medium { background: ${COLORS.MED_AMBER}; color: ${COLORS.LICORICE}; }
.priority-low { background: ${COLORS.LOW_GREEN}; color: white; }
.rating-strong { background: ${COLORS.AQUAMARINE}; color: ${COLORS.LICORICE}; }
.rating-adequate { background: ${COLORS.MED_AMBER}; color: ${COLORS.LICORICE}; }
.rating-weak { background: ${COLORS.HIGH_RED}; color: white; }
.rating-absent { background: ${COLORS.HIGH_RED}; color: white; font-weight: 900; }

/* ============ FINDING CARDS ============ */
.findings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
.finding-card, .talking-point-card {
  background: ${COLORS.CARD_BG}; border: 1px solid ${COLORS.CARD_BORDER};
  border-radius: 6px; padding: 1.5rem; position: relative;
  transition: border-color 0.2s, transform 0.2s;
}
.finding-card:hover, .talking-point-card:hover {
  border-color: ${COLORS.ROSE}; transform: translateY(-2px);
}
.finding-number, .tp-number {
  font-family: ${FONTS.DISPLAY}; font-size: 2.5rem; color: ${COLORS.ROSE};
  opacity: 0.3; position: absolute; top: 0.5rem; right: 1rem;
}
.finding-card h3, .talking-point-card h3 {
  font-family: ${FONTS.HEADING}; font-size: 1.05rem; font-weight: 700;
  color: ${COLORS.PURE_WHITE}; margin-bottom: 0.5rem;
}
.finding-card p, .talking-point-card p { font-size: 0.9rem; color: ${COLORS.FLORAL_WHITE}; opacity: 0.85; }

/* ============ GAP DETAIL CARDS ============ */
.gap-details { margin-top: 2rem; }
.gap-detail-card {
  background: ${COLORS.CARD_BG}; border: 1px solid ${COLORS.CARD_BORDER};
  border-radius: 6px; padding: 1.25rem 1.5rem; margin-bottom: 1rem;
}
.gap-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
.gap-detail-card h3 { font-size: 1rem; color: ${COLORS.PURE_WHITE}; }
.gap-detail-card p { font-size: 0.9rem; color: ${COLORS.FLORAL_WHITE}; opacity: 0.85; }
.gap-number { font-weight: 700; color: ${COLORS.ROSE}; }
.gap-title { font-weight: 700; }

/* ============ COMPARISON ============ */
.comparison-subtitle { font-size: 1.1rem; color: ${COLORS.MEDIUM}; margin-top: 0.5rem; }
.comparison-table .dimension-cell { font-weight: 700; }
.comparison-table .edge-cell { font-weight: 700; color: ${COLORS.LEMON_LIME}; }

/* ============ SITE TREE ============ */
.site-tree-container { margin-top: 1.5rem; }
.site-tree, .tree-children { list-style: none; margin: 0; padding: 0; }
.tree-children { margin-left: 1.5rem; border-left: 1px solid rgba(255,255,255,0.08); padding-left: 1rem; }
.tree-item { padding: 0.25rem 0; font-size: 0.875rem; line-height: 1.5; }
.tree-item.tree-root { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; }
.tree-icon { margin-right: 0.4rem; font-size: 0.85em; opacity: 0.8; }
.tree-node-name { color: ${COLORS.FLORAL_WHITE}; font-weight: 500; }
.tree-root-name { color: ${COLORS.ROSE}; }
.tree-link { color: ${COLORS.AQUAMARINE}; text-decoration: none; }
.tree-link:hover { text-decoration: underline; }
.tree-node-desc { color: ${COLORS.MEDIUM}; font-size: 0.82em; font-style: italic; }
.depth-1 > .tree-node-name { color: ${COLORS.LEMON_LIME}; font-weight: 600; }
.depth-1 > .tree-link { color: ${COLORS.LEMON_LIME}; }

/* ============ METHODOLOGY ============ */
.methodology-text { color: ${COLORS.MEDIUM}; }

/* ============ DOCUMENTS TAB ============ */
.doc-summary { margin-bottom: 1.5rem; color: ${COLORS.MEDIUM}; font-size: 0.9rem; }
.doc-groups { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.doc-group {
  background: ${COLORS.CARD_BG}; border: 1px solid ${COLORS.CARD_BORDER};
  border-radius: 6px; padding: 1.5rem;
}
.doc-group h3 {
  font-family: ${FONTS.HEADING}; font-size: 1rem; font-weight: 700;
  color: ${COLORS.PURE_WHITE}; margin-bottom: 1rem;
  padding-bottom: 0.5rem; border-bottom: 1px solid ${COLORS.CARD_BORDER};
}
.doc-files { display: flex; flex-direction: column; gap: 0.75rem; }
.doc-file {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.5rem 0.75rem; border-radius: 4px;
  transition: background 0.2s;
  text-decoration: none; color: inherit; cursor: pointer;
}
.doc-file:hover { background: rgba(255,255,255,0.06); }
.doc-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 48px; height: 28px; border-radius: 3px;
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em;
  flex-shrink: 0;
}
.doc-html { background: ${COLORS.ROSE}; color: white; }
.doc-docx { background: ${COLORS.BLUE}; color: white; }
.doc-pptx { background: ${COLORS.ORANGE}; color: white; }
.doc-xlsx { background: ${COLORS.LOW_GREEN}; color: white; }
.doc-file-info { display: flex; flex-direction: column; }
.doc-filename { font-size: 0.85rem; color: ${COLORS.FLORAL_WHITE}; }
.doc-time { font-size: 0.7rem; color: ${COLORS.MEDIUM}; }

/* ============ ANIMATIONS ============ */
.fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
.fade-in.visible { opacity: 1; transform: translateY(0); }

/* ============ RESPONSIVE ============ */
@media (max-width: 900px) {
  .sidebar-nav { overflow-x: auto; }
  .hero { padding: 2rem; }
  .content-section { padding: 2rem; }
  .hero-title { font-size: 2.2rem; }
  .findings-grid { grid-template-columns: 1fr; }
}

/* ============ PRINT ============ */
@media print {
  .sidebar-nav { display: none; }
  main { margin-top: 0; }
  .hero { min-height: auto; page-break-after: always; }
  .content-section { page-break-inside: avoid; padding: 2rem 0; }
  body { background: white; color: ${COLORS.LICORICE}; }
  .data-table thead th { background: ${COLORS.LICORICE} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>
</head>
<body>
${nav}
<main>
${hero}
${execSummary}
${strengths}
${peerComparison}
${gaps}
${benchmarks}
${talkingPoints}
${siteTree}
${pagesAnalysed}
${documentsAnalysed}
${methodology}
${documents}
</main>

<script>
// Scroll-triggered fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Active nav tracking
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === current) link.classList.add('active');
  });
});
</script>
</body>
</html>`;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  COLORS,
  FONTS,
  buildPresentation,
  // Individual section renderers (for custom composition)
  renderHero,
  renderExecSummary,
  renderStrengths,
  renderGaps,
  renderBenchmarks,
  renderTalkingPoints,
  renderPeerComparison,
  renderSiteTree,
  renderPagesAnalysed,
  renderDocumentsAnalysed,
  renderMethodology,
  renderDocuments,
  buildNav,
  embedFont,
  embedLogo,
};
