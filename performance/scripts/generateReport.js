/**
 * EXCEL + CSV REPORT GENERATOR — Smart Budget Performance Tests
 * ==============================================================
 * Reads k6 summary JSON files from reports/ and generates:
 *   - reports/Load_Test_Report.xlsx  (formatted Excel with charts)
 *   - reports/results.csv            (enhanced summary CSV)
 *   - reports/graphs/                (chart data exports)
 *
 * Usage:
 *   node scripts/generateReport.js
 *   node scripts/generateReport.js --summary reports/full_load_summary_latest.json
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const ExcelJS = require('exceljs');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const ROOT         = path.resolve(__dirname, '..');
const REPORTS_DIR  = path.join(ROOT, 'reports');
const GRAPHS_DIR   = path.join(REPORTS_DIR, 'graphs');
const EXCEL_OUTPUT = path.join(REPORTS_DIR, 'Load_Test_Report.xlsx');
const CSV_OUTPUT   = path.join(REPORTS_DIR, 'results.csv');

// ---------------------------------------------------------------------------
// Ensure output directories exist
// ---------------------------------------------------------------------------
[REPORTS_DIR, GRAPHS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ---------------------------------------------------------------------------
// Load all summary JSON files
// ---------------------------------------------------------------------------
function loadSummaries() {
  const files = fs.readdirSync(REPORTS_DIR).filter((f) =>
    f.endsWith('_summary.json') || f.endsWith('_summary_latest.json')
  );

  const summaries = {};
  files.forEach((file) => {
    const key  = file.replace('_summary.json', '').replace('_summary_latest.json', '');
    const full = path.join(REPORTS_DIR, file);
    try {
      summaries[key] = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (e) {
      console.warn(`⚠ Could not parse ${file}: ${e.message}`);
    }
  });

  return summaries;
}

// ---------------------------------------------------------------------------
// Extract metric from k6 summary
// ---------------------------------------------------------------------------
function getMetric(summary, metricName, stat) {
  const metric = summary?.metrics?.[metricName];
  if (!metric) return 'N/A';
  if (metric.type === 'rate') return `${((metric.values?.rate || 0) * 100).toFixed(2)}%`;
  if (metric.type === 'counter') return metric.values?.count ?? 0;
  if (metric.type === 'gauge') return metric.values?.value ?? 0;
  // trend
  const val = metric.values?.[stat] ?? metric.values?.avg;
  return val !== undefined ? parseFloat(val.toFixed(2)) : 'N/A';
}

// ---------------------------------------------------------------------------
// Compute pass/fail per threshold
// ---------------------------------------------------------------------------
function computePassFail(summary) {
  const results = [];
  const metrics = summary?.metrics || {};

  Object.entries(metrics).forEach(([name, metric]) => {
    (metric.thresholds || []).forEach((t) => {
      results.push({
        metric: name,
        threshold: t.source,
        pass: !t.ok ? 'FAIL ✗' : 'PASS ✓',
      });
    });
  });

  return results;
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------
const BRAND_BLUE     = { argb: 'FF1E3A5F' };
const BRAND_GREEN    = { argb: 'FF10B981' };
const BRAND_RED      = { argb: 'FFEF4444' };
const BRAND_AMBER    = { argb: 'FFF59E0B' };
const HEADER_BG      = { argb: 'FF1E3A5F' };
const HEADER_FG      = { type: 'pattern', pattern: 'solid', fgColor: HEADER_BG };
const PASS_BG        = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
const FAIL_BG        = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
const ALT_ROW        = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

function styleHeaderRow(row, numCols) {
  row.height = 30;
  for (let c = 1; c <= numCols; c++) {
    const cell = row.getCell(c);
    cell.fill   = HEADER_FG;
    cell.font   = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11, name: 'Calibri' };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top:    { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
    };
  }
}

function styleDataRow(row, numCols, isAlt) {
  row.height = 22;
  for (let c = 1; c <= numCols; c++) {
    const cell = row.getCell(c);
    if (isAlt) cell.fill = ALT_ROW;
    cell.font      = { size: 10, name: 'Calibri' };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
    };
  }
}

// ---------------------------------------------------------------------------
// Build the Excel Workbook
// ---------------------------------------------------------------------------
async function buildExcelReport(summaries) {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Smart Budget Performance Framework';
  wb.created  = new Date();
  wb.modified = new Date();
  wb.title    = 'Smart Budget Load Test Report';
  wb.subject  = 'API Performance & Load Testing Results';

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 1: Executive Summary
  // ══════════════════════════════════════════════════════════════════════════
  const summary = wb.addWorksheet('Executive Summary', {
    properties: { tabColor: { argb: 'FF1E3A5F' } },
  });

  summary.mergeCells('A1:H1');
  const titleCell = summary.getCell('A1');
  titleCell.value      = '🚀 Smart Budget — Performance Load Test Report';
  titleCell.font       = { bold: true, size: 18, color: { argb: 'FF1E3A5F' }, name: 'Calibri' };
  titleCell.alignment  = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill       = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
  summary.getRow(1).height = 50;

  summary.mergeCells('A2:H2');
  const subCell = summary.getCell('A2');
  subCell.value     = `Generated: ${new Date().toLocaleString('en-IN')}  |  Base URL: http://localhost:5000  |  Framework: k6`;
  subCell.font      = { size: 10, color: { argb: 'FF64748B' }, name: 'Calibri' };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  summary.getRow(2).height = 25;

  summary.addRow([]);

  // Scenario overview table
  const scenarioData = [
    ['SCENARIO', 'VIRTUAL USERS', 'DURATION', 'PURPOSE', 'THRESHOLD P95', 'THRESHOLD P99', 'ERROR RATE LIMIT'],
    ['Smoke Test',   '10',    '1 min',   'Sanity check — basic functionality',   '< 1000 ms', '< 3000 ms', '< 1%'],
    ['Load Test',    '100',   '5 min',   'Normal production load',               '< 2000 ms', '< 5000 ms', '< 5%'],
    ['Stress Test',  '500',   '10 min',  'Beyond normal capacity — find limits',  '< 2000 ms', '< 5000 ms', '< 5%'],
    ['Spike Test',   '1000',  '2 min',   'Sudden traffic surge',                 '< 5000 ms', '< 10000 ms','< 10%'],
    ['Full Ramp',    '1000',  '14 min',  '0→100→300→500→1000→0 gradual ramp',    '< 2000 ms', '< 5000 ms', '< 5%'],
  ];

  scenarioData.forEach((rowData, idx) => {
    const row = summary.addRow(rowData);
    if (idx === 0) {
      styleHeaderRow(row, rowData.length);
    } else {
      styleDataRow(row, rowData.length, idx % 2 === 0);
      // Color code purpose column
      const purposeCell = row.getCell(4);
      purposeCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }
  });

  summary.columns = [
    { key: 'a', width: 16 },
    { key: 'b', width: 16 },
    { key: 'c', width: 12 },
    { key: 'd', width: 40 },
    { key: 'e', width: 16 },
    { key: 'f', width: 16 },
    { key: 'g', width: 18 },
    { key: 'h', width: 14 },
  ];

  summary.addRow([]);
  summary.addRow(['📋 API ENDPOINTS TESTED', '', '', '', '', '', '']);
  const apiHeader = summary.lastRow;
  apiHeader.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF1E3A5F' }, name: 'Calibri' };

  const apiData = [
    ['Method', 'Endpoint', 'Description', 'Auth Required'],
    ['POST', '/api/auth/register',        'User Registration',        'No'],
    ['POST', '/api/auth/login',           'User Login',               'No'],
    ['GET',  '/api/transactions',         'Get Transaction History',   'Yes (x-user-id)'],
    ['POST', '/api/transactions',         'Add Expense/Income',        'Yes (x-user-id)'],
    ['PUT',  '/api/transactions/:id',     'Edit Transaction',          'Yes (x-user-id)'],
    ['DELETE','/api/transactions/:id',    'Delete Transaction',        'Yes (x-user-id)'],
    ['GET',  '/api/budgets',              'Get Budget List',           'Yes (x-user-id)'],
    ['POST', '/api/budgets',              'Create/Update Budget',      'Yes (x-user-id)'],
    ['DELETE','/api/budgets/:id',         'Delete Budget',             'Yes (x-user-id)'],
    ['GET',  '/api/goals',               'Get Savings Goals',         'Yes (x-user-id)'],
    ['POST', '/api/goals',               'Create Savings Goal',       'Yes (x-user-id)'],
    ['PUT',  '/api/goals/:id',           'Update Goal Progress',      'Yes (x-user-id)'],
    ['DELETE','/api/goals/:id',          'Delete Savings Goal',       'Yes (x-user-id)'],
    ['POST', '/api/ai/chat',             'AI Financial Advisor Chat', 'Yes (x-user-id)'],
  ];

  apiData.forEach((rowData, idx) => {
    const row = summary.addRow(rowData);
    if (idx === 0) {
      styleHeaderRow(row, 4);
    } else {
      styleDataRow(row, 4, idx % 2 === 0);
      const methodCell = row.getCell(1);
      const method     = rowData[0];
      if (method === 'GET')    methodCell.font = { bold: true, color: { argb: 'FF3B82F6' }, name: 'Calibri', size: 10 };
      if (method === 'POST')   methodCell.font = { bold: true, color: { argb: 'FF10B981' }, name: 'Calibri', size: 10 };
      if (method === 'PUT')    methodCell.font = { bold: true, color: { argb: 'FFF59E0B' }, name: 'Calibri', size: 10 };
      if (method === 'DELETE') methodCell.font = { bold: true, color: { argb: 'FFEF4444' }, name: 'Calibri', size: 10 };
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 2: Detailed Metrics (one per summary file)
  // ══════════════════════════════════════════════════════════════════════════
  const metricsSheet = wb.addWorksheet('Detailed Metrics', {
    properties: { tabColor: { argb: 'FF10B981' } },
  });

  metricsSheet.mergeCells('A1:J1');
  const mTitle = metricsSheet.getCell('A1');
  mTitle.value     = '📊 Detailed Performance Metrics by Test Module';
  mTitle.font      = { bold: true, size: 16, color: { argb: 'FF1E3A5F' }, name: 'Calibri' };
  mTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  metricsSheet.getRow(1).height = 40;

  const metricHeaders = [
    'Test Module', 'Metric', 'Min (ms)', 'Avg (ms)', 'Median (ms)',
    'P90 (ms)', 'P95 (ms)', 'P99 (ms)', 'Max (ms)', 'Error Rate',
  ];

  metricsSheet.addRow([]);
  const mHeaderRow = metricsSheet.addRow(metricHeaders);
  styleHeaderRow(mHeaderRow, metricHeaders.length);

  // Process each summary file
  const MODULE_METRICS = {
    'login':          'login_duration_ms',
    'registration':   'registration_duration_ms',
    'dashboard':      'dashboard_load_ms',
    'expense':        'add_expense_ms',
    'budget':         'budget_op_ms',
    'ai_advisor':     'ai_response_ms',
    'full_load':      'all_api_response_ms',
  };

  let rowIdx = 0;
  Object.entries(summaries).forEach(([moduleName, data]) => {
    const metricKey   = MODULE_METRICS[moduleName] || 'http_req_duration';
    const httpMetric  = data?.metrics?.['http_req_duration'];
    const customMetric= data?.metrics?.[metricKey];
    const m           = customMetric || httpMetric;
    const errRate     = data?.metrics?.['http_req_failed'];

    if (!m) return;

    const v    = m.values || {};
    const eVal = errRate?.values?.rate;

    const rowData = [
      moduleName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      metricKey,
      v.min   !== undefined ? parseFloat(v.min.toFixed(2))    : 'N/A',
      v.avg   !== undefined ? parseFloat(v.avg.toFixed(2))    : 'N/A',
      v.med   !== undefined ? parseFloat(v.med.toFixed(2))    : 'N/A',
      v['p(90)'] !== undefined ? parseFloat(v['p(90)'].toFixed(2)) : 'N/A',
      v['p(95)'] !== undefined ? parseFloat(v['p(95)'].toFixed(2)) : 'N/A',
      v['p(99)'] !== undefined ? parseFloat(v['p(99)'].toFixed(2)) : 'N/A',
      v.max   !== undefined ? parseFloat(v.max.toFixed(2))    : 'N/A',
      eVal    !== undefined ? `${(eVal * 100).toFixed(2)}%`  : 'N/A',
    ];

    const row = metricsSheet.addRow(rowData);
    styleDataRow(row, metricHeaders.length, rowIdx % 2 === 0);
    rowIdx++;

    // Highlight P95 if > 2000ms (SLA breach)
    const p95Cell = row.getCell(7);
    const p95Val  = v['p(95)'];
    if (p95Val !== undefined && p95Val > 2000) {
      p95Cell.fill = FAIL_BG;
      p95Cell.font = { bold: true, color: BRAND_RED, name: 'Calibri', size: 10 };
    } else if (p95Val !== undefined) {
      p95Cell.fill = PASS_BG;
      p95Cell.font = { bold: true, color: { argb: 'FF065F46' }, name: 'Calibri', size: 10 };
    }

    // Highlight error rate
    const errCell = row.getCell(10);
    if (eVal !== undefined && eVal > 0.05) {
      errCell.fill = FAIL_BG;
      errCell.font = { bold: true, color: BRAND_RED, name: 'Calibri', size: 10 };
    }
  });

  metricsSheet.columns = [
    { width: 22 }, { width: 28 }, { width: 12 }, { width: 12 },
    { width: 14 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 14 },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 3: Pass / Fail Results
  // ══════════════════════════════════════════════════════════════════════════
  const pfSheet = wb.addWorksheet('Pass-Fail Results', {
    properties: { tabColor: { argb: 'FFEF4444' } },
  });

  pfSheet.mergeCells('A1:E1');
  const pfTitle = pfSheet.getCell('A1');
  pfTitle.value     = '✅ Threshold Pass / Fail Analysis';
  pfTitle.font      = { bold: true, size: 16, color: { argb: 'FF1E3A5F' }, name: 'Calibri' };
  pfTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  pfSheet.getRow(1).height = 40;

  pfSheet.addRow([]);
  const pfHeaders = ['Test Module', 'Metric', 'Threshold', 'Result', 'Notes'];
  const pfHeaderRow = pfSheet.addRow(pfHeaders);
  styleHeaderRow(pfHeaderRow, pfHeaders.length);

  let pfIdx  = 0;
  let passes = 0;
  let fails  = 0;

  Object.entries(summaries).forEach(([moduleName, data]) => {
    const pfResults = computePassFail(data);
    pfResults.forEach(({ metric, threshold, pass }) => {
      const isPassed = pass.includes('PASS');
      const row = pfSheet.addRow([
        moduleName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        metric,
        threshold,
        pass,
        isPassed ? 'Within SLA threshold' : '⚠ Exceeds SLA threshold — investigate',
      ]);

      styleDataRow(row, pfHeaders.length, pfIdx % 2 === 0);

      const resultCell = row.getCell(4);
      if (isPassed) {
        resultCell.fill = PASS_BG;
        resultCell.font = { bold: true, color: { argb: 'FF065F46' }, name: 'Calibri', size: 10 };
        passes++;
      } else {
        resultCell.fill = FAIL_BG;
        resultCell.font = { bold: true, color: BRAND_RED, name: 'Calibri', size: 10 };
        fails++;
      }

      pfIdx++;
    });
  });

  // Summary stats at bottom
  pfSheet.addRow([]);
  pfSheet.addRow(['', '', '', 'TOTAL PASS', passes.toString()]);
  pfSheet.addRow(['', '', '', 'TOTAL FAIL', fails.toString()]);
  pfSheet.addRow(['', '', '', 'PASS RATE', `${((passes / Math.max(1, passes + fails)) * 100).toFixed(1)}%`]);

  const pfTotalPass = pfSheet.lastRow.getCell(4);
  pfTotalPass.font = { bold: true, size: 11, name: 'Calibri' };

  pfSheet.columns = [
    { width: 22 }, { width: 30 }, { width: 30 }, { width: 16 }, { width: 42 },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 4: HTTP Request Statistics
  // ══════════════════════════════════════════════════════════════════════════
  const httpSheet = wb.addWorksheet('HTTP Statistics', {
    properties: { tabColor: { argb: 'FF8B5CF6' } },
  });

  httpSheet.mergeCells('A1:G1');
  const httpTitle = httpSheet.getCell('A1');
  httpTitle.value     = '🌐 HTTP Request Statistics';
  httpTitle.font      = { bold: true, size: 16, color: { argb: 'FF1E3A5F' }, name: 'Calibri' };
  httpTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  httpSheet.getRow(1).height = 40;

  httpSheet.addRow([]);
  const httpHeaders = ['Test Module', 'Total Requests', 'Successful', 'Failed', 'Req/s (avg)', 'Data Sent (KB)', 'Data Received (KB)'];
  const httpHeaderRow = httpSheet.addRow(httpHeaders);
  styleHeaderRow(httpHeaderRow, httpHeaders.length);

  let httpIdx = 0;
  Object.entries(summaries).forEach(([moduleName, data]) => {
    const reqs     = data?.metrics?.['http_reqs'];
    const failed   = data?.metrics?.['http_req_failed'];
    const dataSent = data?.metrics?.['data_sent'];
    const dataRecv = data?.metrics?.['data_received'];

    const total    = reqs?.values?.count || 0;
    const failRate = failed?.values?.rate || 0;
    const failedN  = Math.round(total * failRate);
    const rps      = reqs?.values?.rate || 0;
    const sentKB   = ((dataSent?.values?.count || 0) / 1024).toFixed(2);
    const recvKB   = ((dataRecv?.values?.count || 0) / 1024).toFixed(2);

    const row = httpSheet.addRow([
      moduleName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      total,
      total - failedN,
      failedN,
      rps.toFixed(2),
      sentKB,
      recvKB,
    ]);

    styleDataRow(row, httpHeaders.length, httpIdx % 2 === 0);

    // Color the failed count
    const failCell = row.getCell(4);
    if (failedN > 0) {
      failCell.fill = FAIL_BG;
      failCell.font = { bold: true, color: BRAND_RED, name: 'Calibri', size: 10 };
    }

    httpIdx++;
  });

  httpSheet.columns = [
    { width: 22 }, { width: 18 }, { width: 15 }, { width: 12 },
    { width: 14 }, { width: 18 }, { width: 22 },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 5: Ramp Stages Reference
  // ══════════════════════════════════════════════════════════════════════════
  const rampSheet = wb.addWorksheet('Ramp Stages', {
    properties: { tabColor: { argb: 'FFF59E0B' } },
  });

  rampSheet.mergeCells('A1:D1');
  const rampTitle = rampSheet.getCell('A1');
  rampTitle.value     = '📈 Load Ramp-Up / Ramp-Down Stage Configuration';
  rampTitle.font      = { bold: true, size: 16, color: { argb: 'FF1E3A5F' }, name: 'Calibri' };
  rampTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  rampSheet.getRow(1).height = 40;

  rampSheet.addRow([]);
  const rampHeaders = ['Stage', 'Duration', 'Target Users', 'Description'];
  const rampHeaderRow = rampSheet.addRow(rampHeaders);
  styleHeaderRow(rampHeaderRow, rampHeaders.length);

  const rampData = [
    [1,  '1 min',  100,  'Ramp up from 0 to 100 users'],
    [2,  '2 min',  100,  'Hold at 100 users — baseline load'],
    [3,  '1 min',  300,  'Ramp up to 300 users'],
    [4,  '2 min',  300,  'Hold at 300 users — moderate load'],
    [5,  '1 min',  500,  'Ramp up to 500 users'],
    [6,  '2 min',  500,  'Hold at 500 users — stress load'],
    [7,  '1 min',  1000, 'Ramp up to 1000 users (spike)'],
    [8,  '2 min',  1000, 'Hold at 1000 users — peak/spike test'],
    [9,  '2 min',  0,    'Ramp down to 0 — system recovery'],
  ];

  rampData.forEach((rowData, idx) => {
    const row = rampSheet.addRow(rowData);
    styleDataRow(row, 4, idx % 2 === 0);

    const userCell = row.getCell(3);
    if (rowData[2] >= 1000) {
      userCell.fill = FAIL_BG;
      userCell.font = { bold: true, color: BRAND_RED, name: 'Calibri', size: 10 };
    } else if (rowData[2] >= 500) {
      userCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      userCell.font = { bold: true, color: BRAND_AMBER, name: 'Calibri', size: 10 };
    } else {
      userCell.fill = PASS_BG;
      userCell.font = { bold: true, color: { argb: 'FF065F46' }, name: 'Calibri', size: 10 };
    }
  });

  rampSheet.columns = [{ width: 10 }, { width: 12 }, { width: 16 }, { width: 45 }];

  // ══════════════════════════════════════════════════════════════════════════
  // Save
  // ══════════════════════════════════════════════════════════════════════════
  await wb.xlsx.writeFile(EXCEL_OUTPUT);
  console.log(`✅ Excel report saved: ${EXCEL_OUTPUT}`);
}

// ---------------------------------------------------------------------------
// Write enhanced CSV summary
// ---------------------------------------------------------------------------
function writeCsvSummary(summaries) {
  const rows = [
    ['Test Module', 'Total Requests', 'Avg (ms)', 'P50 (ms)', 'P90 (ms)', 'P95 (ms)', 'P99 (ms)', 'Max (ms)', 'Error Rate %', 'Req/s'],
  ];

  Object.entries(summaries).forEach(([moduleName, data]) => {
    const m    = data?.metrics?.['http_req_duration'];
    const reqs = data?.metrics?.['http_reqs'];
    const err  = data?.metrics?.['http_req_failed'];

    if (!m) return;
    const v = m.values || {};

    rows.push([
      moduleName.replace(/_/g, ' '),
      reqs?.values?.count || 0,
      v.avg           !== undefined ? v.avg.toFixed(2)         : 'N/A',
      v.med           !== undefined ? v.med.toFixed(2)         : 'N/A',
      v['p(90)']      !== undefined ? v['p(90)'].toFixed(2)    : 'N/A',
      v['p(95)']      !== undefined ? v['p(95)'].toFixed(2)    : 'N/A',
      v['p(99)']      !== undefined ? v['p(99)'].toFixed(2)    : 'N/A',
      v.max           !== undefined ? v.max.toFixed(2)         : 'N/A',
      err?.values?.rate !== undefined ? (err.values.rate * 100).toFixed(2) : 'N/A',
      reqs?.values?.rate !== undefined ? reqs.values.rate.toFixed(2)       : 'N/A',
    ]);
  });

  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');

  // Append to existing CSV or create new
  const header = rows[0].map((v) => `"${v}"`).join(',');
  const body   = rows.slice(1).map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');

  const existing = fs.existsSync(CSV_OUTPUT) ? fs.readFileSync(CSV_OUTPUT, 'utf8') : '';
  if (!existing.includes(header)) {
    fs.writeFileSync(CSV_OUTPUT, csv + '\n', 'utf8');
  } else {
    fs.appendFileSync(CSV_OUTPUT, body + '\n', 'utf8');
  }

  console.log(`✅ CSV summary saved: ${CSV_OUTPUT}`);
}

// ---------------------------------------------------------------------------
// Write graph data JSON (for charting tools)
// ---------------------------------------------------------------------------
function writeGraphData(summaries) {
  const graphData = {
    generated:   new Date().toISOString(),
    modules:     [],
    rampStages: [
      { stage: 1, users: 100,  duration: '1m',  label: 'Ramp to 100' },
      { stage: 2, users: 100,  duration: '2m',  label: 'Hold 100' },
      { stage: 3, users: 300,  duration: '1m',  label: 'Ramp to 300' },
      { stage: 4, users: 300,  duration: '2m',  label: 'Hold 300' },
      { stage: 5, users: 500,  duration: '1m',  label: 'Ramp to 500' },
      { stage: 6, users: 500,  duration: '2m',  label: 'Hold 500' },
      { stage: 7, users: 1000, duration: '1m',  label: 'Spike to 1000' },
      { stage: 8, users: 1000, duration: '2m',  label: 'Hold 1000' },
      { stage: 9, users: 0,    duration: '2m',  label: 'Ramp Down' },
    ],
  };

  Object.entries(summaries).forEach(([moduleName, data]) => {
    const m   = data?.metrics?.['http_req_duration']?.values || {};
    const err = data?.metrics?.['http_req_failed']?.values || {};
    const req = data?.metrics?.['http_reqs']?.values || {};

    graphData.modules.push({
      name:         moduleName,
      avgMs:        parseFloat((m.avg || 0).toFixed(2)),
      p95Ms:        parseFloat((m['p(95)'] || 0).toFixed(2)),
      p99Ms:        parseFloat((m['p(99)'] || 0).toFixed(2)),
      maxMs:        parseFloat((m.max || 0).toFixed(2)),
      errorRate:    parseFloat(((err.rate || 0) * 100).toFixed(2)),
      requestTotal: req.count || 0,
      rps:          parseFloat((req.rate || 0).toFixed(2)),
    });
  });

  const graphFile = path.join(GRAPHS_DIR, 'performance_data.json');
  fs.writeFileSync(graphFile, JSON.stringify(graphData, null, 2), 'utf8');
  console.log(`✅ Graph data saved: ${graphFile}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('\n🔄 Smart Budget — Generating Performance Reports...\n');

  const summaries = loadSummaries();
  const count     = Object.keys(summaries).length;

  if (count === 0) {
    console.log('⚠  No summary JSON files found in reports/');
    console.log('   Run at least one k6 test first:');
    console.log('   k6 run tests/loginTest.js');
    console.log('   Then re-run: node scripts/generateReport.js\n');

    // Create a demo report with placeholder data for documentation
    const demoSummaries = { demo_placeholder: {
      metrics: {
        http_req_duration: {
          type: 'trend',
          values: { min: 45, avg: 185, med: 162, max: 2340, 'p(90)': 290, 'p(95)': 420, 'p(99)': 890 },
          thresholds: [{ source: 'p(95)<2000', ok: true }],
        },
        http_req_failed: {
          type: 'rate',
          values: { rate: 0.012, passes: 1, fails: 0 },
          thresholds: [{ source: 'rate<0.05', ok: true }],
        },
        http_reqs: { type: 'counter', values: { count: 1240, rate: 4.13 } },
        data_sent:     { type: 'counter', values: { count: 204800 } },
        data_received: { type: 'counter', values: { count: 819200 } },
      },
    } };
    await buildExcelReport(demoSummaries);
    writeCsvSummary(demoSummaries);
    writeGraphData(demoSummaries);
  } else {
    console.log(`📁 Found ${count} summary file(s): ${Object.keys(summaries).join(', ')}\n`);
    await buildExcelReport(summaries);
    writeCsvSummary(summaries);
    writeGraphData(summaries);
  }

  console.log('\n🎉 All reports generated successfully!');
  console.log(`   📊 Excel: ${EXCEL_OUTPUT}`);
  console.log(`   📄 CSV:   ${CSV_OUTPUT}`);
  console.log(`   📈 Graphs: ${GRAPHS_DIR}\n`);
}

main().catch((err) => {
  console.error('❌ Report generation failed:', err.message);
  process.exit(1);
});
