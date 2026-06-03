import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock ioredis — must be a class so `new Redis()` works
const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDel = vi.fn();
const mockFlushdb = vi.fn();
const mockQuit = vi.fn();

vi.mock('ioredis', () => {
  return {
    Redis: class MockRedis {
      get = mockGet;
      set = mockSet;
      del = mockDel;
      flushdb = mockFlushdb;
      quit = mockQuit;
    },
  };
});

import { CacheService } from '../../src/services/cache/cache.service.js';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    cache = new CacheService();
  });

  it('should get a cached value', async () => {
    mockGet.mockResolvedValue('5.05');
    const result = await cache.get('rate:USD:BRL');
    expect(result).toBe('5.05');
    expect(mockGet).toHaveBeenCalledWith('rate:USD:BRL');
  });

  it('should return null for cache miss', async () => {
    mockGet.mockResolvedValue(null);
    const result = await cache.get('rate:USD:XYZ');
    expect(result).toBeNull();
  });

  it('should set a value with TTL', async () => {
    mockSet.mockResolvedValue('OK');
    await cache.set('rate:USD:BRL', '5.05', 300);
    expect(mockSet).toHaveBeenCalledWith('rate:USD:BRL', '5.05', 'EX', 300);
  });

  it('should delete a key', async () => {
    mockDel.mockResolvedValue(1);
    await cache.del('rate:USD:BRL');
    expect(mockDel).toHaveBeenCalledWith('rate:USD:BRL');
  });

  it('should get JSON objects', async () => {
    mockGet.mockResolvedValue(JSON.stringify({ rate: 5.05 }));
    const result = await cache.getJSON<{ rate: number }>('rate:USD:BRL');
    expect(result).toEqual({ rate: 5.05 });
  });

  it('should return null for JSON cache miss', async () => {
    mockGet.mockResolvedValue(null);
    const result = await cache.getJSON<{ rate: number }>('rate:USD:BRL');
    expect(result).toBeNull();
  });

  it('should set JSON objects', async () => {
    mockSet.mockResolvedValue('OK');
    await cache.setJSON('rate:USD:BRL', { rate: 5.05 }, 300);
    expect(mockSet).toHaveBeenCalledWith(
      'rate:USD:BRL',
      JSON.stringify({ rate: 5.05 }),
      'EX',
      300,
    );
  });

  it('should flush the database', async () => {
    mockFlushdb.mockResolvedValue('OK');
    await cache.flush();
    expect(mockFlushdb).toHaveBeenCalled();
  });

  it('should disconnect', async () => {
    mockQuit.mockResolvedValue('OK');
    await cache.disconnect();
    expect(mockQuit).toHaveBeenCalled();
  });
});
