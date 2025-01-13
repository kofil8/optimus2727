import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import morgan from 'morgan';
import path from 'path';
import GlobalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';

const app: Application = express();

export const corsOptions = {
  origin: ['*'],
  methods: ['GET', 'alarm', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware setup
app.use(express.json());
app.use(morgan('dev')); //TODO remove this when deploy
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// app.use("/uploads", express.static(path.join("/var/www/uploads")));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // Serve static files from the "uploads" directory
// Route handler for the root endpoint
app.get('/', (req: Request, res: Response) => {
  res.send({
    message: 'Welcome to the API!',
  });
});

// Setup API routes
app.use('/api/v1', router);

// Error handling middleware
app.use(GlobalErrorHandler);

// 404 Not Found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API NOT FOUND!',
    error: {
      path: req.originalUrl,
      message: 'Your requested path is not found!',
    },
  });
});

export default app;
