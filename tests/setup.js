import fs from 'fs';
import path from 'path';
import driverFactory from '../drivers/driver.factory.js';
import { generateExcelReport } from '../utilities/report.generator.js';
import { logger } from '../utilities/logger.js';

// Setup directories
const reportsDir = path.resolve('reports');
const failuresDir = path.join(reportsDir, 'failures');
const logsDir = path.resolve('logs');
const excelDir = path.resolve('excel');

[reportsDir, failuresDir, logsDir, excelDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Global result holder
export const executionResults = {
  summary: {
    executionDate: new Date().toLocaleString(),
    deviceName: 'Android Device',
    androidVersion: 'Unknown',
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    passPercentage: 0,
    executionDuration: ''
  },
  tests: [],
  failures: [],
  logs: []
};

let startTime;

before(async function () {
  this.timeout(180000); // Allow time for emulator startup
  logger.info('=== Starting Android E2E Test Suite Run ===');
  startTime = Date.now();
  
  // Initialize the driver
  const driver = await driverFactory.initDriver();
  
  // Cache device information for report
  try {
    const caps = await driver.getCapabilities();
    executionResults.summary.deviceName = caps['appium:deviceName'] || caps.deviceName || 'Android Emulator';
    executionResults.summary.androidVersion = caps['appium:platformVersion'] || caps.platformVersion || '13';
  } catch (err) {
    logger.warn('Failed to retrieve device capabilities for report summary.');
  }
});

beforeEach(function () {
  this.currentTestStartTime = Date.now();
  logger.info(`>>> Test Started: [${this.currentTest.title}]`);
  executionResults.logs.push({
    timestamp: new Date().toISOString(),
    testName: this.currentTest.title,
    step: 'Test Initialized',
    result: 'SUCCESS',
    remarks: 'Ready to execute steps'
  });
});

afterEach(async function () {
  const durationMs = Date.now() - this.currentTestStartTime;
  const durationSec = (durationMs / 1000).toFixed(2) + 's';
  const driver = driverFactory.getDriver();
  
  const testTitle = this.currentTest.title;
  const testState = this.currentTest.state || 'skipped'; // passed, failed, or skipped
  const moduleName = this.currentTest.parent.title || 'General';

  logger.info(`<<< Test Finished: [${testTitle}] - Status: ${testState.toUpperCase()} - Duration: ${durationSec}`);

  executionResults.summary.totalTests++;
  if (testState === 'passed') {
    executionResults.summary.passed++;
  } else if (testState === 'failed') {
    executionResults.summary.failed++;
  } else {
    executionResults.summary.skipped++;
  }

  // Record test details
  executionResults.tests.push({
    id: `TC${String(executionResults.summary.totalTests).padStart(3, '0')}`,
    module: moduleName,
    scenario: testTitle,
    device: executionResults.summary.deviceName,
    status: testState === 'passed' ? 'Passed' : (testState === 'failed' ? 'Failed' : 'Skipped'),
    startTime: new Date(this.currentTestStartTime).toLocaleTimeString(),
    endTime: new Date().toLocaleTimeString(),
    duration: durationSec
  });

  // Handle failure screenshot, logs and metadata
  if (testState === 'failed') {
    const errMessage = this.currentTest.err ? this.currentTest.err.message : 'Unknown error';
    const errStack = this.currentTest.err ? this.currentTest.err.stack : '';
    
    // File name friendly test title
    const safeTitle = testTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const screenshotPath = path.join(failuresDir, `${safeTitle}_screenshot.png`);
    const logsPath = path.join(failuresDir, `${safeTitle}_logcat.log`);
    
    let currentActivity = 'Unknown';
    try {
      currentActivity = await driver.getCurrentActivity();
    } catch (e) {
      logger.warn(`Could not fetch current activity on failure: ${e.message}`);
    }

    // Capture screenshot
    try {
      await driver.saveScreenshot(screenshotPath);
      logger.info(`Screenshot captured for failed test: ${screenshotPath}`);
    } catch (err) {
      logger.error(`Failed to capture screenshot: ${err.message}`);
    }

    // Capture logcat logs
    try {
      const logs = await driver.getLogs('logcat');
      const logString = logs.map(l => `[${new Date(l.timestamp).toISOString()}] [${l.level}] ${l.message}`).join('\n');
      fs.writeFileSync(logsPath, logString);
      logger.info(`Logcat logs dumped to: ${logsPath}`);
    } catch (err) {
      logger.warn(`Failed to capture logcat logs: ${err.message}`);
    }

    executionResults.failures.push({
      name: testTitle,
      reason: errMessage,
      screenshotPath: screenshotPath,
      device: executionResults.summary.deviceName,
      androidVersion: executionResults.summary.androidVersion,
      activityName: currentActivity
    });

    executionResults.logs.push({
      timestamp: new Date().toISOString(),
      testName: testTitle,
      step: 'Test Execution Failure Handled',
      result: 'FAILED',
      remarks: `Error: ${errMessage}. Activity: ${currentActivity}. Stack: ${errStack}`
    });
  } else {
    executionResults.logs.push({
      timestamp: new Date().toISOString(),
      testName: testTitle,
      step: 'Test Execution Success',
      result: 'SUCCESS',
      remarks: 'All assertions verified'
    });
  }
});

after(async function () {
  this.timeout(60000);
  logger.info('=== Ending Android E2E Test Suite Run ===');
  
  // Calculate total execution duration
  const totalDurationMs = Date.now() - startTime;
  const hours = String(Math.floor(totalDurationMs / 3600000)).padStart(2, '0');
  const minutes = String(Math.floor((totalDurationMs % 3600000) / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((totalDurationMs % 60000) / 1000)).padStart(2, '0');
  executionResults.summary.executionDuration = `${hours}:${minutes}:${seconds}`;

  // Calculate pass percentage
  const total = executionResults.summary.totalTests;
  const passed = executionResults.summary.passed;
  executionResults.summary.passPercentage = total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0;

  // Save raw results to JSON file for standalone generators
  try {
    fs.writeFileSync(
      path.join(reportsDir, 'raw-results.json'),
      JSON.stringify(executionResults, null, 2)
    );
    logger.info('Raw results JSON saved.');
  } catch (err) {
    logger.error(`Failed to write raw-results.json: ${err.message}`);
  }

  // Generate Excel report
  try {
    await generateExcelReport(executionResults);
  } catch (err) {
    logger.error(`Failed to compile Excel Report: ${err.stack}`);
  }

  // Terminate driver session
  await driverFactory.quitDriver();
});
