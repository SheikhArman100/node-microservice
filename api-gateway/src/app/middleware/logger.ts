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



// Define transports array
const transports = [];

// Add file transport only in production
if (process.env.NODE_ENV === 'production') {
  const errorTransport = new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error'
  });
  transports.push(errorTransport);
}

// Always add console transport
transports.push(new winston.transports.Console());

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    myFormat
  ),
  transports: transports
});

export default logger;