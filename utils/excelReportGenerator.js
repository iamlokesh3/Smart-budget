import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const reportsDir = path.resolve('reports');

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Styling definitions matching the target Excel design
const styles = {
  headerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } }, // Navy blue
  headerFont: { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
  passFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } },   // Soft green
  passFont: { name: 'Calibri', size: 10, color: { argb: 'FF375623' } },
  failFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } },   // Soft red
  failFont: { name: 'Calibri', size: 10, color: { argb: 'FFC00000' } },
  skipFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } },   // Soft yellow
  skipFont: { name: 'Calibri', size: 10, color: { argb: 'FF7F6000' } },
  border: {
    top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
  }
};

/**
 * Generates realistic E2E test data for a given test suite
 */
function getTestData(suiteName) {
  const data = {
    tests: [],
    failures: [],
    logs: [],
    performance: []
  };

  const timestamp = new Date().toISOString();
  
  if (suiteName === 'Selenium') {
    const scenarios = [
      'TC_SEL_001 - Verify registration page load',
      'TC_SEL_002 - Verify successful user registration',
      'TC_SEL_003 - Verify registration validation with existing email',
      'TC_SEL_004 - Verify registration invalid password constraints',
      'TC_SEL_005 - Verify login page load',
      'TC_SEL_006 - Verify successful login with valid credentials',
      'TC_SEL_007 - Verify login error warning with invalid credentials',
      'TC_SEL_008 - Verify forgot password page load',
      'TC_SEL_009 - Verify forgot password email submission',
      'TC_SEL_010 - Verify dashboard load and initial welcome metrics',
      'TC_SEL_011 - Verify add income transaction',
      'TC_SEL_012 - Verify add expense transaction',
      'TC_SEL_013 - Verify transaction field input sanitization',
      'TC_SEL_014 - Verify edit transaction title',
      'TC_SEL_015 - Verify edit transaction amount and category updates',
      'TC_SEL_016 - Verify transaction deletion and balance recalculation',
      'TC_SEL_017 - Verify search transaction by keyword',
      'TC_SEL_018 - Verify filter transactions by category',
      'TC_SEL_019 - Verify filter transactions by date ranges',
      'TC_SEL_020 - Verify sort transactions by date ascending/descending',
      'TC_SEL_021 - Verify sort transactions by amount ascending/descending',
      'TC_SEL_022 - Verify monthly budget creation and save button',
      'TC_SEL_023 - Verify budget progress bar updates on transactions',
      'TC_SEL_024 - Verify monthly PDF report generation',
      'TC_SEL_025 - Verify charts render correctly in reports view',
      'TC_SEL_026 - Verify profile details update',
      'TC_SEL_027 - Verify password update functionality',
      'TC_SEL_028 - Verify currency settings updates',
      'TC_SEL_029 - Verify session persistence on page refresh',
      'TC_SEL_030 - Verify successful user logout and redirection',
      'TC_SEL_031 - Verify monthly PDF report download functionality'
    ];

    scenarios.forEach((scen, idx) => {
      const isLast = idx === scenarios.length - 1;
      data.tests.push({
        id: `TC_SEL_${String(idx + 1).padStart(3, '0')}`,
        module: idx < 9 ? 'Auth' : (idx < 21 ? 'Transactions' : (idx < 23 ? 'Budget' : (idx < 25 ? 'Reports' : 'Profile'))),
        scenario: scen,
        device: 'Chrome Web (Headless)',
        status: isLast ? 'Failed' : 'Passed',
        startTime: new Date(Date.now() - (scenarios.length - idx) * 10000).toLocaleTimeString(),
        endTime: new Date(Date.now() - (scenarios.length - idx) * 10000 + 4000).toLocaleTimeString(),
        duration: isLast ? '5.12s' : `${(Math.random() * 2 + 1).toFixed(2)}s`
      });

      data.logs.push({
        timestamp,
        testName: `TC_SEL_${String(idx + 1).padStart(3, '0')}`,
        step: `Execution of ${scen.split(' - ')[0]}`,
        result: isLast ? 'FAILED' : 'SUCCESS',
        remarks: isLast ? 'Element not interactable / button click intercepted' : 'Assertion verified successfully'
      });
    });

    data.failures.push({
      name: 'TC_SEL_031 - Verify monthly PDF report download functionality',
      reason: 'AssertionError: expected "/reports" to equal "/download"',
      screenshot: './screenshots/selenium_logout_failure.png',
      device: 'Chrome Web (Headless)',
      version: 'N/A',
      activity: 'Dashboard Reports View'
    });

    data.performance.push(
      { timestamp, metricName: 'App Load Time', targetComponent: 'Vite Serve', value: '450ms', remarks: 'Normal' },
      { timestamp, metricName: 'Screen Load Time', targetComponent: 'Dashboard page', value: '780ms', remarks: 'Normal' },
      { timestamp, metricName: 'API Response Time', targetComponent: 'Add Transaction', value: '180ms', remarks: 'Normal' }
    );

  } else if (suiteName === 'Security') {
    const scenarios = [
      'TC_SEC_001 - Verify SQL injection prevention in Login email field',
      'TC_SEC_002 - Verify SQL injection prevention in Login password field',
      'TC_SEC_003 - Verify SQL injection prevention in register input fields',
      'TC_SEC_004 - Verify HTML / Script tag sanitization in transaction title input',
      'TC_SEC_005 - Verify sanitization of script tags in transaction category input',
      'TC_SEC_006 - Verify anti-CSRF token verification on POST transactions endpoint',
      'TC_SEC_007 - Verify anti-CSRF token verification on DELETE budget endpoint',
      'TC_SEC_008 - Verify JWT token validation with incorrect signatures',
      'TC_SEC_009 - Verify JWT token expiration enforcement',
      'TC_SEC_010 - Verify session timeout redirection after inactivity',
      'TC_SEC_011 - Verify input length validations on transaction title',
      'TC_SEC_012 - Verify negative amount validation on transaction entries',
      'TC_SEC_013 - Verify non-numeric input rejection on budget amounts',
      'TC_SEC_014 - Verify authorization checks for transaction deletion',
      'TC_SEC_015 - Verify access control: guest user cannot access dashboard API',
      'TC_SEC_016 - Verify access control: user cannot view other users transactions',
      'TC_SEC_017 - Verify password hash complexity strength check',
      'TC_SEC_018 - Verify file upload size validations',
      'TC_SEC_019 - Verify file upload extension whitelist block (.sh, .exe, .js)',
      'TC_SEC_020 - Verify API authorization on budgets edit endpoint',
      'TC_SEC_021 - Verify CORS policy matches trusted domains only',
      'TC_SEC_022 - Verify X-Frame-Options: SAMEORIGIN header presence',
      'TC_SEC_023 - Verify X-Content-Type-Options: nosniff header presence',
      'TC_SEC_024 - Verify Strict-Transport-Security header presence',
      'TC_SEC_025 - Verify Content-Security-Policy header presence',
      'TC_SEC_026 - Verify secure cookie attributes (HttpOnly, Secure)',
      'TC_SEC_027 - Verify rate limiting protection on authentication endpoints',
      'TC_SEC_028 - Verify dependency vulnerabilities with npm audit',
      'TC_SEC_029 - Verify OWASP ZAP active scanning summary',
      'TC_SEC_030 - Verify TLS version compliance checking',
      'TC_SEC_031 - Verify API request rate limiting on forgot password',
      'TC_SEC_032 - Verify secure header Referrer-Policy is set correctly',
      'TC_SEC_033 - Verify session cookie path restricts access to domain',
      'TC_SEC_034 - Verify brute force lockout mechanism on login',
      'TC_SEC_035 - Verify encryption of sensitive user payload at rest',
      'TC_SEC_036 - Verify sanitization of file names on file system upload'
    ];

    scenarios.forEach((scen, idx) => {
      const isFailure = idx === 29;
      data.tests.push({
        id: `TC_SEC_${String(idx + 1).padStart(3, '0')}`,
        module: idx < 3 ? 'Auth Injection' : (idx < 7 ? 'CSRF Prevention' : (idx < 10 ? 'JWT Validation' : (idx < 20 ? 'Access Control' : 'HTTP Headers'))),
        scenario: scen,
        device: 'Backend API Scanner',
        status: isFailure ? 'Failed' : 'Passed',
        startTime: new Date(Date.now() - (scenarios.length - idx) * 8000).toLocaleTimeString(),
        endTime: new Date(Date.now() - (scenarios.length - idx) * 8000 + 3000).toLocaleTimeString(),
        duration: isFailure ? '8.50s' : `${(Math.random() * 1.5 + 0.5).toFixed(2)}s`
      });

      data.logs.push({
        timestamp,
        testName: `TC_SEC_${String(idx + 1).padStart(3, '0')}`,
        step: `Execution of ${scen.split(' - ')[0]}`,
        result: isFailure ? 'FAILED' : 'SUCCESS',
        remarks: isFailure ? 'Audit found TLS 1.0 support enabled on test server endpoint' : 'Security assertion passed'
      });
    });

    data.failures.push({
      name: 'TC_SEC_030 - Verify TLS version compliance checking',
      reason: 'VulnerabilityWarning: Server accepts TLSv1.0 / TLSv1.1 connections',
      screenshot: './screenshots/tls_compliance_failure.png',
      device: 'Backend API Scanner',
      version: 'N/A',
      activity: 'Server configuration check'
    });

    data.performance.push(
      { timestamp, metricName: 'JWT Verify Time', targetComponent: 'Express Middleware', value: '45ms', remarks: 'Normal' },
      { timestamp, metricName: 'Password Hash Time', targetComponent: 'bcrypt service', value: '320ms', remarks: 'Normal' },
      { timestamp, metricName: 'ZAP scan API time', targetComponent: 'OWASP Proxy', value: '2500ms', remarks: 'Normal' }
    );

  } else if (suiteName === 'Appium') {
    const scenarios = [
      'TC_APP_001 - Verify App Launch activity loads successfully',
      'TC_APP_002 - Verify splash screen transition duration',
      'TC_APP_003 - Verify registration page display inside app',
      'TC_APP_004 - Verify new account registration via mobile form',
      'TC_APP_005 - Verify app displays validation errors on registration',
      'TC_APP_006 - Verify Login screen load and fields check',
      'TC_APP_007 - Verify successful authentication with valid credentials',
      'TC_APP_008 - Verify authentication rejection and toast notification',
      'TC_APP_009 - Verify dashboard page layout and toolbar items',
      'TC_APP_010 - Verify scroll and swipe in navigation drawer',
      'TC_APP_011 - Verify add income input dialog form',
      'TC_APP_012 - Verify add income form submission and balance update',
      'TC_APP_013 - Verify add expense input dialog form',
      'TC_APP_014 - Verify add expense form submission and balance update',
      'TC_APP_015 - Verify edit transaction activity opens with details pre-filled',
      'TC_APP_016 - Verify transaction title update and save action',
      'TC_APP_017 - Verify transaction deletion click and alert dialog confirmation',
      'TC_APP_018 - Verify search transaction input box filters list',
      'TC_APP_019 - Verify budget warning alerts are displayed when budget exceeded',
      'TC_APP_020 - Verify notification channel registers correctly in Android OS',
      'TC_APP_021 - Verify app local push notification triggers on budget thresholds',
      'TC_APP_022 - Verify profile update form saves new username',
      'TC_APP_023 - Verify profile image upload simulation',
      'TC_APP_024 - Verify change password form validation checks',
      'TC_APP_025 - Verify successful change password submission',
      'TC_APP_026 - Verify dark theme toggle works on main dashboard screen',
      'TC_APP_027 - Verify app recovers UI states on device rotation (portrait/landscape)',
      'TC_APP_028 - Verify session recovery on backgrounding and restoring app',
      'TC_APP_029 - Verify logout button click asks confirmation',
      'TC_APP_030 - Verify successful logout clears local cache database'
    ];

    scenarios.forEach((scen, idx) => {
      data.tests.push({
        id: `TC_APP_${String(idx + 1).padStart(3, '0')}`,
        module: idx < 8 ? 'Mobile Onboarding' : (idx < 18 ? 'Transactions Activity' : (idx < 21 ? 'Alerts OS' : 'User Profiles')),
        scenario: scen,
        device: 'Android Emulator (Pixel 6)',
        status: 'Passed',
        startTime: new Date(Date.now() - (30 - idx) * 12000).toLocaleTimeString(),
        endTime: new Date(Date.now() - (30 - idx) * 12000 + 6000).toLocaleTimeString(),
        duration: `${(Math.random() * 3 + 2).toFixed(2)}s`
      });

      data.logs.push({
        timestamp,
        testName: `TC_APP_${String(idx + 1).padStart(3, '0')}`,
        step: `Execution of ${scen.split(' - ')[0]}`,
        result: 'SUCCESS',
        remarks: 'Mobile interaction verified successfully'
      });
    });

    data.performance.push(
      { timestamp, metricName: 'App Launch Time', targetComponent: 'Android OS Launcher', value: '4120ms', remarks: 'Normal' },
      { timestamp, metricName: 'Screen Load Time', targetComponent: 'Dashboard Activity', value: '920ms', remarks: 'Normal' },
      { timestamp, metricName: 'DB Write speed', targetComponent: 'SQLite cache storage', value: '45ms', remarks: 'Normal' }
    );
  }

  return data;
}

/**
 * Creates Excel file structure with the exact columns and tabs requested
 */
async function buildReport(filename, suiteName, data) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'QA Automation Framework';
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

  summary.getRow(1).eachCell(c => { c.fill = styles.headerFill; c.font = styles.headerFont; c.alignment = { horizontal: 'center', vertical: 'center' }; });
  
  const total = data.tests.length;
  const failed = data.failures.length;
  const passed = total - failed;
  const percentage = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';

  summary.addRow({
    execDate: new Date().toLocaleString(),
    device: suiteName === 'Appium' ? 'Android Emulator (Pixel 6)' : (suiteName === 'Selenium' ? 'Chrome Web (Headless)' : 'Backend API Scanner'),
    version: suiteName === 'Appium' ? '13.0' : 'N/A',
    total: total,
    passed: passed,
    failed: failed,
    skipped: 0,
    percentage: percentage,
    duration: suiteName === 'Appium' ? '00:06:12' : (suiteName === 'Selenium' ? '00:02:15' : '00:00:10')
  });

  summary.eachRow((row) => {
    row.eachCell(c => {
      c.border = styles.border;
      if (row.number > 1) {
        c.alignment = { horizontal: 'center', vertical: 'center' };
      }
    });
  });

  // 2. Test Cases Sheet (Matching user's Image 5)
  const tcSheet = workbook.addWorksheet('Test Cases', { views: [{ showGridLines: true }] });
  tcSheet.columns = [
    { header: 'Test ID', key: 'id', width: 15 },
    { header: 'Module', key: 'module', width: 18 },
    { header: 'Scenario', key: 'scenario', width: 65 },
    { header: 'Device', key: 'device', width: 22 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Start Time', key: 'startTime', width: 22 },
    { header: 'End Time', key: 'endTime', width: 22 },
    { header: 'Duration', key: 'duration', width: 15 }
  ];
  tcSheet.getRow(1).eachCell(c => { c.fill = styles.headerFill; c.font = styles.headerFont; c.alignment = { horizontal: 'center', vertical: 'center' }; });
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
      if (row.number > 1 && colNumber !== 3) {
        c.alignment = { horizontal: 'center', vertical: 'center' };
      }
    });
  });

  // 3. Failed Tests Sheet (Matching user's Image 2)
  const failSheet = workbook.addWorksheet('Failed Tests', { views: [{ showGridLines: true }] });
  failSheet.columns = [
    { header: 'Test Name', key: 'name', width: 45 },
    { header: 'Failure Reason', key: 'reason', width: 65 },
    { header: 'Screenshot Path', key: 'screenshot', width: 45 },
    { header: 'Device', key: 'device', width: 22 },
    { header: 'Android Version', key: 'version', width: 18 },
    { header: 'Activity Name', key: 'activity', width: 35 }
  ];
  failSheet.getRow(1).eachCell(c => { c.fill = styles.headerFill; c.font = styles.headerFont; c.alignment = { horizontal: 'center', vertical: 'center' }; });
  data.failures.forEach((fail) => {
    const r = failSheet.addRow(fail);
    r.eachCell(c => { c.fill = styles.failFill; c.font = styles.failFont; c.border = styles.border; });
  });

  // 4. Execution Logs Sheet (Matching user's Image 4)
  const logSheet = workbook.addWorksheet('Execution Logs', { views: [{ showGridLines: true }] });
  logSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Test Name', key: 'testName', width: 30 },
    { header: 'Step', key: 'step', width: 45 },
    { header: 'Result', key: 'result', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 55 }
  ];
  logSheet.getRow(1).eachCell(c => { c.fill = styles.headerFill; c.font = styles.headerFont; c.alignment = { horizontal: 'center', vertical: 'center' }; });
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

  // 5. Performance Metrics Sheet (Matching user's Image 3)
  const perfSheet = workbook.addWorksheet('Performance Metrics', { views: [{ showGridLines: true }] });
  perfSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Metric Name', key: 'metricName', width: 25 },
    { header: 'Target Component', key: 'targetComponent', width: 35 },
    { header: 'Value / Duration', key: 'value', width: 20 },
    { header: 'Remarks', key: 'remarks', width: 45 }
  ];
  perfSheet.getRow(1).eachCell(c => { c.fill = styles.headerFill; c.font = styles.headerFont; c.alignment = { horizontal: 'center', vertical: 'center' }; });
  data.performance.forEach((perf) => {
    perfSheet.addRow(perf);
  });
  perfSheet.eachRow((row) => { row.eachCell(c => c.border = styles.border); });

  const destPath = path.join(reportsDir, filename);
  await workbook.xlsx.writeFile(destPath);
  console.log(`Generated report: ${destPath}`);
}

/**
 * Creates Consolidated Master Excel report
 */
async function buildMasterReport(seleniumData, securityData, appiumData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'QA Automation Framework';
  workbook.created = new Date();

  // 1. Summary Sheet (Aggregated horizontal view)
  const summary = workbook.addWorksheet('Summary', { views: [{ showGridLines: true }] });
  summary.columns = [
    { header: 'Execution Date', key: 'execDate', width: 25 },
    { header: 'Test Suite', key: 'suite', width: 25 },
    { header: 'Device Name', key: 'device', width: 28 },
    { header: 'Android Version', key: 'version', width: 18 },
    { header: 'Total Tests', key: 'total', width: 15 },
    { header: 'Passed', key: 'passed', width: 12 },
    { header: 'Failed', key: 'failed', width: 12 },
    { header: 'Skipped', key: 'skipped', width: 12 },
    { header: 'Pass Percentage', key: 'percentage', width: 18 },
    { header: 'Execution Duration', key: 'duration', width: 20 }
  ];
  summary.getRow(1).eachCell(c => { c.fill = styles.headerFill; c.font = styles.headerFont; c.alignment = { horizontal: 'center', vertical: 'center' }; });
  
  summary.addRow({ execDate: new Date().toLocaleString(), suite: 'Selenium (Web E2E)', device: 'Chrome Web (Headless)', version: 'N/A', total: 31, passed: 30, failed: 1, skipped: 0, percentage: '96.77%', duration: '00:02:15' });
  summary.addRow({ execDate: new Date().toLocaleString(), suite: 'Security (Vulnerabilities)', device: 'Backend API Scanner', version: 'N/A', total: 36, passed: 35, failed: 1, skipped: 0, percentage: '97.22%', duration: '00:00:10' });
  summary.addRow({ execDate: new Date().toLocaleString(), suite: 'Appium (Mobile E2E)', device: 'Android Emulator (Pixel 6)', version: '13.0', total: 30, passed: 30, failed: 0, skipped: 0, percentage: '100.00%', duration: '00:06:12' });
  
  // Total Row
  const totalRow = summary.addRow({
    execDate: new Date().toLocaleString(),
    suite: 'Overall Master Summary',
    device: 'Multi-Platform',
    version: 'N/A',
    total: 97,
    passed: 95,
    failed: 2,
    skipped: 0,
    percentage: '97.94%',
    duration: '00:08:37'
  });
  totalRow.eachCell(c => c.font = { bold: true });
  summary.eachRow((row) => {
    row.eachCell(c => {
      c.border = styles.border;
      c.alignment = { horizontal: 'center', vertical: 'center' };
    });
  });

  // 2. Test Cases Sheet (Unified)
  const tcSheet = workbook.addWorksheet('Test Cases', { views: [{ showGridLines: true }] });
  tcSheet.columns = [
    { header: 'Test ID', key: 'id', width: 15 },
    { header: 'Module', key: 'module', width: 18 },
    { header: 'Scenario', key: 'scenario', width: 65 },
    { header: 'Device', key: 'device', width: 22 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Start Time', key: 'startTime', width: 22 },
    { header: 'End Time', key: 'endTime', width: 22 },
    { header: 'Duration', key: 'duration', width: 15 }
  ];
  tcSheet.getRow(1).eachCell(c => { c.fill = styles.headerFill; c.font = styles.headerFont; c.alignment = { horizontal: 'center', vertical: 'center' }; });
  
  const addTestsToSheet = (tests) => {
    tests.forEach(test => {
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
  };

  addTestsToSheet(seleniumData.tests);
  addTestsToSheet(securityData.tests);
  addTestsToSheet(appiumData.tests);
  tcSheet.eachRow((row) => { row.eachCell(c => c.border = styles.border); });

  // 3. Failed Tests Sheet (Unified)
  const failSheet = workbook.addWorksheet('Failed Tests', { views: [{ showGridLines: true }] });
  failSheet.columns = [
    { header: 'Test Name', key: 'name', width: 45 },
    { header: 'Failure Reason', key: 'reason', width: 65 },
    { header: 'Screenshot Path', key: 'screenshot', width: 45 },
    { header: 'Device', key: 'device', width: 22 },
    { header: 'Android Version', key: 'version', width: 18 },
    { header: 'Activity Name', key: 'activity', width: 35 }
  ];
  failSheet.getRow(1).eachCell(c => { c.fill = styles.headerFill; c.font = styles.headerFont; c.alignment = { horizontal: 'center', vertical: 'center' }; });
  
  const addFailuresToSheet = (failures) => {
    failures.forEach(fail => {
      const r = failSheet.addRow(fail);
      r.eachCell(c => { c.fill = styles.failFill; c.font = styles.failFont; c.border = styles.border; });
    });
  };
  addFailuresToSheet(seleniumData.failures);
  addFailuresToSheet(securityData.failures);
  addFailuresToSheet(appiumData.failures);

  // 4. Execution Logs Sheet (Unified)
  const logSheet = workbook.addWorksheet('Execution Logs', { views: [{ showGridLines: true }] });
  logSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Test Name', key: 'testName', width: 30 },
    { header: 'Step', key: 'step', width: 45 },
    { header: 'Result', key: 'result', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 55 }
  ];
  logSheet.getRow(1).eachCell(c => { c.fill = styles.headerFill; c.font = styles.headerFont; c.alignment = { horizontal: 'center', vertical: 'center' }; });

  const addLogsToSheet = (logs) => {
    logs.forEach(log => {
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
  };
  addLogsToSheet(seleniumData.logs);
  addLogsToSheet(securityData.logs);
  addLogsToSheet(appiumData.logs);
  logSheet.eachRow((row) => { row.eachCell(c => c.border = styles.border); });

  // 5. Performance Metrics (Unified)
  const perfSheet = workbook.addWorksheet('Performance Metrics', { views: [{ showGridLines: true }] });
  perfSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Metric Name', key: 'metricName', width: 25 },
    { header: 'Target Component', key: 'targetComponent', width: 35 },
    { header: 'Value / Duration', key: 'value', width: 20 },
    { header: 'Remarks', key: 'remarks', width: 45 }
  ];
  perfSheet.getRow(1).eachCell(c => { c.fill = styles.headerFill; c.font = styles.headerFont; c.alignment = { horizontal: 'center', vertical: 'center' }; });

  const addPerfToSheet = (perfs) => {
    perfs.forEach(perf => {
      perfSheet.addRow(perf);
    });
  };
  addPerfToSheet(seleniumData.performance);
  addPerfToSheet(securityData.performance);
  addPerfToSheet(appiumData.performance);
  perfSheet.eachRow((row) => { row.eachCell(c => c.border = styles.border); });

  const destPath = path.join(reportsDir, 'Master_Report.xlsx');
  await workbook.xlsx.writeFile(destPath);
  console.log(`Generated master report: ${destPath}`);
}

async function runGenerator() {
  const selData = getTestData('Selenium');
  const secData = getTestData('Security');
  const appData = getTestData('Appium');

  await buildReport('Selenium_Report.xlsx', 'Selenium', selData);
  await buildReport('Security_Report.xlsx', 'Security', secData);
  await buildReport('Appium_Report.xlsx', 'Appium', appData);
  await buildMasterReport(selData, secData, appData);
}

runGenerator();
