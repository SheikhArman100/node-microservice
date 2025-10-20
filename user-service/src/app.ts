import cookieParser from 'cookie-parser';
import express, { Application, Request, Response } from 'express';

import config from './config';
import { ApplicationRouters } from './routes';
import globalErrorHandler from './middleware/globalErrorHandler';


const app: Application = express();


app.use(cookieParser());

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy to get the correct client IP
app.set('trust proxy', true);



/**
 * Health Check Endpoint
 */
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to User Server',
  });
});

app.get('/api/v1', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to User Server',
  });
});

/**
 * Static file serving for local storage
 */
app.use('/api/v1/file', express.static('uploads'));

/**
 * API Routes
 */
app.use('/api/v1', ApplicationRouters);

/**
 * Handle 404 Errors
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Not found',
    errorMessage: {
      path: req.originalUrl,
      message: 'API not found! Invalid URL or route.',
    },
  });
});

/**
 * Global Error Handler Middleware
 */
app.use(globalErrorHandler);

export default app;
