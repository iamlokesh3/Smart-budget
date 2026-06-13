/**
 * Appium Configuration Module
 * Comprehensive configuration for Appium E2E testing framework
 * Supports both APK installation and pre-installed applications
 * Supports real devices and Android emulators
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const __dirname = path.resolve();

// Create required directories if they don't exist
const createDirectoriesIfNeeded = () => {
  const dirs = [
    process.env.LOG_DIR || './logs',
    process.env.SCREENSHOT_DIR || './screenshots',
    process.env.REPORT_DIR || './reports',
    './excel',
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectoriesIfNeeded();

export const config = {
  // Appium server configuration
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: process.env.APPIUM_PATH || '/',
    timeout: parseInt(process.env.APPIUM_TIMEOUT || '60000', 10),
  },

  // Target environment
  environment: process.env.NODE_ENV || 'development',
  isCI: process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true',

  // Android Capabilities
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    
    // Dynamic values that can be overridden by Environment variables
    'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '13',
    'appium:udid': process.env.DEVICE_UDID || '',
    
    // App Launch Mode: APK vs. Pre-installed
    'appium:app': process.env.APK_PATH && fs.existsSync(process.env.APK_PATH) 
      ? path.resolve(process.env.APK_PATH) 
      : undefined,
    'appium:appPackage': process.env.APP_PACKAGE || 'com.example.smartbudget',
    'appium:appActivity': process.env.APP_ACTIVITY || 'com.example.smartbudget.MainActivity',
    
    // Session configurations
    'appium:noReset': process.env.NO_RESET === 'true' || false,
    'appium:fullReset': process.env.FULL_RESET === 'true' || false,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': parseInt(process.env.NEW_COMMAND_TIMEOUT || '300', 10),
    'appium:appWaitActivity': process.env.APP_ACTIVITY || 'com.example.smartbudget.MainActivity',
    'appium:appWaitDuration': parseInt(process.env.APPIUM_TIMEOUT || '60000', 10),
    'appium:gpsEnabled': true,
    
    // Performance and logs capabilities
    'appium:ensureWebviewsHavePages': true,
    'appium:nativeWebScreenshot': true,
    'appium:androidInstallTimeout': 90000,
    'appium:settings': {
      waitForIdleTimeout: 500,
      waitForSelectorTimeout: 10000,
      shouldUseCompactResponses: true,
    },
  },

  // Test Runner configuration
  options: {
    waitforTimeout: parseInt(process.env.EXPLICIT_WAIT || '15000', 10),
    implicitWait: parseInt(process.env.IMPLICIT_WAIT || '10000', 10),
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  // Logging and Reporting
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    logDir: process.env.LOG_DIR || './logs',
    screenshotDir: process.env.SCREENSHOT_DIR || './screenshots',
    logcatDir: path.join(process.env.SCREENSHOT_DIR || './screenshots', 'logcat'),
    reportDir: process.env.REPORT_DIR || './reports',
    excelReportPath: process.env.EXCEL_REPORT_PATH || './excel/Mobile_E2E_Report.xlsx',
  },

  // Screenshot and Device Logs
  capture: {
    captureOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
    captureLogcat: process.env.CAPTURE_LOGCAT !== 'false',
  },

  // Performance Thresholds
  performance: {
    appLaunchThreshold: parseInt(process.env.APP_LAUNCH_THRESHOLD || '8000', 10),
    screenLoadThreshold: parseInt(process.env.SCREEN_LOAD_THRESHOLD || '5000', 10),
    apiResponseThreshold: parseInt(process.env.API_RESPONSE_THRESHOLD || '3000', 10),
  },

  // Retry Configuration
  retry: {
    maxRetries: parseInt(process.env.RETRY_COUNT || '2', 10),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000', 10),
  },

  // Test Data
  testData: {
    testDataDir: process.env.TEST_DATA_DIR || './testdata',
    validUsername: process.env.VALID_USERNAME || 'testuser@example.com',
    validPassword: process.env.VALID_PASSWORD || 'Test@1234',
    invalidUsername: 'invalid@example.com',
    invalidPassword: 'InvalidPassword123',
    emptyValue: '',
  },
};

// Common UI Locators for Android UiAutomator2
export const locators = {
  // Navigation
  bottomNavigation: '//*[@resource-id="com.example.smartbudget:id/bottom_nav"]',
  navigationDrawer: '//*[@resource-id="com.example.smartbudget:id/nav_drawer"]',
  menuButton: '//*[@resource-id="com.example.smartbudget:id/menu_button"]',
  backButton: '//*[@content-desc="Navigate up"]',
  
  // Common Buttons
  loginButton: '//*[@resource-id="com.example.smartbudget:id/btn_login"]',
  logoutButton: '//*[@resource-id="com.example.smartbudget:id/btn_logout"]',
  submitButton: '//*[@resource-id="com.example.smartbudget:id/btn_submit"]',
  cancelButton: '//*[@resource-id="com.example.smartbudget:id/btn_cancel"]',
  
  // Input Fields
  emailInput: '//*[@resource-id="com.example.smartbudget:id/et_email"]',
  passwordInput: '//*[@resource-id="com.example.smartbudget:id/et_password"]',
  usernameInput: '//*[@resource-id="com.example.smartbudget:id/et_username"]',
  
  // Messages
  errorMessage: '//*[@resource-id="com.example.smartbudget:id/tv_error"]',
  successMessage: '//*[@resource-id="com.example.smartbudget:id/tv_success"]',
  toastMessage: '//*[@class="android.widget.Toast"]',
  
  // Dialogs
  alertDialog: '//*[@class="android.app.AlertDialog$Builder"]',
  dialogTitle: '//*[@resource-id="android:id/alertTitle"]',
  dialogMessage: '//*[@resource-id="android:id/message"]',
  dialogPositiveButton: '//*[@resource-id="android:id/button1"]',
  dialogNegativeButton: '//*[@resource-id="android:id/button2"]',
  
  // Loading
  progressBar: '//*[@resource-id="com.example.smartbudget:id/progress_bar"]',
  loadingSpinner: '//*[@resource-id="com.example.smartbudget:id/loading"]',
};

export default { config, locators };
