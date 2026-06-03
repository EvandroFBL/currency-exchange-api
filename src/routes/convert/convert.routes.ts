import { FastifyInstance, FastifyRequest } from 'fastify';
import { ConversionService } from '../../services/convert/conversion.service.js';
import { CacheService } from '../../services/cache/cache.service.js';
import { db } from '../../db/connection.js';
import { conversionHistory } from '../../db/schema.js';

const cacheService = new CacheService();
const conversionService = new ConversionService(cacheService);

interface ConvertQuery {
  from: string;
  to: string;
  amount: string;
}

export async function convertRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/convert — convert between currencies
  app.get<{ Querystring: ConvertQuery }>('/convert', async (request, reply) => {
    const { from, to, amount } = request.query;

    if (!from || !to || !amount) {
      return reply.status(400).send({
        error: 'Missing required query parameters: from, to, amount',
      });
    }

    try {
      const result = await conversionService.convert(from, to, amount);

      // Log conversion to history
      await db.insert(conversionHistory).values({
        fromCurrency: result.from,
        toCurrency: result.to,
        amount: result.amount,
        result: result.result,
        rate: result.rate,
        source: result.source,
      });

      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
