import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const __dirname = path.resolve();

export const config = {
  // Appium server configuration
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: process.env.APPIUM_PATH || '/'
  },

  // Target environment
  environment: process.env.NODE_ENV || 'development',

  // Android Capabilities
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    
    // Dynamic values that can be overridden by Environment variables
    'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '13',
    'appium:udid': process.env.DEVICE_UDID || '',
    
    // App Launch Mode: APK vs. Pre-installed
    'appium:app': process.env.APK_PATH ? path.resolve(__dirname, process.env.APK_PATH) : undefined,
    'appium:appPackage': process.env.APP_PACKAGE || 'com.example.app',
    'appium:appActivity': process.env.APP_ACTIVITY || 'com.example.app.MainActivity',
    
    // Session configurations
    'appium:noReset': process.env.NO_RESET === 'true' || false,
    'appium:fullReset': process.env.FULL_RESET === 'true' || false,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': parseInt(process.env.NEW_COMMAND_TIMEOUT || '60', 10),
    'appium:gpsEnabled': true,
    
    // Performance and logs capabilities
    'appium:ensureWebviewsHavePages': true,
    'appium:nativeWebScreenshot': true,
    'appium:androidInstallTimeout': 90000
  },

  // Test Runner configuration
  options: {
    waitforTimeout: parseInt(process.env.WAIT_TIMEOUT || '10000', 10),
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    logLevel: 'info'
  }
};
