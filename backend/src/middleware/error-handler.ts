import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '../utils/logger';

type HttpError = Error & { statusCode?: number };

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Resource not found',
    path: req.path
  });
};

export const errorHandler = (
  error: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = error.statusCode ?? 500;
  const requestId = res.locals.requestId as string | undefined;

  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Invalid request payload',
      details: error.issues,
      requestId
    });
    return;
  }

  logger.error(
    {
      requestId,
      method: req.method,
      path: req.path,
      message: error.message,
      stack: error.stack
    },
    'Unhandled application error'
  );

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : error.message,
    requestId
  });
};
