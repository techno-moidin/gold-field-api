# Gold Field - Workflow Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Initial Setup & Exploration](#2-initial-setup--exploration)
3. [Frontend Setup](#3-frontend-setup)
4. [Backend Bug Fixes](#4-backend-bug-fixes)
5. [Database Schema Analysis](#5-database-schema-analysis)
6. [External Data Sources & Caching](#6-external-data-sources--caching)
7. [Database Seeding](#7-database-seeding)
8. [Documentation Updates](#8-documentation-updates)
9. [Commit Preparation](#9-commit-preparation)
10. [Pending Tasks](#10-pending-tasks)

---

## 1. Project Overview

### 1.1 What is Gold Field?

Gold Field is a full-stack application consisting of:
- **Backend (gold-field-api)**: NestJS API for live gold rate tracking, historical analytics, and predictions
- **Frontend (gold-field)**: React + TypeScript web application

### 1.2 Supported Regions and Purities

The system tracks gold rates for:
- **6 Regions**: USA, INDIA, UAE, SAUDI, UK, EU
- **3 Purities**: 24K, 22K, 18K

### 1.3 Technology Stack

**Backend:**
- Framework: NestJS 11
- Database: PostgreSQL 15
- Cache: Redis 7 (configured but using memory store)
- ORM: TypeORM 0.3.x
- Scheduler: @nestjs/schedule

**Frontend:**
- Framework: React 19
- Language: TypeScript
- Build Tool: Vite
- HTTP Client: Axios
- Routing: React Router DOM

---

## 2. Initial Setup & Exploration

### 2.1 Understanding OpenCode Workspaces

We started by understanding how OpenCode handles workspaces:
- Each OpenCode session operates only on the current working directory
- Cannot access other workspaces directly
- Sessions can be shared via `/share` command
- To continue on another device: push code to git + share OpenCode link

**Location of our projects:**
```
/Users/apple/Desktop/SB_Projects/Workspace/gold-field-temp/
├── gold-field/          (Frontend - React app)
└── gold-field-api/     (Backend - NestJS API)
```

### 2.2 Research: Google Stitch AI

We explored what "Stitch AI" refers to since there are multiple products with similar names:

| Product | Description |
|--------|-------------|
| **Google Stitch** | AI design tool from Google Labs - creates UI from natural language |
| Stitch AI (UK) | Business WhatsApp solutions provider |
| Stitch (StitchDesign) | Open-source Apple prototyping environment |
| stitch-ai (PyPI) | Python SDK for memory management |

**Decision:** Google Stitch (stitch.withgoogle.com) is the tool for designing the frontend. Since OpenCode cannot directly access Google Stitch, we decided to:
1. Export designs from Stitch (Figma/code/images)
2. Or manually share specs to build the frontend

---

## 3. Frontend Setup

### 3.1 Project Initialization

We set up the React frontend from scratch in the `gold-field` directory.

**Initial challenge:** Create React App couldn't be run directly in the non-empty directory.

**Solution:** Created the project in `/tmp` first, then moved files to the target directory.

```bash
# Step 1: Create in temp directory
cd /tmp && npm create vite@latest gold-field-frontend -- --template react-ts

# Step 2: Move to target directory
cp -r /tmp/gold-field-frontend/* /Users/apple/Desktop/SB_Projects/Workspace/gold-field-temp/gold-field/
```

### 3.2 Installed Dependencies

After creation, we installed additional packages:

```bash
npm install axios react-router-dom
npm install -D prettier
```

### 3.3 TypeScript Configuration

The project came pre-configured with:
- TypeScript (tsconfig.json)
- ESLint (eslint.config.js)
- Vite (vite.config.ts)

We added `.prettierrc` for code formatting:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 3.4 Verified Setup

We ran lint and build to verify everything works:
- `npm run lint` - Code linting passed
- `npm run build` - TypeScript compilation and Vite build succeeded

### 3.5 Directory Structure Created

The frontend now has:
```
gold-field/
├── src/
│   ├── components/     (React components)
│   ├── screens/       (Page components)
│   ├── hooks/          (Custom hooks)
│   ├── lib/            (Utilities)
│   ├── store/          (State management)
│   ├── types/          (TypeScript types)
│   └── assets/         (Static assets)
├── public/
├── node_modules/
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
└── .prettierrc
```

---

## 4. Backend Bug Fixes

### 4.1 ContentService Dependency Injection Error

When running the backend (NestJS app), we encountered this error:

```
Nest can't resolve dependencies of the ContentService (?). Please make sure that the argument dependency at index [0] is available in the current context.
```

### 4.2 Root Cause

The error occurred because NestJS 10+ requires explicit token injection for the Cache manager. In the `ContentService`, the Cache was being injected directly without the proper decorator.

**Original code (incorrect):**
```typescript
constructor(private cacheManager: Cache) {}
```

### 4.3 Fix Applied

We fixed this by:
1. Adding the `@Inject` decorator import
2. Using `@Inject(CACHE_MANAGER)` token

**Fixed code:**
```typescript
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
```

### 4.4 Files Modified

- `src/content/content.service.ts` - Added CACHE_MANAGER injection

---

## 5. Database Schema Analysis

### 5.1 Collections/Entities Identified

We analyzed all TypeORM entities in the project:

| Entity | Table | Description |
|--------|-------|-------------|
| **GoldRate** | `gold_rates` | Live gold rates for 6 regions, 3 purities |
| **Subscriber** | `subscribers` | Telegram/WhatsApp subscribers for alerts |
| **SignalMetrics** | `signal_metrics` | Daily market signals (UAE Marts data) |
| **AffiliatePartner** | `affiliate_partners` | Affiliate partners (brokers, jewelry, etc.) |
| **AffiliateClick** | `affiliate_clicks` | Click tracking for affiliates |

### 5.2 GoldRate Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| region | enum | USA, INDIA, UAE, SAUDI, UK, EU |
| currency | enum | USD, INR, AED, SAR, GBP, EUR |
| purity | enum | 24K, 22K, 18K |
| pricePerGram | decimal(12,2) | Price per gram |
| pricePerOunce | decimal(12,2) | Price per ounce |
| bid | decimal(12,2) | Bid price |
| ask | decimal(12,2) | Ask price |
| change24h | decimal(8,2) | 24h change |
| changePercent24h | decimal(8,2) | 24h change % |
| high24h | decimal(12,2) | 24h high |
| low24h | decimal(12,2) | 24h low |
| open | decimal(12,2) | Open price |
| previousClose | decimal(12,2) | Previous close |
| marketOpen | timestamptz | Market open time |
| marketClose | timestamptz | Market close time |
| isActive | boolean | Active status |
| timestamp | timestamptz | Record timestamp |

### 5.3 Subscriber Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| telegramId | string | Telegram user ID |
| telegramUsername | string | Telegram username |
| whatsappPhone | string | WhatsApp number |
| tier | enum | FREE, PREMIUM |
| alertFrequency | enum | DAILY, WEEKLY, INSTANT |
| preferredRegion | string | Default region |
| preferredPurity | string | Default purity |
| isActive | boolean | Active status |
| isSubscribed | boolean | Subscription status |
| createdAt | timestamptz | Creation time |
| updatedAt | timestamptz | Last update |
| lastAlertAt | Date | Last alert sent |

### 5.4 SignalMetrics Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| metricDate | date | Date (unique) |
| price24kAvg | decimal(12,2) | Average 24K price |
| price24kHigh | decimal(12,2) | High 24K price |
| price24kLow | decimal(12,2) | Low 24K price |
| usdToAed | decimal(8,4) | USD to AED rate |
| soukPremium | decimal(8,2) | Souk premium |
| volumeTraded | decimal(12,2) | Trading volume |
| createdAt | timestamptz | Creation time |

### 5.5 AffiliatePartner Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | string | Partner name |
| code | string | Unique code |
| description | string | Description |
| url | string | Partner URL |
| category | enum | BROKER, JEWELRY, TRADING, APPS |
| status | enum | ACTIVE, INACTIVE, PENDING |
| commissionAmount | decimal(10,2) | Commission amount |
| commissionCurrency | string | Currency |
| commissionType | string | percentage/fixed |
| commissionRate | decimal(5,2) | Commission rate |
| logoUrl | string | Logo URL |
| createdAt | timestamptz | Creation time |
| updatedAt | timestamptz | Last update |

### 5.6 AffiliateClick Fields

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| subscriberId | string | Subscriber ID (optional) |
| partnerCode | string | Partner code |
| partnerUrl | string | Clicked URL |
| clickedAt | timestamptz | Click time |
| converted | boolean | Conversion status |
| convertedAt | timestamptz | Conversion time |
| conversionValue | decimal(10,2) | Value |
| conversionCurrency | string | Currency |
| utmSource | string | UTM source |
| utmMedium | string | UTM medium |

---

## 6. External Data Sources & Caching

### 6.1 External APIs

**Metal-API (metal-api.com)**
- Primary source for live gold rates
- Fetches: XAU (gold) prices in USD, INR, AED, SAR, GBP, EUR
- Requires API key (free tier available)
- Fallback: Mock data if no key configured

**Implementation:**
- `src/external-api/metal-api.service.ts` - Fetches from Metal-API
- `src/external-api/mock-data.service.ts` - Generates mock data

### 6.2 Cache Strategy

**Cache Type:** Memory store (configured, not Redis yet)
**Location:** In-memory cache using cache-manager

**Cache Keys:**
| Key Pattern | Data Cached | TTL |
|------------|-------------|-----|
| `gold:live:all` | All live rates | 60s |
| `gold:live:region:{region}` | Rates by region | 60s |
| `gold:live:region:purity:{region}:{purity}` | Specific rate | 60s |

### 6.3 Scheduler

The backend has a scheduler that:
- Fetches rates every X minutes (configurable via `METAL_API_UPDATE_INTERVAL_MINUTES`)
- Falls back to mock data if Metal-API fails
- Saves new rates to database
- Invalidates cache after saving

**Implementation:**
- `src/scheduler/gold-rate-scheduler.service.ts`

### 6.4 WebSocket (Not Implemented Yet)

WebSocket for real-time updates is planned for Phase 2 but not yet implemented.

**Planned Implementation:**
- Room-based subscriptions: `{region}-{purity}` (e.g., USA-24K)
- Events: `rateUpdate`, `bulkUpdate`, `subscribed`, `pong`

---

## 7. Database Seeding

### 7.1 Need for Seed Data

The user requested to add mock data to all database tables for development and testing purposes.

### 7.2 Scripts Created

We created seed scripts in `src/scripts/` directory:

1. **`seed-gold-rates.ts`**
   - Generates 18 gold rates (6 regions × 3 purities)
   - Uses realistic base prices per currency
   - Applies purity multipliers (24K: 1.0, 22K: 0.9167, 18K: 0.75)
   - Adds random variation for realistic data

2. **`seed-subscribers.ts`**
   - Creates 4 sample subscribers
   - Mix of Telegram and WhatsApp users
   - Different tiers: FREE and PREMIUM
   - Different alert frequencies: DAILY, WEEKLY, INSTANT

3. **`seed-signal-metrics.ts`**
   - Generates 30 days of signal metrics
   - Dates from today going back 30 days
   - Realistic price variations
   - Includes USD to AED exchange rate

4. **`seed-affiliate.ts`**
   - Creates 5 affiliate partners:
     - Gold Dubai Brokers (BROKER)
     - Malabar Gold & Diamonds (JEWELRY)
     - Joyalukkas (JEWELRY)
     - Gold Forex Trading (TRADING)
     - GoldTracker App (APPS)
   - Creates 2 sample clicks with conversion tracking

5. **`seed-all.ts`** (Main entry point)
   - Connects to database
   - Runs all seed functions in sequence
   - Handles errors and cleanup

### 7.3 Package.json Update

Added seed script to package.json:

```json
"seed": "ts-node -r tsconfig-paths/register src/scripts/seed-all.ts"
```

### 7.4 Running the Seed

```bash
cd gold-field-api
npm run seed
```

**Output:**
```
🌱 Starting database seed...

📦 Database connected

--- Seeding Gold Rates ---
✅ Seeded 18 gold rates

--- Seeding Subscribers ---
✅ Seeded 4 subscribers

--- Seeding Signal Metrics ---
✅ Seeded 30 signal metrics

--- Seeding Affiliate Partners ---
✅ Seeded 5 affiliate partners
✅ Seeded 2 affiliate clicks

✅ Database seeding completed!
```

---

## 8. Documentation Updates

### 8.1 README.md Updates

Updated the backend README.md with:

1. **Phase 2 Status**
   - Added Content pages API as completed
   - Marked WebSocket as not implemented yet

2. **Port Change**
   - Default port changed from 3000 to 8001
   - Updated all example curl commands

3. **Seed Script Instructions**
   - Added "npm run seed" instructions
   - Added database seeding step in Quick Start

4. **Project Structure**
   - Added new modules: content/, alerts/, uaemarts/, affiliate/
   - Added scripts/ directory with seed files

5. **Environment Variables**
   - Updated APP_PORT default to 8001

---

## 9. Commit Preparation

### 9.1 Frontend Changes (gold-field)

**Summary:** Set up React + TypeScript frontend with Vite

**Message:**
```
feat: add React + TypeScript frontend setup with Vite

- Initialize Vite with react-ts template
- Configure TypeScript, ESLint, and Prettier
- Add axios and react-router-dom for API integration
```

### 9.2 Backend Changes (gold-field-api)

**Summary:** Bug fix + new seed scripts

**Message:**
```
fix: resolve ContentService dependency injection

- Add @Inject(CACHE_MANAGER) decorator for cache injection
- Fix import type issues in NestJS 10+

feat: add database seed scripts for all collections

- Add seed-gold-rates.ts for gold rates (18 records)
- Add seed-subscribers.ts for subscribers
- Add seed-signal-metrics.ts for signal metrics
- Add seed-affiliate.ts for partners and clicks
- Add seed-all.ts main script
- Update app port to 8001
```

### 9.3 Files Modified

**Frontend:**
- All new files from Vite template
- package.json updates
- .prettierrc added

**Backend:**
- src/content/content.service.ts (fix)
- package.json (seed script)
- README.md (updates)
- src/scripts/* (new)

### 9.4 Files to Exclude from Commit

Recommended to exclude:
- `.DS_Store` (macOS system file)
- `dump.rdb` (database dump if present)
- `dist/` (compiled files)
- `.gitignore` should already handle these

---

## 10. Pending Tasks

### 10.1 Frontend Development

| Task | Status | Description |
|------|--------|-------------|
| Design from Google Stitch | TODO | Export/designspecs needed |
| UI Components | TODO | Build based on designs |
| API Integration | TODO | Connect to backend |
| WebSocket Client | TODO | For real-time updates |

### 10.2 Backend Development

| Task | Status | Description |
|------|--------|-------------|
| WebSocket Gateway | TODO | Real-time push |
| Enhanced Analytics | TODO | OHLC, MA, Volatility |
| ML Predictions | TODO | Price predictions |
| User Authentication | TODO | Phase 3 |

### 10.3 Integrations

| Task | Status | Description |
|------|--------|-------------|
| Telegram Bot | TODO | alerts via Telegram |
| WhatsApp Integration | TODO | alerts via WhatsApp |
| Metal-API Key | TODO | Get real API key |
| Redis Cache | TODO | Switch from memory |

### 10.4 DevOps

| Task | Status | Description |
|------|--------|-------------|
| CI/CD Pipeline | TODO | Build and deploy |
| Docker Setup | TODO | Containerization |
| Production Config | TODO | Environment configs |

---

## Summary

Since our first session, we have:

1. ✅ Understood OpenCode workspace limitations
2. ✅ Researched Google Stitch AI
3. ✅ Set up React + TypeScript frontend from scratch
4. ✅ Fixed ContentService cache injection bug
5. ✅ Analyzed all 5 database entities/schemas
6. ✅ Documented external APIs and caching
7. ✅ Created comprehensive seed scripts for all tables
8. ✅ Updated README documentation
9. ✅ Prepared commit messages

**Next immediate steps:**
1. User to commit the changes
2. User to provide Google Stitch designs
3. Build frontend UI components
4. Connect frontend to backend API