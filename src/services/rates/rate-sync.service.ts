import { db } from '../../db/connection.js';
import { exchangeRates, cryptocurrencies } from '../../db/schema.js';
import { CacheService } from '../cache/cache.service.js';
import { ExchangeRateApiService } from '../external/exchange-rate-api.js';
import { CoinGeckoService } from '../external/coingecko-api.js';
import { eq } from 'drizzle-orm';

const FIAT_CACHE_TTL = 300; // 5 minutes
const CRYPTO_CACHE_TTL = 60; // 1 minute (volatile)

export class RateSyncService {
  constructor(
    private cache: CacheService,
    private exchangeRateApi: ExchangeRateApiService,
    private coinGeckoApi: CoinGeckoService,
  ) {}

  async syncFiatRates(baseCurrency: string = 'USD'): Promise<number> {
    const rates = await this.exchangeRateApi.fetchRates(baseCurrency);

    for (const rate of rates) {
      await db.insert(exchangeRates).values(rate).onConflictDoNothing();

      await this.cache.setJSON(
        `rate:fiat:${rate.fromCurrency}:${rate.toCurrency}`,
        { rate: rate.rate, source: rate.source, fetchedAt: rate.fetchedAt },
        FIAT_CACHE_TTL,
      );
    }

    return rates.length;
  }

  async syncCryptoPrices(): Promise<number> {
    const coins = await db
      .select()
      .from(cryptocurrencies)
      .where(eq(cryptocurrencies.active, true));

    if (coins.length === 0) return 0;

    const coinIds = coins.map((c) => c.coingeckoId);
    const prices = await this.coinGeckoApi.fetchPrices(coinIds, ['usd', 'brl', 'eur']);

    let count = 0;
    const now = new Date();

    for (const coin of coins) {
      const priceData = prices[coin.coingeckoId];
      if (!priceData) continue;

      for (const [currency, price] of Object.entries(priceData)) {
        await db
          .insert(exchangeRates)
          .values({
            fromCurrency: coin.symbol.toUpperCase(),
            toCurrency: currency.toUpperCase(),
            rate: price.toString(),
            source: 'coingecko',
            fetchedAt: now,
          })
          .onConflictDoNothing();

        await this.cache.setJSON(
          `rate:crypto:${coin.symbol.toUpperCase()}:${currency.toUpperCase()}`,
          { rate: price.toString(), source: 'coingecko', fetchedAt: now },
          CRYPTO_CACHE_TTL,
        );

        count++;
      }
    }

    return count;
  }
}
