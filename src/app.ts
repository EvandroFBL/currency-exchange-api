import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health/health.routes.js';
import { rateRoutes } from './routes/rates/rates.routes.js';
import { convertRoutes } from './routes/convert/convert.routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  await app.register(cors);

  // Global error handler
  app.setErrorHandler((error: Error & { statusCode?: number; code?: string }, _request, reply) => {
    const statusCode = error.statusCode || 500;
    const response: Record<string, unknown> = {
      error: error.message || 'Internal Server Error',
    };

    if (error.code) {
      response.code = error.code;
    }

    if (statusCode >= 500) {
      app.log.error(error);
    }

    return reply.status(statusCode).send(response);
  });

  // Register routes
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(rateRoutes, { prefix: '/api/rates' });
  await app.register(convertRoutes, { prefix: '/api' });

  return app;
}
