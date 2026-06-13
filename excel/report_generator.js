/**
 * Excel Report Generator
 * Generates comprehensive Excel reports with multiple sheets
 * Includes test summary, detailed test cases, failures, and execution logs
 * 
 * @module excel/report_generator
 */

import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { logger } from '../utilities/logger.js';
import { executionResults } from '../tests/setup.js';

const reportDir = path.resolve('excel');

// Ensure directory exists
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

/**
 * Generate comprehensive Excel report
 * @param {Object} results - Test execution results
 * @param {string} filename - Output filename
 * @returns {Promise<string>} Report file path
 */
export async function generateExcelReport(results = executionResults, filename = 'Mobile_E2E_Report.xlsx') {
  try {
    logger.info('Generating Excel Report...');
    
    const workbook = new ExcelJS.Workbook();
    const reportPath = path.join(reportDir, filename);

    // Sheet 1: Summary
    createSummarySheet(workbook, results);
    
    // Sheet 2: Test Cases
    createTestCasesSheet(workbook, results);
    
    // Sheet 3: Failed Tests
    createFailuresSheet(workbook, results);
    
    // Sheet 4: Execution Logs
    createLogsSheet(workbook, results);
    
    // Sheet 5: Performance Metrics
    createPerformanceSheet(workbook, results);

    await workbook.xlsx.writeFile(reportPath);
    logger.info(`Excel report generated successfully: ${reportPath}`);
    return reportPath;
  } catch (error) {
    logger.error(`Failed to generate Excel report: ${error.message}`);
    throw error;
  }
}

/**
 * Create Summary Sheet
 */
function createSummarySheet(workbook, results) {
  const sheet = workbook.addWorksheet('Summary');
  
  // Set column widths
  sheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 40 }
  ];

  // Add header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'center' };

  // Add data
  const summaryData = results.summary;
  sheet.addRow({
    metric: 'Execution Date',
    value: summaryData.executionDate
  });
  sheet.addRow({
    metric: 'Device Name',
    value: summaryData.deviceName
  });
  sheet.addRow({
    metric: 'Android Version',
    value: summaryData.androidVersion
  });
  sheet.addRow({
    metric: 'Total Tests',
    value: summaryData.totalTests
  });
  sheet.addRow({
    metric: 'Passed',
    value: summaryData.passed
  });
  sheet.addRow({
    metric: 'Failed',
    value: summaryData.failed
  });
  sheet.addRow({
    metric: 'Skipped',
    value: summaryData.skipped
  });
  sheet.addRow({
    metric: 'Pass Percentage',
    value: `${summaryData.passPercentage.toFixed(2)}%`
  });
  sheet.addRow({
    metric: 'Execution Duration',
    value: summaryData.executionDuration
  });

  logger.debug('Summary sheet created');
}

/**
 * Create Test Cases Sheet
 */
function createTestCasesSheet(workbook, results) {
  const sheet = workbook.addWorksheet('Test Cases');
  
  // Set column widths
  sheet.columns = [
    { header: 'Test ID', key: 'testId', width: 10 },
    { header: 'Module', key: 'module', width: 20 },
    { header: 'Scenario', key: 'scenario', width: 30 },
    { header: 'Device', key: 'device', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Start Time', key: 'startTime', width: 20 },
    { header: 'End Time', key: 'endTime', width: 20 },
    { header: 'Duration (ms)', key: 'duration', width: 15 }
  ];

  // Add header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'center' };

  // Add test data
  results.tests.forEach((test, index) => {
    const row = sheet.addRow({
      testId: index + 1,
      module: test.module || 'N/A',
      scenario: test.scenario || test.title || 'N/A',
      device: results.summary.deviceName,
      status: test.status || 'UNKNOWN',
      startTime: test.startTime || new Date().toISOString(),
      endTime: test.endTime || new Date().toISOString(),
      duration: test.duration || 0
    });

    // Apply conditional formatting for status
    const statusCell = row.getCell('status');
    if (test.status === 'PASSED') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      statusCell.font = { color: { argb: 'FF006100' } };
    } else if (test.status === 'FAILED') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
      statusCell.font = { color: { argb: 'FF9C0006' } };
    } else if (test.status === 'SKIPPED') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
      statusCell.font = { color: { argb: 'FF9C6500' } };
    }
  });

  logger.debug('Test Cases sheet created');
}

/**
 * Create Failures Sheet
 */
function createFailuresSheet(workbook, results) {
  const sheet = workbook.addWorksheet('Failed Tests');
  
  // Set column widths
  sheet.columns = [
    { header: 'Test Name', key: 'testName', width: 30 },
    { header: 'Failure Reason', key: 'reason', width: 40 },
    { header: 'Screenshot Path', key: 'screenshot', width: 40 },
    { header: 'Device', key: 'device', width: 20 },
    { header: 'Android Version', key: 'androidVersion', width: 15 },
    { header: 'Activity', key: 'activity', width: 30 }
  ];

  // Add header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'center' };

  // Add failure data
  results.failures.forEach((failure) => {
    sheet.addRow({
      testName: failure.testName || 'N/A',
      reason: failure.reason || failure.errorMessage || 'No reason provided',
      screenshot: failure.screenshotPath || 'N/A',
      device: results.summary.deviceName,
      androidVersion: results.summary.androidVersion,
      activity: failure.currentActivity || 'Unknown'
    });
  });

  logger.debug('Failures sheet created');
}

/**
 * Create Execution Logs Sheet
 */
function createLogsSheet(workbook, results) {
  const sheet = workbook.addWorksheet('Execution Logs');
  
  // Set column widths
  sheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Test Name', key: 'testName', width: 25 },
    { header: 'Step', key: 'step', width: 30 },
    { header: 'Result', key: 'result', width: 12 },
    { header: 'Remarks', key: 'remarks', width: 40 }
  ];

  // Add header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'center' };

  // Add log data
  results.logs.forEach((log) => {
    const row = sheet.addRow({
      timestamp: log.timestamp || new Date().toISOString(),
      testName: log.testName || 'System',
      step: log.step || 'N/A',
      result: log.result || 'INFO',
      remarks: log.remarks || ''
    });

    // Apply conditional formatting for result
    const resultCell = row.getCell('result');
    if (log.result === 'SUCCESS') {
      resultCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      resultCell.font = { color: { argb: 'FF006100' } };
    } else if (log.result === 'FAILURE') {
      resultCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
      resultCell.font = { color: { argb: 'FF9C0006' } };
    }
  });

  logger.debug('Execution Logs sheet created');
}

/**
 * Create Performance Sheet
 */
function createPerformanceSheet(workbook, results) {
  const sheet = workbook.addWorksheet('Performance');
  
  // Set column widths
  sheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Metric Name', key: 'metricName', width: 25 },
    { header: 'Component', key: 'component', width: 25 },
    { header: 'Value', key: 'value', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 40 }
  ];

  // Add header styling
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'center' };

  // Add performance data
  if (results.performance && results.performance.length > 0) {
    results.performance.forEach((perf) => {
      sheet.addRow({
        timestamp: perf.timestamp || new Date().toISOString(),
        metricName: perf.metricName || 'N/A',
        component: perf.targetComponent || 'N/A',
        value: perf.value || 'N/A',
        remarks: perf.remarks || ''
      });
    });
  }

  logger.debug('Performance sheet created');
}

/**
 * Export HTML report metadata as JSON for reference
 */
export async function generateReportMetadata(results = executionResults) {
  try {
    const metadataPath = path.join(reportDir, 'report_metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(results, null, 2));
    logger.info(`Report metadata saved: ${metadataPath}`);
    return metadataPath;
  } catch (error) {
    logger.error(`Failed to generate report metadata: ${error.message}`);
    throw error;
  }
}

export default {
  generateExcelReport,
  generateReportMetadata,
};
