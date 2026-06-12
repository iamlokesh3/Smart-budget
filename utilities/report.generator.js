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
        executionDate: new Date().toISOString(),
        deviceName: 'Android Emulator',
        androidVersion: '13.0',
        totalTests: 4,
        passed: 3,
        failed: 1,
        skipped: 0,
        passPercentage: 75.0,
        executionDuration: '00:01:24'
      },
      tests: [
        { id: 'TC001', module: 'Auth', scenario: 'Validate Invalid Login Credentials', device: 'Pixel 6', status: 'Passed', startTime: '12:00:00', endTime: '12:00:15', duration: '15s' },
        { id: 'TC002', module: 'Auth', scenario: 'Validate Successful User Login', device: 'Pixel 6', status: 'Passed', startTime: '12:00:15', endTime: '12:00:35', duration: '20s' },
        { id: 'TC003', module: 'Form', scenario: 'Validate Form Rules and Submissions', device: 'Pixel 6', status: 'Failed', startTime: '12:00:35', endTime: '12:01:10', duration: '35s' },
        { id: 'TC004', module: 'UI', scenario: 'Validate Swipe Gestures & Tabs', device: 'Pixel 6', status: 'Passed', startTime: '12:01:10', endTime: '12:01:24', duration: '14s' }
      ],
      failures: [
        { name: 'Validate Form Rules and Submissions', reason: 'AssertionError: expected field to be empty but got "John Doe"', screenshotPath: 'reports/failures/TC003_failed.png', device: 'Pixel 6', androidVersion: '13.0', activityName: 'com.example.app.FormActivity' }
      ],
      logs: [
        { timestamp: new Date().toISOString(), testName: 'Validate Invalid Login Credentials', step: 'Enter empty username', result: 'SUCCESS', remarks: 'Validation message triggered' },
        { timestamp: new Date().toISOString(), testName: 'Validate Successful User Login', step: 'Enter correct password', result: 'SUCCESS', remarks: 'Logged into dashboard' },
        { timestamp: new Date().toISOString(), testName: 'Validate Form Rules and Submissions', step: 'Validate phone characters', result: 'FAILED', remarks: 'Failed to trigger invalid chars check' }
      ]
    };
    logger.info('No raw results found, writing template Mobile_E2E_Report.xlsx');
    generateExcelReport(dummyData)
      .then((path) => console.log(`Template Excel generated: ${path}`))
      .catch((err) => console.error(err));
  }
}
