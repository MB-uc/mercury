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
  let text = `Mercury v6 automated audit. Capabilities used: ${caps}. Claims: ${claimCount}. Generated: ${generated}.`;
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
  if (stages.ms_findings) return "deep_dive";
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
  // ms-findings uses evidence_loaded instead of citations
  if (stages.ms_findings && stages.ms_findings.evidence_loaded) {
    count += stages.ms_findings.evidence_loaded.pages_loaded || 0;
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

  // Comparison matrix — may be at top level or in synthesis.
  // Accepts two formats:
  //   (a) Array: [{dimension, a, b, edge}, ...] — expected format
  //   (b) Object: {dimensions: [...], companies: {A: {...}, B: {...}}} — natural authoring format
  if (competeArtefact.comparison_matrix) {
    const matrix = competeArtefact.comparison_matrix;
    if (Array.isArray(matrix)) {
      result.comparisonMatrix = matrix.map(row => ({
        dimension: row.dimension || row.category || "",
        a: row.a || row.company_a || "",
        b: row.b || row.company_b || "",
        edge: row.edge || "",
      }));
    } else if (matrix && typeof matrix === "object" && Array.isArray(matrix.dimensions)) {
      // Object format: extract company names from keys, map dimensions to rows
      const companyKeys = Object.keys(matrix.companies || {});
      const keyA = companyKeys[0] || "";
      const keyB = companyKeys[1] || "";
      const companiesA = (matrix.companies || {})[keyA] || {};
      const companiesB = (matrix.companies || {})[keyB] || {};
      if (!result.companyA) result.companyA = keyA;
      if (!result.companyB) result.companyB = keyB;
      result.comparisonMatrix = matrix.dimensions.map(dim => {
        const dimName = typeof dim === "string" ? dim : (dim.name || dim.dimension || "");
        const rowA = companiesA[dimName] || {};
        const rowB = companiesB[dimName] || {};
        return {
          dimension: dimName,
          a: rowA.summary || rowA.notes || String(rowA.score || ""),
          b: rowB.summary || rowB.notes || String(rowB.score || ""),
          edge: rowA.edge || rowB.edge || (typeof dim === "object" ? dim.edge || "" : ""),
        };
      });
    }
    // If neither format is recognised, skip silently (no crash)
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
// MS-FINDINGS STAGE EXTRACTORS (Mercury Strategy pipeline)
// ============================================================

/**
 * Extract strengths from ms-findings: findings where the implication
 * describes something positive (no severity marker = strength pattern).
 * In ms-findings, there's no severity="positive" — instead, findings
 * that identify present capabilities are strengths.
 */
function extractMsFindings(artefact) {
  const findings = artefact.findings || [];
  return findings.map(f => ({
    title: f.theme || "",
    detail: f.implication || "",
    severity: f.severity || "moderate",
    classification: f.classification || "INFERENCE",
    finding_id: f.finding_id || "",
    audience_impact: f.audience_impact || [],
    claim_ids: f.claim_ids || [],
  }));
}

/**
 * Extract gaps from ms-findings gap summary
 */
function extractMsGaps(artefact) {
  return (artefact.gaps || []).map(g => ({
    gap: g.description || "",
    applies: g.section || "",
    section: g.scope || "",
    priority: g.severity === "significant" ? "High" : g.severity === "moderate" ? "Medium" : "Low",
    detail: g.description || "",
    claim_ids: g.claim_ids || [],
  }));
}

/**
 * Extract talking points from ms-findings strategic implications
 */
function extractMsImplications(artefact) {
  const implications = (artefact.synthesis && artefact.synthesis.implications) || [];
  return implications.map((imp, i) => ({
    title: typeof imp === "string" ? imp.slice(0, 80) : (imp.title || imp.statement || ""),
    detail: typeof imp === "string" ? imp : (imp.detail || imp.rationale || imp.statement || ""),
    priority: implications.length - i,
    claim_ids: (typeof imp === "object" && imp.claim_ids) || [],
  }));
}

/**
 * Extract pages analysed from ms-findings section_inventory (per-page URLs).
 * Falls back to a summary row from evidence_loaded if section_inventory is absent.
 * Returns array of [url, section_label, presence_quality] rows.
 */
function extractMsPagesAnalysed(artefact) {
  // Primary: pull individual scraped pages from section_inventory
  const inventory = artefact.section_inventory;
  if (inventory && typeof inventory === "object") {
    const rows = [];
    for (const section of Object.values(inventory)) {
      const scraped = section.scraped_pages || [];
      for (const page of scraped) {
        if (page.url) {
          const label = page.playbook_page_type || page.section_key || section.section_key || "";
          const quality = page.presence_quality || "";
          rows.push([page.url, label, quality]);
        }
      }
    }
    if (rows.length > 0) return rows;
  }
  // Fallback: summary row from evidence_loaded
  const loaded = artefact.evidence_loaded || {};
  const pages = loaded.pages_loaded || 0;
  const docs = loaded.documents_loaded || 0;
  if (pages > 0 || docs > 0) {
    return [[`${pages} pages loaded from ms-crawl`, "crawl evidence", `${docs} documents`]];
  }
  return [];
}

/**
 * Extract documents accessed from ms-findings document_checklist items.
 * Returns array of [url, document_type, status] for present/present_partial items.
 */
function extractMsDocumentsAccessed(artefact) {
  const checklist = artefact.document_checklist;
  if (!checklist) return [];
  const items = checklist.items || checklist;
  if (!Array.isArray(items)) return [];
  return items
    .filter(item => item.url && (item.status === "present" || item.status === "present_partial"))
    .map(item => [item.url, item.document || "", item.status]);
}

/**
 * Build methodology from ms-findings artefact
 */
function buildMsMethodology(artefact) {
  const loaded = artefact.evidence_loaded || {};
  const claimCount = (artefact.claims || []).length;
  const findingCount = (artefact.findings || []).length;
  const gapCount = (artefact.gaps || []).length;
  const limitations = artefact.limitations || [];
  let text = `Mercury Strategy pipeline. Evidence: ${loaded.pages_loaded || 0} pages, ${loaded.documents_loaded || 0} documents. Claims: ${claimCount}. Findings: ${findingCount}. Gaps: ${gapCount}.`;
  if (limitations.length > 0) {
    text += "\n\nLimitations:\n" + limitations.map(l => typeof l === "string" ? `- ${l}` : `- ${l.description || l}`).join("\n");
  }
  return text;
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
  const primary = stages.brief || stages.compete || stages.sitemap || stages.meeting || stages.ms_findings;
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
    documentsAnalysed: [],

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

  // ---- MS-FINDINGS stage (Mercury Strategy pipeline) ----
  if (stages.ms_findings) {
    const msf = stages.ms_findings;

    // Executive summary from synthesis
    if (msf.synthesis && msf.synthesis.executive_summary) {
      reportData.executiveSummary = msf.synthesis.executive_summary;
    } else if (!reportData.executiveSummary) {
      // Build from implications
      const implications = extractMsImplications(msf);
      if (implications.length > 0) {
        reportData.executiveSummary = implications.map(i => i.detail).join("\n\n");
      }
    }

    // Split findings into strengths (positive signals) and issues
    const allFindings = extractMsFindings(msf);
    // Findings that don't identify a gap pattern are treated as strengths
    // This is a heuristic — ms-findings doesn't have severity="positive"
    // We use the finding classification and content to determine
    const msStrengths = allFindings.filter(f =>
      f.detail.toLowerCase().includes("strong") ||
      f.detail.toLowerCase().includes("effective") ||
      f.detail.toLowerCase().includes("comprehensive") ||
      f.severity === "minor"
    );
    const msIssues = allFindings.filter(f => !msStrengths.includes(f));

    if (msStrengths.length > 0) {
      reportData.strengths = reportData.strengths.concat(msStrengths.map(s => ({
        title: s.title,
        detail: s.detail,
        claim_ids: s.claim_ids,
      })));
    }

    // Gaps from the dedicated gap summary
    const msGaps = extractMsGaps(msf);
    if (msGaps.length > 0) {
      reportData.gaps = reportData.gaps.concat(msGaps);
    }

    // Talking points from strategic implications
    const msTPs = extractMsImplications(msf);
    if (msTPs.length > 0) {
      reportData.talkingPoints = reportData.talkingPoints.concat(msTPs);
    }

    // Pages analysed
    const msPages = extractMsPagesAnalysed(msf);
    reportData.pagesAnalysed = reportData.pagesAnalysed.concat(msPages);

    // Documents accessed
    const msDocs = extractMsDocumentsAccessed(msf);
    if (msDocs.length > 0) {
      reportData.documentsAnalysed = (reportData.documentsAnalysed || []).concat(msDocs);
    }

    // Methodology
    if (!reportData.methodology) {
      reportData.methodology = buildMsMethodology(msf);
    }

    // Claims
    reportData.claims = reportData.claims.concat(msf.claims || []);

    // Site structure for treemap (from ms-crawl structure passed through)
    if (msf.site_structure) {
      reportData.sitemapData = msf.site_structure;
    }
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
  const stageNames = ["brief", "compete", "sitemap", "meeting", "ms_findings"];
  const stages = {};

  for (const stage of stageNames) {
    // Try multiple naming patterns
    const patterns = [
      `${slug}-${stage}-artefact.json`,
      `${slug}-${stage}.json`,
      `${company}-${stage}-artefact.json`,
      `${stage}-artefact.json`,
    ];

    // For ms_findings, also check ms-findings naming patterns
    if (stage === "ms_findings") {
      patterns.push(
        `${slug}-ms-findings-artefact.json`,
        `${company}-ms-findings-artefact.json`,
        `ms-findings-artefact.json`,
      );
    }

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
  extractMsFindings,
  extractMsGaps,
  extractMsImplications,
  extractMsPagesAnalysed,
  extractMsDocumentsAccessed,
  buildMsMethodology,
};
