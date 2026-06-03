import { FastifyInstance } from 'fastify';

export async function convertRoutes(app: FastifyInstance): Promise<void> {
  // Placeholder — will be implemented in Phase 6
  app.get('/convert', async (_request, reply) => {
    return reply.status(200).send({ message: 'Not yet implemented' });
  });
}
