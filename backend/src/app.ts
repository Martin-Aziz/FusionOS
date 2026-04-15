import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { buildRouter } from './api/routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { metricsMiddleware } from './middleware/metrics';
import { globalRateLimit } from './middleware/rate-limit';
import { requestContext } from './middleware/request-context';
import { logger } from './utils/logger';

export const buildApp = (): express.Express => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: false }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestContext);
  app.use(
    pinoHttp({
      logger,
      customProps: (_req, res) => ({ requestId: res.locals.requestId as string | undefined })
    })
  );
  app.use(metricsMiddleware);
  app.use(globalRateLimit);

  app.use(buildRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
