import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.config';
import { requestIdMiddleware } from './middlewares/requestId';
import { errorHandler } from './middlewares/errorHandler';
import { apiV1Routes } from './routes';
import { NotFoundError } from './errors/NotFoundError';

const app: Application = express();

// Security Hardening Headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['Location', 'X-Request-ID', 'X-Cache'],
    credentials: true,
  })
);

// Body Parsing with Strict Payload Size Caps
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Correlation ID Tracking
app.use(requestIdMiddleware);

// HTTP Access Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// REST API Version 1 Mount
app.use('/api/v1', apiV1Routes);

// Catch Unmatched Routes -> 404
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Resource not found for ${req.method} ${req.originalUrl}`));
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
