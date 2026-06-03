import { describe, it, expect, afterAll } from 'vitest';
import { db, pool } from '../../src/db/connection.js';

describe('Database Connection', () => {
  it('should connect to PostgreSQL and execute a query', async () => {
    const result = await db.execute('SELECT 1 as number');
    expect(result.rows[0]).toEqual({ number: 1 });
  });

  afterAll(async () => {
    await pool.end();
  });
});
