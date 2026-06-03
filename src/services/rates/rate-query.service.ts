import { db } from '../../db/connection.js';
import { exchangeRates } from '../../db/schema.js';
import { desc, eq, and } from 'drizzle-orm';

export interface RateQueryOptions {
  base?: string;
  type?: 'fiat' | 'crypto';
  limit?: number;
}

export class RateQueryService {
  async getLatestRates(options: RateQueryOptions = {}) {
    const conditions = [];

    if (options.base) {
      conditions.push(eq(exchangeRates.fromCurrency, options.base.toUpperCase()));
    }

    if (options.type === 'fiat') {
      conditions.push(eq(exchangeRates.source, 'exchangerate-api'));
    } else if (options.type === 'crypto') {
      conditions.push(eq(exchangeRates.source, 'coingecko'));
    }

    const baseQuery = db
      .select({
        fromCurrency: exchangeRates.fromCurrency,
        toCurrency: exchangeRates.toCurrency,
        rate: exchangeRates.rate,
        source: exchangeRates.source,
        fetchedAt: exchangeRates.fetchedAt,
      })
      .from(exchangeRates);

    if (conditions.length > 0) {
      return baseQuery
        .where(and(...conditions))
        .orderBy(desc(exchangeRates.fetchedAt))
        .limit(options.limit || 100);
    }

    return baseQuery
      .orderBy(desc(exchangeRates.fetchedAt))
      .limit(options.limit || 100);
  }

  async getHistory(from: string, to: string, limit: number = 30) {
    return db
      .select({
        rate: exchangeRates.rate,
        source: exchangeRates.source,
        fetchedAt: exchangeRates.fetchedAt,
      })
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, from.toUpperCase()),
          eq(exchangeRates.toCurrency, to.toUpperCase()),
        ),
      )
      .orderBy(desc(exchangeRates.fetchedAt))
      .limit(limit);
  }
}
