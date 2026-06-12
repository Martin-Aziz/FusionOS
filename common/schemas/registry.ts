import { z } from 'zod';

const runtimeRouteEnum = z.enum([
  'native-linux',
  'flatpak',
  'appimage',
  'apt',
  'wine',
  'proton',
  'container',
  'vm',
  'agent-workspace',
  'macos-experimental'
]);

const compatibilityLevelEnum = z.enum([
  'platinum',
  'gold',
  'silver',
  'bronze',
  'experimental',
  'unsupported',
  'unknown'
]);

const systemProfileSchema = z.object({
  arch: z.enum(['x86_64', 'arm64']),
  gpu: z.string().optional(),
  ramGb: z.number().positive(),
  kernelVersion: z.string().optional(),
  fusionOsVersion: z.string().min(1).max(32)
});

export const appSearchQuerySchema = z
  .object({
    q: z.string().max(120).optional(),
    category: z.string().max(60).optional(),
    compatibilityLevel: compatibilityLevelEnum.optional(),
    runtimeRoute: runtimeRouteEnum.optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20)
  })
  .strict();

export type AppSearchQuery = z.infer<typeof appSearchQuerySchema>;

export const submitReportSchema = z
  .object({
    runtimeRoute: runtimeRouteEnum,
    worked: z.boolean(),
    systemProfile: systemProfileSchema,
    notes: z.string().min(1).max(2000)
  })
  .strict();

export type SubmitReportPayload = z.infer<typeof submitReportSchema> & { appSlug: string };

export const resolveRuntimeSchema = z
  .object({
    appSlug: z.string().min(1).max(80),
    systemProfile: systemProfileSchema
  })
  .strict();

export type ResolveRuntimePayload = z.infer<typeof resolveRuntimeSchema>;

export const workspaceCreateSchema = z
  .object({
    name: z.string().min(1).max(80),
    allowedPaths: z.array(z.string()),
    networkAccess: z.enum(['none', 'limited', 'full']),
    allowedApps: z.array(z.string()),
    runtimeRoutes: z.array(runtimeRouteEnum)
  })
  .strict();

export type WorkspaceCreatePayload = z.infer<typeof workspaceCreateSchema>;

export const telemetryEventSchema = z
  .object({
    event: z.enum([
      'os_boot',
      'app_installed',
      'app_launched',
      'app_crashed',
      'compat_report_submitted',
      'workspace_created',
      'workspace_started',
      'runtime_resolved'
    ]),
    appSlug: z.string().min(1).optional(),
    sessionId: z.string().uuid(),
    fusionOsVersion: z.string().min(1).max(32),
    arch: z.enum(['x86_64', 'arm64']),
    gpu: z.string().optional(),
    ramGb: z.number().positive(),
    timestamp: z.string().datetime(),
    metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
  })
  .strict();

export type TelemetryEventPayload = z.infer<typeof telemetryEventSchema>;
