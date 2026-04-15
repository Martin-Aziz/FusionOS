import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export type RequestContextLocals = {
  requestId: string;
};

export const requestContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.header('x-request-id') ?? randomUUID();
  res.locals.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};
