import type { FastifyInstance } from 'fastify';
import { prisma } from '@grez/db';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({ status: 'ok', db: 'connected' });
    } catch {
      return reply.status(503).send({ status: 'error', db: 'disconnected' });
    }
  });
}
