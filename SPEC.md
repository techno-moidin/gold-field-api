# GOLD FIELD - SPECIFICATION DOCUMENT

## Project Name: Gold Field (Reshaped Version)

## Version: 2.0

## Date: 2026-04-16

---

## 1. PROJECT OVERVIEW

### 1.1 Vision

Transform from a data-focused gold analytics site to a **decision-focused "Gold Decision Engine"** that provides actionable daily recommendations: "Should I buy gold today?"

### 1.2 Core Problem Solved

Users want a simple answer: buy, wait, or avoid. They don't want more charts—they want clarity on when to purchase gold in the UAE market.

### 1.3 Target Audience

- UAE residents interested in gold investments
- Gold buyers in Dubai/Abu Dhabi looking for timing advice
- Small-scale investors comparing gold prices across local markets

---

## 2. PRODUCT FEATURES

### 2.1 Daily Gold Signal (Core Feature)

A daily recommendation engine that outputs:

| Signal   | Meaning                           |
| -------- | --------------------------------- |
| ✅ BUY   | Good entry point identified       |
| ⚠️ WAIT  | No clear direction, hold          |
| ❌ AVOID | Poor timing, price likely to drop |

**Each signal includes:**

- Signal type (BUY/WAIT/AVOID)
- Confidence level (High/Medium/Low)
- Short reasoning (2-3 sentences max)
- Key metrics used (trend, USD, local premium)

**Signal generation logic (Phase 1 - Simple):**

- 7-day price trend (up/down/stable)
- 30-day price trend
- 24h change percentage
- Local UAE premium vs international

**Signal generation logic (Phase 2 - Enhanced):**

- USD strength correlation
- Inflation signals
- Local demand indicators (weekend effect)
- Technical indicators (MA crossover)

### 2.2 UAE-Specific Edge

Unique to this platform—big global sites ignore this:

| Feature               | Description                                   |
| --------------------- | --------------------------------------------- |
| Dubai Souk Premium    | Current premium over international spot price |
| Best Day/Time to Buy  | Based on historical patterns                  |
| Making Charges Guide  | Typical making charges for 24K/22K/18K        |
| VAT Insight           | 5% VAT on gold in UAE                         |
| Best Shops Comparison | Placeholder for affiliate integration         |

### 2.3 Simple Visual Trends

Keep it simple—maximum 3 views:

- **7-day trend**: Line chart, simple
- **30-day trend**: Line chart with MA overlay
- **"Cheap vs Expensive" indicator**: Visual gauge showing current price vs 30-day average

### 2.4 Live Gold Rates

Essential data component (from existing codebase):

- 6 regions (USA, India, UAE, Saudi, UK, EU)
- 3 purities (24K, 22K, 18K)
- Real-time + historical data

### 2.5 Telegram/WhatsApp Alerts

Core retention & monetization engine:

| Feature          | Free Tier      | Paid Tier (Future)        |
| ---------------- | -------------- | ------------------------- |
| Daily Signal     | ✅ Push at 9AM | ✅ Early (7AM) + Priority |
| Price Drop Alert | Limited        | Unlimited                 |
| Weekly Report    | ❌             | ✅                        |
| Deep Analysis    | ❌             | ✅                        |
| Price            | Free           | ~20 AED/month             |

### 2.6 Newsletter (Phase 2)

- Weekly gold market summary
- Key events affecting prices
- Next week's signal preview

---

## 3. MODULE ARCHITECTURE

### 3.1 Existing Modules (To Keep)

```
src/
├── gold-rates/          ✅ Complete - Live rates, history, chart data
├── external-api/       ✅ Complete - Metal-API + Mock data
├── scheduler/          ✅ Complete - Periodic fetching
├── config/             ✅ Complete - All configurations
```

### 3.2 New Modules (To Create)

```
src/
├── signals/                    # NEW: Daily Signal Engine
│   ├── signals.module.ts
│   ├── signals.service.ts      # Signal generation logic
│   ├── signals.controller.ts   # REST endpoints
│   └── dto/
│       ├── signal-response.dto.ts
│       └── signal-query.dto.ts
│
├── alerts/                     # NEW: Telegram/WhatsApp Alerts
│   ├── alerts.module.ts
│   ├── alerts.service.ts      # Alert sending logic
│   ├── telegram.service.ts    # Telegram Bot integration
│   ├── whatsapp.service.ts    # Twilio WhatsApp
│   └── dto/
│       ├── subscribe.dto.ts
│       └── alert.dto.ts
│
├── uaemarts/                  # NEW: UAE Market Edge
│   ├── uaemarts.module.ts
│   ├── uaemarts.service.ts   # Souk premium, timing insights
│   ├── uaemarts.controller.ts
│   └── dto/
│
├── affiliate/                 # NEW: Affiliate Management
│   ├── affiliate.module.ts
│   ├── affiliate.service.ts  # Track clicks, conversions
│   ├── affiliate.controller.ts
│   └── dto/
│
├── content/                  # NEW: Content/SEO Pages
│   ├── content.module.ts
│   ├── content.service.ts    # Dynamic SEO pages
│   └── content.controller.ts
│
└── analytics/                # NEW: Analytics (Phase 2 Day 3-5)
    ├── analytics.module.ts
    ├── analytics.service.ts
    └── analytics.controller.ts
```

### 3.3 Database Schema Changes

**New Tables Required:**

```sql
-- Subscribers for alerts
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id VARCHAR(50) UNIQUE,
    whatsapp_phone VARCHAR(20),
    region VARCHAR(10) DEFAULT 'UAE',
    purity VARCHAR(5) DEFAULT '24K',
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily signals (for history)
CREATE TABLE daily_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_date DATE UNIQUE NOT NULL,
    signal_type VARCHAR(10) NOT NULL, -- BUY, WAIT, AVOID
    confidence VARCHAR(10), -- HIGH, MEDIUM, LOW
    reasoning TEXT,
    trend_7d NUMERIC,
    trend_30d NUMERIC,
    usd_index NUMERIC,
    local_premium NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signal metrics for calculations
CREATE TABLE signal_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE UNIQUE NOT NULL,
    price_24k_avg NUMERIC,
    price_24k_high NUMERIC,
    price_24k_low NUMERIC,
    usd_to_aed NUMERIC,
    souk_premium NUMERIC,
    volume_traded NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate tracking
CREATE TABLE affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id UUID REFERENCES subscribers(id),
    partner_code VARCHAR(50),
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    converted BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ
);

-- SEO content pages
CREATE TABLE content_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    meta_description TEXT,
    content JSONB,
    region VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. API ENDPOINTS

### 4.1 Signal Endpoints (NEW)

```
GET  /signals/today           # Today's signal
GET  /signals/history        # Past signals (paginated)
GET  /signals/forecast       # Simple forward prediction
POST /signals/generate       # Manual trigger (admin)
```

### 4.2 Alert Endpoints (NEW)

```
POST /alerts/subscribe       # Subscribe via Telegram/WhatsApp
POST /alerts/unsubscribe    # Unsubscribe
POST /alerts/telegram/webhook  # Telegram bot webhook
GET  /alerts/status          # Check subscription status
```

### 4.3 UAE Market Endpoints (NEW)

```
GET  /uaemarts/premium       # Current Dubai souk premium
GET  /uaemarts/best-time     # Best day/time to buy
GET  /uaemarts/making-charges  # Making charges guide
GET  /uaemarts/vat-info      # VAT explanation
GET  /uaemarts/summary       # All UAE insights combined
```

### 4.4 Affiliate Endpoints (NEW)

```
GET  /affiliate/links        # Available affiliate links
POST /affiliate/track        # Track a click
POST /affiliate/convert      # Mark as converted (webhook)
```

### 4.5 Content/SEO Endpoints (NEW)

```
GET  /content/:slug          # Dynamic SEO page
GET  /content/sitemap        # XML sitemap
GET  /content/search         # Search functionality
```

### 4.6 Existing Endpoints (Keep as-is)

```
GET  /gold-rates/live                   # All live rates
GET  /gold-rates/live/:region           # Rates by region
GET  /gold-rates/live/:region/:purity   # Specific rate
GET  /gold-rates/history                # Paginated history
GET  /gold-rates/history/:region/:purity/:period
GET  /gold-rates/chart                  # Chart data
GET  /gold-rates/convert                # Currency conversion
POST /gold-rates/refresh                # Clear cache
```

---

## 5. EXTERNAL SERVICES & APIs

### 5.1 Gold Price Data

| Source    | Status     | Purpose                 |
| --------- | ---------- | ----------------------- |
| Metal-API | Configured | Primary gold price feed |
| Mock Data | Fallback   | Development + backup    |

**Note:** For production, consider:

- metals.dev API (alternative)
- GoldAPI.io
- Finnhub (commodities)

### 5.2 Telegram Integration

| Service          | Purpose     | Cost |
| ---------------- | ----------- | ---- |
| Telegram Bot API | Send alerts | Free |
| BotFather        | Create bot  | Free |

**Implementation:**

- Use `node-telegram-bot-api` or `grammy`
- Webhook for receiving messages
- Store user chat IDs in database

### 5.3 WhatsApp Integration

| Service             | Purpose     | Cost                |
| ------------------- | ----------- | ------------------- |
| Twilio WhatsApp API | Send alerts | Pay-per-use         |
|                     |             | ~$0.005 per message |

**Alternative:**

- Start with Telegram only (free, easier)
- Add WhatsApp in Phase 2

### 5.4 Affiliate Programs

| Partner Type      | Examples                 | Commission        |
| ----------------- | ------------------------ | ----------------- |
| Gold Trading Apps | BullionVault, APMEX      | $10-50 per signup |
| Local Dealers     | Malabar Gold, Joyalukkas | Per-sale tracking |
| Investment Apps   | Coinbase (gold trading)  | Revenue share     |

### 5.5 Analytics (Future)

| Service          | Purpose          | Cost      |
| ---------------- | ---------------- | --------- |
| Google Analytics | Traffic tracking | Free      |
| Vercel Analytics | Performance      | Free tier |
| Hotjar           | User behavior    | Free tier |

---

## 6. EDGE CASES

### 6.1 Signal Generation Edge Cases

| Scenario                           | Handling                                           |
| ---------------------------------- | -------------------------------------------------- |
| Insufficient data (<7 days)        | Use default "WAIT" with "Insufficient data" reason |
| API fetch failure                  | Use last known signal, mark as "Stale"             |
| Conflicting indicators             | Default to "WAIT" with explanation                 |
| Weekend/holiday                    | Use Friday's signal for Sat-Sun                    |
| Extreme price movement (>5% daily) | Override to "WAIT" - unusual volatility            |

### 6.2 Alert System Edge Cases

| Scenario                       | Handling                                           |
| ------------------------------ | -------------------------------------------------- |
| Telegram bot blocked           | Prompt user to unblock, offer WhatsApp alternative |
| User subscribes multiple times | Dedup, update existing subscription                |
| Message fails to send          | Retry 3 times, log failure, mark user              |
| WhatsApp number invalid        | Validate format, send confirmation opt-in          |

### 6.3 Data Edge Cases

| Scenario                  | Handling                                      |
| ------------------------- | --------------------------------------------- |
| No gold rates in database | Return default signal "WAIT" with explanation |
| Stale data (>1 hour old)  | Add "Last Updated" timestamp to response      |
| Negative price change     | Handle normally, calculate as expected        |
| Region not supported      | Return 404 with supported regions list        |

### 6.4 Monetization Edge Cases

| Scenario              | Handling                             |
| --------------------- | ------------------------------------ |
| Affiliate link broken | Monthly audit, remove broken links   |
| Zero conversions      | A/B test different offers            |
| Payment issues        | Use multiple affiliate programs      |
| Copyright claims      | Ensure affiliate links are compliant |

### 6.5 Legal/Compliance Edge Cases

| Scenario                | Handling                                   |
| ----------------------- | ------------------------------------------ |
| Financial advice claims | Strong disclaimers: "Not financial advice" |
| Copyright issues        | Only use public data, no scraping          |
| GDPR compliance         | Cookie consent, data export option         |
| UAE regulations         | Verify no license required for info site   |

---

## 7. TECHNICAL SPECIFICATIONS

### 7.1 Tech Stack (Existing + New)

| Component    | Technology       | Version |
| ------------ | ---------------- | ------- |
| Framework    | NestJS           | 11.x    |
| Database     | PostgreSQL       | 15      |
| Cache        | Redis            | 7       |
| ORM          | TypeORM          | 0.3.x   |
| Scheduler    | @nestjs/schedule | 5.x     |
| HTTP Client  | Axios            | 1.x     |
| Telegram Bot | grammes          | latest  |
| WhatsApp     | Twilio SDK       | latest  |
| Validation   | class-validator  | 0.14.x  |

### 7.2 New Dependencies Required

```json
{
  "dependencies": {
    "grammy": "^1.x",
    "twilio": "^4.x",
    "@nestjs/jwt": "^10.x",
    "@nestjs/passport": "^10.x",
    "passport": "^0.7.x",
    "node-cron": "^3.x"
  }
}
```

### 7.3 Caching Strategy

| Data Type       | TTL    | Cache Key         |
| --------------- | ------ | ----------------- |
| Today's Signal  | 1 hour | `signal:today`    |
| Signal History  | 1 day  | `signal:history`  |
| UAE Premium     | 5 min  | `uae:premium`     |
| Affiliate Links | 1 hour | `affiliate:links` |
| Live Rates      | 1 min  | `gold:live:all`   |
| SEO Content     | 1 hour | `content:{slug}`  |

### 7.4 WebSocket (Optional - Phase 2)

If real-time is needed:

- Socket.io for WebSocket
- Rooms: Signal updates, Price alerts
- Keep simple—Telegram is primary channel

---

## 8. MONETIZATION PLAN

### Phase 1 (Months 1-3): Foundation

- Google AdSense (low priority)
- Build Telegram subscriber base
- Target: 500 subscribers

### Phase 2 (Months 3-6): Initial Revenue

- Affiliate links (primary)
- Target: 2-5 conversions/month
- Start paid feature research

### Phase 3 (Months 6+): Scale

- Paid signal subscriptions (~20 AED/month)
- Target: 300-500 AED/month
- Premium Telegram channel

### Revenue Breakdown Target

| Source             | Target (Monthly) |
| ------------------ | ---------------- |
| AdSense            | 50-100 AED       |
| Affiliate          | 100-200 AED      |
| Paid Subscriptions | 150-200 AED      |
| **Total**          | **300-500 AED**  |

---

## 9. FILE STRUCTURE (UPDATED)

```
gold-field-api/
├── src/
│   ├── signals/                    # NEW
│   │   ├── signals.module.ts
│   │   ├── signals.service.ts
│   │   ├── signals.controller.ts
│   │   ├── signals.scheduler.ts
│   │   └── dto/
│   │
│   ├── alerts/                     # NEW
│   │   ├── alerts.module.ts
│   │   ├── alerts.service.ts
│   │   ├── telegram.service.ts
│   │   ├── alerts.controller.ts
│   │   └── dto/
│   │
│   ├── uaemarts/                   # NEW
│   │   ├── uaemarts.module.ts
│   │   ├── uaemarts.service.ts
│   │   ├── uaemarts.controller.ts
│   │   └── dto/
│   │
│   ├── affiliate/                  # NEW
│   │   ├── affiliate.module.ts
│   │   ├── affiliate.service.ts
│   │   ├── affiliate.controller.ts
│   │   └── dto/
│   │
│   ├── content/                    # NEW
│   │   ├── content.module.ts
│   │   ├── content.service.ts
│   │   ├── content.controller.ts
│   │   └── dto/
│   │
│   ├── analytics/                  # NEW (Phase 2)
│   │
│   ├── gold-rates/                 # EXISTING ✅
│   ├── external-api/              # EXISTING ✅
│   ├── scheduler/                 # EXISTING ✅
│   ├── config/                    # EXISTING ✅
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── .env
├── docker-compose.yml
├── package.json
├── SPEC.md                         # This file
└── ARCHITECTURE.md                # Original (keep)
```

---

## 10. IMPLEMENTATION PRIORITY

### Week 1-2: MVP

1. ✅ Keep existing gold rates module
2. Create signals module (basic BUY/WAIT/AVOID)
3. Create signals endpoint
4. Add "Last Signal" to live rates response

### Week 3-4: Core Features

1. Create Telegram bot for alerts
2. Subscribe/unsubscribe endpoints
3. Basic UAE market data (premium, timing)
4. Affiliate links endpoint

### Month 2: Content & SEO

1. Create content module
2. Dynamic SEO pages
3. Sitemap generator
4. Google Search Console setup

### Month 3+: Polish & Monetization

1. Add WhatsApp (Twilio)
2. Paid subscription system
3. Enhanced signal logic
4. Analytics dashboard

---

## 11. DISCALIMERS & LEGAL

### Required Disclaimers

```
⚠️ IMPORTANT DISCLAIMERS

1. This is NOT financial advice
2. Signals are for informational purposes only
3. Past performance does not guarantee future results
4. Always do your own research before investing
5. Consult a licensed financial advisor for investment decisions
```

### Placement

- Website footer (persistent)
- Signal result page
- Newsletter footer
- Telegram bot bio

---

## 12. SUCCESS METRICS

### Target KPIs (6 months)

| Metric                | Target      |
| --------------------- | ----------- |
| Monthly Visitors      | 5,000+      |
| Telegram Subscribers  | 500+        |
| Email Subscribers     | 200+        |
| Monthly Revenue       | 300-500 AED |
| Affiliate Conversions | 3-5/month   |

---

_Document Version: 2.0_
_Created: 2026-04-16_
_Status: Ready for Implementation_

13. Documentation & Updates

- Telegram Bot integration: token configured, endpoints exist, testing required
- UAE Marts module: premium, best time, making charges, VAT info, summary
- Affiliate module: seed partners, tracking clicks, conversions, stats
- Daily Alert Scheduler: 9 AM daily signal, weekly summaries
- Data models updated: Subscriber, AffiliatePartner, AffiliateClick, SignalMetrics
- REST API surface extended with: /alerts/_, /uaemarts/_, /affiliate/_, /signals/_
- Caching: in-memory for local testing; Redis-backed when available
- Testing: basic smoke tests added; CI planned

14. Validation Plan

- Start server locally and test REST endpoints
- Test Telegram bot after token is configured
- Verify webhook endpoints for Telegram (if enabled)
- Validate subscriber flows (subscribe/unsubscribe)
- Validate seed and affiliate links
