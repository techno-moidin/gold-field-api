# Gold Field API - Backend Architecture & Workflow

## Table of Contents
1. [Application Entry Point](#1-application-entry-point)
2. [Module Architecture](#2-module-architecture)
3. [Enums & Constants](#3-enums--constants)
4. [Configuration](#4-configuration)
5. [Database Entities](#5-database-entities)
6. [Controller to Service Flow](#6-controller-to-service-flow)
7. [Gold Rates Module](#7-gold-rates-module)
8. [Alerts Module](#8-alerts-module)
9. [Affiliate Module](#9-affiliate-module)
10. [UAE Marts Module](#10-uae-marts-module)
11. [Content Module](#11-content-module)
12. [External API Module](#12-external-api-module)
13. [Scheduler Module](#13-scheduler-module)
14. [API Endpoints Reference](#14-api-endpoints-reference)
15. [Data Flow Diagrams](#15-data-flow-diagrams)

---

## 1. Application Entry Point

### 1.1 main.ts - Bootstrap File

The application starts from `src/main.ts`. This is the entry point that initializes the NestJS application.

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe - validates all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,                    // Transform payloads to DTO instances
      whitelist: true,                     // Strip non-whitelisted properties
      forbidNonWhitelisted: true,          // Throw error if non-whitelisted properties
      transformOptions: {
        enableImplicitConversion: true,    // Auto-convert types
      },
    }),
  );

  // Enable CORS for frontend access
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Start the server
  await app.listen(appConfig.port);
  console.log(`🚀 Gold Field API running on http://localhost:${appConfig.port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
```

### 1.2 Key Points

1. **ValidationPipe** - All incoming requests are validated against DTOs
2. **CORS Enabled** - Frontend on different port can access the API
3. **Port Configuration** - Reads from `APP_PORT` env variable (default: 8001)
4. **Error Handling** - Graceful shutdown on startup failure

---

## 2. Module Architecture

### 2.1 AppModule - Root Module

The root module that imports and configures all feature modules.

```typescript
// src/app.module.ts
@Module({
  imports: [
    // Global Config - loads .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database - TypeORM PostgreSQL connection
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      entities: [GoldRate, Subscriber, SignalMetrics, AffiliatePartner, AffiliateClick],
      synchronize: true,    // Auto-create tables (don't use in production!)
      logging: databaseConfig.host === 'localhost',
    }),
    
    // Cache - In-memory cache (can be Redis)
    CacheModule.register({
      isGlobal: true,
      ttl: redisConfig.ttl * 1000,   // TTL in milliseconds
      max: 1000,                      // Max items in cache
      store: 'memory',
    }),
    
    // Feature Modules
    GoldRatesModule,      // Core gold rates
    SchedulerModule,     // Background jobs
    SignalsModule,        // Signal management
    AlertsModule,        // Telegram/WhatsApp alerts
    UaeMartsModule,     // UAE Marts data
    AffiliateModule,   // Affiliate partners
    DailyAlertSchedulerModule,  // Daily alerts scheduler
    ContentModule,      // Static content pages
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 2.2 All Modules Overview

| Module | Purpose | Key Files |
|--------|---------|-----------|
| **GoldRatesModule** | Core gold rate CRUD and caching | controller, service, entity, dto |
| **SchedulerModule** | Background job for fetching rates | gold-rate-scheduler.service |
| **AlertsModule** | Telegram/WhatsApp subscriptions | alerts.service, telegram.service |
| **UaeMartsModule** | UAE market data | uaemarts.service |
| **AffiliateModule** | Partner tracking | affiliate.service, entities |
| **ContentModule** | Static pages | content.service |
| **SignalsModule** | Market signals | signals.service |

---

## 3. Enums & Constants

### 3.1 Gold Rate Enums

Located in `src/gold-rates/enums/gold-rate.enums.ts`

```typescript
// Region enum - 6 supported regions
export enum Region {
  USA = 'USA',      // United States
  INDIA = 'INDIA',  // India
  UAE = 'UAE',      // United Arab Emirates
  SAUDI = 'SAUDI',  // Saudi Arabia
  UK = 'UK',       // United Kingdom
  EU = 'EU',       // European Union
}

// Currency enum - 6 currencies
export enum Currency {
  USD = 'USD',      // US Dollar
  INR = 'INR',      // Indian Rupee
  AED = 'AED',      // UAE Dirham
  SAR = 'SAR',      // Saudi Riyal
  GBP = 'GBP',      // British Pound
  EUR = 'EUR',      // Euro
}

// GoldPurity enum - 3 purities
export enum GoldPurity {
  GOLD_24K = '24K',  // 99.9% pure
  GOLD_22K = '22K',  // 91.6% pure
  GOLD_18K = '18K',  // 75% pure
}

// Region to Currency mapping
export const REGION_CURRENCY_MAP: Record<Region, Currency> = {
  [Region.USA]: Currency.USD,
  [Region.INDIA]: Currency.INR,
  [Region.UAE]: Currency.AED,
  [Region.SAUDI]: Currency.SAR,
  [Region.UK]: Currency.GBP,
  [Region.EU]: Currency.EUR,
};
```

### 3.2 Subscriber Enums

Located in `src/alerts/entities/subscriber.entity.ts`

```typescript
// Subscription tier
export enum SubscriptionTier {
  FREE = 'FREE',      // Free tier
  PREMIUM = 'PREMIUM',  // Paid tier
}

// Alert frequency
export enum AlertFrequency {
  DAILY = 'DAILY',      // Daily digest
  WEEKLY = 'WEEKLY',    // Weekly digest
  INSTANT = 'INSTANT',  // Instant notification
}
```

### 3.3 Affiliate Enums

Located in `src/affiliate/entities/affiliate-partner.entity.ts`

```typescript
// Partner status
export enum PartnerStatus {
  ACTIVE = 'ACTIVE',    // Active partner
  INACTIVE = 'INACTIVE', // Inactive partner
  PENDING = 'PENDING',  // Pending approval
}

// Partner category
export enum PartnerCategory {
  BROKER = 'BROKER',    // Gold broker
  JEWELRY = 'JEWELRY', // Jewelry store
  TRADING = 'TRADING', // Trading platform
  APPS = 'APPS',      // Mobile app
}
```

---

## 4. Configuration

### 4.1 Config Files

Located in `src/config/`

| File | Purpose | Exports |
|------|---------|---------|
| `database.config.ts` | PostgreSQL connection | `databaseConfig` object |
| `redis.config.ts` | Redis/cache settings | `redisConfig` object |
| `app.config.ts` | App settings | `appConfig` object |
| `metal-api.config.ts` | Metal-API settings | `metalApiConfig` object |

### 4.2 Database Configuration

```typescript
// src/config/database.config.ts
export const databaseConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'goldfield',
};
```

### 4.3 App Configuration

```typescript
// src/config/app.config.ts
export const appConfig = {
  port: parseInt(process.env.APP_PORT ?? '8001', 10),
  env: process.env.APP_ENV ?? 'development',
};
```

### 4.4 Redis Configuration

```typescript
// src/config/redis.config.ts
export const redisConfig = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  ttl: parseInt(process.env.REDIS_TTL ?? '60', 10),  // seconds
};
```

### 4.5 Metal-API Configuration

```typescript
// src/config/metal-api.config.ts
export const metalApiConfig = {
  apiKey: process.env.METAL_API_KEY ?? '',
  baseUrl: 'https://api.metal-api.io/v1',
  updateIntervalMinutes: parseInt(process.env.METAL_API_UPDATE_INTERVAL_MINUTES ?? '5', 10),
};
```

---

## 5. Database Entities

### 5.1 GoldRate Entity

Table: `gold_rates`

```typescript
// src/gold-rates/entities/gold-rate.entity.ts
@Entity('gold_rates')
@Index(['region', 'purity', 'timestamp'])
@Index(['region', 'timestamp'])
export class GoldRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Region })
  region: Region;

  @Column({ type: 'enum', enum: Currency })
  currency: Currency;

  @Column({ type: 'enum', enum: GoldPurity })
  purity: GoldPurity;

  @Column('decimal', { precision: 12, scale: 2 })
  pricePerGram: number;

  @Column('decimal', { precision: 12, scale: 2 })
  pricePerOunce: number;

  @Column('decimal', { precision: 12, scale: 2 })
  bid: number;

  @Column('decimal', { precision: 12, scale: 2 })
  ask: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  change24h: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  changePercent24h: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  high24h: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  low24h: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  open: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  previousClose: number;

  @Column({ type: 'timestamptz', nullable: true })
  marketOpen: Date;

  @Column({ type: 'timestamptz', nullable: true })
  marketClose: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
```

### 5.2 Subscriber Entity

Table: `subscribers`

```typescript
// src/alerts/entities/subscriber.entity.ts
@Entity('subscribers')
@Index(['telegramId'], { unique: true })
@Index(['whatsappPhone'])
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  telegramId: string;

  @Column({ nullable: true })
  telegramUsername: string;

  @Column({ nullable: true })
  whatsappPhone: string;

  @Column({ type: 'enum', enum: SubscriptionTier, default: SubscriptionTier.FREE })
  tier: SubscriptionTier;

  @Column({ type: 'enum', enum: AlertFrequency, default: AlertFrequency.DAILY })
  alertFrequency: AlertFrequency;

  @Column({ default: 'UAE' })
  preferredRegion: string;

  @Column({ default: '24K' })
  preferredPurity: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSubscribed: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  lastAlertAt: Date;
}
```

### 5.3 SignalMetrics Entity

Table: `signal_metrics`

```typescript
// src/uaemarts/entities/signal-metrics.entity.ts
@Entity('signal_metrics')
@Index(['metricDate'], { unique: true })
export class SignalMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  metricDate: Date;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  price24kAvg: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  price24kHigh: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  price24kLow: number;

  @Column('decimal', { precision: 8, scale: 4, nullable: true })
  usdToAed: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  soukPremium: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  volumeTraded: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
```

### 5.4 AffiliatePartner Entity

Table: `affiliate_partners`

```typescript
// src/affiliate/entities/affiliate-partner.entity.ts
@Entity('affiliate_partners')
export class AffiliatePartner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  url: string;

  @Column({ type: 'enum', enum: PartnerCategory, default: PartnerCategory.BROKER })
  category: PartnerCategory;

  @Column({ type: 'enum', enum: PartnerStatus, default: PartnerStatus.ACTIVE })
  status: PartnerStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  commissionAmount: number;

  @Column({ default: 'USD' })
  commissionCurrency: string;

  @Column({ default: 'percentage' })
  commissionType: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ nullable: true })
  logoUrl: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
```

### 5.5 AffiliateClick Entity

Table: `affiliate_clicks`

```typescript
// src/affiliate/entities/affiliate-click.entity.ts
@Entity('affiliate_clicks')
@Index(['clickedAt'])
@Index(['partnerCode'])
export class AffiliateClick {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  subscriberId: string;

  @Column()
  partnerCode: string;

  @Column()
  partnerUrl: string;

  @CreateDateColumn({ type: 'timestamptz' })
  clickedAt: Date;

  @Column({ default: false })
  converted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  convertedAt: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  conversionValue: number;

  @Column({ nullable: true })
  conversionCurrency: string;

  @Column({ nullable: true })
  utmSource: string;

  @Column({ nullable: true })
  utmMedium: string;
}
```

---

## 6. Controller to Service Flow

### 6.1 How a Request Flows

When a client makes a request, here's the complete flow:

```
1. Client Request
       ↓
2. Route (defined in Controller)
       ↓
3. DTO Validation (ValidationPipe)
       ↓
4. Controller Method
       ↓
5. Service Business Logic
       ↓
6. Repository (TypeORM)
       ↓
7. Database (PostgreSQL)
       ↓
8. Response (JSON)
```

### 6.2 Example: Get Live Gold Rates

**Step 1: Client Request**
```bash
curl http://localhost:8001/gold-rates/live/UAE/24K
```

**Step 2: Route Matching**
The `GoldRatesController` has this route:
```typescript
@Get('live/:region/:purity')
async getLiveByRegionAndPurity(
  @Param('region') region: Region,
  @Param('purity') purity: GoldPurity,
) { ... }
```

**Step 3: Parameter Validation**
The `ValidationPipe` validates:
- `region` must be a valid `Region` enum value (USA, INDIA, UAE, SAUDI, UK, EU)
- `purity` must be a valid `GoldPurity` enum value (24K, 22K, 18K)

**Step 4: Controller Processing**
```typescript
@Get('live/:region/:purity')
async getLiveByRegionAndPurity(
  @Param('region') region: Region,
  @Param('purity') purity: GoldPurity,
) {
  const rate = await this.goldRatesService.getLiveByRegionAndPurity(region, purity);
  if (!rate) {
    throw new BadRequestException(`No rate found for ${region} ${purity}`);
  }
  return rate;
}
```

**Step 5: Service Business Logic**
The service checks cache first:
```typescript
async getLiveByRegionAndPurity(region, purity, cached = true) {
  const cacheKey = `${this.CACHE_KEYS.LIVE_REGION_PURITY}${region}:${purity}`;
  
  // Check cache first
  if (cached) {
    const cached = await this.cacheManager.get<LiveRateResponse>(cacheKey);
    if (cached) return { ...cached, cached: true };
  }
  
  // If not in cache, query database
  const rate = await this.goldRatesRepository.findOne({
    where: { region, purity, isActive: true },
    order: { timestamp: 'DESC' },
  });
  
  // Cache the result
  await this.cacheManager.set(cacheKey, response, 60);
  return response;
}
```

**Step 6: Database Query**
TypeORM generates and executes SQL:
```sql
SELECT * FROM gold_rates 
WHERE region = 'UAE' AND purity = '24K' AND is_active = true 
ORDER BY timestamp DESC 
LIMIT 1
```

**Step 7: Response**
```json
{
  "region": "UAE",
  "currency": "AED",
  "purity": "24K",
  "pricePerGram": 314.50,
  "pricePerOunce": 9782.35,
  "bid": 314.20,
  "ask": 314.80,
  "change24h": 1.25,
  "changePercent24h": 0.40,
  "high24h": 315.00,
  "low24h": 312.50,
  "timestamp": "2026-04-23T10:30:00.000Z",
  "cached": false
}
```

---

## 7. Gold Rates Module

### 7.1 Overview

The core module for managing gold rates - the most important module in the API.

### 7.2 Controller Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| POST | `/gold-rates` | Create single rate |
| POST | `/gold-rates/bulk` | Create multiple rates |
| GET | `/gold-rates/live` | Get all live rates |
| GET | `/gold-rates/live/:region` | Get rates by region |
| GET | `/gold-rates/live/:region/:purity` | Get specific rate |
| GET | `/gold-rates/history` | Get paginated history |
| GET | `/gold-rates/history/:region/:purity/:period` | Get aggregated |
| GET | `/gold-rates/chart` | Get chart data |
| GET | `/gold-rates/convert` | Currency conversion |
| POST | `/gold-rates/refresh` | Clear cache |
| GET | `/gold-rates` | Find all (admin) |

### 7.3 DTOs (Data Transfer Objects)

Located in `src/gold-rates/dto/`

| File | Purpose |
|------|--------|
| `create-gold-rate.dto.ts` | Create single rate |
| `bulk-create-gold-rate.dto.ts` | Bulk create |
| `history-query.dto.ts` | History query params |
| `live-rate-query.dto.ts` | Live rate query params |
| `chart-query.dto.ts` | Chart query params |
| `convert-query.dto.ts` | Convert query params |
| `refresh-rate-query.dto.ts` | Refresh cache params |

### 7.4 Service Methods

```typescript
// src/gold-rates/gold-rates.service.ts
@Injectable()
export class GoldRatesService {
  // Create a single gold rate
  async create(createGoldRateDto: CreateGoldRateDto): Promise<GoldRate>
  
  // Create multiple gold rates
  async bulkCreate(rates: BulkCreateGoldRateDto[]): Promise<GoldRate[]>
  
  // Get all live rates (from cache or DB)
  async getLiveAll(cached = true): Promise<LiveRateResponse[]>
  
  // Get rates by region
  async getLiveByRegion(region: Region, cached = true): Promise<LiveRateResponse[]>
  
  // Get specific rate (region + purity)
  async getLiveByRegionAndPurity(region, purity, cached = true): Promise<LiveRateResponse | null>
  
  // Get historical data with pagination
  async getHistory(query: HistoryQueryDto): Promise<HistoryResponse>
  
  // Get aggregated data (day/week/month)
  async getAggregatedHistory(region, purity, period): Promise<AggregatedData[]>
  
  // Get candlestick data for charts
  async getChartData(query: ChartQueryDto): Promise<ChartDataPoint[]>
  
  // Convert between regions
  async convert(query: ConvertQueryDto): Promise<ConversionResponse>
  
  // Clear cache
  async refreshRates(region?, purity?): Promise<RefreshResult>
  
  // Find all (admin)
  async findAll(): Promise<GoldRate[]>
}
```

### 7.5 Caching Strategy

The service uses a three-level caching strategy:

```typescript
private readonly CACHE_KEYS = {
  LIVE_ALL: 'gold:live:all',
  LIVE_REGION: 'gold:live:region:',
  LIVE_REGION_PURITY: 'gold:live:region:purity:',
};

// Cache flow:
// 1. Check cache with key "gold:live:region:purity:UAE:24K"
// 2. If miss, query database for latest rate
// 3. Store in cache with 60 second TTL
// 4. Return response with "cached: true/false"
```

---

## 8. Alerts Module

### 8.1 Overview

Manages Telegram/WhatsApp subscriptions for price alerts and signals.

### 8.2 Controller Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| POST | `/alerts/subscribe` | Subscribe to alerts |
| POST | `/alerts/unsubscribe` | Unsubscribe |
| GET | `/alerts/status` | Check subscription status |
| GET | `/alerts/stats` | Get subscriber count |
| POST | `/alerts/send-signal` | Send signal alert |
| POST | `/alerts/send-price-alert` | Send price alert |
| POST | `/alerts/update-preferences` | Update preferences |

### 8.3 Service Methods

```typescript
// src/alerts/alerts.service.ts
@Injectable()
export class AlertsService {
  // Subscribe user
  async subscribe(data: SubscribeDto): Promise<Subscriber>
  
  // Unsubscribe user
  async unsubscribe(identifier: string): Promise<void>
  
  // Get subscription status
  async getSubscriptionStatus(identifier: string): Promise<SubscriptionStatus>
  
  // Get subscriber count
  async getSubscriberCount(): Promise<{ total: number; byRegion: Record<string, number> }>
  
  // Send signal alert to all subscribers
  async sendSignalAlert(data: SignalData): Promise<{ sent: number }>
  
  // Send price alert
  async sendPriceAlert(data: PriceAlertData): Promise<{ sent: number }>
  
  // Update user preferences
  async updatePreferences(identifier: string, prefs: UpdatePrefsDto): Promise<Subscriber>
}
```

---

## 9. Affiliate Module

### 9.1 Overview

Manages affiliate partners and click tracking.

### 9.2 Controller Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/affiliate/links` | Get all affiliate links |
| POST | `/affiliate/track` | Track a click |
| POST | `/affiliate/convert` | Mark as converted |
| GET | `/affiliate/stats` | Get click stats |
| GET | `/affiliate/partner-stats` | Get partner stats |
| POST | `/affiliate/seed` | Seed default partners |
| GET | `/affiliate/redirect/:code` | Redirect with tracking |

### 9.3 Click Tracking Flow

```
1. User clicks affiliate link: /affiliate/redirect/GOLDDB
       ↓
2. Controller extracts partner code: "GOLDDB"
       ↓
3. Service creates AffiliateClick record
       ↓
4. Returns redirect URL
       ↓
5. Browser redirects to partner site
```

---

## 10. UAE Marts Module

### 10.1 Overview

Provides UAE market-specific data (premiums, making charges, VAT info).

### 10.2 Controller Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/uaemarts/premium` | Get souk premium |
| GET | `/uaemarts/best-time` | Best time to buy |
| GET | `/uaemarts/making-charges` | Making charges |
| GET | `/uaemarts/vat-info` | VAT information |
| GET | `/uaemarts/summary` | Market summary |
| POST | `/uaemarts/refresh` | Refresh data |

---

## 11. Content Module

### 11.1 Overview

Serves static content pages (home, about, contact, etc.) with caching.

### 11.2 Controller Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/content/:slug` | Get page by slug |
| GET | `/content/search?q=` | Search pages |
| GET | `/content/sitemap` | XML sitemap |

### 11.3 Available Pages

The service has these hardcoded pages:
- `home` - Home page content
- `about` - About page
- `contact` - Contact page
- `privacy` - Privacy policy
- `terms` - Terms of service

---

## 12. External API Module

### 12.1 Overview

Handles external API integrations for fetching real-time gold rates.

### 12.2 Metal-API Service

```typescript
// src/external-api/metal-api.service.ts
@Injectable()
export class MetalApiService {
  // Fetch all gold rates
  async fetchGoldRates(): Promise<FetchRatesResult>
  
  // Fetch specific rate
  async fetchRateForRegion(metal, currency): Promise<MetalApiRatesResponse | null>
}
```

### 12.3 Mock Data Service

```typescript
// src/external-api/mock-data.service.ts
@Injectable()
export class MockDataService {
  // Generate realistic mock rates
  generateRates(): MockGoldRate[]
  
  // Uses base prices and purity multipliers
  // 24K = 1.0x, 22K = 0.9167x, 18K = 0.75x
}
```

### 12.4 Fallback Strategy

```typescript
// Flow in scheduler:
// 1. Try Metal-API
// 2. If fails or no API key → Use mock data
// 3. Save to database
```

---

## 13. Scheduler Module

### 13.1 Overview

Runs background jobs - fetches gold rates periodically.

### 13.2 Gold Rate Scheduler

```typescript
// src/scheduler/gold-rate-scheduler.service.ts
@Injectable()
export class GoldRateSchedulerService implements OnModuleInit, OnModuleDestroy {
  // Runs on module init
  onModuleInit() {
    // Schedule interval based on METAL_API_UPDATE_INTERVAL_MINUTES
    // Default: every 5 minutes
  }
  
  // Fetch and store rates
  async fetchAndStoreRates(): Promise<{ success: boolean; count: number }>
  
  // Private: fetch from Metal-API or mock
  private async fetchRates(): Promise<MockGoldRate[]>
}
```

### 13.3 Daily Alert Scheduler

```typescript
// src/scheduler/daily-alert-scheduler.service.ts
@Injectable()
export class DailyAlertSchedulerService {
  // Sends daily digest to subscribers
  // Runs at configured time (e.g., 9 AM UAE)
}
```

---

## 14. API Endpoints Reference

### 14.1 Gold Rates Endpoints

```
POST   /gold-rates              - Create single rate
POST   /gold-rates/bulk        - Bulk create rates
GET    /gold-rates/live         - All live rates (cached)
GET    /gold-rates/live/:region - By region
GET    /gold-rates/live/:region/:purity - Specific rate
GET    /gold-rates/history      - Paginated history
GET    /gold-rates/history/:region/:purity/:period - Aggregated
GET    /gold-rates/chart      - Chart data
GET    /gold-rates/convert    - Currency conversion
POST   /gold-rates/refresh    - Clear cache
GET    /gold-rates            - Find all
```

### 14.2 Alerts Endpoints

```
POST   /alerts/subscribe           - Subscribe
POST   /alerts/unsubscribe       - Unsubscribe
GET    /alerts/status            - Check status
GET    /alerts/stats            - Subscriber stats
POST   /alerts/send-signal       - Send signal
POST   /alerts/send-price-alert  - Send price alert
POST   /alerts/update-preferences - Update prefs
```

### 14.3 Affiliate Endpoints

```
GET    /affiliate/links           - All links
POST   /affiliate/track          - Track click
POST   /affiliate/convert       - Mark converted
GET    /affiliate/stats         - Click stats
GET    /affiliate/partner-stats - Partner stats
POST   /affiliate/seed         - Seed partners
GET    /affiliate/redirect/:code - Redirect
```

### 14.4 UAE Marts Endpoints

```
GET    /uaemarts/premium        - Premium data
GET    /uaemarts/best-time    - Best time
GET    /uaemarts/making-charges - Making charges
GET    /uaemarts/vat-info    - VAT info
GET    /uaemarts/summary      - Summary
POST   /uaemarts/refresh    - Refresh
```

### 14.5 Content Endpoints

```
GET    /content/:slug         - Get page
GET    /content/search       - Search
GET    /content/sitemap     - Sitemap
```

---

## 15. Data Flow Diagrams

### 15.1 Read Flow (Getting Live Rates)

```
┌─────────────┐      GET /gold-rates/live/UAE/24K      ┌──────────────────┐
│   Client    │ ─────────────────────────────────► │  GoldRatesController │
└─────────────┘                                    └────────┬─────────┘
                                                         │
                                                         ▼
                                                  ┌─────┴──────┐
                                                  │ Validation │
                                                  └─────┬──────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │ GoldRatesService│
                                                  │  getLive.. │
                                                  └─────┬──────┘
                                                         │
                                                         ▼
                                            ┌─────────────────────┐
                                            │ Check Cache Key:   │
                                            │ gold:live:region: │
                                            │ purity:UAE:24K │
                                            └───────┬───────┘
                                                   │
                           ┌─────────────────────────┼─────────────────────────┐
                           │                         │                         │
                           ▼                         ▼                         ▼
                    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
                    │ Cache Hit │         │ Cache Miss│         │           │
                    └────┬────┘         └────┬────┘         │           │
                         │                   │              │           │
                         ▼                   ▼              ▼           ▼
                  ┌────────────┐    ┌────────────────┐  ┌──────────────┐
                  │ Return     │    │ Query DB      │  │ Store to    │
                  │ cached:true│    │ ORDER BY ts   │  │ Cache      │
                  └────────────┘    │ DESC LIMIT 1  │  │ TTL: 60s   │
                                  └──────┬───────┘  └────────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Return      │
                                  │ cached:false│
                                  └────────────┘
```

### 15.2 Write Flow (Creating Rate)

```
┌─────────────┐      POST /gold-rates/bulk         ┌──────────────────────┐
│   Client   │ ───────────────────────────────► │  GoldRatesController  │
└─────────────┘   [{region:UAE, purity:24K,  └─────────┬────────────┘
                    pricePerGram: 315.50, ...}]     │
                                            ▼
                                   ┌────────────┐
                                   │ Validation│
                                   └─────┬─────┘
                                        │
                                        ▼
                                 ┌──────────────┐
                                 │GoldRates   │
                                 │Service    │
                                 │bulkCreate │
                                 └──────┬───┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │ TypeORM   │
                                │ repo.save│
                                └────┬────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │ PostgreSQL │
                              │ INSERT   │
                              └────┬────┘
                                   │
                                   ▼
                            ┌─────────────┐
                            │ Invalidate│
                            │ Cache    │
                            └─────────┘
```

### 15.3 Scheduler Flow

```
┌─────────────────────────────────────────────────────────┐
│              GoldRateSchedulerService                  │
│                                                    │
│  onModuleInit()                                     │
│       │                                          │
│       ▼                                          │
│  ┌──────────────────────────────────────────────┐  │
│  │ setInterval(fetchAndStoreRates, 5 min)     │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │           fetchAndStoreRates()                 │  │
│  └────────────┬───────────────────────────┬────────┘  │
│             │                           │           │
│             ▼                           ▼           │
│  ┌──────────────────┐    ┌──────────────┐      │
│  │ MetalApiService   │    │ MockData    │      │
│  │ fetchGoldRates() │    │ generate()  │      │
│  └───────┬──────────┘    └──────┬─────┘      │
│          │                      │             │
│          └──────────┬───────────┘             │
│                     │                       │
│                     ▼                       │
│            ┌────────────────┐               │
│            │ GoldRates     │               │
│            │ Service      │               │
│            │ bulkCreate  │               │
│            └──────┬───────┘               │
│                   │                      │
│                   ▼                      │
│            ┌─────────────┐               │
│            │ PostgreSQL  │               │
│            │ INSERT     │               │
│            └────────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## Summary

This document covers the complete backend architecture:

1. **Entry Point** - `main.ts` bootstraps the app
2. **Modules** - All 8 feature modules imported in `AppModule`
3. **Enums** - Region, Currency, GoldPurity, SubscriptionTier, AlertFrequency, PartnerStatus, PartnerCategory
4. **Configuration** - databaseConfig, appConfig, redisConfig, metalApiConfig
5. **Entities** - 5 TypeORM entities with full field definitions
6. **Controller → Service Flow** - Complete request lifecycle
7. **Gold Rates Module** - Core CRUD with caching
8. **Alerts Module** - Subscription management
9. **Affiliate Module** - Partner and click tracking
10. **UAE Marts Module** - Market-specific data
11. **Content Module** - Static pages with caching
12. **External API** - Metal-API with mock fallback
13. **Scheduler** - Background rate fetching
14. **All API Endpoints** - Complete reference
15. **Data Flow Diagrams** - Visual representations

This provides a complete understanding of how the backend works from the entry point all the way to the database.