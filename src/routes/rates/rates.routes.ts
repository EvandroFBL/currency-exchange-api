import { FastifyInstance } from 'fastify';

export async function rateRoutes(app: FastifyInstance): Promise<void> {
  // Placeholder — will be implemented in Phase 6
  app.get('/', async (_request, reply) => {
    return reply.status(200).send({ rates: [], message: 'Not yet implemented' });
  });
}
