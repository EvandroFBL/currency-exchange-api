import { RateEntry } from '../../types/rates.js';

interface ExchangeRateApiResponse {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
  'error-type'?: string;
}

export class ExchangeRateApiService {
  private apiKey: string;
  private baseUrl = 'https://v6.exchangerate-api.com/v6';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchRates(baseCurrency: string): Promise<RateEntry[]> {
    const url = `${this.baseUrl}/${this.apiKey}/latest/${baseCurrency}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ExchangeRate API error: ${response.status}`);
    }

    const data = (await response.json()) as ExchangeRateApiResponse;

    if (data.result !== 'success') {
      throw new Error(`ExchangeRate API error: ${data['error-type'] || 'unknown'}`);
    }

    const now = new Date();

    return Object.entries(data.conversion_rates).map(([code, rate]) => ({
      fromCurrency: baseCurrency,
      toCurrency: code,
      rate: rate.toString(),
      source: 'exchangerate-api',
      fetchedAt: now,
    }));
  }
}
