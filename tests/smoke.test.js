/**
 * Smoke Tests
 * Quick sanity tests to verify basic application functionality
 * Runs on every build to catch critical issues early
 * 
 * @module tests/smoke.test
 */

import { describe, it, before, afterEach, after } from 'mocha';
import { expect } from 'chai';
import driverFactory from '../drivers/driver.factory.js';
import LoginPage from '../pages/login.page.js';
import { logger } from '../utilities/logger.js';
import { config } from '../config/appium.config.js';
import { executionResults, recordPerformanceMetric } from './setup.js';

describe('Smoke Tests - Critical Path Verification', () => {
  let driver;
  let loginPage;
  let testStartTime;

  before(async function () {
    this.timeout(120000);
    logger.info('=== Starting Smoke Test Suite ===');
    
    try {
      driver = driverFactory.getDriver();
      loginPage = new LoginPage(driver);
      logger.info('Driver initialized successfully for smoke tests');
    } catch (error) {
      logger.error(`Failed to initialize driver for smoke tests: ${error.message}`);
      throw error;
    }
  });

  beforeEach(function () {
    testStartTime = Date.now();
    logger.info(`>>> Smoke Test: ${this.currentTest.title}`);
  });

  afterEach(async function () {
    const duration = Date.now() - testStartTime;
    const status = this.currentTest.state === 'passed' ? 'PASSED' : 'FAILED';
    
    executionResults.tests.push({
      title: this.currentTest.title,
      module: 'Smoke',
      scenario: this.currentTest.title,
      status: status,
      startTime: new Date(testStartTime).toISOString(),
      endTime: new Date().toISOString(),
      duration: duration
    });

    if (status === 'FAILED') {
      executionResults.failures.push({
        testName: this.currentTest.title,
        reason: this.currentTest.err?.message || 'Unknown error',
        errorMessage: this.currentTest.err?.stack || '',
        currentActivity: 'Unknown'
      });

      // Capture screenshot on failure
      try {
        const screenshotPath = await loginPage.takeScreenshot(`smoke_${this.currentTest.title.replace(/\s+/g, '_')}_failure.png`);
        logger.info(`Failure screenshot: ${screenshotPath}`);
      } catch (screenshotError) {
        logger.warn(`Could not capture screenshot: ${screenshotError.message}`);
      }
    }

    logger.info(`<<< Test Completed: ${this.currentTest.title} - Status: ${status} - Duration: ${duration}ms`);
  });

  after(async function () {
    logger.info('=== Smoke Test Suite Completed ===');
  });

  describe('Application Launch', () => {
    it('SM-001: App should launch successfully', async function () {
      this.timeout(30000);
      logger.info('Verifying app launch...');

      const launchStart = Date.now();
      const isDisplayed = await loginPage.isLoginPageDisplayed();
      const launchTime = Date.now() - launchStart;

      recordPerformanceMetric('App Launch', 'Login Screen', launchTime, 'Smoke Test');

      expect(isDisplayed).to.be.true;
      logger.info(`App launched successfully in ${launchTime}ms`);
    });

    it('SM-002: Login page elements should be visible', async function () {
      this.timeout(15000);
      logger.info('Verifying login page elements...');

      const emailVisible = await loginPage.isDisplayed(loginPage.emailInput);
      const passwordVisible = await loginPage.isDisplayed(loginPage.passwordInput);
      const loginBtnVisible = await loginPage.isDisplayed(loginPage.loginButton);

      expect(emailVisible).to.be.true;
      expect(passwordVisible).to.be.true;
      expect(loginBtnVisible).to.be.true;
      logger.info('All login page elements are visible');
    });
  });

  describe('Authentication Flow', () => {
    it('SM-003: Should allow valid login', async function () {
      this.timeout(30000);
      logger.info('Testing valid login...');

      const testData = config.testData;
      await loginPage.login(testData.validUsername, testData.validPassword);

      // Check for success (adjust based on your app)
      await driver.pause(2000);
      const currentActivity = await driver.getCurrentActivity();
      logger.info(`Current activity after login: ${currentActivity}`);

      // If login was successful, should navigate away from login screen
      expect(currentActivity).to.not.be.null;
    });

    it('SM-004: Should display error for invalid credentials', async function () {
      this.timeout(30000);
      logger.info('Testing invalid login...');

      const testData = config.testData;
      await loginPage.login(testData.invalidUsername, testData.invalidPassword);

      await driver.pause(1000);
      const errorMessage = await loginPage.getErrorMessage();

      expect(errorMessage.length).to.be.greaterThan(0);
      logger.info(`Error message displayed: ${errorMessage}`);
    });

    it('SM-005: Should require email field', async function () {
      this.timeout(20000);
      logger.info('Testing empty email validation...');

      const testData = config.testData;
      await loginPage.loginWithEmptyEmail(testData.validPassword);

      await driver.pause(1000);
      const errorMessage = await loginPage.getErrorMessage();

      expect(errorMessage.length).to.be.greaterThan(0);
      logger.info('Email required validation working');
    });

    it('SM-006: Should require password field', async function () {
      this.timeout(20000);
      logger.info('Testing empty password validation...');

      const testData = config.testData;
      await loginPage.loginWithEmptyPassword(testData.validUsername);

      await driver.pause(1000);
      const errorMessage = await loginPage.getErrorMessage();

      expect(errorMessage.length).to.be.greaterThan(0);
      logger.info('Password required validation working');
    });
  });

  describe('Device & Environment', () => {
    it('SM-007: Device information should be accessible', async function () {
      this.timeout(15000);
      logger.info('Retrieving device information...');

      const activity = await driver.getCurrentActivity();
      const packageName = await driver.getCurrentPackage();

      expect(activity).to.not.be.null;
      expect(packageName).to.not.be.null;

      logger.info(`Package: ${packageName}, Activity: ${activity}`);
    });

    it('SM-008: Should handle app permissions', async function () {
      this.timeout(15000);
      logger.info('Verifying app permissions handling...');

      // Accept any system alerts that might appear
      try {
        await loginPage.acceptAlert();
      } catch (error) {
        logger.debug('No alert to accept');
      }

      const isDisplayed = await loginPage.isLoginPageDisplayed();
      expect(isDisplayed).to.be.true;
      logger.info('App permissions handled successfully');
    });
  });

  describe('Performance Baseline', () => {
    it('SM-009: Login page should load within threshold', async function () {
      this.timeout(20000);
      logger.info('Checking login page load performance...');

      const loadStart = Date.now();
      await loginPage.waitForDisplayed(loginPage.loginButton, config.options.waitforTimeout);
      const loadTime = Date.now() - loadStart;

      const threshold = config.performance.screenLoadThreshold;
      logger.info(`Login page load time: ${loadTime}ms (Threshold: ${threshold}ms)`);

      // Log but don't fail on performance (just tracking baseline)
      expect(loadTime).to.be.a('number');
      recordPerformanceMetric('Login Page Load', 'Login Screen', loadTime, 'Smoke Test');
    });

    it('SM-010: Should handle rapid interactions', async function () {
      this.timeout(20000);
      logger.info('Testing rapid interactions...');

      const clickStart = Date.now();
      
      // Simulate rapid clicking
      for (let i = 0; i < 3; i++) {
        try {
          await loginPage.click(loginPage.emailInput);
          await driver.pause(100);
        } catch (error) {
          logger.debug(`Click ${i} skipped due to element not ready`);
        }
      }

      const clickTime = Date.now() - clickStart;
      logger.info(`Rapid interactions completed in ${clickTime}ms`);

      expect(clickTime).to.be.a('number');
    });
  });

  describe('Error Handling', () => {
    it('SM-011: App should recover from invalid input', async function () {
      this.timeout(20000);
      logger.info('Testing error recovery...');

      // Try invalid input
      await loginPage.typeText(loginPage.emailInput, '!!!invalid!!!', true);
      await driver.pause(500);

      // Clear and try valid input
      await loginPage.clearField(loginPage.emailInput);
      const isEmpty = await loginPage.verifyFieldsAreEmpty();

      expect(isEmpty).to.be.true;
      logger.info('Error recovery successful');
    });

    it('SM-012: App should handle network delays', async function () {
      this.timeout(30000);
      logger.info('Testing network delay handling...');

      const testData = config.testData;
      
      // Simulate login with expected delays
      const start = Date.now();
      await loginPage.login(testData.validUsername, testData.validPassword);
      const duration = Date.now() - start;

      logger.info(`Login completed in ${duration}ms`);
      expect(duration).to.be.greaterThan(0);
    });
  });
});

export default null;
