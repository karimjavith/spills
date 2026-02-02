// app.ts
import './middleware/observability/otel.js';
import './middleware/observability/tracing.js';

import express from 'express';
import pinoHttpImport from 'pino-http';
import type { Options } from 'pino-http';
import type { HttpLogger } from 'pino-http';
const pinoHttp = pinoHttpImport as unknown as (opts: Options) => HttpLogger;
import cors from 'cors';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

import transactionsRouter from './api/transaction.js';
import savingsRouter from './api/savings.js';
import accountsRouter from './api/accounts.js';

import { baseLogger } from './middleware/observability/logger.js';
import { runWithContext } from './middleware/observability/context.js';
import { asString } from './helpers/index.js';
import { IncomingMessage } from 'http';
import { ServerResponse } from 'http';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });

const app = express();

// Logging middleware for the HTTP requests
app.use(
  pinoHttp({
    logger: baseLogger,
    genReqId: (req: IncomingMessage) => {
      const header = req.headers['x-request-id'];
      return Array.isArray(header) ? header[0] : (header ?? randomUUID());
    },
    customSuccessMessage: () => 'http_request',
    customErrorMessage: () => 'http_request_error',
    customLogLevel: (req: IncomingMessage, res: ServerResponse, err?: Error) =>
      err || res.statusCode >= 500
        ? 'error'
        : res.statusCode >= 400
          ? 'warn'
          : 'info',
  }),
);

// Put reqId into AsyncLocalStorage for the rest of the request lifecycle
app.use((req, _res, next) => {
  runWithContext({ reqId: asString(req.id) }, next);
});

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/savings', savingsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  },
);

export default app;
export { app };
