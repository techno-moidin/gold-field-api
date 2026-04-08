# GOLD FIELD API - ARCHITECTURE DOCUMENT

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Vision & Roadmap](#2-vision--roadmap)
3. [Current Implementation Status ✅](#3-current-implementation-status-)
4. [Architecture Decisions](#4-architecture-decisions)
5. [Future Implementation Plan](#5-future-implementation-plan)
6. [Technical Specifications](#6-technical-specifications)
7. [API Reference](#7-api-reference)
8. [File Structure](#8-file-structure)
9. [Discussion Log](#9-discussion-log)

---

## 1. Project Overview

**Project Name:** Gold Field API  
**Type:** Real-time Gold Rate Tracking & Analytics Backend  
**Framework:** NestJS 11  
**Goal:** Provide live gold rates, historical analytics, and predictions for multiple global regions

### Core Problem Being Solved
A unified API for tracking gold prices across different regions (USA, India, UAE, Saudi Arabia, UK, EU) with support for multiple purities (24K, 22K, 18K), real-time updates, and historical analytics.

---

## 2. Vision & Roadmap

### Phase 1: Live Gold Rates & Analytics (COMPLETED) ✅
- [x] Real-time gold rates for 6 regions
- [x] 3 gold purities support
- [x] Redis caching
- [x] PostgreSQL storage
- [x] Chart-ready data endpoints
- [x] Currency conversion

### Phase 2: Real-Time & Enhanced Analytics (IN PROGRESS)
- [ ] WebSocket for real-time push
- [ ] Enhanced historical analytics (OHLC, MA, Volatility)
- [ ] Better aggregation queries
- [ ] Standard database indexes

### Phase 3: Advanced Features (PLANNED)
- [ ] ML-based price predictions
- [ ] News feed integration
- [ ] User authentication & preferences
- [ ] Email/push notifications

### Phase 4: E-commerce / SaaS (PLANNED)
- [ ] Gold trading features
- [ ] Subscription tiers
- [ ] Ad integration
- [ ] Premium analytics

### Phase 5: Microservices Architecture (PLANNED)
- [ ] Split into microservices
- [ ] RabbitMQ message broker
- [ ] Dedicated rate-fetching service
- [ ] Analytics service
- [ ] Notification service

---

## 3. Current Implementation Status ✅

### What Was Built

| Feature | Status | Files |
|---------|--------|-------|
| Core NestJS Setup | ✅ Complete | `main.ts`, `app.module.ts` |
| Gold Rates CRUD | ✅ Complete | `gold-rates/*` |
| PostgreSQL + TypeORM | ✅ Complete | Entity, Config |
| Redis Caching | ✅ Complete | `gold-rates.service.ts` |
| External API (Metal-API) | ✅ Complete | `external-api/*` |
| Mock Data Generator | ✅ Complete | `mock-data.service.ts` |
| Scheduler (Cron) | ✅ Complete | `scheduler/*` |

### API Endpoints Available

```
POST   /gold-rates              # Create single rate
POST   /gold-rates/bulk         # Bulk create rates
GET    /gold-rates/live         # All live rates (cached)
GET    /gold-rates/live/:region # Rates by region
GET    /gold-rates/live/:region/:purity  # Specific rate
GET    /gold-rates/history      # Paginated history
GET    /gold-rates/history/:region/:purity/:period  # Aggregated
GET    /gold-rates/chart        # Chart data
GET    /gold-rates/convert      # Currency conversion
POST   /gold-rates/refresh      # Clear cache
```

### Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | NestJS | 11.x |
| Database | PostgreSQL | 15 |
| Cache | Redis | 7 |
| ORM | TypeORM | 0.3.x |
| Scheduler | @nestjs/schedule | 5.x |
| External API | Axios | 1.x |

---

## 4. Architecture Decisions

| # | Decision | Summary | Date |
|---|----------|---------|------|
| 1 | PostgreSQL over MongoDB | Better for time-series, TypeORM support | Start |
| 2 | Redis for Caching | Fast reads, TTL support | Start |
| 3 | Mock Data for Development | No external API dependency | Phase 2 |
| 4 | Region-Based Enums | Type safety, autocomplete | Start |
| 5 | Direct Repository Pattern | Simpler than repo pattern | Start |
| 6 | No Monorepo | Frontend separate, microservices later | Reverted |
| 7 | WebSocket Public, Room-Based | Subscribe by region+purity (e.g., USA-24K) | Phase 2 |

---

## 5. Future Implementation Plan

### Day 1: WebSocket Foundation

**Morning (2-3h):**
1. Install: `npm install @nestjs/websockets @nestjs/platform-socket.io socket.io`
2. Create: `src/gateway/gold-rates.gateway.ts`
3. Create: `src/gateway/gold-rates-events.service.ts`

**Afternoon (2-3h):**
4. Create: `src/gateway/gateway.module.ts`
5. Update: `src/app.module.ts`
6. Test WebSocket connection

**Deliverables Day 1:**
- [ ] WebSocket server running
- [ ] Subscribe/unsubscribe working
- [ ] Event emission working

---

### Day 2: WebSocket + Scheduler Integration

**Morning (2-3h):**
1. Inject Events Service into Scheduler
2. Broadcast after fetch completes
3. Configure WebSocket CORS
4. Add connection limits

**Afternoon (2-3h):**
5. Add heartbeat/ping
6. Error handling
7. Document WebSocket events

**Deliverables Day 2:**
- [ ] Scheduler broadcasts to clients
- [ ] Real-time updates working
- [ ] CORS configured

---

### Day 3: Historical Analytics - Foundation

**Morning (2-3h):**
1. Create: `src/analytics/analytics.module.ts`
2. Create: `src/analytics/analytics.service.ts`
3. Implement OHLC method
4. Create: `src/analytics/analytics.controller.ts`

**Afternoon (2-3h):**
5. Create Query DTOs
6. Add database indexes
7. Test OHLC endpoint

**Deliverables Day 3:**
- [ ] OHLC endpoint working
- [ ] Configurable intervals
- [ ] Date range filtering

---

### Day 4: Enhanced Analytics - Moving Averages & Volatility

**Morning (2-3h):**
1. Implement Moving Averages (MA, EMA)
2. Implement Volatility Metrics (Bollinger Bands, ATR)
3. Implement Trend Analysis
4. Add Statistics endpoint

**Afternoon (2-3h):**
5. Create controller methods
6. Optimize SQL queries
7. Write unit tests

**Deliverables Day 4:**
- [ ] MA/EMA working
- [ ] Volatility indicators
- [ ] Trend analysis
- [ ] Stats endpoint

---

### Day 5: Polish & Integration

**Morning (2-3h):**
1. Create composite endpoint
2. WebSocket analytics events
3. Error handling & validation

**Afternoon (2-3h):**
4. Performance optimization
5. Update documentation
6. Final testing

**Deliverables Day 5:**
- [ ] All endpoints working
- [ ] WebSocket integrated
- [ ] Tests passing

---

## 6. Technical Specifications

### WebSocket Events

**Client → Server:**

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe` | `{ region, purity }` | Subscribe to rate |
| `unsubscribe` | `{ region, purity }` | Unsubscribe |
| `ping` | - | Heartbeat |

**Server → Client:**

| Event | Payload | Description |
|-------|---------|-------------|
| `rateUpdate` | `LiveRateResponse` | Single rate update |
| `bulkUpdate` | `LiveRateResponse[]` | All rates after fetch |
| `subscribed` | `{ room }` | Confirmation |
| `pong` | - | Heartbeat response |

### Room Naming
Format: `{region}-{purity}`  
Examples: `USA-24K`, `INDIA-22K`, `UAE-18K`, `ALL`

### Analytics Data Structures

```typescript
// OHLC
interface OHLCData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  avg: number;
  volume: number;
}

// Moving Averages
interface MovingAveragesResponse {
  timestamp: Date;
  ma5: number | null;
  ma10: number | null;
  ma20: number | null;
  ema12: number | null;
  ema26: number | null;
}

// Volatility
interface VolatilityResponse {
  timestamp: Date;
  bollingerHigh: number;
  bollingerLow: number;
  atr: number;
  stdDev: number;
}

// Trend
interface TrendResponse {
  trend: 'bullish' | 'bearish' | 'neutral';
  momentum: number;
  support: number;
  resistance: number;
  trendStrength: number;
}
```

---

## 7. API Reference

### REST Endpoints

```
GET  /gold-rates/live
GET  /gold-rates/live/:region
GET  /gold-rates/live/:region/:purity
GET  /gold-rates/history
GET  /gold-rates/history/:region/:purity/:period
GET  /gold-rates/chart
GET  /gold-rates/convert
POST /gold-rates/refresh

# Analytics (Day 3-4)
GET  /analytics/ohlc
GET  /analytics/moving-averages
GET  /analytics/volatility
GET  /analytics/trends
GET  /analytics/stats
GET  /analytics/comprehensive
```

### WebSocket Usage

```typescript
// Frontend
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Subscribe
socket.emit('subscribe', { region: 'USA', purity: '24K' });

// Listen
socket.on('rateUpdate', (data) => {
  console.log('New rate:', data.pricePerGram);
});

// Unsubscribe
socket.emit('unsubscribe', { region: 'USA', purity: '24K' });
```

---

## 8. File Structure

```
gold-field-api/
├── src/
│   ├── analytics/                    # NEW: Day 3-5
│   │   ├── analytics.controller.ts
│   │   ├── analytics.module.ts
│   │   ├── analytics.service.ts
│   │   └── dto/
│   │
│   ├── config/                     # EXISTING ✅
│   ├── external-api/              # EXISTING ✅
│   ├── gateway/                    # NEW: Day 1-2
│   │   ├── gateway.module.ts
│   │   ├── gold-rates.gateway.ts
│   │   └── gold-rates-events.service.ts
│   ├── gold-rates/                 # EXISTING ✅
│   ├── scheduler/                  # EXISTING ✅
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
│
├── .env
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── ARCHITECTURE.md                 # This file
```

---

## 9. Discussion Log

### Session 1: Project Initialization
- NestJS framework chosen
- PostgreSQL + Redis stack
- Region-based enums
- Mock data for development

### Session 2: Phase 1 Implementation
- All CRUD, caching, scheduler, external API complete
- README updated
- Tests passing

### Session 3: Phase 2 Planning
- WebSocket: public, room-based (region+purity)
- Analytics: OHLC, MA, volatility, trends
- No authentication for Phase 2
- ARCHITECTURE.md created for day-by-day guide

### Pending Discussions
- [ ] Authentication strategy
- [ ] Rate limiting rules
- [ ] Frontend architecture
- [ ] CI/CD pipeline

---

## Quick Start

```bash
npm install
docker-compose up -d
npm run start:dev
npm test
```

---

## Next Actions

| Day | Task | Status |
|-----|------|--------|
| 1 | WebSocket Foundation | TODO |
| 2 | WebSocket + Scheduler | TODO |
| 3 | Analytics OHLC | TODO |
| 4 | Enhanced Analytics | TODO |
| 5 | Polish & Integration | TODO |

---

*Last Updated: 2026-04-03*  
*Status: Phase 2 Ready - Start Day 1*
