import { ErrorRequestHandler } from 'express';
import config from '../../config';
import { IGenericErrorMessages } from '../../interfaces/error';
import handleValidationError from '../../errors/handleValidationError';
import ApiError from '../../errors/ApiError';
import { ZodError } from 'zod';
import handleZodError from '../../errors/handleZodError';
import handleCastError from '../../errors/handleCastError';
import logger from './logger';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  // console.log('globalErrorHandler : ', error);
  
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessages: IGenericErrorMessages[] = [];

  // Common log data to include with all error logs
  const logData = {
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'unauthenticated',
    stack: error?.stack
  };

  if (error?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError?.errorMessages;
    logger.error(`Validation Error: ${message}`, {
      ...logData,
      errorMessages,
      errorName: error.name,
      errorDetails: error.errors
    });
  } else if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorMessages = simplifiedError?.errorMessages;
    logger.error(`Zod Validation Error: ${message}`, {
      ...logData,
      errorMessages,
      zodIssues: error.issues
    });
  } else if (error.name === 'CastError') {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorMessages = simplifiedError?.errorMessages;
     
    logger.error(`Cast Error: ${message}`, {
      ...logData,
      errorMessages,
      value: error.value,
      path: error.path
    });
  }else if (error.name === 'MongoServerError' && error.code === 11000) {
    statusCode = 400;
    message = `Duplicate key error: ${Object.keys(error.keyValue)} already exists.`;
    errorMessages = Object.keys(error.keyValue).map(key => ({
      path: key,
      message: `${key} already exists.`,
    }));
    logger.error(`MongoDB Duplicate Key Error: ${message}`, {
      ...logData,
      errorMessages,
      keyValue: error.keyValue,
      code: error.code
    });
  } else if (error instanceof ApiError) {
    statusCode = error?.statusCode;
    message = error?.message;
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : [];
    // Log based on status code severity
    if (statusCode >= 500) {
      logger.error(`API Error (${statusCode}): ${message}`, {
        ...logData,
        errorMessages
      });
    } else if (statusCode >= 400) {
      logger.error(`API Error (${statusCode}): ${message}`, {
        ...logData,
        errorMessages
      });
    } else {
      logger.info(`API Error (${statusCode}): ${message}`, {
        ...logData,
        errorMessages
      });
    }
  } else if (error instanceof Error) {
    message = error?.message;
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : [];
      logger.error(`Uncaught Exception: ${message}`, {
        ...logData,
        errorMessages,
        name: error.name
      });
  }
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorMessages,
    stack: config.env !== 'production' ? error?.stack : undefined,
  });
  next();
};

export default globalErrorHandler;
