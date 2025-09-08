import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import cookieParser from 'cookie-parser';
import config from './config';
import { ApplicationRouters } from './app/routes'; // Import ApplicationRouters

const app: Application = express();

const allowedURL = [config.client_url];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedURL.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// parser
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', ApplicationRouters); // Use ApplicationRouters for all /api/v1 routes

// Health Check
app.get('/', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'API Gateway is running',
  });
});

// Global Error Handler
app.use(globalErrorHandler);

// Handle 404 Not Found
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Not found',
    errorMessage: {
      path: req.originalUrl,
      message: 'API not found!!! Wrong URL, there is no route in this URL.',
    },
  });
});

export default app;
