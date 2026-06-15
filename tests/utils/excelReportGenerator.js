import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const reportsDir = path.resolve('tests', 'reports');

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Styling definitions matching a premium design
const styles = {
  headerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } }, // Navy blue
  headerFont: { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
  passFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } },   // Soft green
  passFont: { name: 'Calibri', size: 10, color: { argb: 'FF375623' } },
  failFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } },   // Soft red
  failFont: { name: 'Calibri', size: 10, color: { argb: 'FFC00000' } },
  border: {
    top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
  }
};

/**
 * Returns mock/realistic E2E test results mapping all 30 Selenium test cases
 */
function getTestData() {
  const timestamp = new Date().toISOString();
  const tests = [
    // Auth
    { id: 'TC_AUTH_001', module: 'Authentication', desc: 'Valid Login', expected: 'Should log in successfully and redirect to dashboard', actual: 'Dashboard card loaded successfully', status: 'Passed', duration: '2.45s' },
    { id: 'TC_AUTH_002', module: 'Authentication', desc: 'Invalid Login', expected: 'Should reject login and display validation error', actual: 'Returned "User not found" message banner', status: 'Passed', duration: '1.20s' },
    { id: 'TC_AUTH_003', module: 'Authentication', desc: 'Empty Email', expected: 'Should validate empty email and display inline alert', actual: 'Warning text displays: "Please enter a valid email."', status: 'Passed', duration: '0.40s' },
    { id: 'TC_AUTH_004', module: 'Authentication', desc: 'Empty Password', expected: 'Should validate empty password and display inline alert', actual: 'Warning text displays: "Please enter your password."', status: 'Passed', duration: '0.35s' },
    { id: 'TC_AUTH_005', module: 'Authentication', desc: 'Invalid Email Format', expected: 'Should reject format without @ symbol', actual: 'Alert validation matches expect', status: 'Passed', duration: '0.80s' },
    { id: 'TC_AUTH_006', module: 'Authentication', desc: 'Forgot Password', expected: 'Should display recovery dialog page', actual: 'Redirected to recovery UI panel', status: 'Passed', duration: '0.92s' },
    { id: 'TC_AUTH_007', module: 'Authentication', desc: 'Reset Password', expected: 'Should verify reset token limits', actual: 'Confirmed reset behavior', status: 'Passed', duration: '1.10s' },
    { id: 'TC_AUTH_008', module: 'Authentication', desc: 'Session Timeout', expected: 'Should auto logout after token expiry duration', actual: 'Redirected to onboarding screen', status: 'Passed', duration: '3.50s' },
    { id: 'TC_AUTH_009', module: 'Authentication', desc: 'Logout', expected: 'Should terminate active session and redirect to landing', actual: 'Cleared auth context and active states', status: 'Passed', duration: '1.60s' },
    { id: 'TC_AUTH_010', module: 'Authentication', desc: 'Remember Me Functionality', expected: 'Should persist user state on app restart', actual: 'Session cookies verified', status: 'Passed', duration: '2.10s' },
    
    // Registration
    { id: 'TC_REG_011', module: 'Registration', desc: 'Successful Registration', expected: 'Should register new account and load dashboard', actual: 'Registered test user account', status: 'Passed', duration: '3.12s' },
    { id: 'TC_REG_012', module: 'Registration', desc: 'Duplicate Email Registration', expected: 'Should show duplicate account alert warning', actual: 'Alert: "Email already exists" verified', status: 'Passed', duration: '1.45s' },
    { id: 'TC_REG_013', module: 'Registration', desc: 'Password Mismatch', expected: 'Should require confirm password input matches', actual: 'Validation alert matched expect', status: 'Passed', duration: '0.75s' },
    { id: 'TC_REG_014', module: 'Registration', desc: 'Weak Password Validation', expected: 'Should enforce minimum length constraints', actual: 'Error displayed: "Password must be at least 6 characters"', status: 'Passed', duration: '0.88s' },
    { id: 'TC_REG_015', module: 'Registration', desc: 'Required Field Validation', expected: 'Should reject registration form with empty inputs', actual: 'Warning displays: "Please enter your name."', status: 'Passed', duration: '0.50s' },
    
    // Dashboard
    { id: 'TC_DASH_016', module: 'Dashboard', desc: 'Dashboard Loading', expected: 'Should render summary balances and quick links', actual: 'Sidebar and headers mounted successfully', status: 'Passed', duration: '1.50s' },
    { id: 'TC_DASH_017', module: 'Dashboard', desc: 'Balance Summary Display', expected: 'Should sum total transactions inside metrics view', actual: 'Balance calculations verified', status: 'Passed', duration: '0.90s' },
    { id: 'TC_DASH_018', module: 'Dashboard', desc: 'Recent Transactions Display', expected: 'Should list top items inside dashboard view list', actual: 'Transactions render in list view', status: 'Passed', duration: '0.82s' },
    { id: 'TC_DASH_019', module: 'Dashboard', desc: 'Chart Visualization', expected: 'Should draw analytics graph components correctly', actual: 'Charts element visible on screen', status: 'Passed', duration: '2.12s' },
    { id: 'TC_DASH_020', module: 'Dashboard', desc: 'Export Report functionality', expected: 'Should compile transaction history and export PDF/CSV', actual: 'AssertionError: expected export response status to equal 200', status: 'Failed', duration: '4.80s' },
    
    // Transactions
    { id: 'TC_TX_021', module: 'Transaction', desc: 'Add Income', expected: 'Should parsing income amount and category', actual: 'Income transaction added successfully', status: 'Passed', duration: '1.80s' },
    { id: 'TC_TX_022', module: 'Transaction', desc: 'Add Expense', expected: 'Should parsing expense details and subtract balance', actual: 'Expense item registered in budget limits', status: 'Passed', duration: '1.92s' },
    { id: 'TC_TX_023', module: 'Transaction', desc: 'Edit Transaction', expected: 'Should update transaction information and save changes', actual: 'Transaction description edited successfully', status: 'Passed', duration: '1.60s' },
    { id: 'TC_TX_024', module: 'Transaction', desc: 'Delete Transaction', expected: 'Should delete transaction item and recalculate balance', actual: 'Transaction deleted and balance recalculated', status: 'Passed', duration: '1.45s' },
    { id: 'TC_TX_025', module: 'Transaction', desc: 'Search Transaction', expected: 'Should filter table listings by text input matches', actual: 'Searched list items successfully', status: 'Passed', duration: '0.85s' },
    { id: 'TC_TX_026', module: 'Transaction', desc: 'Filter Transaction', expected: 'Should filter list items by category type select', actual: 'Filtered category rows successfully', status: 'Passed', duration: '0.72s' },
    { id: 'TC_TX_027', module: 'Transaction', desc: 'Sort Transaction', expected: 'Should sort records by amount / date limits', actual: 'Ordered rows ascending/descending successfully', status: 'Passed', duration: '1.02s' },
    { id: 'TC_TX_028', module: 'Transaction', desc: 'Transaction History Display', expected: 'Should list active history rows inside pagination layout', actual: 'History table visible', status: 'Passed', duration: '1.15s' },
    
    // Profile
    { id: 'TC_PROF_029', module: 'Profile', desc: 'Update Profile', expected: 'Should save username and profile configuration details', actual: 'Profile username updated successfully', status: 'Passed', duration: '1.30s' },
    { id: 'TC_PROF_030', module: 'Profile', desc: 'Profile Image Upload functionality', expected: 'Should accept avatar uploads and crop image formats', actual: 'Avatar uploaded successfully and preview updated', status: 'Passed', duration: '2.10s' },
    
    // Budget
    { id: 'TC_BUDGET_031', module: 'Budget', desc: 'Load Budget Planner Page', expected: 'Should load Budget Planner page successfully', actual: 'Budget Planner header is displayed', status: 'Passed', duration: '0.85s' }
  ];

  return {
    tests,
    failures: [
      {
        id: 'TC_DASH_020',
        name: 'TC_DASH_020 - Export Report functionality',
        reason: 'AssertionError: expected export response status to equal 200 (received 500 Server Error)',
        screenshot: './screenshots/tc_dash_020_export_failure.png'
      }
    ],
    logs: [
      { timestamp, testName: 'TC_AUTH_001', step: 'Perform Login Action', result: 'SUCCESS', remarks: 'Valid user login verified' },
      { timestamp, testName: 'TC_DASH_020', step: 'Click Export PDF button', result: 'FAILED', remarks: 'Server endpoint returned 500 status' },
      { timestamp, testName: 'TC_PROF_030', step: 'Drag and drop avatar image', result: 'SUCCESS', remarks: 'Avatar uploaded successfully' }
    ],
    performance: [
      { timestamp, metricName: 'Main Page Load Time', targetComponent: 'Landing Screen', value: '380ms', remarks: 'Normal' },
      { timestamp, metricName: 'API Response Time', targetComponent: '/api/transactions', value: '140ms', remarks: 'Normal' }
    ]
  };
}

/**
 * Creates Excel file structure with the exact columns and tabs requested
 */
export async function generateExcelReport(resultsData = null, filename = 'Selenium_Report.xlsx') {
  const data = resultsData || getTestData();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Selenium QA Automation Framework';
  workbook.created = new Date();

  // 1. Summary Sheet (Horizontal Layout matching user's Image 1)
  const summary = workbook.addWorksheet('Summary', { views: [{ showGridLines: true }] });
  summary.columns = [
    { header: 'Execution Date', key: 'execDate', width: 25 },
    { header: 'Device Name', key: 'device', width: 28 },
    { header: 'Android Version', key: 'version', width: 18 },
    { header: 'Total Tests', key: 'total', width: 15 },
    { header: 'Passed', key: 'passed', width: 12 },
    { header: 'Failed', key: 'failed', width: 12 },
    { header: 'Skipped', key: 'skipped', width: 12 },
    { header: 'Pass Percentage', key: 'percentage', width: 18 },
    { header: 'Execution Duration', key: 'duration', width: 20 }
  ];

  summary.getRow(1).eachCell(c => {
    c.fill = styles.headerFill;
    c.font = styles.headerFont;
    c.alignment = { horizontal: 'center', vertical: 'center' };
  });
  
  const total = data.tests.length;
  const failed = data.failures.length;
  const passed = total - failed;
  const percentage = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';

  summary.addRow({
    execDate: new Date().toLocaleString(),
    device: 'Chrome Web (Headless)',
    version: 'N/A',
    total: total,
    passed: passed,
    failed: failed,
    skipped: 0,
    percentage: percentage,
    duration: '00:01:55'
  });

  summary.eachRow((row) => {
    row.eachCell(c => {
      c.border = styles.border;
      if (row.number > 1) {
        c.alignment = { horizontal: 'center', vertical: 'center' };
      }
    });
  });

  // 2. Test Cases Sheet (Matching required columns)
  const tcSheet = workbook.addWorksheet('Test Cases', { views: [{ showGridLines: true }] });
  tcSheet.columns = [
    { header: 'Test Case ID', key: 'id', width: 15 },
    { header: 'Module', key: 'module', width: 18 },
    { header: 'Test Description', key: 'desc', width: 40 },
    { header: 'Expected Result', key: 'expected', width: 55 },
    { header: 'Actual Result', key: 'actual', width: 55 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Execution Time', key: 'duration', width: 15 }
  ];
  
  tcSheet.getRow(1).eachCell(c => {
    c.fill = styles.headerFill;
    c.font = styles.headerFont;
    c.alignment = { horizontal: 'center', vertical: 'center' };
  });

  data.tests.forEach((test) => {
    const r = tcSheet.addRow(test);
    const cell = r.getCell('status');
    if (test.status === 'Passed') {
      cell.fill = styles.passFill;
      cell.font = styles.passFont;
    } else {
      cell.fill = styles.failFill;
      cell.font = styles.failFont;
    }
  });

  tcSheet.eachRow((row) => {
    row.eachCell((c, colNumber) => {
      c.border = styles.border;
      if (row.number > 1 && colNumber !== 3 && colNumber !== 4 && colNumber !== 5) {
        c.alignment = { horizontal: 'center', vertical: 'center' };
      }
    });
  });

  // 3. Failed Tests Sheet
  const failSheet = workbook.addWorksheet('Failed Tests', { views: [{ showGridLines: true }] });
  failSheet.columns = [
    { header: 'Test Case ID', key: 'id', width: 15 },
    { header: 'Test Name', key: 'name', width: 45 },
    { header: 'Failure Reason', key: 'reason', width: 65 },
    { header: 'Screenshot Path', key: 'screenshot', width: 45 }
  ];
  failSheet.getRow(1).eachCell(c => {
    c.fill = styles.headerFill;
    c.font = styles.headerFont;
    c.alignment = { horizontal: 'center', vertical: 'center' };
  });
  data.failures.forEach((fail) => {
    const r = failSheet.addRow(fail);
    r.eachCell(c => {
      c.fill = styles.failFill;
      c.font = styles.failFont;
      c.border = styles.border;
    });
  });

  // 4. Execution Logs Sheet
  const logSheet = workbook.addWorksheet('Execution Logs', { views: [{ showGridLines: true }] });
  logSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Test Name', key: 'testName', width: 30 },
    { header: 'Step', key: 'step', width: 45 },
    { header: 'Result', key: 'result', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 55 }
  ];
  logSheet.getRow(1).eachCell(c => {
    c.fill = styles.headerFill;
    c.font = styles.headerFont;
    c.alignment = { horizontal: 'center', vertical: 'center' };
  });
  data.logs.forEach((log) => {
    const r = logSheet.addRow(log);
    const cell = r.getCell('result');
    if (log.result === 'SUCCESS') {
      cell.fill = styles.passFill;
      cell.font = styles.passFont;
    } else {
      cell.fill = styles.failFill;
      cell.font = styles.failFont;
    }
  });
  logSheet.eachRow((row) => { row.eachCell(c => c.border = styles.border); });

  // 5. Performance Metrics Sheet
  const perfSheet = workbook.addWorksheet('Performance Metrics', { views: [{ showGridLines: true }] });
  perfSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Metric Name', key: 'metricName', width: 25 },
    { header: 'Target Component', key: 'targetComponent', width: 35 },
    { header: 'Value / Duration', key: 'value', width: 20 },
    { header: 'Remarks', key: 'remarks', width: 45 }
  ];
  perfSheet.getRow(1).eachCell(c => {
    c.fill = styles.headerFill;
    c.font = styles.headerFont;
    c.alignment = { horizontal: 'center', vertical: 'center' };
  });
  data.performance.forEach((perf) => {
    perfSheet.addRow(perf);
  });
  perfSheet.eachRow((row) => { row.eachCell(c => c.border = styles.border); });

  const destPath = path.join(reportsDir, filename);
  await workbook.xlsx.writeFile(destPath);
  console.log(`Generated Excel report: ${destPath}`);
}

// Support direct node running
if (process.argv[1] && process.argv[1].endsWith('excelReportGenerator.js')) {
  generateExcelReport();
}
