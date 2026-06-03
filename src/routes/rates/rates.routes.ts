import { FastifyInstance, FastifyRequest } from 'fastify';
import { RateQueryService } from '../../services/rates/rate-query.service.js';
import { RateSyncService } from '../../services/rates/rate-sync.service.js';
import { CacheService } from '../../services/cache/cache.service.js';
import { ExchangeRateApiService } from '../../services/external/exchange-rate-api.js';
import { CoinGeckoService } from '../../services/external/coingecko-api.js';
import { env } from '../../config/env.js';

const rateQueryService = new RateQueryService();

interface RatesQuery {
  base?: string;
  type?: 'fiat' | 'crypto';
  limit?: number;
}

interface HistoryQuery {
  from?: string;
  to?: string;
  limit?: number;
}

export async function rateRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/rates — list current rates
  app.get<{ Querystring: RatesQuery }>('/', async (request, reply) => {
    const { base, type, limit } = request.query;

    const rates = await rateQueryService.getLatestRates({
      base,
      type,
      limit: limit ? parseInt(String(limit), 10) : undefined,
    });

    return reply.status(200).send({
      count: rates.length,
      rates,
    });
  });

  // GET /api/rates/history — historical rates for a pair
  app.get<{ Querystring: HistoryQuery }>('/history', async (request, reply) => {
    const { from, to, limit } = request.query;

    if (!from || !to) {
      return reply.status(400).send({
        error: 'Missing required query parameters: from, to',
      });
    }

    const history = await rateQueryService.getHistory(
      from,
      to,
      limit ? parseInt(String(limit), 10) : 30,
    );

    return reply.status(200).send({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      count: history.length,
      history,
    });
  });

  // POST /api/rates/sync — trigger manual rate refresh
  app.post('/sync', async (_request, reply) => {
    const cache = new CacheService();
    const exchangeRateApi = new ExchangeRateApiService(env.EXCHANGE_RATE_API_KEY);
    const coinGeckoApi = new CoinGeckoService(env.COINGECKO_API_KEY);
    const syncService = new RateSyncService(cache, exchangeRateApi, coinGeckoApi);

    try {
      const fiatCount = await syncService.syncFiatRates('USD');
      const cryptoCount = await syncService.syncCryptoPrices();

      return reply.status(200).send({
        fiat: fiatCount,
        crypto: cryptoCount,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });
}
