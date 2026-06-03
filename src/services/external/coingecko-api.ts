type PriceMap = Record<string, Record<string, number>>;

export class CoinGeckoService {
  private apiKey: string;
  private baseUrl = 'https://api.coingecko.com/api/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchPrices(coinIds: string[], vsCurrencies: string[]): Promise<PriceMap> {
    const ids = coinIds.join(',');
    const currencies = vsCurrencies.join(',');
    const url = `${this.baseUrl}/simple/price?ids=${ids}&vs_currencies=${currencies}`;

    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers['x-cg-demo-api-key'] = this.apiKey;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return (await response.json()) as PriceMap;
  }
}
