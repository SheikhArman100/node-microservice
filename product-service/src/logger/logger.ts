import winston from 'winston';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log directory and file paths
const logDir = path.join(process.cwd(), 'logs');

// Define log formats
const { combine, timestamp, printf } = winston.format;

// Custom log format
const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const metaString = Object.keys(metadata).length
    ? `\n${JSON.stringify(metadata, null, 2)}`
    : '';

  return `${timestamp} [${level}]: ${message}${metaString}`;
});

// Default logger - for server starts and general app logs
const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    myFormat
  ),
  transports: [
    // App logs
    new DailyRotateFile({
      filename: path.join(logDir, '%DATE%-app.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(
        timestamp(),
        winston.format.json({ space: 2 })
      ),
    }),
    // Error logs
    new DailyRotateFile({
      filename: path.join(logDir, '%DATE%-error.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: combine(
        timestamp(),
        winston.format.json({ space: 2 })
      ),
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        winston.format.colorize(),
        winston.format.simple(),
        myFormat
      ),
    })
  );
}

export default logger;


export const eventLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    myFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'event-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(
        timestamp(),
        winston.format.json({ space: 2 })
      ),
    }),
  ],
});
