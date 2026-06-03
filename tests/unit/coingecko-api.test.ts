import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CoinGeckoService } from '../../src/services/external/coingecko-api.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('CoinGeckoService', () => {
  let service: CoinGeckoService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CoinGeckoService('test-key');
  });

  it('should fetch prices for multiple coins', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        bitcoin: { usd: 67432.12, brl: 340527.21 },
        ethereum: { usd: 3521.45, brl: 17788.33 },
      }),
    });

    const prices = await service.fetchPrices(['bitcoin', 'ethereum'], ['usd', 'brl']);
    expect(prices).toHaveProperty('bitcoin');
    expect(prices.bitcoin.usd).toBe(67432.12);
    expect(prices.bitcoin.brl).toBe(340527.21);
    expect(prices.ethereum.usd).toBe(3521.45);
  });

  it('should call the correct URL with params', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ bitcoin: { usd: 67000 } }),
    });

    await service.fetchPrices(['bitcoin'], ['usd']);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      { headers: { 'x-cg-demo-api-key': 'test-key' } },
    );
  });

  it('should throw on HTTP error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Rate Limited',
    });

    await expect(service.fetchPrices(['bitcoin'], ['usd'])).rejects.toThrow(
      'CoinGecko API error: 429',
    );
  });

  it('should not send API key header if empty', async () => {
    const serviceNoKey = new CoinGeckoService('');
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ bitcoin: { usd: 67000 } }),
    });

    await serviceNoKey.fetchPrices(['bitcoin'], ['usd']);
    expect(mockFetch).toHaveBeenCalledWith(expect.any(String), { headers: {} });
  });
});
