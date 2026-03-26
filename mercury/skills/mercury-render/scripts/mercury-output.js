/**
 * Mercury Output Helper — on-demand rendering from artefact files.
 *
 * Called at the end of each pipeline stage to offer the user formatted output.
 * Handles: loading artefacts, building reportData, rendering to HTML/DOCX/PPTX,
 * and maintaining a cumulative HTML hub with a Documents tab.
 *
 * Usage (from within a Mercury stage):
 *
 *   const MO = require('./mercury-output.js');
 *
 *   // After stage completes, render requested formats
 *   const result = await MO.renderStage({
 *     dir: '/path/to/artefacts',
 *     company: 'rentokil-initial',
 *     stage: 'brief',
 *     formats: ['html', 'docx', 'pptx'],
 *     opts: { sector: 'Business Services', index: 'FTSE 100' },
 *   });
 *   // result.files = { html: '...path', docx: '...path', pptx: '...path' }
 *   // result.hub = '...path to cumulative HTML hub'
 */

const fs = require("fs");
const path = require("path");

// ============================================================
// PATHS
// ============================================================

const SCRIPTS_DIR = __dirname;
const adapter = require(path.join(SCRIPTS_DIR, "mercury-adapter.js"));
const MH = require(path.join(SCRIPTS_DIR, "mercury-html.js"));
const M = require(path.join(SCRIPTS_DIR, "mercury-components.js"));
const MP = require(path.join(SCRIPTS_DIR, "mercury-pptx.js"));
const MX = require(path.join(SCRIPTS_DIR, "mercury-xlsx.js"));

// ============================================================
// MANIFEST — tracks all rendered outputs for the Documents tab
// ============================================================

/**
 * Load or create the output manifest for a company.
 * The manifest lives alongside the artefacts as {company}-mercury-manifest.json.
 *
 * Schema:
 * {
 *   company: "Rentokil Initial",
 *   slug: "rentokil-initial",
 *   stages_completed: ["brief", "compete"],
 *   documents: [
 *     { stage: "brief", format: "html", path: "...", filename: "...", rendered_at: "..." },
 *     { stage: "brief", format: "docx", path: "...", filename: "...", rendered_at: "..." },
 *   ],
 *   hub_path: "...",
 *   last_updated: "..."
 * }
 */
function loadManifest(dir, slug) {
  const manifestPath = path.join(dir, `${slug}-mercury-manifest.json`);
  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (e) {
      console.warn(`Warning: Could not parse manifest: ${e.message}`);
    }
  }
  return {
    company: "",
    slug,
    stages_completed: [],
    documents: [],
    hub_path: null,
    last_updated: null,
  };
}

function saveManifest(dir, manifest) {
  const manifestPath = path.join(dir, `${manifest.slug}-mercury-manifest.json`);
  manifest.last_updated = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

// ============================================================
// STAGE LABELS
// ============================================================

const STAGE_LABELS = {
  brief: "Consultant Briefing",
  compete: "Competitive Landscape",
  sitemap: "Sitemap Recommendation",
  meeting: "Meeting Pack",
  ms_brief: "Strategy Brief",
  ms_crawl: "Site Crawl",
  ms_findings: "Strategy Findings",
};

const STAGE_ORDER = ["brief", "compete", "sitemap", "meeting"];
const MS_STAGE_ORDER = ["ms_brief", "ms_crawl", "ms_findings"];

function nextStage(currentStage) {
  const order = MS_STAGE_ORDER.includes(currentStage) ? MS_STAGE_ORDER : STAGE_ORDER;
  const idx = order.indexOf(currentStage);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

// ============================================================
// RENDER INDIVIDUAL FORMATS
// ============================================================

/**
 * Render HTML from reportData.
 */
function renderHTML(reportData, outputPath) {
  const html = MH.buildPresentation(reportData);
  fs.writeFileSync(outputPath, html);
  return outputPath;
}

/**
 * Render DOCX from reportData.
 * When isMsFindings is true, produces the comprehensive Mercury Strategy report.
 * Otherwise produces the original pipeline report format.
 */
async function renderDOCX(reportData, outputPath) {
  if (reportData.isMsFindings) {
    return renderMsStrategyDOCX(reportData, outputPath);
  }
  return renderOriginalDOCX(reportData, outputPath);
}

/**
 * Build a URL table section (pages or documents) for Word output.
 * @param {string} title - Section heading
 * @param {Array} rows - Array of [url, col2, col3] tuples
 * @param {string[]} headers - Column headers
 * @returns {Array} Array of docx elements
 */
function buildUrlTable(title, rows, headers) {
  if (!rows || rows.length === 0) return [];
  const elements = [];
  elements.push(M.heading2(title));
  const colWidths = [4500, 2263, 2263];
  elements.push(new M.Table({
    width: { size: 9026, type: M.WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new M.TableRow({
        children: headers.map((h, i) => M.hCell(h, colWidths[i])),
      }),
      ...rows.map((row, ri) => {
        const fill = ri % 2 === 0 ? M.COLORS.MERCURY_GRAY : M.COLORS.WHITE;
        const [url, col2, col3] = row;
        const urlStr = String(url || "");
        const isUrl = /^https?:\/\//i.test(urlStr);
        const urlChild = isUrl
          ? new M.ExternalHyperlink({
              link: urlStr,
              children: [new M.TextRun({ text: urlStr, style: "Hyperlink", font: M.FONT_PRIMARY, size: 18 })],
            })
          : new M.TextRun({ text: urlStr, font: M.FONT_PRIMARY, size: 18 });
        return new M.TableRow({
          children: [
            new M.TableCell({ borders: M.BORDERS, width: { size: colWidths[0], type: M.WidthType.DXA }, shading: { fill, type: M.ShadingType.CLEAR }, margins: M.CELL_MARGINS, children: [new M.Paragraph({ children: [urlChild], spacing: { before: 40, after: 40 } })] }),
            M.cell([M.t(String(col2 || ""), { size: 18 })], { width: colWidths[1], fill }),
            M.cell([M.t(String(col3 || ""), { size: 18 })], { width: colWidths[2], fill }),
          ],
        });
      }),
    ],
  }));
  elements.push(M.spacer(200));
  return elements;
}

// ============================================================
// MERCURY STRATEGY COMPREHENSIVE WORD REPORT
// ============================================================

async function renderMsStrategyDOCX(reportData, outputPath) {
  const sections = [];

  // ---- COVER PAGE ----
  sections.push(M.coverPage(
    "Mercury Strategy",
    reportData.subtitle,
    reportData.meta,
    { thirdLine: reportData.thirdLine }
  ));

  // ---- MAIN CONTENT SECTION ----
  const content = M.contentSection("Mercury Strategy", `${reportData.subtitle} | Mercury Strategy`);
  const children = [];

  // ============================================================
  // 1. EXECUTIVE SUMMARY
  // ============================================================
  if (reportData.executiveSummary) {
    children.push(M.heading1("Executive summary"));
    children.push(M.bodyText(reportData.executiveSummary));
    children.push(M.spacer(400));
  }

  // ============================================================
  // 2. COMPANY CONTEXT
  // ============================================================
  const ctx = reportData.companyContext;
  if (ctx) {
    children.push(M.heading1("Company context"));

    // Identity table
    const identityRows = [];
    if (ctx.company_type) identityRows.push(["Company type", ctx.company_type]);
    if (ctx.sector) identityRows.push(["Sector", ctx.sector]);
    if (ctx.listing_status) identityRows.push(["Listing status", ctx.listing_status]);
    if (ctx.coverage_confidence) identityRows.push(["Coverage confidence", ctx.coverage_confidence]);
    if (ctx.benchmark && ctx.benchmark.iq_score != null) {
      identityRows.push(["Connect.IQ score", String(ctx.benchmark.iq_score)]);
    }
    if (ctx.benchmark && ctx.benchmark.index_name) {
      identityRows.push(["Index", ctx.benchmark.index_name]);
    }
    if (ctx.benchmark && ctx.benchmark.rank) {
      identityRows.push(["Rank", ctx.benchmark.rank]);
    }
    if (identityRows.length > 0) {
      children.push(M.dataTable(["Attribute", "Value"], identityRows, [3500, 5526]));
      children.push(M.spacer(200));
    }

    // Material events
    const events = ctx.material_events || [];
    if (events.length > 0) {
      children.push(M.heading2("Material events"));
      events.forEach(evt => {
        const text = typeof evt === "string" ? evt : (evt.description || evt.event || JSON.stringify(evt));
        children.push(M.bodyText(`- ${text}`));
      });
      children.push(M.spacer(200));
    }
  }

  // ============================================================
  // 3. BENCHMARK POSITION
  // ============================================================
  if (reportData.benchmarks && reportData.benchmarks.rows) {
    children.push(M.heading1("Connect.IQ benchmark position"));
    const bHeaders = reportData.benchmarks.headers || ["Category", "Score", "Index median", "Index P75", "Assessment"];
    const bWidths = bHeaders.map(() => Math.floor(9026 / bHeaders.length));
    children.push(M.dataTable(bHeaders, reportData.benchmarks.rows, bWidths));
    children.push(M.spacer(200));
  }

  // ============================================================
  // 4. STRATEGIC FINDINGS
  // ============================================================
  const findings = reportData.allFindings || [];
  if (findings.length > 0) {
    children.push(M.heading1("Strategic findings"));

    // Summary table first
    const findingSummaryRows = findings.map(f => [
      f.title || "",
      f.severity || "",
      f.polarity || "unclassified",
      (f.audience_impact || []).join(", ") || "-",
    ]);
    children.push(M.dataTable(
      ["Finding", "Severity", "Signal", "Audience impact"],
      findingSummaryRows,
      [3200, 1200, 1400, 3226]
    ));
    children.push(M.spacer(300));

    // Detailed findings
    findings.forEach((f, i) => {
      const severityTag = f.severity ? ` [${f.severity}]` : "";
      children.push(M.heading2(`${i + 1}. ${f.title}${severityTag}`));
      if (f.detail) children.push(M.bodyText(f.detail));
      if (f.audience_impact && f.audience_impact.length > 0) {
        children.push(M.bodyText(`Audience impact: ${f.audience_impact.join(", ")}`));
      }
      children.push(M.spacer(150));
    });
    children.push(M.spacer(200));
  }

  // ============================================================
  // 5. ARCHETYPE ASSESSMENT
  // ============================================================
  const archetypes = reportData.archetypeResults || [];
  if (archetypes.length > 0) {
    children.push(M.heading1("Archetype assessment"));

    // Show only High and Medium archetypes in main body
    const significantArchetypes = archetypes.filter(a =>
      a.confidence === "high" || a.confidence === "High" ||
      a.confidence === "medium" || a.confidence === "Medium"
    );
    const otherArchetypes = archetypes.filter(a =>
      a.confidence !== "high" && a.confidence !== "High" &&
      a.confidence !== "medium" && a.confidence !== "Medium"
    );

    if (significantArchetypes.length > 0) {
      const archRows = significantArchetypes.map(a => [
        a.archetype_name || a.archetype_id || "",
        (a.confidence || "").charAt(0).toUpperCase() + (a.confidence || "").slice(1),
        (a.criteria_met || []).length + " met",
        (a.criteria_not_met || []).length + " not met",
      ]);
      children.push(M.dataTable(
        ["Archetype", "Confidence", "Criteria met", "Criteria not met"],
        archRows,
        [3500, 1500, 1500, 2526]
      ));
      children.push(M.spacer(200));

      // Detail for each High-confidence archetype
      significantArchetypes
        .filter(a => a.confidence === "high" || a.confidence === "High")
        .forEach(a => {
          children.push(M.heading2(a.archetype_name || a.archetype_id));
          if (a.evidence_notes) children.push(M.bodyText(a.evidence_notes));
          if (a.criteria_met && a.criteria_met.length > 0) {
            children.push(M.bodyText(`Criteria met: ${a.criteria_met.join(", ")}`));
          }
          children.push(M.spacer(100));
        });
    }

    if (otherArchetypes.length > 0) {
      children.push(M.bodyText(
        `${otherArchetypes.length} additional archetype${otherArchetypes.length > 1 ? "s" : ""} assessed at Low or None confidence (see Appendix A).`
      ));
      children.push(M.spacer(200));
    }
  }

  // ============================================================
  // 6. AUDIENCE ANALYSIS
  // ============================================================
  const audience = reportData.audienceAssessment || [];
  if (audience.length > 0) {
    children.push(M.heading1("Audience analysis"));

    const audienceRows = audience.map(a => [
      a.tier || a.audience || "",
      a.classification || a.status || "",
      a.evidence_notes || a.notes || a.detail || "",
    ]);
    children.push(M.dataTable(
      ["Audience tier", "Classification", "Evidence"],
      audienceRows,
      [2500, 1526, 5000]
    ));
    children.push(M.spacer(200));

    // Detail for underserved and absent tiers
    audience
      .filter(a => {
        const cls = (a.classification || a.status || "").toLowerCase();
        return cls === "underserved" || cls === "absent";
      })
      .forEach(a => {
        const tierName = a.tier || a.audience || "";
        const cls = a.classification || a.status || "";
        children.push(M.heading2(`${tierName} [${cls}]`));
        if (a.evidence_notes || a.notes || a.detail) {
          children.push(M.bodyText(a.evidence_notes || a.notes || a.detail));
        }
        if (a.failure_signals && a.failure_signals.length > 0) {
          children.push(M.bodyText(`Failure signals: ${a.failure_signals.join(", ")}`));
        }
        children.push(M.spacer(100));
      });
    children.push(M.spacer(200));
  }

  // ============================================================
  // 7. GAPS IDENTIFIED
  // ============================================================
  if (reportData.gaps && reportData.gaps.length > 0) {
    children.push(M.heading1("Gaps identified"));
    children.push(M.gapsTable(reportData.gaps));
    children.push(M.spacer(200));
  }

  // ============================================================
  // 8. SITE STRUCTURE
  // ============================================================
  // Note: site structure renders in HTML (treemap). For Word, summarise sections.
  const evidenceLoaded = reportData.evidenceLoaded;
  if (evidenceLoaded) {
    children.push(M.heading1("Site overview"));
    const siteRows = [];
    if (evidenceLoaded.pages_loaded) siteRows.push(["Pages loaded", String(evidenceLoaded.pages_loaded)]);
    if (evidenceLoaded.documents_loaded) siteRows.push(["Documents loaded", String(evidenceLoaded.documents_loaded)]);
    if (evidenceLoaded.sections_assessed) {
      const secs = Array.isArray(evidenceLoaded.sections_assessed) ? evidenceLoaded.sections_assessed : [];
      if (secs.length > 0) siteRows.push(["Sections assessed", secs.join(", ")]);
    }
    if (siteRows.length > 0) {
      children.push(M.dataTable(["Metric", "Value"], siteRows, [3500, 5526]));
      children.push(M.spacer(200));
    }
  }

  // ============================================================
  // 9. STRATEGIC IMPLICATIONS (PRIORITIES)
  // ============================================================
  if (reportData.talkingPoints && reportData.talkingPoints.length > 0) {
    children.push(M.heading1("Strategic implications"));
    reportData.talkingPoints.forEach((tp, i) => {
      children.push(M.heading2(`${i + 1}. ${tp.title}`));
      if (tp.detail) children.push(M.bodyText(tp.detail));
      children.push(M.spacer(100));
    });
    children.push(M.spacer(200));
  }

  // ============================================================
  // 10. PEER CALIBRATION
  // ============================================================
  const peer = reportData.peerCalibration;
  if (peer) {
    children.push(M.heading1("Peer calibration"));
    if (peer.summary) children.push(M.bodyText(peer.summary));
    if (peer.baseline_expectations && peer.baseline_expectations.length > 0) {
      children.push(M.heading2("Baseline expectations"));
      peer.baseline_expectations.forEach(b => {
        const text = typeof b === "string" ? b : (b.feature || b.description || JSON.stringify(b));
        children.push(M.bodyText(`- ${text}`));
      });
    }
    if (peer.leading_features && peer.leading_features.length > 0) {
      children.push(M.heading2("Where the company leads"));
      peer.leading_features.forEach(f => {
        const text = typeof f === "string" ? f : (f.feature || f.description || JSON.stringify(f));
        children.push(M.bodyText(`- ${text}`));
      });
    }
    if (peer.sector_gaps && peer.sector_gaps.length > 0) {
      children.push(M.heading2("Sector-wide gaps"));
      peer.sector_gaps.forEach(g => {
        const text = typeof g === "string" ? g : (g.feature || g.description || JSON.stringify(g));
        children.push(M.bodyText(`- ${text}`));
      });
    }
    children.push(M.spacer(200));
  }

  // ============================================================
  // APPENDIX A — ARCHETYPE EVIDENCE TABLES
  // ============================================================
  const appendix = reportData.appendix;
  const hasAppendixA = (appendix && appendix.archetype_evidence_tables && appendix.archetype_evidence_tables.length > 0)
    || archetypes.length > 0;
  if (hasAppendixA) {
    children.push(M.heading1("Appendix A — Archetype evidence"));
    // Full archetype table (all 13)
    if (archetypes.length > 0) {
      const fullArchRows = archetypes.map(a => [
        a.archetype_id || "",
        a.archetype_name || "",
        (a.confidence || "").charAt(0).toUpperCase() + (a.confidence || "").slice(1),
        String((a.criteria_met || []).length),
        String((a.criteria_not_met || []).length),
        String((a.criteria_not_assessable || []).length),
      ]);
      children.push(M.dataTable(
        ["ID", "Archetype", "Confidence", "Met", "Not met", "N/A"],
        fullArchRows,
        [600, 3000, 1200, 800, 1000, 800]
      ));
      children.push(M.spacer(200));
    }
    // Detailed evidence tables from appendix
    if (appendix && appendix.archetype_evidence_tables) {
      appendix.archetype_evidence_tables.forEach(table => {
        const name = table.archetype_name || table.archetype_id || "";
        children.push(M.heading2(name));
        if (table.observations && table.observations.length > 0) {
          const obsRows = table.observations.map(o => [
            o.criterion || "",
            o.observation || o.evidence || "",
            o.met ? "Met" : "Not met",
          ]);
          children.push(M.dataTable(
            ["Criterion", "Observation", "Status"],
            obsRows,
            [1500, 5526, 2000]
          ));
        }
        children.push(M.spacer(100));
      });
    }
    children.push(M.spacer(200));
  }

  // ============================================================
  // APPENDIX B — PAGES ACCESSED
  // ============================================================
  children.push(...buildUrlTable(
    "Appendix B — Pages accessed",
    reportData.pagesAnalysed,
    ["URL", "Page type", "Presence quality"]
  ));

  // ============================================================
  // APPENDIX C — DOCUMENTS ACCESSED
  // ============================================================
  children.push(...buildUrlTable(
    "Appendix C — Documents accessed",
    reportData.documentsAnalysed,
    ["URL", "Document type", "Status"]
  ));

  // ============================================================
  // APPENDIX D — CLAIM REGISTER
  // ============================================================
  if (reportData.claims && reportData.claims.length > 0) {
    children.push(M.heading1("Appendix D — Claim register"));
    const claimRows = reportData.claims.map(c => [
      c.claim_id || "",
      c.statement || "",
      c.certainty || "",
      c.scope || "",
    ]);
    children.push(M.dataTable(
      ["Claim ID", "Statement", "Certainty", "Scope"],
      claimRows,
      [1000, 4526, 1500, 2000]
    ));
    children.push(M.spacer(200));
  }

  // ============================================================
  // APPENDIX E — METHODOLOGY & LIMITATIONS
  // ============================================================
  if (reportData.methodology || (reportData.limitations && reportData.limitations.length > 0)) {
    children.push(M.heading1("Appendix E — Methodology and limitations"));
    if (reportData.methodology) {
      children.push(M.bodyText(reportData.methodology));
      children.push(M.spacer(200));
    }
    if (reportData.limitations && reportData.limitations.length > 0) {
      children.push(M.heading2("Limitations"));
      reportData.limitations.forEach(l => {
        const text = typeof l === "string" ? l : (l.description || l.detail || l.text || l.reason || JSON.stringify(l));
        children.push(M.bodyText(`- ${text}`));
      });
    }
  }

  content.children = children;
  sections.push(content);

  const doc = M.createDocument(sections);
  await M.build(doc, outputPath);
  return outputPath;
}

// ============================================================
// ORIGINAL PIPELINE WORD REPORT
// ============================================================

async function renderOriginalDOCX(reportData, outputPath) {
  const sections = [];

  // Cover page
  sections.push(M.coverPage(reportData.title, reportData.subtitle, reportData.meta, {
    thirdLine: reportData.thirdLine,
  }));

  // Content section
  const content = M.contentSection(reportData.title, `${reportData.subtitle} | ${reportData.title}`);
  const children = [];

  // Executive summary
  if (reportData.executiveSummary) {
    children.push(M.heading1("Executive summary"));
    children.push(M.bodyText(reportData.executiveSummary));
    children.push(M.spacer(400));
  }

  // Ratings (from brief synthesis or compete summary)
  const ratings = reportData.summaryRatings || reportData.ratings;
  if (ratings && ratings.length > 0) {
    const ratingHeaders = ["Area", "Assessment"];
    const ratingRows = ratings.map(r => [
      r.dimension || r.label || r.area || "",
      r.rating || r.ratingA || r.assessment || "",
    ]);
    children.push(M.dataTable(ratingHeaders, ratingRows, [5000, 4026]));
    children.push(M.spacer(200));
  }

  // Strengths
  if (reportData.strengths && reportData.strengths.length > 0) {
    children.push(M.heading1("What they do well"));
    reportData.strengths.forEach((s, i) => {
      children.push(M.heading3(`${i + 1}. ${s.title}`));
      if (s.detail && s.detail !== s.title) children.push(M.bodyText(s.detail));
    });
    children.push(M.spacer(200));
  }

  // Peer comparison (compete stage)
  if (reportData.comparisonMatrix && reportData.comparisonMatrix.length > 0) {
    children.push(M.heading1("Peer comparison"));
    if (reportData.companyA || reportData.companyB) {
      children.push(M.bodyText(`${reportData.companyA || "Company A"} vs ${reportData.companyB || "Company B"}`));
    }
    const compHeaders = ["Dimension", reportData.companyA || "Company A", reportData.companyB || "Company B", "Edge"];
    const compRows = reportData.comparisonMatrix.map(row => [
      row.dimension || "", row.a || "", row.b || "", row.edge || "",
    ]);
    children.push(M.dataTable(compHeaders, compRows, [2500, 2500, 2500, 1526]));
    children.push(M.spacer(200));
  }

  // Gaps
  if (reportData.gaps && reportData.gaps.length > 0) {
    children.push(M.heading1("Gaps versus best practice"));
    children.push(M.gapsTable(reportData.gaps));
    children.push(M.spacer(200));
  }

  // Benchmarks
  if (reportData.benchmarks && reportData.benchmarks.rows) {
    children.push(M.heading1("Connect.IQ benchmark context"));
    const bHeaders = reportData.benchmarks.headers || ["Category", "Median", "P75", "Estimate", "Assessment"];
    const bWidths = bHeaders.map(() => Math.floor(9026 / bHeaders.length));
    children.push(M.dataTable(bHeaders, reportData.benchmarks.rows, bWidths));
    children.push(M.spacer(200));
  }

  // Talking points
  if (reportData.talkingPoints && reportData.talkingPoints.length > 0) {
    children.push(M.heading1("Priorities"));
    reportData.talkingPoints.forEach((tp, i) => {
      children.push(M.heading3(`${i + 1}. ${tp.title}`));
      if (tp.detail) children.push(M.bodyText(tp.detail));
    });
    children.push(M.spacer(200));
  }

  // Meeting data (agenda, pre-read, facilitator guide)
  if (reportData.agenda) {
    children.push(M.heading1("Meeting agenda"));
    children.push(M.bodyText(typeof reportData.agenda === "string" ? reportData.agenda : JSON.stringify(reportData.agenda, null, 2)));
    children.push(M.spacer(200));
  }
  if (reportData.preRead) {
    children.push(M.heading1("Client pre-read"));
    children.push(M.bodyText(typeof reportData.preRead === "string" ? reportData.preRead : JSON.stringify(reportData.preRead, null, 2)));
    children.push(M.spacer(200));
  }
  if (reportData.facilitatorGuide) {
    children.push(M.heading1("Facilitator guide"));
    children.push(M.bodyText(typeof reportData.facilitatorGuide === "string" ? reportData.facilitatorGuide : JSON.stringify(reportData.facilitatorGuide, null, 2)));
    children.push(M.spacer(200));
  }

  // Pages accessed
  children.push(...buildUrlTable(
    "Pages accessed",
    reportData.pagesAnalysed,
    ["URL", "Page type", "Presence quality"]
  ));

  // Documents accessed
  children.push(...buildUrlTable(
    "Documents accessed",
    reportData.documentsAnalysed,
    ["URL", "Document type", "Status"]
  ));

  // Methodology
  if (reportData.methodology) {
    children.push(M.heading1("Methodology"));
    children.push(M.bodyText(reportData.methodology));
  }

  content.children = children;
  sections.push(content);

  const doc = M.createDocument(sections);
  await M.build(doc, outputPath);
  return outputPath;
}

/**
 * Render PPTX from reportData.
 */
async function renderPPTX(reportData, outputPath) {
  const pptx = MP.createPresentation(reportData.title, "IDX Mercury");

  // Title slide
  MP.titleSlide(pptx, reportData.title, reportData.subtitle, reportData.meta, {
    thirdLine: reportData.thirdLine,
  });

  // Executive summary
  if (reportData.executiveSummary) {
    MP.sectionSlide(pptx, "Executive summary");
    MP.contentSlide(pptx, "Executive summary", reportData.executiveSummary, { fontSize: 11 });
  }

  // Ratings (from brief synthesis or compete summary)
  const ratings = reportData.summaryRatings || reportData.ratings;
  if (ratings && ratings.length > 0) {
    const normalizedRatings = ratings.map(r => ({
      label: r.dimension || r.label || r.area || "",
      rating: r.rating || r.ratingA || r.assessment || "",
    }));
    MP.ratingSlide(pptx, "Assessment summary", normalizedRatings);
  }

  // Strengths
  if (reportData.strengths && reportData.strengths.length > 0) {
    MP.sectionSlide(pptx, "What they do well");
    MP.bulletSlide(pptx, "What they do well", reportData.strengths.map(s => ({
      title: s.title, detail: "",
    })));
  }

  // Peer comparison (compete stage)
  if (reportData.comparisonMatrix && reportData.comparisonMatrix.length > 0) {
    MP.sectionSlide(pptx, "Peer comparison", "", { variant: "blue" });
    const compHeaders = ["Dimension", reportData.companyA || "Company A", reportData.companyB || "Company B", "Edge"];
    const compRows = reportData.comparisonMatrix.map(row => [
      row.dimension || "", row.a || "", row.b || "", row.edge || "",
    ]);
    MP.tableSlide(pptx, "Detailed comparison", compHeaders, compRows, { colW: [3, 3.5, 3.5, 2.13] });
  }

  // Gaps
  if (reportData.gaps && reportData.gaps.length > 0) {
    const gapsHeading = reportData.isMsFindings ? "Gaps identified" : "Gaps versus best practice";
    MP.sectionSlide(pptx, gapsHeading);
    MP.gapsSlide(pptx, gapsHeading, reportData.gaps);
  }

  // Benchmarks
  if (reportData.benchmarks && reportData.benchmarks.rows) {
    MP.sectionSlide(pptx, "Connect.IQ benchmarks");
    const bHeaders = reportData.benchmarks.headers || ["Category", "Median", "P75", "Estimate", "Assessment"];
    MP.tableSlide(pptx, "Benchmark context", bHeaders, reportData.benchmarks.rows);
  }

  // Talking points
  if (reportData.talkingPoints && reportData.talkingPoints.length > 0) {
    MP.sectionSlide(pptx, "Priorities");
    MP.bulletSlide(pptx, "Priorities", reportData.talkingPoints.map(tp => ({
      title: tp.title, detail: tp.detail,
    })), { numbered: true });
  }

  // Meeting data (agenda, pre-read, facilitator guide)
  if (reportData.agenda || reportData.preRead || reportData.facilitatorGuide) {
    MP.sectionSlide(pptx, "Meeting pack", "", { variant: "blue" });
    if (reportData.agenda) {
      const agendaText = typeof reportData.agenda === "string" ? reportData.agenda : JSON.stringify(reportData.agenda, null, 2);
      MP.contentSlide(pptx, "Meeting agenda", agendaText, { fontSize: 10 });
    }
    if (reportData.preRead) {
      const preReadText = typeof reportData.preRead === "string" ? reportData.preRead : JSON.stringify(reportData.preRead, null, 2);
      MP.contentSlide(pptx, "Client pre-read", preReadText, { fontSize: 10 });
    }
    if (reportData.facilitatorGuide) {
      const guideText = typeof reportData.facilitatorGuide === "string" ? reportData.facilitatorGuide : JSON.stringify(reportData.facilitatorGuide, null, 2);
      MP.contentSlide(pptx, "Facilitator guide", guideText, { fontSize: 10 });
    }
  }

  // Pages accessed
  if (reportData.pagesAnalysed && reportData.pagesAnalysed.length > 0) {
    MP.sectionSlide(pptx, "Pages accessed");
    const batchSize = 10;
    for (let i = 0; i < reportData.pagesAnalysed.length; i += batchSize) {
      const batch = reportData.pagesAnalysed.slice(i, i + batchSize);
      MP.tableSlide(pptx, `Pages accessed (${i + 1}–${Math.min(i + batchSize, reportData.pagesAnalysed.length)})`,
        ["URL", "Page type", "Presence quality"], batch, { colW: [6.5, 2.5, 3.13] });
    }
  }

  // Documents accessed
  if (reportData.documentsAnalysed && reportData.documentsAnalysed.length > 0) {
    MP.sectionSlide(pptx, "Documents accessed");
    const batchSize = 10;
    for (let i = 0; i < reportData.documentsAnalysed.length; i += batchSize) {
      const batch = reportData.documentsAnalysed.slice(i, i + batchSize);
      MP.tableSlide(pptx, `Documents accessed (${i + 1}–${Math.min(i + batchSize, reportData.documentsAnalysed.length)})`,
        ["URL", "Document type", "Status"], batch, { colW: [6.5, 3.63, 2] });
    }
  }

  // Methodology
  if (reportData.methodology) {
    MP.sectionSlide(pptx, "Methodology");
    MP.contentSlide(pptx, "Methodology", reportData.methodology);
  }

  await MP.build(pptx, outputPath);
  return outputPath;
}

// ============================================================
// MAIN API
// ============================================================

/**
 * Render one or more formats for the current state of a company's artefacts.
 *
 * @param {object} config
 * @param {string} config.dir - Directory containing artefact files
 * @param {string} config.company - Company slug (for filenames)
 * @param {string} config.stage - Current stage just completed
 * @param {string[]} config.formats - Array of formats to render: 'html', 'docx', 'pptx'
 * @param {object} config.opts - Options passed to adapter: { sector, index, title }
 * @returns {object} { files: { html, docx, pptx }, hub, manifest }
 */
async function renderStage(config) {
  const { dir, company, stage, formats = [], opts = {} } = config;
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

  // Load all available artefacts (not just current stage)
  const reportData = adapter.loadAndBuild(dir, company, opts);

  // Load/update manifest
  const manifest = loadManifest(dir, slug);
  manifest.company = reportData.subtitle || company;
  manifest.slug = slug;
  if (!manifest.stages_completed.includes(stage)) {
    manifest.stages_completed.push(stage);
  }

  const result = { files: {}, hub: null, manifest: null };
  const timestamp = new Date().toISOString();

  // Attach documentsTab so all rendered formats (not just the hub) include it
  reportData.documentsTab = buildDocumentsTabData(manifest);

  // Render requested formats
  for (const fmt of formats) {
    const filename = `${slug}-${stage}.${fmt === "html" ? "html" : fmt}`;
    const outputPath = path.join(dir, filename);

    try {
      if (fmt === "html") {
        renderHTML(reportData, outputPath);
        result.files.html = outputPath;
      } else if (fmt === "docx") {
        await renderDOCX(reportData, outputPath);
        result.files.docx = outputPath;
      } else if (fmt === "pptx") {
        await renderPPTX(reportData, outputPath);
        result.files.pptx = outputPath;
      } else if (fmt === "xlsx") {
        await MX.build(reportData, outputPath);
        result.files.xlsx = outputPath;
      }

      // Record in manifest
      manifest.documents = manifest.documents.filter(
        d => !(d.stage === stage && d.format === fmt)
      );
      manifest.documents.push({
        stage,
        format: fmt,
        path: outputPath,
        filename,
        rendered_at: timestamp,
      });
    } catch (err) {
      console.error(`Failed to render ${fmt.toUpperCase()} for stage "${stage}": ${err.message}`);
      // Continue with other formats
    }
  }

  // Always rebuild the cumulative HTML hub
  // (documentsTab was already set above, so reportData is ready to use directly)
  const hubPath = path.join(dir, `${slug}-mercury-hub.html`);
  reportData.documentsTab = buildDocumentsTabData(manifest); // refresh after manifest save
  renderHTML(reportData, hubPath);
  result.hub = hubPath;
  manifest.hub_path = hubPath;

  // Save manifest
  saveManifest(dir, manifest);
  result.manifest = manifest;

  return result;
}

/**
 * Build the data structure for the Documents tab in the HTML hub.
 */
function buildDocumentsTabData(manifest) {
  const stageGroups = {};

  for (const doc of manifest.documents) {
    if (!stageGroups[doc.stage]) {
      stageGroups[doc.stage] = {
        label: STAGE_LABELS[doc.stage] || doc.stage,
        files: [],
      };
    }
    stageGroups[doc.stage].files.push({
      format: doc.format.toUpperCase(),
      filename: doc.filename,
      path: doc.path,
      rendered_at: doc.rendered_at,
    });
  }

  return {
    stages_completed: manifest.stages_completed,
    groups: [...STAGE_ORDER, ...MS_STAGE_ORDER]
      .filter(s => stageGroups[s])
      .map(s => stageGroups[s]),
  };
}

/**
 * Generate the stage completion message shown to the user.
 *
 * @param {string} stage - Stage just completed
 * @param {object} reportData - The reportData from the adapter
 * @param {object} manifest - Current manifest
 * @returns {string} Formatted message
 */
function stageCompleteMessage(stage, reportData, manifest) {
  const label = STAGE_LABELS[stage] || stage;
  const next = nextStage(stage);

  const counts = [];
  if (reportData.strengths && reportData.strengths.length > 0)
    counts.push(`${reportData.strengths.length} strengths`);
  if (reportData.gaps && reportData.gaps.length > 0)
    counts.push(`${reportData.gaps.length} gaps`);
  if (reportData.talkingPoints && reportData.talkingPoints.length > 0)
    counts.push(`${reportData.talkingPoints.length} priorities`);
  if (reportData.claims && reportData.claims.length > 0)
    counts.push(`${reportData.claims.length} claims`);

  let msg = `**${label} complete.**`;
  if (counts.length > 0) msg += ` ${counts.join(", ")}.`;
  msg += "\n\n";
  msg += "**Download this stage as:**\n";
  msg += "- **HTML** — interactive presentation (opens in browser)\n";
  msg += "- **Word** — branded document (.docx)\n";
  msg += "- **Slides** — branded presentation (.pptx)\n";
  msg += "- **Excel** — structured workbook with site structure sheet (.xlsx)\n";
  msg += "\n";

  if (next) {
    const nextLabel = STAGE_LABELS[next];
    const commandPrefix = MS_STAGE_ORDER.includes(next) ? "/ms-" : "/mercury:";
    const commandName = MS_STAGE_ORDER.includes(next) ? next.replace("ms_", "") : next;
    msg += `**Or continue to:** \`${commandPrefix}${commandName}\` — ${nextLabel}\n`;
  } else {
    msg += "**All stages complete.** You can download the full integrated report in any format.\n";
  }

  if (manifest && manifest.hub_path) {
    msg += `\nThe **Mercury Hub** (cumulative HTML report) has been updated.\n`;
  }

  return msg;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Main API
  renderStage,
  stageCompleteMessage,

  // Individual renderers (for direct use)
  renderHTML,
  renderDOCX,
  renderPPTX,

  // Manifest
  loadManifest,
  saveManifest,
  buildDocumentsTabData,

  // Stage helpers
  STAGE_LABELS,
  STAGE_ORDER,
  MS_STAGE_ORDER,
  nextStage,
};
