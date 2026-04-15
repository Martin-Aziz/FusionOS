import type { Request, Response } from 'express';
import { Router } from 'express';

import {
  searchPackagesQuerySchema,
  submitCompatibilitySchema,
  telemetryEventSchema
} from '../../../common/schemas/registry';
import { authRateLimit } from '../middleware/rate-limit';
import { metricsRegistry } from '../middleware/metrics';
import { InMemoryRegistryRepository } from '../repositories/registry-repository';
import { PackageCatalogService } from '../services/package-catalog-service';
import { getHealthStatus } from '../services/health-service';
import { asyncHandler } from '../utils/async-handler';

const packageCatalogService = new PackageCatalogService(new InMemoryRegistryRepository());

const getRequiredPathParam = (value: string | undefined, fieldName: string): string => {
  if (!value) {
    const error = new Error(`Missing required path parameter: ${fieldName}`) as Error & {
      statusCode?: number;
    };
    error.statusCode = 400;
    throw error;
  }

  return value;
};

export const buildRouter = (): Router => {
  const router = Router();

  router.get('/health', asyncHandler(async (_req: Request, res: Response) => {
    const health = await getHealthStatus();
    res.status(health.status === 'ok' ? 200 : 503).json(health);
  }));

  router.get('/metrics', asyncHandler(async (_req: Request, res: Response) => {
    res.set('Content-Type', metricsRegistry.contentType);
    const output = await metricsRegistry.metrics();
    res.status(200).send(output);
  }));

  router.get('/api/v1/packages/search', asyncHandler(async (req: Request, res: Response) => {
    const query = searchPackagesQuerySchema.parse(req.query);
    const result = await packageCatalogService.searchPackages(query);
    res.status(200).json(result);
  }));

  router.get('/api/v1/packages/:id', asyncHandler(async (req: Request, res: Response) => {
    const packageId = getRequiredPathParam(req.params.id, 'id');
    const result = await packageCatalogService.getPackageById(packageId);
    if (!result) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }

    res.status(200).json(result);
  }));

  router.get('/api/v1/packages/:id/compat', asyncHandler(async (req: Request, res: Response) => {
    const packageId = getRequiredPathParam(req.params.id, 'id');
    const reports = await packageCatalogService.getCompatibilityReports(packageId);
    res.status(200).json({ reports });
  }));

  router.post('/api/v1/compat/submit', authRateLimit, asyncHandler(async (req: Request, res: Response) => {
    const payload = submitCompatibilitySchema.parse(req.body);
    const report = await packageCatalogService.submitCompatibilityReport(payload);
    res.status(201).json({ id: report.id, accepted: true });
  }));

  router.post('/api/v1/telemetry', authRateLimit, asyncHandler(async (req: Request, res: Response) => {
    const payload = telemetryEventSchema.parse(req.body);
    await packageCatalogService.recordTelemetry(payload);
    res.status(202).json({ accepted: true });
  }));

  if (process.env.NODE_ENV === 'test') {
    router.get('/api/v1/testing/error', (_req: Request, _res: Response) => {
      throw new Error('forced test error');
    });
  }

  return router;
};
