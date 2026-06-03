import 'dotenv/config';
import { db, pool } from './connection.js';
import { currencies, cryptocurrencies } from './schema.js';

const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
];

const CRYPTOS = [
  { coingeckoId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { coingeckoId: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { coingeckoId: 'solana', symbol: 'SOL', name: 'Solana' },
  { coingeckoId: 'ripple', symbol: 'XRP', name: 'XRP' },
  { coingeckoId: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { coingeckoId: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { coingeckoId: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { coingeckoId: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { coingeckoId: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { coingeckoId: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed fiat currencies
  for (const currency of FIAT_CURRENCIES) {
    await db.insert(currencies).values(currency).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${FIAT_CURRENCIES.length} fiat currencies`);

  // Seed cryptocurrencies
  for (const crypto of CRYPTOS) {
    await db.insert(cryptocurrencies).values(crypto).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${CRYPTOS.length} cryptocurrencies`);

  await pool.end();
  console.log('🎉 Seeding complete!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
