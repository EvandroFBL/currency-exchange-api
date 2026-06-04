# 💱 Currency Exchange API

A production-grade REST API for real-time currency exchange rates supporting both **fiat and cryptocurrency** conversions. Built with modern Node.js backend practices including TDD, containerization, and CI/CD.

## 🚀 Features

- **Real-time fiat rates** from [ExchangeRate API](https://www.exchangerate-api.com/)
- **Crypto prices** from [CoinGecko API](https://www.coingecko.com/en/api)
- **Smart conversion engine** — direct, inverse, and cross-rate calculations via USD
- **Redis caching** with differentiated TTL (5min fiat / 1min crypto)
- **Conversion history** audit trail
- **Zod-validated** environment configuration
- **Docker Compose** one-command setup
- **CI/CD** with GitHub Actions (test + Docker build)
- **Full test suite** with Vitest (18 unit + integration tests)

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 + TypeScript |
| Framework | Fastify |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Validation | Zod |
| Testing | Vitest + Supertest |
| Containers | Docker Compose |
| CI/CD | GitHub Actions |

## 📡 API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health check |

### Rates
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/rates` | All current rates |
| `GET` | `/api/rates?base=USD` | Rates for a base currency |
| `GET` | `/api/rates?type=fiat` | Fiat-only rates |
| `GET` | `/api/rates?type=crypto` | Crypto-only rates |
| `GET` | `/api/rates?limit=10` | Limit results |
| `GET` | `/api/rates/history?from=USD&to=BRL` | Historical rates for a pair |
| `POST` | `/api/rates/sync` | Trigger rate refresh from external APIs |

### Conversion
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/convert?from=BRL&to=USD&amount=100` | Convert any amount |

Supports all conversion types:
- **Fiat → Fiat** (e.g., BRL → USD via direct/inverse rate)
- **Crypto → Fiat** (e.g., BTC → BRL)
- **Crypto → Crypto** (e.g., BTC → ETH via cross-rate through USD)

## 🏃 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- [ExchangeRate API key](https://www.exchangerate-api.com/) (free tier)
- [CoinGecko API key](https://www.coingecko.com/en/api) (free tier)

### Setup

```bash
# Clone
git clone https://github.com/EvandroFBL/currency-exchange-api.git
cd currency-exchange-api

# Environment
cp .env.example .env
# Edit .env with your API keys

# Start services (PostgreSQL + Redis)
docker-compose up -d

# Run migrations & seed
npm run db:migrate
npm run db:seed

# Start dev server
npm run dev
```

API is live at `http://localhost:3000`

```bash
# Test it
curl http://localhost:3000/api/health
curl "http://localhost:3000/api/convert?from=BTC&to=BRL&amount=1"
```

### Development

```bash
npm run dev           # Start dev server with hot reload
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Tests with coverage report
npm run lint          # TypeScript type check
npm run db:studio     # Drizzle Studio (DB GUI)
```

## 📁 Project Structure

```
currency-exchange-api/
├── .github/workflows/     # CI/CD pipeline
│   └── ci.yml
├── drizzle/
│   └── migrations/        # Auto-generated SQL migrations
├── src/
│   ├── config/
│   │   └── env.ts         # Zod-validated environment config
│   ├── db/
│   │   ├── connection.ts  # Drizzle + PostgreSQL pool
│   │   ├── schema.ts      # 4 tables (currencies, crypto, rates, history)
│   │   ├── seed.ts        # Seed 14 fiat + 10 crypto currencies
│   │   └── seed-rates.ts  # Seed test exchange rates
│   ├── routes/
│   │   ├── health/        # GET /api/health
│   │   ├── rates/         # GET /api/rates, history, sync
│   │   └── convert/       # GET /api/convert
│   ├── services/
│   │   ├── cache/         # Redis cache service (typed JSON)
│   │   ├── external/      # ExchangeRate API + CoinGecko clients
│   │   ├── rates/         # Rate sync + query services
│   │   └── convert/       # Conversion engine (direct/inverse/cross)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Error classes
│   ├── app.ts             # Fastify app factory
│   └── server.ts          # Entry point
├── tests/
│   ├── unit/              # Unit tests (mocked deps)
│   └── integration/       # Integration tests (real DB)
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## 🗄️ Database Schema

```
┌──────────────────┐     ┌──────────────────────┐
│   currencies     │     │  cryptocurrencies     │
├──────────────────┤     ├──────────────────────┤
│ id (PK)          │     │ id (PK)              │
│ code (UNIQUE)    │     │ coingecko_id (UNIQUE) │
│ name             │     │ symbol               │
│ symbol           │     │ name                 │
│ active           │     │ active               │
│ created_at       │     │ created_at           │
└──────────────────┘     └──────────────────────┘

┌──────────────────────────┐     ┌──────────────────────┐
│    exchange_rates         │     │ conversion_history    │
├──────────────────────────┤     ├──────────────────────┤
│ id (PK)                   │     │ id (PK)              │
│ from_currency             │     │ from_currency        │
│ to_currency               │     │ to_currency          │
│ rate (NUMERIC 20,8)       │     │ amount               │
│ source                    │     │ result               │
│ fetched_at                │     │ rate                 │
│ created_at                │     │ source               │
│ UNIQUE(from,to,fetched_at)│     │ created_at           │
└──────────────────────────┘     └──────────────────────┘
```

## 🧪 Testing

```bash
# All tests (18 passing)
npm test

# Specific file
npx vitest run tests/unit/conversion.service.test.ts

# Watch mode
npm run test:watch
```

**Test coverage:**
- 9 unit tests — CacheService (Redis mock)
- 4 unit tests — ExchangeRate API (fetch mock)
- 4 unit tests — CoinGecko API (fetch mock)
- 1 integration test — Database connection

## 🐳 Docker

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

Services:
- **app** — Node.js API (port 3000)
- **db** — PostgreSQL 16 (port 5433)
- **db-test** — PostgreSQL for tests (port 5434)
- **redis** — Redis 7 (port 6380)

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment (`development`, `test`, `production`) |
| `PORT` | No | `3000` | Server port |
| `HOST` | No | `0.0.0.0` | Server host |
| `LOG_LEVEL` | No | `info` | Fastify log level |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `REDIS_URL` | **Yes** | — | Redis connection string |
| `EXCHANGE_RATE_API_KEY` | No | — | ExchangeRate API key |
| `COINGECKO_API_KEY` | No | — | CoinGecko API key |

## 📄 License

MIT
