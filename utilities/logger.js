import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = path.resolve('logs');

// Ensure the directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` | Metadata: ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console log output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] [${level}]: ${message}`;
        })
      )
    }),
    // Persistent file log output
    new winston.transports.File({
      filename: path.join(logDir, 'appium-execution.log'),
      maxsize: 5242880, // 5MB limit per log file
      maxFiles: 5
    })
  ]
});

// Provide a quick stream logging adapter if needed for external hooks
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};
