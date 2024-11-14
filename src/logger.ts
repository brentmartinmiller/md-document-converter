import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure the logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define the log format
const logFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Create the logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    logFormat
  ),
  transports: [
    // Console output
    new transports.Console(),
    // File output
    new transports.File({ filename: path.join(logsDir, 'app.log') }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logsDir, 'exceptions.log') }),
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

export default logger;
