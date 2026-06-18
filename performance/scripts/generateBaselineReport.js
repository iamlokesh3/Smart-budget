/**
 * BASELINE LOAD TEST — Excel Report Generator
 * =============================================
 * Reads: reports/baseline_summary.json  (written by k6 handleSummary)
 * Writes: reports/Baseline_Load_Test_Report.xlsx
 *
 * Report Sheets:
 *   1. Executive Summary   — RPS, avg/min/max response time, error rate
 *   2. API Breakdown       — Per-endpoint metrics table
 *   3. Test Configuration  — 100 VUs × 1 min setup details
 *   4. Pass / Fail Status  — Threshold evaluation with color coding
 *
 * Usage:
 *   node scripts/generateBaselineReport.js
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const ExcelJS = require('exceljs');

// ─── Paths ───────────────────────────────────────────────────────────────────
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const SUMMARY_JSON= path.join(REPORTS_DIR, 'baseline_summary.json');
const OUTPUT_XLSX = path.join(REPORTS_DIR, 'Baseline_Load_Test_Report.xlsx');

// Ensure reports dir exists
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

// ─── Load k6 Summary ─────────────────────────────────────────────────────────
function loadSummary() {
  if (!fs.existsSync(SUMMARY_JSON)) {
    console.log('⚠  baseline_summary.json not found — using demo data for template.');
    return generateDemoData();
  }
  return JSON.parse(fs.readFileSync(SUMMARY_JSON, 'utf8'));
}

// ─── Demo data when no real test has run yet ──────────────────────────────────
function generateDemoData() {
  function makeTrend(min, avg, med, max, p90, p95, p99, count) {
    return {
      type: 'trend',
      values: { min, avg, med, max, 'p(90)': p90, 'p(95)': p95, 'p(99)': p99, count },
      thresholds: [
        { source: 'p(95)<2000', ok: p95 < 2000 },
        { source: 'avg<1000',   ok: avg  < 1000 },
      ],
    };
  }
  return {
    metrics: {
      http_req_duration:       makeTrend(45,  215,  185,  1842, 310,  420,  890,  7240),
      login_duration_ms:       makeTrend(32,  95,   88,   510,  155,  210,  390,  920),
      dashboard_duration_ms:   makeTrend(40,  165,  148,  980,  240,  310,  520,  920),
      add_expense_duration_ms: makeTrend(55,  220,  195,  1200, 340,  450,  780,  1102),
      edit_expense_duration_ms:makeTrend(48,  185,  170,  890,  280,  360,  640,  1050),
      del_expense_duration_ms: makeTrend(38,  120,  110,  640,  195,  260,  450,  1000),
      budget_duration_ms:      makeTrend(60,  250,  220,  1350, 380,  490,  820,  920),
      goal_duration_ms:        makeTrend(42,  155,  140,  820,  240,  310,  560,  920),
      ai_chat_duration_ms:     makeTrend(80,  380,  340,  2100, 580,  720,  1200, 920),
      http_reqs: {
        type: 'counter',
        values: { count: 9054, rate: 150.9 },
      },
      http_req_failed: {
        type: 'rate',
        values: { rate: 0.009, passes: 8973, fails: 81 },
        thresholds: [{ source: 'rate<0.05', ok: true }],
      },
      vus:     { type: 'gauge', values: { value: 100 } },
      vus_max: { type: 'gauge', values: { value: 100 } },
      total_requests_sent:  { type: 'counter', values: { count: 9054 } },
      successful_requests:  { type: 'counter', values: { count: 8973 } },
      failed_requests:      { type: 'counter', values: { count: 81   } },
      overall_error_rate:   { type: 'rate',    values: { rate: 0.009 } },
      data_sent:     { type: 'counter', values: { count: 2890000 } },
      data_received: { type: 'counter', values: { count: 14200000} },
    },
  };
}

// ─── Helper — extract value safely ───────────────────────────────────────────
function v(summary, metric, stat) {
  const m = summary?.metrics?.[metric];
  if (!m) return null;
  const val = m.values?.[stat];
  return val !== undefined ? val : null;
}

function fmt(val, decimals = 2) {
  if (val === null || val === undefined) return 'N/A';
  return parseFloat(val.toFixed(decimals));
}

function fmtPct(rate) {
  if (rate === null || rate === undefined) return 'N/A';
  return `${(rate * 100).toFixed(2)}%`;
}

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  navy:       'FF1E3A5F',
  navyLight:  'FF2D5A8E',
  white:      'FFFFFFFF',
  emerald:    'FF10B981',
  emeraldBg:  'FFD1FAE5',
  emeraldDark:'FF065F46',
  red:        'FFEF4444',
  redBg:      'FFFEE2E2',
  amber:      'FFF59E0B',
  amberBg:    'FFFEF3C7',
  blue:       'FF3B82F6',
  blueBg:     'FFDBEAFE',
  purple:     'FF8B5CF6',
  purpleBg:   'FFEDE9FE',
  slate100:   'FFF1F5F9',
  slate50:    'FFF8FAFC',
  border:     'FFE2E8F0',
};

function fill(argb) { return { type: 'pattern', pattern: 'solid', fgColor: { argb } }; }
function font(argb, bold = false, size = 10) {
  return { color: { argb }, bold, size, name: 'Calibri' };
}
function border(style = 'thin') {
  return { top: {style}, bottom: {style}, left: {style}, right: {style} };
}
function thinBorder() {
  return { bottom: { style: 'hair', color: { argb: C.border } } };
}

// ─── Style a header row ───────────────────────────────────────────────────────
function styleHeader(row, cols, bgArgb = C.navy) {
  row.height = 32;
  for (let c = 1; c <= cols; c++) {
    const cell = row.getCell(c);
    cell.fill      = fill(bgArgb);
    cell.font      = font(C.white, true, 11);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border    = { bottom: { style: 'medium', color: { argb: bgArgb } } };
  }
}

function styleDataRow(row, cols, altRow) {
  row.height = 24;
  for (let c = 1; c <= cols; c++) {
    const cell = row.getCell(c);
    if (altRow) cell.fill = fill(C.slate50);
    cell.font      = font('FF334155', false, 10);
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border    = thinBorder();
  }
}

// ─── Pass / Fail badge ────────────────────────────────────────────────────────
function applyPassFail(cell, passed) {
  cell.value     = passed ? '✅  PASS' : '❌  FAIL';
  cell.fill      = fill(passed ? C.emeraldBg : C.redBg);
  cell.font      = font(passed ? C.emeraldDark : C.red, true, 10);
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
}

// ─── Colour a metric cell by SLA ─────────────────────────────────────────────
function colorMetric(cell, val, warnThresh, failThresh) {
  if (val === null || typeof val !== 'number') return;
  if (val > failThresh) {
    cell.fill = fill(C.redBg);
    cell.font = font(C.red, true, 10);
  } else if (val > warnThresh) {
    cell.fill = fill(C.amberBg);
    cell.font = font(C.amber, true, 10);
  } else {
    cell.fill = fill(C.emeraldBg);
    cell.font = font(C.emeraldDark, true, 10);
  }
}

// ─── Title / subtitle helper ─────────────────────────────────────────────────
function addTitle(ws, mergeRange, text, style = {}) {
  ws.mergeCells(mergeRange);
  const cell = ws.getCell(mergeRange.split(':')[0]);
  cell.value     = text;
  cell.font      = { bold: true, size: style.size || 16, color: { argb: style.color || C.navy }, name: 'Calibri' };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  if (style.bg) cell.fill = fill(style.bg);
  const row = cell.row;
  if (style.height) ws.getRow(row).height = style.height;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n📊 Generating Baseline Load Test Report...\n');

  const summary = loadSummary();
  const metrics = summary.metrics || {};

  // ── Extract key numbers ──────────────────────────────────────────────────
  const totalReqs   = metrics.http_reqs?.values?.count  || 0;
  const rps         = metrics.http_reqs?.values?.rate   || 0;
  const errRate     = metrics.http_req_failed?.values?.rate || 0;
  const successN    = metrics.successful_requests?.values?.count || Math.round(totalReqs * (1 - errRate));
  const failedN     = metrics.failed_requests?.values?.count    || Math.round(totalReqs * errRate);
  const dataSentMB  = ((metrics.data_sent?.values?.count || 0) / 1048576).toFixed(2);
  const dataRecvMB  = ((metrics.data_received?.values?.count || 0) / 1048576).toFixed(2);

  // Overall http_req_duration
  const oAvg = fmt(v(summary, 'http_req_duration', 'avg'));
  const oMin = fmt(v(summary, 'http_req_duration', 'min'));
  const oMed = fmt(v(summary, 'http_req_duration', 'med'));
  const oMax = fmt(v(summary, 'http_req_duration', 'max'));
  const oP90 = fmt(v(summary, 'http_req_duration', 'p(90)'));
  const oP95 = fmt(v(summary, 'http_req_duration', 'p(95)'));
  const oP99 = fmt(v(summary, 'http_req_duration', 'p(99)'));

  const successRate = ((1 - errRate) * 100).toFixed(2);

  // ── Per-API data ─────────────────────────────────────────────────────────
  const API_ROWS = [
    { name: 'User Login',             metric: 'login_duration_ms',        method: 'POST', endpoint: '/api/auth/login',          sla: 500  },
    { name: 'Transaction History',    metric: 'dashboard_duration_ms',    method: 'GET',  endpoint: '/api/transactions',         sla: 1000 },
    { name: 'Add Expense',            metric: 'add_expense_duration_ms',  method: 'POST', endpoint: '/api/transactions',         sla: 1000 },
    { name: 'Edit Expense',           metric: 'edit_expense_duration_ms', method: 'PUT',  endpoint: '/api/transactions/:id',     sla: 1000 },
    { name: 'Delete Expense',         metric: 'del_expense_duration_ms',  method: 'DEL',  endpoint: '/api/transactions/:id',     sla: 1000 },
    { name: 'Budget Management',      metric: 'budget_duration_ms',       method: 'GET',  endpoint: '/api/budgets',              sla: 1000 },
    { name: 'Savings Goals',          metric: 'goal_duration_ms',         method: 'GET',  endpoint: '/api/goals',                sla: 1000 },
    { name: 'AI Financial Advisor',   metric: 'ai_chat_duration_ms',      method: 'POST', endpoint: '/api/ai/chat',              sla: 3000 },
  ];

  // ── Build workbook ───────────────────────────────────────────────────────
  const wb      = new ExcelJS.Workbook();
  wb.creator    = 'Smart Budget k6 Framework';
  wb.created    = new Date();
  wb.title      = 'Smart Budget Baseline Load Test Report';
  wb.subject    = '100 VUs × 1 Minute — Performance Results';

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 1: Executive Summary
  // ══════════════════════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet('Executive Summary', {
    properties: { tabColor: { argb: C.navy } },
  });

  ws1.columns = [
    {width:4},{width:28},{width:22},{width:22},{width:22},{width:22},{width:22},{width:4},
  ];

  // Banner
  ws1.mergeCells('A1:H1');
  ws1.getRow(1).height = 12;
  ws1.getCell('A1').fill = fill(C.navy);

  ws1.mergeCells('A2:H2');
  const bannerCell = ws1.getCell('A2');
  bannerCell.value = '🚀  Smart Budget — Baseline Load Test Report';
  bannerCell.fill  = fill(C.navy);
  bannerCell.font  = { bold: true, size: 22, color: { argb: C.white }, name: 'Calibri' };
  bannerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(2).height = 56;

  ws1.mergeCells('A3:H3');
  const subCell = ws1.getCell('A3');
  subCell.value = `100 Virtual Users  ×  1 Minute  ·  Generated: ${new Date().toLocaleString('en-IN')}`;
  subCell.fill  = fill(C.navyLight);
  subCell.font  = { size: 11, color: { argb: C.white }, name: 'Calibri' };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(3).height = 28;

  ws1.addRow([]);

  // ── KPI Cards (big numbers) ──────────────────────────────────────────────
  ws1.mergeCells('B5:C5');
  ws1.getCell('B5').value = '📦  Total Requests';
  ws1.getCell('B5').font  = font(C.navy, true, 12);
  ws1.getCell('B5').alignment = { horizontal: 'center' };
  ws1.getRow(5).height = 28;

  ws1.mergeCells('D5:E5');
  ws1.getCell('D5').value = '⚡  Requests / Second';
  ws1.getCell('D5').font  = font(C.navy, true, 12);
  ws1.getCell('D5').alignment = { horizontal: 'center' };

  ws1.mergeCells('F5:G5');
  ws1.getCell('F5').value = '✅  Success Rate';
  ws1.getCell('F5').font  = font(C.navy, true, 12);
  ws1.getCell('F5').alignment = { horizontal: 'center' };

  // Big number values
  ws1.mergeCells('B6:C6');
  const totalCell = ws1.getCell('B6');
  totalCell.value = totalReqs;
  totalCell.fill  = fill(C.blueBg);
  totalCell.font  = { bold: true, size: 32, color: { argb: C.blue }, name: 'Calibri' };
  totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(6).height = 60;

  ws1.mergeCells('D6:E6');
  const rpsCell = ws1.getCell('D6');
  rpsCell.value = parseFloat(rps.toFixed(1));
  rpsCell.fill  = fill(C.purpleBg);
  rpsCell.font  = { bold: true, size: 32, color: { argb: C.purple }, name: 'Calibri' };
  rpsCell.alignment = { horizontal: 'center', vertical: 'middle' };

  ws1.mergeCells('F6:G6');
  const srCell = ws1.getCell('F6');
  srCell.value = `${successRate}%`;
  srCell.fill  = fill(parseFloat(successRate) >= 95 ? C.emeraldBg : C.redBg);
  srCell.font  = { bold: true, size: 32,
    color: { argb: parseFloat(successRate) >= 95 ? C.emeraldDark : C.red }, name: 'Calibri' };
  srCell.alignment = { horizontal: 'center', vertical: 'middle' };

  ws1.addRow([]);
  ws1.addRow([]);

  // ── Response Time Summary ────────────────────────────────────────────────
  ws1.mergeCells('B9:G9');
  const rtHeader = ws1.getCell('B9');
  rtHeader.value = '⏱  Overall API Response Time Summary (ms)';
  rtHeader.fill  = fill(C.navy);
  rtHeader.font  = font(C.white, true, 13);
  rtHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(9).height = 34;

  // Metric blocks row
  const metricLabels = ['MIN', 'AVERAGE', 'MEDIAN', 'P90', 'P95', 'MAX'];
  const metricValues = [oMin, oAvg, oMed, oP90, oP95, oMax];
  const metricCols   = ['B', 'C', 'D', 'E', 'F', 'G'];
  const metricColors = [C.emeraldBg, C.blueBg, C.blueBg, C.amberBg, C.amberBg, C.redBg];
  const metricFonts  = [C.emeraldDark, C.blue, C.blue, C.amber, C.amber, C.red];

  // Labels
  metricLabels.forEach((label, i) => {
    const cell = ws1.getCell(`${metricCols[i]}10`);
    cell.value = label;
    cell.fill  = fill(metricColors[i]);
    cell.font  = font(metricFonts[i], true, 10);
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  ws1.getRow(10).height = 26;

  // Values
  metricValues.forEach((val, i) => {
    const cell = ws1.getCell(`${metricCols[i]}11`);
    cell.value = typeof val === 'number' ? `${val} ms` : val;
    cell.fill  = fill(metricColors[i]);
    cell.font  = { bold: true, size: 18, color: { argb: metricFonts[i] }, name: 'Calibri' };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  ws1.getRow(11).height = 50;

  ws1.addRow([]);

  // ── Additional Stats ─────────────────────────────────────────────────────
  ws1.mergeCells('B13:G13');
  const statsHdr = ws1.getCell('B13');
  statsHdr.value = '📋  Test Statistics';
  statsHdr.fill  = fill(C.navy);
  statsHdr.font  = font(C.white, true, 12);
  statsHdr.alignment = { horizontal: 'center', vertical: 'middle' };
  ws1.getRow(13).height = 30;

  const statsData = [
    ['Virtual Users',     '100 concurrent'],
    ['Test Duration',     '1 minute (60 seconds)'],
    ['Total Requests',    totalReqs.toLocaleString()],
    ['Requests/Second',   `${parseFloat(rps.toFixed(2))} req/s`],
    ['Successful Reqs',   successN.toLocaleString()],
    ['Failed Requests',   failedN.toLocaleString()],
    ['Error Rate',        fmtPct(errRate)],
    ['P99 Response',      `${oP99} ms`],
    ['Data Sent',         `${dataSentMB} MB`],
    ['Data Received',     `${dataRecvMB} MB`],
    ['Target URL',        'http://localhost:5000'],
    ['Test Timestamp',    new Date().toLocaleString('en-IN')],
  ];

  statsData.forEach(([label, value], idx) => {
    const row = ws1.addRow(['', label, '', value]);
    ws1.mergeCells(`B${row.number}:C${row.number}`);
    ws1.mergeCells(`D${row.number}:G${row.number}`);
    row.height = 24;

    const lCell = row.getCell(2);
    lCell.font      = font(C.navy, true, 10);
    lCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    if (idx % 2 === 0) lCell.fill = fill(C.slate50);

    const vCell = row.getCell(4);
    vCell.font      = font('FF334155', false, 10);
    vCell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 };
    if (idx % 2 === 0) vCell.fill = fill(C.slate50);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 2: API Breakdown
  // ══════════════════════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet('API Breakdown', {
    properties: { tabColor: { argb: C.emerald } },
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  ws2.mergeCells('A1:K1');
  ws2.getCell('A1').value = '📊  Per-API Response Time Breakdown — 100 VUs × 1 Minute';
  ws2.getCell('A1').fill  = fill(C.navy);
  ws2.getCell('A1').font  = font(C.white, true, 16);
  ws2.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  ws2.getRow(1).height = 44;

  const apiHeaders = [
    'API Name', 'Method', 'Endpoint',
    'Min (ms)', 'Avg (ms)', 'Median (ms)', 'P90 (ms)', 'P95 (ms)', 'P99 (ms)', 'Max (ms)',
    'SLA (P95)',
  ];
  const apiHeaderRow = ws2.addRow(apiHeaders);
  styleHeader(apiHeaderRow, apiHeaders.length);

  API_ROWS.forEach((api, idx) => {
    const min = fmt(v(summary, api.metric, 'min'));
    const avg = fmt(v(summary, api.metric, 'avg'));
    const med = fmt(v(summary, api.metric, 'med'));
    const p90 = fmt(v(summary, api.metric, 'p(90)'));
    const p95 = fmt(v(summary, api.metric, 'p(95)'));
    const p99 = fmt(v(summary, api.metric, 'p(99)'));
    const max = fmt(v(summary, api.metric, 'max'));

    const row = ws2.addRow([
      api.name, api.method, api.endpoint,
      min, avg, med, p90, p95, p99, max,
      `< ${api.sla} ms`,
    ]);

    styleDataRow(row, apiHeaders.length, idx % 2 === 0);
    row.getCell(1).font      = font(C.navy, true, 10);
    row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    row.getCell(3).alignment = { horizontal: 'left',  vertical: 'middle', indent: 1 };

    // Method badge
    const mCell = row.getCell(2);
    const mColors = {
      POST: { bg: C.emeraldBg, fg: C.emeraldDark },
      GET:  { bg: C.blueBg,   fg: C.blue },
      PUT:  { bg: C.amberBg,  fg: C.amber },
      DEL:  { bg: C.redBg,    fg: C.red   },
    };
    const mc = mColors[api.method] || { bg: C.slate100, fg: C.navy };
    mCell.fill = fill(mc.bg);
    mCell.font = font(mc.fg, true, 9);
    mCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // P95 color coding vs SLA
    const p95Cell = row.getCell(8);
    const p95Val  = typeof p95 === 'number' ? p95 : Infinity;
    colorMetric(p95Cell, p95Val, api.sla * 0.75, api.sla);

    // Avg color
    colorMetric(row.getCell(5), typeof avg === 'number' ? avg : Infinity, api.sla * 0.5, api.sla * 0.8);
  });

  ws2.columns = [
    {width:24},{width:9},{width:32},{width:12},{width:12},
    {width:14},{width:12},{width:12},{width:12},{width:12},{width:14},
  ];

  // ── Response Time Chart Data (for reference) ──────────────────────────────
  ws2.addRow([]);
  ws2.addRow(['📈 Chart Data — Copy these values into your chart tool']);
  ws2.lastRow.getCell(1).font = font(C.navy, true, 11);

  const chartHdrRow = ws2.addRow(['API', 'Min', 'Avg', 'P95', 'Max', 'SLA Limit']);
  styleHeader(chartHdrRow, 6, C.navyLight);

  API_ROWS.forEach((api, idx) => {
    const row = ws2.addRow([
      api.name,
      fmt(v(summary, api.metric, 'min')),
      fmt(v(summary, api.metric, 'avg')),
      fmt(v(summary, api.metric, 'p(95)')),
      fmt(v(summary, api.metric, 'max')),
      api.sla,
    ]);
    styleDataRow(row, 6, idx % 2 === 0);
    row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 3: Pass / Fail Threshold Results
  // ══════════════════════════════════════════════════════════════════════════
  const ws3 = wb.addWorksheet('Pass-Fail Results', {
    properties: { tabColor: { argb: 'FFEF4444' } },
  });

  ws3.mergeCells('A1:F1');
  ws3.getCell('A1').value = '✅  Threshold Pass / Fail Evaluation';
  ws3.getCell('A1').fill  = fill(C.navy);
  ws3.getCell('A1').font  = font(C.white, true, 16);
  ws3.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  ws3.getRow(1).height = 44;

  const pfHeaders = ['Metric', 'Threshold', 'Actual Value', 'SLA Limit', 'Status', 'Notes'];
  const pfHdrRow  = ws3.addRow(pfHeaders);
  styleHeader(pfHdrRow, pfHeaders.length);

  // Build threshold rows from summary
  const thresholdRows = [];
  const allMetrics = summary?.metrics || {};

  Object.entries(allMetrics).forEach(([name, metric]) => {
    const thresh = metric.thresholds || [];
    thresh.forEach((t) => {
      thresholdRows.push({ name, threshold: t.source, ok: t.ok });
    });
  });

  // Add manual computed rows for the key metrics
  const computedThresholds = [
    {
      name: 'http_req_duration',
      threshold: 'p(95)<2000',
      actualVal: `${oP95} ms`,
      sla: '2000 ms',
      ok: typeof oP95 === 'number' && oP95 < 2000,
      notes: 'P95 latency SLA',
    },
    {
      name: 'http_req_duration',
      threshold: 'p(99)<5000',
      actualVal: `${oP99} ms`,
      sla: '5000 ms',
      ok: typeof oP99 === 'number' && oP99 < 5000,
      notes: 'P99 latency SLA',
    },
    {
      name: 'http_req_duration',
      threshold: 'avg<1000',
      actualVal: `${oAvg} ms`,
      sla: '1000 ms',
      ok: typeof oAvg === 'number' && oAvg < 1000,
      notes: 'Average latency SLA',
    },
    {
      name: 'http_req_failed',
      threshold: 'rate<0.05',
      actualVal: fmtPct(errRate),
      sla: '5%',
      ok: errRate < 0.05,
      notes: 'Max 5% errors allowed',
    },
    {
      name: 'login_duration_ms',
      threshold: 'p(95)<500',
      actualVal: `${fmt(v(summary, 'login_duration_ms', 'p(95)'))} ms`,
      sla: '500 ms',
      ok: (v(summary, 'login_duration_ms', 'p(95)') || 999) < 500,
      notes: 'Login P95 SLA',
    },
    {
      name: 'dashboard_duration_ms',
      threshold: 'p(95)<1000',
      actualVal: `${fmt(v(summary, 'dashboard_duration_ms', 'p(95)'))} ms`,
      sla: '1000 ms',
      ok: (v(summary, 'dashboard_duration_ms', 'p(95)') || 9999) < 1000,
      notes: 'Dashboard P95 SLA',
    },
    {
      name: 'ai_chat_duration_ms',
      threshold: 'p(95)<3000',
      actualVal: `${fmt(v(summary, 'ai_chat_duration_ms', 'p(95)'))} ms`,
      sla: '3000 ms',
      ok: (v(summary, 'ai_chat_duration_ms', 'p(95)') || 9999) < 3000,
      notes: 'AI Chat P95 SLA',
    },
  ];

  let passes = 0;
  let fails  = 0;

  computedThresholds.forEach((t, idx) => {
    const row = ws3.addRow([
      t.name, t.threshold, t.actualVal, t.sla, '', t.notes,
    ]);
    styleDataRow(row, pfHeaders.length, idx % 2 === 0);
    row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    row.getCell(6).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    applyPassFail(row.getCell(5), t.ok);
    if (t.ok) passes++; else fails++;
  });

  // Totals
  ws3.addRow([]);
  const passRow = ws3.addRow(['', '', '', 'TOTAL PASS', passes, '']);
  passRow.getCell(4).font = font(C.emeraldDark, true, 11);
  passRow.getCell(5).fill = fill(C.emeraldBg);
  passRow.getCell(5).font = font(C.emeraldDark, true, 14);
  passRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
  passRow.height = 30;

  const failRow = ws3.addRow(['', '', '', 'TOTAL FAIL', fails, '']);
  failRow.getCell(4).font = font(C.red, true, 11);
  failRow.getCell(5).fill = fill(fails > 0 ? C.redBg : C.emeraldBg);
  failRow.getCell(5).font = font(fails > 0 ? C.red : C.emeraldDark, true, 14);
  failRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
  failRow.height = 30;

  const rateRow = ws3.addRow([
    '', '', '', 'PASS RATE',
    `${((passes / Math.max(1, passes + fails)) * 100).toFixed(1)}%`, '',
  ]);
  rateRow.getCell(4).font = font(C.navy, true, 11);
  rateRow.getCell(5).font = font(C.navy, true, 14);
  rateRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
  rateRow.height = 30;

  ws3.columns = [
    {width:30},{width:26},{width:18},{width:16},{width:14},{width:38},
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET 4: Test Configuration
  // ══════════════════════════════════════════════════════════════════════════
  const ws4 = wb.addWorksheet('Test Configuration', {
    properties: { tabColor: { argb: C.purple } },
  });

  ws4.columns = [{width:4},{width:34},{width:38},{width:4}];

  ws4.mergeCells('A1:D1');
  ws4.getCell('A1').value = '⚙️  Baseline Load Test Configuration';
  ws4.getCell('A1').fill  = fill(C.navy);
  ws4.getCell('A1').font  = font(C.white, true, 16);
  ws4.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  ws4.getRow(1).height = 44;

  const configData = [
    ['LOAD PROFILE', ''],
    ['Virtual Users (VUs)',           '100 concurrent'],
    ['Duration',                       '1 minute (60 seconds)'],
    ['Ramp-up',                        'Instant — all 100 VUs start together'],
    ['Ramp-down',                      'Instant — all VUs stop after 1 min'],
    ['', ''],
    ['TEST TARGET', ''],
    ['Backend URL',                    'http://localhost:5000'],
    ['Auth Method',                    'x-user-id header'],
    ['Test User ID',                   '1781096350731'],
    ['Test User Email',                'lokeshmk436@gmail.com'],
    ['', ''],
    ['APIS UNDER TEST', ''],
    ['1. User Login',                  'POST /api/auth/login'],
    ['2. Transaction History',         'GET  /api/transactions'],
    ['3. Add Expense',                 'POST /api/transactions'],
    ['4. Edit Expense',                'PUT  /api/transactions/:id'],
    ['5. Delete Expense',              'DELETE /api/transactions/:id'],
    ['6. Budget Management (GET)',     'GET  /api/budgets'],
    ['7. Budget Management (POST)',    'POST /api/budgets'],
    ['8. Savings Goals',               'GET  /api/goals'],
    ['9. AI Financial Advisor',        'POST /api/ai/chat'],
    ['', ''],
    ['SLA THRESHOLDS', ''],
    ['Overall P95',                    '< 2000 ms'],
    ['Overall P99',                    '< 5000 ms'],
    ['Average Response',               '< 1000 ms'],
    ['Error Rate',                     '< 5%'],
    ['Login P95',                      '< 500 ms'],
    ['Dashboard P95',                  '< 1000 ms'],
    ['AI Chat P95',                    '< 3000 ms'],
    ['', ''],
    ['TOOL & FRAMEWORK', ''],
    ['Load Testing Tool',              'k6 by Grafana Labs'],
    ['Report Generator',               'Node.js + ExcelJS'],
    ['CI/CD',                          'GitHub Actions'],
    ['k6 Config',                      'performance/tests/baselineTest.js'],
    ['Report Script',                  'performance/scripts/generateBaselineReport.js'],
  ];

  configData.forEach(([label, value], idx) => {
    if (!label && !value) {
      ws4.addRow([]);
      return;
    }

    if (!value) {
      // Section header
      const row = ws4.addRow(['', label, '', '']);
      ws4.mergeCells(`B${row.number}:C${row.number}`);
      row.getCell(2).fill      = fill(C.navy);
      row.getCell(2).font      = font(C.white, true, 11);
      row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
      row.height = 28;
      return;
    }

    const row = ws4.addRow(['', label, value, '']);
    row.height = 22;
    const isAlt = idx % 2 === 0;
    if (isAlt) {
      row.getCell(2).fill = fill(C.slate50);
      row.getCell(3).fill = fill(C.slate50);
    }
    row.getCell(2).font      = font(C.navy, true, 10);
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    row.getCell(3).font      = font('FF334155', false, 10);
    row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  });

  // ── Save the workbook ─────────────────────────────────────────────────────
  await wb.xlsx.writeFile(OUTPUT_XLSX);

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  ✅  Baseline Load Test Report Generated!        ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  📊 Excel: ${OUTPUT_XLSX.split('\\').slice(-3).join('/').padEnd(38)}║`);
  console.log('║                                                  ║');
  console.log(`║  📦 Total Requests:  ${String(totalReqs).padEnd(28)}║`);
  console.log(`║  ⚡ Req/Sec:         ${String(parseFloat(rps.toFixed(1))).padEnd(28)}║`);
  console.log(`║  ⏱  Avg Response:    ${String(oAvg + ' ms').padEnd(28)}║`);
  console.log(`║  ⬇  Min Response:    ${String(oMin + ' ms').padEnd(28)}║`);
  console.log(`║  ⬆  Max Response:    ${String(oMax + ' ms').padEnd(28)}║`);
  console.log(`║  📈 P95:             ${String(oP95 + ' ms').padEnd(28)}║`);
  console.log(`║  📈 P99:             ${String(oP99 + ' ms').padEnd(28)}║`);
  console.log(`║  ✅ Success Rate:    ${String(successRate + '%').padEnd(28)}║`);
  console.log(`║  ❌ Error Rate:      ${String(fmtPct(errRate)).padEnd(28)}║`);
  console.log('╚══════════════════════════════════════════════════╝\n');
}

main().catch((err) => {
  console.error('❌ Report generation failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
