import { db, pool } from './connection.js';
import { exchangeRates } from './schema.js';

const TEST_RATES = [
  { fromCurrency: 'USD', toCurrency: 'BRL', rate: '5.05', source: 'exchangerate-api' },
  { fromCurrency: 'USD', toCurrency: 'EUR', rate: '0.92', source: 'exchangerate-api' },
  { fromCurrency: 'USD', toCurrency: 'GBP', rate: '0.79', source: 'exchangerate-api' },
  { fromCurrency: 'USD', toCurrency: 'JPY', rate: '157.50', source: 'exchangerate-api' },
  { fromCurrency: 'USD', toCurrency: 'CAD', rate: '1.37', source: 'exchangerate-api' },
  { fromCurrency: 'USD', toCurrency: 'AUD', rate: '1.53', source: 'exchangerate-api' },
  { fromCurrency: 'EUR', toCurrency: 'BRL', rate: '5.49', source: 'exchangerate-api' },
  { fromCurrency: 'EUR', toCurrency: 'GBP', rate: '0.86', source: 'exchangerate-api' },
  { fromCurrency: 'BTC', toCurrency: 'USD', rate: '67432.12', source: 'coingecko' },
  { fromCurrency: 'BTC', toCurrency: 'BRL', rate: '340527.21', source: 'coingecko' },
  { fromCurrency: 'ETH', toCurrency: 'USD', rate: '3521.45', source: 'coingecko' },
  { fromCurrency: 'ETH', toCurrency: 'BRL', rate: '17788.33', source: 'coingecko' },
  { fromCurrency: 'SOL', toCurrency: 'USD', rate: '172.30', source: 'coingecko' },
  { fromCurrency: 'SOL', toCurrency: 'BRL', rate: '870.12', source: 'coingecko' },
];

async function seedRates() {
  console.log('💱 Seeding test exchange rates...');
  for (const r of TEST_RATES) {
    await db.insert(exchangeRates).values(r).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${TEST_RATES.length} exchange rates`);
  await pool.end();
}

seedRates().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
