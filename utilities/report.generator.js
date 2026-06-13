import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { logger } from './logger.js';

/**
 * Compiles a detailed, multi-sheet Excel report from execution data
 * @param {object} data - Collected test execution data
 * @returns {Promise<string>} Path to the generated Excel file
 */
export async function generateExcelReport(data) {
  const excelDir = path.resolve('excel');
  if (!fs.existsSync(excelDir)) {
    fs.mkdirSync(excelDir, { recursive: true });
  }

  const filePath = path.join(excelDir, 'Mobile_E2E_Report.xlsx');
  logger.info(`Generating Excel E2E Report at: ${filePath}`);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Appium QA Automation Framework';
  workbook.lastModifiedBy = 'Appium QA Automation Framework';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color palette definitions (Emerald/Navy theme)
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' } // Navy Blue
  };
  const headerFont = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };
  const borderStyle = {
    top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
  };
  const passFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2EFDA' } // Light Green
  };
  const failFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFCE4D6' } // Light Red
  };
  const skipFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF2CC' } // Light Yellow
  };

  // -------------------------------------------------------------
  // Sheet 1: Summary
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('Summary', { views: [{ showGridLines: true }] });
  
  summarySheet.columns = [
    { header: 'Execution Date', key: 'execDate', width: 25 },
    { header: 'Device Name', key: 'device', width: 25 },
    { header: 'Android Version', key: 'version', width: 18 },
    { header: 'Total Tests', key: 'total', width: 15 },
    { header: 'Passed', key: 'passed', width: 12 },
    { header: 'Failed', key: 'failed', width: 12 },
    { header: 'Skipped', key: 'skipped', width: 12 },
    { header: 'Pass Percentage', key: 'percentage', width: 18 },
    { header: 'Execution Duration', key: 'duration', width: 20 }
  ];

  summarySheet.addRow({
    execDate: data.summary.executionDate,
    device: data.summary.deviceName,
    version: data.summary.androidVersion,
    total: data.summary.totalTests,
    passed: data.summary.passed,
    failed: data.summary.failed,
    skipped: data.summary.skipped,
    percentage: `${data.summary.passPercentage}%`,
    duration: data.summary.executionDuration
  });

  // Style Header
  summarySheet.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  summarySheet.getRow(2).eachCell((cell) => {
    cell.border = borderStyle;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // -------------------------------------------------------------
  // Sheet 2: Test Cases
  // -------------------------------------------------------------
  const testCasesSheet = workbook.addWorksheet('Test Cases', { views: [{ showGridLines: true }] });
  
  testCasesSheet.columns = [
    { header: 'Test ID', key: 'id', width: 15 },
    { header: 'Module', key: 'module', width: 18 },
    { header: 'Scenario', key: 'scenario', width: 40 },
    { header: 'Device', key: 'device', width: 22 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Start Time', key: 'startTime', width: 25 },
    { header: 'End Time', key: 'endTime', width: 25 },
    { header: 'Duration', key: 'duration', width: 15 }
  ];

  data.tests.forEach((test) => {
    const row = testCasesSheet.addRow({
      id: test.id,
      module: test.module,
      scenario: test.scenario,
      device: test.device,
      status: test.status,
      startTime: test.startTime,
      endTime: test.endTime,
      duration: test.duration
    });

    // Color by status
    const statusCell = row.getCell('status');
    if (test.status === 'Passed') {
      statusCell.fill = passFill;
    } else if (test.status === 'Failed') {
      statusCell.fill = failFill;
    } else {
      statusCell.fill = skipFill;
    }
  });

  testCasesSheet.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  testCasesSheet.eachRow({ includeHeader: false }, (row) => {
    row.eachCell((cell) => {
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  });

  // -------------------------------------------------------------
  // Sheet 3: Failed Tests
  // -------------------------------------------------------------
  const failedSheet = workbook.addWorksheet('Failed Tests', { views: [{ showGridLines: true }] });
  
  failedSheet.columns = [
    { header: 'Test Name', key: 'name', width: 40 },
    { header: 'Failure Reason', key: 'reason', width: 60 },
    { header: 'Screenshot Path', key: 'screenshot', width: 45 },
    { header: 'Device', key: 'device', width: 22 },
    { header: 'Android Version', key: 'version', width: 18 },
    { header: 'Activity Name', key: 'activity', width: 35 }
  ];

  data.failures.forEach((fail) => {
    failedSheet.addRow({
      name: fail.name,
      reason: fail.reason,
      screenshot: fail.screenshotPath,
      device: fail.device,
      version: fail.androidVersion,
      activity: fail.activityName
    });
  });

  failedSheet.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  failedSheet.eachRow({ includeHeader: false }, (row) => {
    row.eachCell((cell) => {
      cell.border = borderStyle;
      cell.fill = failFill;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  });

  // -------------------------------------------------------------
  // Sheet 4: Execution Logs
  // -------------------------------------------------------------
  const logsSheet = workbook.addWorksheet('Execution Logs', { views: [{ showGridLines: true }] });
  
  logsSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 22 },
    { header: 'Test Name', key: 'testName', width: 30 },
    { header: 'Step', key: 'step', width: 45 },
    { header: 'Result', key: 'result', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 45 }
  ];

  data.logs.forEach((log) => {
    const row = logsSheet.addRow({
      timestamp: log.timestamp,
      testName: log.testName,
      step: log.step,
      result: log.result,
      remarks: log.remarks
    });

    const resultCell = row.getCell('result');
    if (log.result === 'SUCCESS') {
      resultCell.fill = passFill;
    } else if (log.result === 'FAILED') {
      resultCell.fill = failFill;
    } else {
      resultCell.fill = skipFill;
    }
  });

  logsSheet.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  logsSheet.eachRow({ includeHeader: false }, (row) => {
    row.eachCell((cell) => {
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  });

  // -------------------------------------------------------------
  // Sheet 5: Performance Metrics
  // -------------------------------------------------------------
  const perfSheet = workbook.addWorksheet('Performance Metrics', { views: [{ showGridLines: true }] });
  
  perfSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 22 },
    { header: 'Metric Name', key: 'metricName', width: 25 },
    { header: 'Target Component', key: 'targetComponent', width: 35 },
    { header: 'Value / Duration', key: 'value', width: 20 },
    { header: 'Remarks', key: 'remarks', width: 45 }
  ];

  const perfData = data.performance || [];
  perfData.forEach((perf) => {
    perfSheet.addRow({
      timestamp: perf.timestamp,
      metricName: perf.metricName,
      targetComponent: perf.targetComponent,
      value: perf.value,
      remarks: perf.remarks
    });
  });

  perfSheet.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  perfSheet.eachRow({ includeHeader: false }, (row) => {
    row.eachCell((cell) => {
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  });

  // Write Excel file
  await workbook.xlsx.writeFile(filePath);
  logger.info(`Excel Report generated successfully at: ${filePath}`);
  return filePath;
}

// Standalone execution script support
if (process.argv[1] && process.argv[1].endsWith('report.generator.js')) {
  logger.info('Running Excel Report Generator directly with mock/last results...');
  const resultsPath = path.resolve('reports/raw-results.json');
  if (fs.existsSync(resultsPath)) {
    try {
      const raw = fs.readFileSync(resultsPath, 'utf8');
      const data = JSON.parse(raw);
      generateExcelReport(data)
        .then((path) => console.log(`Excel generated at ${path}`))
        .catch((err) => console.error(err));
    } catch (e) {
      console.error('Failed to parse reports/raw-results.json', e);
    }
  } else {
    // Generate dummy test results to verify compile works out-of-the-box
    const dummyData = {
      summary: {
        executionDate: new Date().toLocaleString(),
        deviceName: 'Android Emulator (Pixel 6)',
        androidVersion: '13.0',
        totalTests: 17,
        passed: 17,
        failed: 0,
        skipped: 0,
        passPercentage: 100.0,
        executionDuration: '00:03:45'
      },
      tests: [
        { id: 'TC001', module: 'Auth', scenario: 'TC_AUTH_001 - Should validate empty username input', device: 'Pixel 6', status: 'Passed', startTime: '10:00:01', endTime: '10:00:08', duration: '7.12s' },
        { id: 'TC002', module: 'Auth', scenario: 'TC_AUTH_002 - Should validate empty password input', device: 'Pixel 6', status: 'Passed', startTime: '10:00:08', endTime: '10:00:14', duration: '6.45s' },
        { id: 'TC003', module: 'Auth', scenario: 'TC_AUTH_003 - Should validate invalid credentials and error banners', device: 'Pixel 6', status: 'Passed', startTime: '10:00:14', endTime: '10:00:23', duration: '8.92s' },
        { id: 'TC004', module: 'Auth', scenario: 'TC_AUTH_004 - Should perform successful user login & dashboard navigation', device: 'Pixel 6', status: 'Passed', startTime: '10:00:23', endTime: '10:00:36', duration: '13.15s' },
        { id: 'TC005', module: 'Auth', scenario: 'TC_AUTH_005 - Should verify session persistence on app relaunch', device: 'Pixel 6', status: 'Passed', startTime: '10:00:36', endTime: '10:00:46', duration: '9.80s' },
        { id: 'TC006', module: 'Auth', scenario: 'TC_AUTH_006 - Should validate logout and return to login screen', device: 'Pixel 6', status: 'Passed', startTime: '10:00:46', endTime: '10:00:54', duration: '8.10s' },
        
        { id: 'TC007', module: 'Form', scenario: 'TC_FORM_001 - Should validate incorrect email format', device: 'Pixel 6', status: 'Passed', startTime: '10:00:54', endTime: '10:01:05', duration: '10.50s' },
        { id: 'TC008', module: 'Form', scenario: 'TC_FORM_002 - Should validate phone numbers constraints', device: 'Pixel 6', status: 'Passed', startTime: '10:01:05', endTime: '10:01:14', duration: '9.22s' },
        { id: 'TC009', module: 'Form', scenario: 'TC_FORM_003 - Should validate password strength requirement checks', device: 'Pixel 6', status: 'Passed', startTime: '10:01:14', endTime: '10:01:25', duration: '11.08s' },
        { id: 'TC010', module: 'Form', scenario: 'TC_FORM_004 - Should validate mandatory checkbox selections', device: 'Pixel 6', status: 'Passed', startTime: '10:01:25', endTime: '10:01:34', duration: '8.75s' },
        { id: 'TC011', module: 'Form', scenario: 'TC_FORM_005 - Should submit form successfully with valid inputs, dates, & dropdowns', device: 'Pixel 6', status: 'Passed', startTime: '10:01:34', endTime: '10:01:52', duration: '17.65s' },
        
        { id: 'TC012', module: 'UI', scenario: 'TC_UI_001 - Should perform and validate Swipe gestures', device: 'Pixel 6', status: 'Passed', startTime: '10:01:52', endTime: '10:02:04', duration: '12.30s' },
        { id: 'TC013', module: 'UI', scenario: 'TC_UI_002 - Should perform Double Tap & Long Press on target controls', device: 'Pixel 6', status: 'Passed', startTime: '10:02:04', endTime: '10:02:18', duration: '13.90s' },
        { id: 'TC014', module: 'UI', scenario: 'TC_UI_003 - Should scroll RecyclerView layout until a target card is visible', device: 'Pixel 6', status: 'Passed', startTime: '10:02:18', endTime: '10:02:35', duration: '17.40s' },
        { id: 'TC015', module: 'UI', scenario: 'TC_UI_004 - Should perform Drag and Drop operations', device: 'Pixel 6', status: 'Passed', startTime: '10:02:35', endTime: '10:02:49', duration: '14.15s' },
        { id: 'TC016', module: 'UI', scenario: 'TC_UI_005 - Should perform Pinch & Zoom gestures on visual analytics components', device: 'Pixel 6', status: 'Passed', startTime: '10:02:49', endTime: '10:03:04', duration: '15.20s' },
        { id: 'TC017', module: 'UI', scenario: 'TC_UI_006 - Should assert alerts, toasts, snackbars, and progress bar state transitions', device: 'Pixel 6', status: 'Passed', startTime: '10:03:04', endTime: '10:03:22', duration: '17.80s' }
      ],
      failures: [],
      logs: [
        { timestamp: new Date().toISOString(), testName: 'TC_AUTH_001', step: 'Validate Username Input Warning', result: 'SUCCESS', remarks: 'Assertion verified: "Username is required"' },
        { timestamp: new Date().toISOString(), testName: 'TC_AUTH_004', step: 'User Authentication & Login', result: 'SUCCESS', remarks: 'Dashboard loaded successfully' },
        { timestamp: new Date().toISOString(), testName: 'TC_FORM_005', step: 'Select custom calendar picker day', result: 'SUCCESS', remarks: 'Date selected: 15' },
        { timestamp: new Date().toISOString(), testName: 'TC_FORM_005', step: 'Form Submission', result: 'SUCCESS', remarks: 'Captured toast: "Form Submitted Successfully"' },
        { timestamp: new Date().toISOString(), testName: 'TC_UI_001', step: 'Perform Swipe Gestures', result: 'SUCCESS', remarks: 'Swiped Left and Swiped Right successfully' },
        { timestamp: new Date().toISOString(), testName: 'TC_UI_003', step: 'Scroll Recycler List', result: 'SUCCESS', remarks: 'Found element: Transaction ID: #4829' }
      ],
      performance: [
        { timestamp: new Date().toISOString(), metricName: 'App Launch Time', targetComponent: 'System/Driver Initializer', value: '4521ms', remarks: 'Successfully initialized driver' },
        { timestamp: new Date().toISOString(), metricName: 'Screen Load Time', targetComponent: 'Dashboard Page', value: '1850ms', remarks: 'Dashboard loaded successfully after authentication' },
        { timestamp: new Date().toISOString(), metricName: 'Screen Load Time', targetComponent: 'Form Page', value: '620ms', remarks: 'Form page loaded successfully' },
        { timestamp: new Date().toISOString(), metricName: 'API Response Delay', targetComponent: 'Form Submission Service', value: '430ms', remarks: 'Form submission API response delay' },
        { timestamp: new Date().toISOString(), metricName: 'Crash Event', targetComponent: 'Validate Auth Form Rules', value: 'NONE', remarks: 'No crash detected' }
      ]
    };
    logger.info('No raw results found, writing template Mobile_E2E_Report.xlsx');
    generateExcelReport(dummyData)
      .then((path) => console.log(`Template Excel generated: ${path}`))
      .catch((err) => console.error(err));
  }
}
