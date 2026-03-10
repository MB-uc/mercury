/**
 * Mercury Adapter — transforms stage artefact JSONs into the unified reportData
 * shape consumed by all three renderers (html, docx, pptx).
 *
 * Usage:
 *   const { buildReportData } = require('./mercury-adapter.js');
 *   const reportData = buildReportData({ brief: briefArtefact, compete: competeArtefact });
 *   // Pass reportData to any renderer
 *
 * Accepts any combination of stages. Sections only appear when their stage data exists.
 */

// ============================================================
// STAGE EXTRACTORS
// ============================================================

/**
 * Extract strengths from findings with severity === "positive"
 */
function extractStrengths(artefact) {
  return (artefact.findings || [])
    .filter(f => f.severity === "positive")
    .map(f => ({
      title: f.claim || "",
      detail: f.reasoning || f.claim || "",
      claim_ids: f.claim_ids || [],
    }));
}

/**
 * Extract issue findings (non-positive severity) for narrative use
 */
function extractIssues(artefact) {
  return (artefact.findings || [])
    .filter(f => f.severity !== "positive")
    .map(f => ({
      title: f.claim || "",
      detail: f.reasoning || f.claim || "",
      severity: f.severity || "medium",
      classification: f.classification || "FACT",
      claim_ids: f.claim_ids || [],
    }));
}

/**
 * Extract gaps from gap_analysis where status === "searched_not_found"
 */
function extractGaps(artefact) {
  return (artefact.gap_analysis || [])
    .filter(g => g.status === "searched_not_found")
    .map(g => ({
      gap: g.category || "",
      applies: g.applies_to || g.section_name || "",
      section: g.search_method || "",
      priority: g.priority || "Medium",
      detail: g.reasoning || g.search_method || "",
      claim_ids: g.claim_ids || [],
    }));
}

/**
 * Extract talking points from synthesis.priorities
 */
function extractTalkingPoints(artefact) {
  const priorities = (artefact.synthesis && artefact.synthesis.priorities) || [];
  return priorities.map(p => ({
    title: p.recommendation || "",
    detail: p.rationale || "",
    priority: p.priority || 0,
    effort: p.effort || "",
    impact: p.impact || "",
    claim_ids: p.claim_ids || [],
  }));
}

/**
 * Extract pages analysed from citations with type === "web_page"
 */
function extractPagesAnalysed(artefact) {
  return (artefact.citations || [])
    .filter(c => c.type === "web_page")
    .map(c => [c.source || "", c.type || "", (c.claims_supported || []).join(", ")]);
}

/**
 * Build methodology string from artefact metadata
 */
function buildMethodology(artefact) {
  const caps = (artefact.capabilities_used || []).join(", ");
  const claimCount = (artefact.claims || []).length;
  const generated = artefact.generated_at || "unknown";
  const limitations = (artefact.limitations || []);
  let text = `Mercury v3 automated audit. Capabilities used: ${caps}. Claims: ${claimCount}. Generated: ${generated}.`;
  if (limitations.length > 0) {
    text += "\n\nLimitations:\n" + limitations.map(l => `- ${l}`).join("\n");
  }
  return text;
}

/**
 * Determine report type from the stages provided
 */
function determineReportType(stages) {
  if (stages.compete) return "peer_comparison";
  if (stages.sitemap) return "deep_dive";
  return "quick_audit";
}

/**
 * Count total pages analysed across all provided artefacts
 */
function countPages(stages) {
  let count = 0;
  for (const artefact of Object.values(stages)) {
    if (artefact && artefact.citations) {
      count += artefact.citations.filter(c => c.type === "web_page").length;
    }
  }
  return count;
}

// ============================================================
// COMPETE STAGE EXTRACTORS
// ============================================================

function extractComparisonData(competeArtefact) {
  if (!competeArtefact) return {};

  const findings = competeArtefact.findings || [];

  // Look for comparison-specific fields that the compete stage produces
  // These may be in the artefact's top level or in a dedicated comparison object
  const result = {};

  if (competeArtefact.company_a) result.companyA = competeArtefact.company_a;
  if (competeArtefact.company_b) result.companyB = competeArtefact.company_b;
  if (competeArtefact.companyA) result.companyA = competeArtefact.companyA;
  if (competeArtefact.companyB) result.companyB = competeArtefact.companyB;

  // Comparison matrix — may be at top level or in synthesis
  if (competeArtefact.comparison_matrix) {
    result.comparisonMatrix = competeArtefact.comparison_matrix.map(row => ({
      dimension: row.dimension || row.category || "",
      a: row.a || row.company_a || "",
      b: row.b || row.company_b || "",
      edge: row.edge || "",
    }));
  }

  // Summary ratings
  if (competeArtefact.summary_ratings) {
    result.summaryRatings = competeArtefact.summary_ratings.map(r => ({
      dimension: r.dimension || r.area || "",
      ratingA: r.rating_a || r.ratingA || "",
      ratingB: r.rating_b || r.ratingB || "",
      edge: r.edge || "",
    }));
  }

  // Where A/B leads — extract from findings with section markers
  const aLeads = findings.filter(f =>
    (f.section || "").includes("where_a_leads") || (f.section || "").includes("company_a_leads")
  );
  const bLeads = findings.filter(f =>
    (f.section || "").includes("where_b_leads") || (f.section || "").includes("company_b_leads")
  );

  if (aLeads.length > 0) {
    result.whereALeads = aLeads.map(f => ({
      title: f.claim || "",
      detail: f.reasoning || f.claim || "",
      claim_ids: f.claim_ids || [],
    }));
  }

  if (bLeads.length > 0) {
    result.whereBLeads = bLeads.map(f => ({
      title: f.claim || "",
      detail: f.reasoning || f.claim || "",
      claim_ids: f.claim_ids || [],
    }));
  }

  // Pages per company
  if (competeArtefact.pages_a) result.pagesA = competeArtefact.pages_a;
  if (competeArtefact.pages_b) result.pagesB = competeArtefact.pages_b;

  return result;
}

// ============================================================
// SITEMAP STAGE EXTRACTORS
// ============================================================

function extractSitemapData(sitemapArtefact) {
  if (!sitemapArtefact) return null;

  // The sitemap artefact should contain a hierarchical structure for the treemap
  // Look for common field names
  return sitemapArtefact.sitemap_data
    || sitemapArtefact.sitemapData
    || sitemapArtefact.recommended_architecture
    || sitemapArtefact.architecture
    || sitemapArtefact.tree
    || null;
}

// ============================================================
// MEETING STAGE EXTRACTORS
// ============================================================

function extractMeetingData(meetingArtefact) {
  if (!meetingArtefact) return {};

  const result = {};

  if (meetingArtefact.agenda) result.agenda = meetingArtefact.agenda;
  if (meetingArtefact.pre_read) result.preRead = meetingArtefact.pre_read;
  if (meetingArtefact.facilitator_guide) result.facilitatorGuide = meetingArtefact.facilitator_guide;

  return result;
}

// ============================================================
// MAIN ADAPTER
// ============================================================

/**
 * Build a unified reportData object from one or more Mercury stage artefacts.
 *
 * @param {object} stages - Object with stage keys: { brief, compete, sitemap, meeting }
 *   Each value is a parsed artefact JSON, or null/undefined if that stage wasn't run.
 * @param {object} opts - Override options: { sector, index, title }
 * @returns {object} reportData ready for any renderer
 */
function buildReportData(stages, opts = {}) {
  // Use the first available artefact for shared metadata
  const primary = stages.brief || stages.compete || stages.sitemap || stages.meeting;
  if (!primary) throw new Error("At least one stage artefact is required");

  const company = primary.company || primary.entity || "Unknown";
  const domain = primary.domain || "";
  const type = determineReportType(stages);
  const totalPages = countPages(stages);
  const stagesCompleted = Object.keys(stages).filter(k => stages[k]);

  // Build title based on what stages are present
  let title = opts.title || "Mercury Site Audit";
  if (type === "peer_comparison") title = "Mercury Peer Comparison";
  if (stagesCompleted.length > 2) title = "Mercury Full Report";

  const reportData = {
    type,
    title,
    subtitle: company,
    date: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    thirdLine: `Domain: ${domain}`,
    meta: [
      ["Sector", opts.sector || ""],
      ["Index", opts.index || ""],
      ["Stages", stagesCompleted.join(", ")],
      ["Pages analysed", `${totalPages} key pages`],
    ].filter(([, v]) => v), // Remove empty values

    // Claims from all stages
    claims: [],

    // Sections — populated from whichever stages exist
    executiveSummary: "",
    strengths: [],
    gaps: [],
    talkingPoints: [],
    pagesAnalysed: [],
    methodology: "",

    // Optional sections (populated by later stages)
    ratings: null,
    summaryRatings: null,
    benchmarks: null,
    overallAssessment: null,
    sitemapData: null,

    // Compete stage fields
    companyA: "",
    companyB: "",
    comparisonMatrix: [],
    whereALeads: [],
    whereBLeads: [],

    // Meeting stage fields
    agenda: null,
    preRead: null,
    facilitatorGuide: null,
  };

  // ---- BRIEF stage ----
  if (stages.brief) {
    const b = stages.brief;
    reportData.executiveSummary = b.executive_summary || "";
    reportData.strengths = extractStrengths(b);
    reportData.gaps = extractGaps(b);
    reportData.talkingPoints = extractTalkingPoints(b);
    reportData.pagesAnalysed = extractPagesAnalysed(b);
    reportData.methodology = buildMethodology(b);
    reportData.claims = reportData.claims.concat(b.claims || []);
    reportData.benchmarks = b.benchmarks || null;

    // Ratings from synthesis if present
    if (b.synthesis && b.synthesis.ratings) {
      reportData.ratings = b.synthesis.ratings;
    }

    // Overall assessment for supplementary use
    if (b.synthesis && b.synthesis.overall_assessment) {
      reportData.overallAssessment = b.synthesis.overall_assessment;
    }
  }

  // ---- COMPETE stage ----
  if (stages.compete) {
    const c = stages.compete;
    const compData = extractComparisonData(c);
    Object.assign(reportData, compData);

    // Merge exec summary if brief didn't provide one
    if (!reportData.executiveSummary && c.executive_summary) {
      reportData.executiveSummary = c.executive_summary;
    }

    // Append compete gaps to existing gaps
    const competeGaps = extractGaps(c);
    if (competeGaps.length > 0) {
      reportData.gaps = reportData.gaps.concat(competeGaps);
    }

    // Append compete talking points
    const competeTPs = extractTalkingPoints(c);
    if (competeTPs.length > 0) {
      reportData.talkingPoints = reportData.talkingPoints.concat(competeTPs);
    }

    // Merge claims
    reportData.claims = reportData.claims.concat(c.claims || []);

    // Merge pages
    const competePages = extractPagesAnalysed(c);
    reportData.pagesAnalysed = reportData.pagesAnalysed.concat(competePages);
  }

  // ---- SITEMAP stage ----
  if (stages.sitemap) {
    const s = stages.sitemap;
    reportData.sitemapData = extractSitemapData(s);

    // Merge exec summary if not yet set
    if (!reportData.executiveSummary && s.executive_summary) {
      reportData.executiveSummary = s.executive_summary;
    }

    // Sitemap-specific findings as additional talking points
    const sitemapTPs = extractTalkingPoints(s);
    if (sitemapTPs.length > 0) {
      reportData.talkingPoints = reportData.talkingPoints.concat(sitemapTPs);
    }

    reportData.claims = reportData.claims.concat(s.claims || []);
  }

  // ---- MEETING stage ----
  if (stages.meeting) {
    const m = stages.meeting;
    const meetingData = extractMeetingData(m);
    Object.assign(reportData, meetingData);

    if (!reportData.executiveSummary && m.executive_summary) {
      reportData.executiveSummary = m.executive_summary;
    }

    reportData.claims = reportData.claims.concat(m.claims || []);
  }

  // Deduplicate claims by claim_id (keep claims without an id)
  const seenClaims = new Set();
  reportData.claims = reportData.claims.filter(c => {
    if (!c || !c.claim_id) return true; // keep claims without id
    if (seenClaims.has(c.claim_id)) return false;
    seenClaims.add(c.claim_id);
    return true;
  });

  return reportData;
}

// ============================================================
// CONVENIENCE: LOAD FROM FILES
// ============================================================

const fs = require("fs");
const path = require("path");

/**
 * Load artefact files from a directory by naming convention.
 * Looks for: {company}-brief-artefact.json, {company}-compete-artefact.json, etc.
 *
 * @param {string} dir - Directory containing artefact files
 * @param {string} company - Company slug (used in filenames)
 * @returns {object} stages object: { brief, compete, sitemap, meeting }
 */
function loadArtefacts(dir, company) {
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  const stageNames = ["brief", "compete", "sitemap", "meeting"];
  const stages = {};

  for (const stage of stageNames) {
    // Try multiple naming patterns
    const patterns = [
      `${slug}-${stage}-artefact.json`,
      `${slug}-${stage}.json`,
      `${company}-${stage}-artefact.json`,
      `${stage}-artefact.json`,
    ];

    for (const filename of patterns) {
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        try {
          stages[stage] = JSON.parse(fs.readFileSync(filePath, "utf8"));
          break;
        } catch (e) {
          console.warn(`Warning: Could not parse ${filePath}: ${e.message}`);
        }
      }
    }
  }

  return stages;
}

/**
 * Load artefacts and build reportData in one step.
 *
 * @param {string} dir - Directory containing artefact files
 * @param {string} company - Company slug
 * @param {object} opts - Override options passed to buildReportData
 * @returns {object} reportData
 */
function loadAndBuild(dir, company, opts = {}) {
  const stages = loadArtefacts(dir, company);
  const loaded = Object.keys(stages).filter(k => stages[k]);
  if (loaded.length === 0) {
    throw new Error(`No artefact files found for "${company}" in ${dir}`);
  }
  console.log(`Loaded ${loaded.length} stage(s): ${loaded.join(", ")}`);
  return buildReportData(stages, opts);
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Main API
  buildReportData,
  loadArtefacts,
  loadAndBuild,

  // Individual extractors (for custom composition)
  extractStrengths,
  extractIssues,
  extractGaps,
  extractTalkingPoints,
  extractPagesAnalysed,
  extractComparisonData,
  extractSitemapData,
  extractMeetingData,
  buildMethodology,
  determineReportType,
};
