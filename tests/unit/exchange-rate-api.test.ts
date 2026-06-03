import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExchangeRateApiService } from '../../src/services/external/exchange-rate-api.js';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('ExchangeRateApiService', () => {
  let service: ExchangeRateApiService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ExchangeRateApiService('test-key');
  });

  it('should fetch rates for a base currency', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        result: 'success',
        base_code: 'USD',
        conversion_rates: {
          BRL: 5.05,
          EUR: 0.92,
          GBP: 0.79,
        },
      }),
    });

    const rates = await service.fetchRates('USD');
    expect(rates).toHaveLength(3);
    expect(rates[0]).toEqual({
      fromCurrency: 'USD',
      toCurrency: 'BRL',
      rate: '5.05',
      source: 'exchangerate-api',
      fetchedAt: expect.any(Date),
    });
  });

  it('should throw on HTTP error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });

    await expect(service.fetchRates('USD')).rejects.toThrow('ExchangeRate API error: 429');
  });

  it('should throw on unsuccessful result', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        result: 'error',
        'error-type': 'invalid-key',
      }),
    });

    await expect(service.fetchRates('USD')).rejects.toThrow('ExchangeRate API error: invalid-key');
  });

  it('should call the correct URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        result: 'success',
        base_code: 'EUR',
        conversion_rates: { USD: 1.08 },
      }),
    });

    await service.fetchRates('EUR');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://v6.exchangerate-api.com/v6/test-key/latest/EUR',
    );
  });
});
