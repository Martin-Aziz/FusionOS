import { z } from 'zod';

export const searchPackagesQuerySchema = z
  .object({
    q: z.string().min(1).max(120),
    ecosystem: z.enum(['linux', 'windows', 'macos']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20)
  })
  .strict();

export type SearchPackagesQuery = z.infer<typeof searchPackagesQuerySchema>;

export const submitCompatibilitySchema = z
  .object({
    pkgId: z.string().min(3),
    hwProfile: z.string().min(2).max(120),
    triosVersion: z.string().min(1).max(32),
    result: z.enum(['works_perfectly', 'works_with_issues', 'fails_to_launch']),
    notes: z.string().min(1).max(2000)
  })
  .strict();

export type SubmitCompatibilityPayload = z.infer<typeof submitCompatibilitySchema>;

export const telemetryEventSchema = z
  .object({
    event: z.enum([
      'os_boot',
      'app_installed',
      'app_launched',
      'app_crashed',
      'compat_issue_reported',
      'env_switch'
    ]),
    pkgId: z.string().min(3).optional(),
    sessionId: z.string().uuid(),
    osVersion: z.string().min(1).max(32),
    hwProfile: z.string().min(2).max(120),
    timestamp: z.string().datetime(),
    metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
  })
  .strict();

export type TelemetryEventPayload = z.infer<typeof telemetryEventSchema>;
