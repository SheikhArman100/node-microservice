import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import { ApplicationRouters } from './app/routes';
import cookieParser from 'cookie-parser';


const app: Application = express();


app.use(cookieParser());

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Testing
app.get('/', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
  message: 'Welcome to Product Service Api',
  });
});

// Routes
app.use('/api/v1', ApplicationRouters);

// No routes
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Not found',
    errorMessage: {
      path: req.originalUrl,
      message: 'Api not found!!! Wrong url, there is no route in this url.',
    },
  });
});

app.use(globalErrorHandler);

export default app;
