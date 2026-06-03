import { db } from '../../db/connection.js';
import { exchangeRates } from '../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { CacheService } from '../cache/cache.service.js';

interface ConversionResult {
  from: string;
  to: string;
  amount: string;
  result: string;
  rate: string;
  source: string;
  timestamp: string;
}

export class ConversionService {
  constructor(private cache: CacheService) {}

  async convert(from: string, to: string, amount: string): Promise<ConversionResult> {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // Same currency
    if (fromUpper === toUpper) {
      return {
        from: fromUpper,
        to: toUpper,
        amount,
        result: amount,
        rate: '1',
        source: 'identity',
        timestamp: new Date().toISOString(),
      };
    }

    const rate = await this.findRate(fromUpper, toUpper);
    const result = (amountNum * parseFloat(rate.rate)).toFixed(8);

    return {
      from: fromUpper,
      to: toUpper,
      amount,
      result,
      rate: rate.rate,
      source: rate.source,
      timestamp: new Date().toISOString(),
    };
  }

  private async findRate(
    from: string,
    to: string,
  ): Promise<{ rate: string; source: string }> {
    // Check cache first
    const cached = await this.cache.getJSON<{ rate: string; source: string }>(
      `rate:${from}:${to}`,
    );
    if (cached) return cached;

    // Try direct rate
    const direct = await db
      .select({ rate: exchangeRates.rate, source: exchangeRates.source })
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, from),
          eq(exchangeRates.toCurrency, to),
        ),
      )
      .orderBy(desc(exchangeRates.fetchedAt))
      .limit(1);

    if (direct.length > 0) {
      await this.cache.setJSON(`rate:${from}:${to}`, direct[0], 60);
      return direct[0];
    }

    // Try inverse rate
    const inverse = await db
      .select({ rate: exchangeRates.rate, source: exchangeRates.source })
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, to),
          eq(exchangeRates.toCurrency, from),
        ),
      )
      .orderBy(desc(exchangeRates.fetchedAt))
      .limit(1);

    if (inverse.length > 0) {
      const inverseRate = (1 / parseFloat(inverse[0].rate)).toFixed(8);
      const result = { rate: inverseRate, source: inverse[0].source };
      await this.cache.setJSON(`rate:${from}:${to}`, result, 60);
      return result;
    }

    // Try cross-rate via USD
    const fromUsd = await this.findRateViaUSD(from);
    const toUsd = await this.findRateViaUSD(to);

    if (fromUsd && toUsd) {
      const crossRate = (parseFloat(toUsd.rate) / parseFloat(fromUsd.rate)).toFixed(8);
      const result = { rate: crossRate, source: `${fromUsd.source}+${toUsd.source}` };
      await this.cache.setJSON(`rate:${from}:${to}`, result, 60);
      return result;
    }

    throw new Error(`No rate found for ${from} -> ${to}`);
  }

  private async findRateViaUSD(
    currency: string,
  ): Promise<{ rate: string; source: string } | null> {
    if (currency === 'USD') return { rate: '1', source: 'base' };

    const result = await db
      .select({ rate: exchangeRates.rate, source: exchangeRates.source })
      .from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, 'USD'),
          eq(exchangeRates.toCurrency, currency),
        ),
      )
      .orderBy(desc(exchangeRates.fetchedAt))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }
}
