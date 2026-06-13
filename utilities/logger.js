/**
 * Logger Utility Module
 * Provides comprehensive logging functionality using Winston
 * Logs to both console and files with different log levels
 * 
 * @module utilities/logger
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const logDir = process.env.LOG_DIR || './logs';

// Create log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(logColors);

// Define format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} - ${info.level}: ${info.message}`
  )
);

// Define format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    ),
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(logDir, `appium-${new Date().toISOString().split('T')[0]}.log`),
    format: fileFormat,
    maxsize: 20971520, // 20MB
    maxFiles: 5,
  }),
  
  // File transport for errors only
  new winston.transports.File({
    filename: path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`),
    level: 'error',
    format: fileFormat,
    maxsize: 20971520,
    maxFiles: 5,
  }),
];

/**
 * Create and configure Winston logger
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels: logLevels,
  format: fileFormat,
  transports: transports,
  exitOnError: false,
});

/**
 * Log test execution details
 * @param {string} testName - Name of the test
 * @param {string} step - Test step description
 * @param {string} status - Step status (PASS/FAIL/INFO)
 * @param {string} remarks - Additional remarks
 */
export const logTestStep = (testName, step, status = 'INFO', remarks = '') => {
  const message = `[${testName}] ${step} - ${status}${remarks ? ` - ${remarks}` : ''}`;
  
  switch (status) {
    case 'PASS':
      logger.info(message);
      break;
    case 'FAIL':
      logger.error(message);
      break;
    case 'WARN':
      logger.warn(message);
      break;
    default:
      logger.debug(message);
  }
};

/**
 * Log test execution metrics
 * @param {string} testName - Name of the test
 * @param {number} startTime - Test start time
 * @param {number} endTime - Test end time
 * @param {string} status - Test status
 */
export const logTestMetrics = (testName, startTime, endTime, status) => {
  const duration = endTime - startTime;
  logger.info(`[TEST METRICS] ${testName} - Status: ${status}, Duration: ${duration}ms`);
};

/**
 * Log performance metrics
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {number} threshold - Performance threshold
 */
export const logPerformanceMetric = (metric, value, threshold) => {
  if (value > threshold) {
    logger.warn(`[PERFORMANCE] ${metric}: ${value}ms (Threshold: ${threshold}ms) - SLOW`);
  } else {
    logger.info(`[PERFORMANCE] ${metric}: ${value}ms (Threshold: ${threshold}ms) - OK`);
  }
};

/**
 * Log screenshot capture
 * @param {string} path - Screenshot file path
 * @param {string} reason - Reason for screenshot
 */
export const logScreenshot = (path, reason = 'Test Failure') => {
  logger.info(`[SCREENSHOT] ${reason} - Saved to: ${path}`);
};

/**
 * Log device logs capture
 * @param {string} path - Device log file path
 * @param {number} logCount - Number of log entries
 */
export const logDeviceLogs = (path, logCount) => {
  logger.info(`[DEVICE LOGS] Captured ${logCount} log entries - Saved to: ${path}`);
};

/**
 * Create a test session log
 * @returns {Object} Session logger object
 */
export const createSessionLogger = () => {
  const sessionId = Date.now();
  const sessionLogPath = path.join(logDir, `session-${sessionId}.log`);
  
  logger.info(`========================================`);
  logger.info(`Test Session Started: ${sessionId}`);
  logger.info(`Timestamp: ${new Date().toISOString()}`);
  logger.info(`========================================`);
  
  return {
    sessionId,
    sessionLogPath,
    startTime: new Date(),
  };
};

/**
 * Close session log
 * @param {Object} session - Session object
 * @param {string} status - Final test status
 */
export const closeSessionLogger = (session, status = 'COMPLETED') => {
  const duration = new Date() - session.startTime;
  logger.info(`========================================`);
  logger.info(`Test Session Ended: ${session.sessionId}`);
  logger.info(`Status: ${status}`);
  logger.info(`Duration: ${duration}ms`);
  logger.info(`Timestamp: ${new Date().toISOString()}`);
  logger.info(`========================================`);
};

// Provide a quick stream logging adapter if needed for external hooks
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

export default logger;
