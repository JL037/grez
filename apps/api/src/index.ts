import { env } from '@grez/shared';
import { buildApp } from './app.js';

const config = env();

const app = await buildApp();

try {
  await app.listen({ port: config.API_PORT, host: config.API_HOST });
  app.log.info(`Server listening on http://${config.API_HOST}:${config.API_PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
