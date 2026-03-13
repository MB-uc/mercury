/**
 * Mercury XLSX Renderer — exports Mercury report data to a branded Excel workbook.
 *
 * Sheets produced (if data is available):
 *   1. Cover          — report metadata and summary stats
 *   2. Site structure — directory tree of sitemapData, one row per page
 *   3. Findings       — gaps table with priority, section, and description
 *   4. Talking points — strategic implications / priorities
 *   5. Pages analysed — evidence inventory
 *   6. Benchmarks     — Connect.IQ benchmark data (if present)
 *
 * Usage:
 *   const MX = require('./mercury-xlsx.js');
 *   await MX.build(reportData, './output/company-ms-findings.xlsx');
 */

const ExcelJS = require('exceljs');

// ============================================================
// BRAND COLOURS (Excel ARGB format — no leading #)
// ============================================================

const C = {
  LICORICE:     'FF12061A',
  FLORAL_WHITE: 'FFF7F6EE',
  ROSE:         'FFFF006F',
  AQUAMARINE:   'FF00FFC9',
  LEMON_LIME:   'FFEEFF00',
  BLUE:         'FF0068FF',
  ORANGE:       'FF6500FF',  // corrected: FF prefix + hex
  GREEN:        'FF00FF00',
  WHITE:        'FFFFFFFF',
  MEDIUM:       'FF999999',
  HIGH_RED:     'FFCC3333',
  MED_AMBER:    'FFE8A317',
  LOW_GREEN:    'FF27AE60',
  LIGHT_BG:     'FFF5F5F5',
  ALT_ROW:      'FFF0F0F0',
};

// Section colours for depth-1 nodes in site tree
const SECTION_COLOURS = [
  'FFFF006F', // Rose
  'FF0068FF', // Blue
  'FF00FFC9', // Aquamarine
  'FFEEFF00', // Lemon lime
  'FFFF6500', // Orange
  'FF00FF00', // Green
  'FF9B59B6', // Purple
  'FFE67E22', // Amber
];

// ============================================================
// HELPERS
// ============================================================

function applyHeaderStyle(cell, opts = {}) {
  cell.font = { name: 'Arial', bold: true, color: { argb: C.FLORAL_WHITE }, size: opts.size || 10 };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.bg || C.LICORICE } };
  cell.alignment = { vertical: 'middle', horizontal: opts.align || 'left', wrapText: true };
  cell.border = {
    bottom: { style: 'thin', color: { argb: C.MEDIUM } },
  };
}

function applyDataStyle(cell, opts = {}) {
  cell.font = { name: 'Arial', size: opts.size || 9, bold: opts.bold || false, color: { argb: opts.color || C.LICORICE } };
  cell.alignment = { vertical: 'top', horizontal: opts.align || 'left', wrapText: true };
  if (opts.fill) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill } };
  }
}

function applyAltRow(row, isAlt) {
  if (!isAlt) return;
  row.eachCell({ includeEmpty: false }, cell => {
    if (!cell.fill || cell.fill.fgColor?.argb === C.WHITE || !cell.fill.fgColor) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.ALT_ROW } };
    }
  });
}

function priorityColour(priority) {
  if (!priority) return C.MEDIUM;
  const p = String(priority).toLowerCase();
  if (p === 'high' || p === 'significant') return C.HIGH_RED;
  if (p === 'medium' || p === 'moderate') return C.MED_AMBER;
  return C.LOW_GREEN;
}

// Import normalisePriority from adapter to avoid duplicating enum logic
const { normalisePriority } = require('./mercury-adapter');

function severityLabel(severity) {
  return normalisePriority(severity);
}

// ============================================================
// SHEET BUILDERS
// ============================================================

/**
 * Sheet 1: Cover — report metadata
 */
function buildCoverSheet(wb, data) {
  const ws = wb.addWorksheet('Cover');
  ws.columns = [
    { width: 24 },
    { width: 60 },
  ];

  // Title block
  const titleRow = ws.addRow([data.title || 'Mercury Report', '']);
  titleRow.getCell(1).font = { name: 'Arial', bold: true, size: 16, color: { argb: C.LICORICE } };
  titleRow.getCell(1).alignment = { vertical: 'middle' };
  ws.mergeCells(`A${titleRow.number}:B${titleRow.number}`);

  const subtitleRow = ws.addRow([data.subtitle || '', '']);
  subtitleRow.getCell(1).font = { name: 'Arial', size: 12, color: { argb: C.ROSE.replace('FF', '') } };
  ws.mergeCells(`A${subtitleRow.number}:B${subtitleRow.number}`);

  ws.addRow([]);

  // Meta rows
  const metaRows = [
    ['Date', data.date || ''],
    ['Domain', data.thirdLine ? data.thirdLine.replace('Domain: ', '') : ''],
    ...(data.meta || []),
  ].filter(([, v]) => v);

  for (const [label, value] of metaRows) {
    const row = ws.addRow([label, value]);
    row.getCell(1).font = { name: 'Arial', bold: true, size: 9, color: { argb: C.MEDIUM } };
    row.getCell(2).font = { name: 'Arial', size: 9 };
    row.height = 18;
  }

  ws.addRow([]);

  // Summary counts
  const summaryHeader = ws.addRow(['Summary', '']);
  summaryHeader.getCell(1).font = { name: 'Arial', bold: true, size: 10, color: { argb: C.LICORICE } };
  ws.mergeCells(`A${summaryHeader.number}:B${summaryHeader.number}`);

  const counts = [
    ['Gaps identified', (data.gaps || []).length],
    ['Talking points', (data.talkingPoints || []).length],
    ['Pages analysed', (data.pagesAnalysed || []).length],
    ['Claims', (data.claims || []).length],
  ];

  for (const [label, value] of counts) {
    const row = ws.addRow([label, value]);
    row.getCell(1).font = { name: 'Arial', size: 9 };
    row.getCell(2).font = { name: 'Arial', bold: true, size: 9 };
    row.height = 18;
  }

  ws.addRow([]);

  // Methodology note
  if (data.methodology) {
    const mRow = ws.addRow(['Methodology', data.methodology]);
    mRow.getCell(1).font = { name: 'Arial', bold: true, size: 9, color: { argb: C.MEDIUM } };
    mRow.getCell(2).font = { name: 'Arial', size: 9, italic: true, color: { argb: C.MEDIUM } };
    mRow.getCell(2).alignment = { wrapText: true, vertical: 'top' };
    mRow.height = 60;
  }

  // IDX credit in footer area
  ws.addRow([]);
  const creditRow = ws.addRow(['Prepared by IDX using the Mercury platform', '']);
  creditRow.getCell(1).font = { name: 'Arial', size: 8, italic: true, color: { argb: C.MEDIUM } };
  ws.mergeCells(`A${creditRow.number}:B${creditRow.number}`);
}

/**
 * Flatten a sitemapData tree into rows for Excel.
 * Returns: [{ depth, path, name, label, url, description, pageType, presenceQuality, wordCount }]
 */
function flattenTree(node, depth, parentPath, rows, sectionColourMap) {
  if (!node) return;

  const name = node.name || node.label || '';
  const label = node.label || node.name || '';
  const pathStr = parentPath ? `${parentPath} / ${label}` : label;

  // Assign section colour for depth-1 nodes
  if (depth === 1 && !sectionColourMap.has(label)) {
    const colIdx = sectionColourMap.size % SECTION_COLOURS.length;
    sectionColourMap.set(label, SECTION_COLOURS[colIdx]);
  }
  const sectionColour = depth === 0 ? C.LICORICE
    : depth === 1 ? sectionColourMap.get(label)
    : sectionColourMap.get(getSection1Ancestor(node, parentPath)) || null;

  rows.push({
    depth,
    path: pathStr,
    name,
    label,
    url:             node.url || '',
    description:     node.description || '',
    pageType:        node.page_type || node.playbook_page_type || '',
    presenceQuality: node.presence_quality || '',
    wordCount:       node.word_count || '',
    sectionColour,
  });

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      flattenTree(child, depth + 1, depth === 0 ? label : pathStr, rows, sectionColourMap);
    }
  }
}

function getSection1Ancestor(node, parentPath) {
  // Infer the depth-1 section from the path string
  if (!parentPath) return '';
  return parentPath.split(' / ')[0] || '';
}

/**
 * Sheet 2: Site structure — directory tree
 */
function buildSiteStructureSheet(wb, data) {
  if (!data.sitemapData) return;

  const ws = wb.addWorksheet('Site structure');
  ws.columns = [
    { key: 'indent',   width: 4  },  // A — visual indent (blank, repeated)
    { key: 'label',    width: 40 },  // B — page name
    { key: 'url',      width: 50 },  // C — URL
    { key: 'pageType', width: 28 },  // D — Playbook page type
    { key: 'quality',  width: 20 },  // E — presence quality
    { key: 'words',    width: 12 },  // F — word count
    { key: 'desc',     width: 50 },  // G — description
  ];

  // Column headers
  const headerRow = ws.addRow(['', 'Page / section', 'URL', 'Page type', 'Presence quality', 'Words', 'Description']);
  ['A','B','C','D','E','F','G'].forEach(col => {
    applyHeaderStyle(ws.getCell(`${col}${headerRow.number}`));
  });
  headerRow.height = 22;
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  // Flatten tree
  const rows = [];
  const sectionColourMap = new Map();
  flattenTree(data.sitemapData, 0, '', rows, sectionColourMap);

  // Write rows
  rows.forEach((item, idx) => {
    // Indent column: fill A cells with depth indicator
    const indent = '  '.repeat(item.depth);
    const connector = item.depth === 0 ? '' : (item.depth === 1 ? '├─ ' : '│  '.repeat(item.depth - 1) + '└─ ');

    const excelRow = ws.addRow([
      '',                              // A — left gutter
      indent + connector + item.label, // B — name with visual indent
      item.url,                        // C
      item.pageType,                   // D
      item.presenceQuality,            // E
      item.wordCount || '',            // F
      item.description,               // G
    ]);

    excelRow.height = 18;

    // Style col A as colour bar for the section
    const cellA = excelRow.getCell(1);
    if (item.sectionColour) {
      cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: item.sectionColour } };
    }

    // Style label cell by depth
    const cellB = excelRow.getCell(2);
    if (item.depth === 0) {
      cellB.font = { name: 'Arial', bold: true, size: 10, color: { argb: C.LICORICE } };
      cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.LIGHT_BG } };
    } else if (item.depth === 1) {
      cellB.font = { name: 'Arial', bold: true, size: 9 };
    } else {
      cellB.font = { name: 'Arial', size: 9 };
    }

    // URL as hyperlink
    const cellC = excelRow.getCell(3);
    if (item.url) {
      cellC.value = { text: item.url, hyperlink: item.url };
      cellC.font = { name: 'Arial', size: 9, color: { argb: 'FF0068FF' }, underline: true };
    } else {
      applyDataStyle(cellC, { size: 9, color: C.MEDIUM });
    }

    applyDataStyle(excelRow.getCell(4), { size: 9 });
    
    // Presence quality with colour
    const cellE = excelRow.getCell(5);
    applyDataStyle(cellE, { size: 9 });
    if (item.presenceQuality === 'absent') {
      cellE.font = { name: 'Arial', size: 9, color: { argb: C.HIGH_RED }, bold: true };
    } else if (item.presenceQuality && item.presenceQuality.startsWith('present_')) {
      cellE.font = { name: 'Arial', size: 9, color: { argb: C.MED_AMBER } };
    } else if (item.presenceQuality === 'present') {
      cellE.font = { name: 'Arial', size: 9, color: { argb: C.LOW_GREEN } };
    }

    applyDataStyle(excelRow.getCell(6), { size: 9, align: 'right' });
    applyDataStyle(excelRow.getCell(7), { size: 9, color: C.MEDIUM });

    // Alt row on body rows
    if (item.depth > 0) applyAltRow(excelRow, idx % 2 === 0);
  });

  // Summary row
  ws.addRow([]);
  const totalRow = ws.addRow(['', `${rows.length - 1} pages across ${(data.sitemapData.children || []).length} sections`, '', '', '', '', '']);
  totalRow.getCell(2).font = { name: 'Arial', size: 8, italic: true, color: { argb: C.MEDIUM } };
}

/**
 * Sheet 3: Findings / gaps
 */
function buildFindingsSheet(wb, data) {
  if (!data.gaps || data.gaps.length === 0) return;

  const ws = wb.addWorksheet('Findings');
  ws.columns = [
    { width: 6  },  // A — priority colour bar
    { width: 8  },  // B — priority label
    { width: 50 },  // C — gap description
    { width: 30 },  // D — section / applies to
    { width: 60 },  // E — detail
  ];

  const headerRow = ws.addRow(['', 'Priority', 'Finding', 'Section', 'Detail']);
  ['A','B','C','D','E'].forEach(col => applyHeaderStyle(ws.getCell(`${col}${headerRow.number}`)));
  headerRow.height = 22;
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  data.gaps.forEach((g, idx) => {
    const priority = severityLabel(g.priority || g.severity);
    const colour = priorityColour(priority);

    const excelRow = ws.addRow([
      '',
      priority,
      g.gap || g.description || '',
      g.applies || g.section || '',
      g.detail || '',
    ]);
    excelRow.height = 36;

    // Colour bar
    excelRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colour } };

    // Priority label
    const cellB = excelRow.getCell(2);
    cellB.font = { name: 'Arial', bold: true, size: 9, color: { argb: colour } };
    cellB.alignment = { vertical: 'top' };

    applyDataStyle(excelRow.getCell(3), { size: 9, bold: true });
    applyDataStyle(excelRow.getCell(4), { size: 9, color: C.MEDIUM });
    applyDataStyle(excelRow.getCell(5), { size: 9 });

    excelRow.getCell(3).alignment = { wrapText: true, vertical: 'top' };
    excelRow.getCell(5).alignment = { wrapText: true, vertical: 'top' };

    applyAltRow(excelRow, idx % 2 !== 0);
  });
}

/**
 * Sheet 4: Talking points / strategic implications
 */
function buildTalkingPointsSheet(wb, data) {
  if (!data.talkingPoints || data.talkingPoints.length === 0) return;

  const ws = wb.addWorksheet('Talking points');
  ws.columns = [
    { width: 6  },  // A — marker
    { width: 50 },  // B — title
    { width: 80 },  // C — detail
  ];

  const headerRow = ws.addRow(['', 'Point', 'Detail']);
  ['A','B','C'].forEach(col => applyHeaderStyle(ws.getCell(`${col}${headerRow.number}`)));
  headerRow.height = 22;
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  data.talkingPoints.forEach((tp, idx) => {
    const excelRow = ws.addRow([
      '',
      tp.title || '',
      tp.detail || '',
    ]);
    excelRow.height = 40;

    excelRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.ROSE } };
    applyDataStyle(excelRow.getCell(2), { size: 9, bold: true });
    excelRow.getCell(2).alignment = { wrapText: true, vertical: 'top' };
    applyDataStyle(excelRow.getCell(3), { size: 9 });
    excelRow.getCell(3).alignment = { wrapText: true, vertical: 'top' };

    applyAltRow(excelRow, idx % 2 !== 0);
  });
}

/**
 * Sheet 5: Pages analysed
 */
function buildPagesSheet(wb, data) {
  if (!data.pagesAnalysed || data.pagesAnalysed.length === 0) return;

  const ws = wb.addWorksheet('Pages analysed');

  // Determine whether rows are arrays or objects.
  // Guard: find first non-null entry to detect shape, or default to array format.
  const sample = data.pagesAnalysed.find(r => r != null);
  const isArray = sample == null || Array.isArray(sample);

  if (isArray) {
    ws.columns = [{ width: 60 }, { width: 20 }, { width: 30 }];
    const hRow = ws.addRow(['URL / source', 'Type', 'Claims supported']);
    ['A','B','C'].forEach(col => applyHeaderStyle(ws.getCell(`${col}${hRow.number}`)));
    hRow.height = 22;
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    data.pagesAnalysed.forEach((row, idx) => {
      const excelRow = ws.addRow(row.slice(0, 3));
      excelRow.height = 18;
      excelRow.eachCell(cell => applyDataStyle(cell, { size: 9 }));
      applyAltRow(excelRow, idx % 2 !== 0);
    });
  } else {
    ws.columns = [{ width: 60 }, { width: 20 }];
    const hRow = ws.addRow(['URL / source', 'Type']);
    ['A','B'].forEach(col => applyHeaderStyle(ws.getCell(`${col}${hRow.number}`)));
    hRow.height = 22;
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    data.pagesAnalysed.forEach((page, idx) => {
      const excelRow = ws.addRow([page.url || page.source || '', page.type || '']);
      excelRow.height = 18;
      excelRow.eachCell(cell => applyDataStyle(cell, { size: 9 }));
      applyAltRow(excelRow, idx % 2 !== 0);
    });
  }
}

/**
 * Sheet 6: Benchmarks (optional)
 */
function buildBenchmarksSheet(wb, data) {
  if (!data.benchmarks || !data.benchmarks.rows) return;

  const ws = wb.addWorksheet('Benchmarks');
  const headers = data.benchmarks.headers || ['Category', 'Median', 'P75', 'Estimate', 'Assessment'];
  ws.columns = headers.map((h, i) => ({ width: i === 0 ? 30 : 16 }));

  const hRow = ws.addRow(headers);
  headers.forEach((h, i) => applyHeaderStyle(ws.getCell(hRow.getCell(i + 1).address)));
  hRow.height = 22;
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  data.benchmarks.rows.forEach((row, idx) => {
    const excelRow = ws.addRow(Array.isArray(row) ? row : Object.values(row));
    excelRow.height = 18;
    excelRow.eachCell(cell => applyDataStyle(cell, { size: 9 }));
    applyAltRow(excelRow, idx % 2 !== 0);
  });
}

// ============================================================
// MAIN BUILD
// ============================================================

/**
 * Build a Mercury Excel workbook from reportData.
 *
 * @param {object} reportData - Standard Mercury reportData shape
 * @param {string} outputPath - File path for the .xlsx output
 */
async function build(reportData, outputPath) {
  const wb = new ExcelJS.Workbook();

  wb.creator = 'IDX Mercury';
  wb.lastModifiedBy = 'IDX Mercury';
  wb.created = new Date();
  wb.modified = new Date();

  buildCoverSheet(wb, reportData);
  buildSiteStructureSheet(wb, reportData);
  buildFindingsSheet(wb, reportData);
  buildTalkingPointsSheet(wb, reportData);
  buildPagesSheet(wb, reportData);
  buildBenchmarksSheet(wb, reportData);

  await wb.xlsx.writeFile(outputPath);
  console.log(`Mercury Excel saved: ${outputPath}`);
  return outputPath;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  build,
  buildCoverSheet,
  buildSiteStructureSheet,
  buildFindingsSheet,
  buildTalkingPointsSheet,
  buildPagesSheet,
  buildBenchmarksSheet,
};
