import { env } from './config/env';
import { buildApp } from './app';
import { logger } from './utils/logger';

const app = buildApp();

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, 'TriOS backend server started');
});
