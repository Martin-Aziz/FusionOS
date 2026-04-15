import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    DATABASE_URL: z.string().url().optional(),
    REDIS_URL: z.string().url().optional(),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    DEVICE_TOKEN_SALT: z.string().min(32).optional()
  })
  .passthrough();

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse(process.env);
