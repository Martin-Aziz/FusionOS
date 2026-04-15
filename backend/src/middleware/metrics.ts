import type { NextFunction, Request, Response } from 'express';
import client from 'prom-client';

export const metricsRegistry = new client.Registry();

client.collectDefaultMetrics({ register: metricsRegistry });

const httpRequestDuration = new client.Histogram({
  name: 'trios_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry]
});

const getRouteLabel = (req: Request): string => {
  const route = req.route as unknown;
  if (
    typeof route === 'object' &&
    route !== null &&
    'path' in route &&
    typeof (route as { path: unknown }).path === 'string'
  ) {
    return (route as { path: string }).path;
  }

  return req.path;
};

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const endTimer = httpRequestDuration.startTimer();
  res.on('finish', () => {
    endTimer({
      method: req.method,
      route: getRouteLabel(req),
      status_code: res.statusCode.toString()
    });
  });

  next();
};
