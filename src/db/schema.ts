import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  numeric,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ═══════════════════════════════════════
// Fiat Currencies
// ═══════════════════════════════════════

export const currencies = pgTable('currencies', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 3 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 10 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// ═══════════════════════════════════════
// Exchange Rates (fiat + crypto source rates)
// ═══════════════════════════════════════

export const exchangeRates = pgTable(
  'exchange_rates',
  {
    id: serial('id').primaryKey(),
    fromCurrency: varchar('from_currency', { length: 10 }).notNull(),
    toCurrency: varchar('to_currency', { length: 10 }).notNull(),
    rate: numeric('rate', { precision: 20, scale: 8 }).notNull(),
    source: varchar('source', { length: 50 }).notNull(), // 'exchangerate-api' | 'coingecko'
    fetchedAt: timestamp('fetched_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    pairIdx: uniqueIndex('idx_exchange_rate_pair').on(
      table.fromCurrency,
      table.toCurrency,
      table.fetchedAt,
    ),
  }),
);

// ═══════════════════════════════════════
// Cryptocurrencies
// ═══════════════════════════════════════

export const cryptocurrencies = pgTable('cryptocurrencies', {
  id: serial('id').primaryKey(),
  coingeckoId: varchar('coingecko_id', { length: 100 }).notNull().unique(),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// ═══════════════════════════════════════
// Conversion History
// ═══════════════════════════════════════

export const conversionHistory = pgTable('conversion_history', {
  id: serial('id').primaryKey(),
  fromCurrency: varchar('from_currency', { length: 10 }).notNull(),
  toCurrency: varchar('to_currency', { length: 10 }).notNull(),
  amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
  result: numeric('result', { precision: 20, scale: 8 }).notNull(),
  rate: numeric('rate', { precision: 20, scale: 8 }).notNull(),
  source: varchar('source', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
