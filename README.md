# Gold Field API

A NestJS backend for live gold rate tracking, historical analytics, and predictions.

## Features (Roadmap)

- [x] **Phase 1: Live Gold Rates & Analytics**
  - [x] Real-time gold rates for 6 regions (USA, India, UAE, Saudi, UK, EU)
  - [x] 3 gold purities (24K, 22K, 18K)
  - [x] Redis caching for fast retrieval
  - [x] Historical data storage with PostgreSQL
  - [x] Chart-ready data endpoints
  - [x] Currency conversion

- [ ] **Phase 2: External API & Scheduler**
  - [x] Metal-API integration
  - [x] Mock data generator for development
  - [x] Scheduled rate updates
  - [ ] WebSocket for real-time push

- [ ] **Phase 3: Analytics & Predictions**
  - [ ] Advanced analytics
  - [ ] ML-based price predictions
  - [ ] News feed integration

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: TypeORM
- **Scheduler**: @nestjs/schedule

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL & Redis)
- Metal-API key (optional, mock data used if not set)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

### 3. Configure Environment

Copy `.env` and update values:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=goldfield

REDIS_HOST=localhost
REDIS_PORT=6379

# Optional: Get free key from https://metal-api.com
METAL_API_KEY=your_key_here
METAL_API_UPDATE_INTERVAL_MINUTES=5
```

### 4. Run Development Server

```bash
npm run start:dev
```

API available at: `http://localhost:3000`

## API Endpoints

### Live Rates

| Method | Endpoint                           | Description                                |
| ------ | ---------------------------------- | ------------------------------------------ |
| GET    | `/gold-rates/live`                 | All live rates (cached)                    |
| GET    | `/gold-rates/live/:region`         | By region (USA, INDIA, UAE, SAUDI, UK, EU) |
| GET    | `/gold-rates/live/:region/:purity` | By region + purity (24K, 22K, 18K)         |

### Historical Data

| Method | Endpoint                                      | Description                    |
| ------ | --------------------------------------------- | ------------------------------ |
| GET    | `/gold-rates/history`                         | Paginated history with filters |
| GET    | `/gold-rates/history/:region/:purity/:period` | Aggregated (day/week/month)    |

### Utilities

| Method | Endpoint              | Description                  |
| ------ | --------------------- | ---------------------------- |
| GET    | `/gold-rates/chart`   | Chart-ready candlestick data |
| GET    | `/gold-rates/convert` | Convert between regions      |
| POST   | `/gold-rates/refresh` | Force cache refresh          |

### Admin

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| POST   | `/gold-rates`      | Create single rate |
| POST   | `/gold-rates/bulk` | Bulk create rates  |

## Example Requests

### Get all live rates

```bash
curl http://localhost:3000/gold-rates/live
```

### Get rates for India

```bash
curl http://localhost:3000/gold-rates/live/INDIA
```

### Get 24K gold in UAE

```bash
curl http://localhost:3000/gold-rates/live/UAE/24K
```

### Get historical data

```bash
curl "http://localhost:3000/gold-rates/history?region=USA&purity=24K&limit=50"
```

### Convert 100 USD to INR

```bash
curl "http://localhost:3000/gold-rates/convert?amount=100&fromRegion=USA&toRegion=INDIA"
```

## Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Project Structure

```
src/
├── config/              # Configuration files
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── metal-api.config.ts
├── external-api/        # External API integrations
│   ├── metal-api.service.ts
│   └── mock-data.service.ts
├── gold-rates/          # Core gold rates module
│   ├── dto/              # Data Transfer Objects
│   ├── enums/            # Enums (Region, Currency, Purity)
│   ├── entities/        # TypeORM entities
│   ├── gold-rates.controller.ts
│   ├── gold-rates.service.ts
│   └── gold-rates.module.ts
├── scheduler/           # Background jobs
│   └── gold-rate-scheduler.service.ts
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

## Environment Variables

| Variable                            | Default     | Description              |
| ----------------------------------- | ----------- | ------------------------ |
| `DB_HOST`                           | localhost   | PostgreSQL host          |
| `DB_PORT`                           | 5432        | PostgreSQL port          |
| `DB_USERNAME`                       | postgres    | Database user            |
| `DB_PASSWORD`                       | password    | Database password        |
| `DB_NAME`                           | goldfield   | Database name            |
| `REDIS_HOST`                        | localhost   | Redis host               |
| `REDIS_PORT`                        | 6379        | Redis port               |
| `REDIS_TTL`                         | 60          | Cache TTL in seconds     |
| `METAL_API_KEY`                     | -           | Metal-API key (optional) |
| `METAL_API_UPDATE_INTERVAL_MINUTES` | 5           | Rate update interval     |
| `APP_PORT`                          | 3000        | Application port         |
| `APP_ENV`                           | development | Environment              |

## License

MIT
