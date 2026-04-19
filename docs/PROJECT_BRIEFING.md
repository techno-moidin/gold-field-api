# Gold Field API - Project Briefing for Design

## Project Overview

**Gold Field API** is a real-time gold rate tracking and analytics backend that provides live gold prices, historical data, market insights, and alerts for multiple global regions.

## Core Problem

Investors, jewelers, and consumers need a unified, real-time source for gold prices across different regions (USA, India, UAE, Saudi Arabia, UK, EU) with support for multiple purities (24K, 22K, 18K).

---

## Target Users

1. **Individual Investors** - Track gold prices for investment decisions
2. **Jewelers/Retailers** - Source gold at best prices, track costs
3. **Financial Analysts** - Historical data for market research
4. **Gold ETF Traders** - Real-time price alerts

---

## Core Features

### 1. Live Gold Rates

- Real-time prices for 6 regions
- 3 purity levels (24K, 22K, 18K)
- Price Per Gram & Per Ounce
- 24h Change (value & percentage)
- Bid/Ask spread

### 2. Historical Data

- Paginated history with filters
- Aggregated by day/week/month
- Chart-ready data format (OHLC)

### 3. Signals & Alerts

- Daily Buy/Wait/Avoid signal with confidence level
- Telegram bot subscription
- Weekly summary option
- Not financial advice disclaimer

### 4. UAE Market Insights

- Current premium vs international spot
- 7-day and 30-day averages
- Best time to buy (day of week)
- Making charges by purity
- VAT information (5% UAE)

### 5. Affiliate Partners

- Partner links (BullionVault, APMEX, JM Bullion, etc.)
- Click tracking
- Conversion stats

### 6. Content Pages

- SEO pages (home, about, contact, privacy, terms)
- Search functionality
- Sitemap

---

## User Flows

### Flow 1: Check Live Price

1. User opens app → sees all regions' 24K prices
2. Selects region → sees all purities for that region
3. Taps specific region+purity → sees full rate card

### Flow 2: Subscribe to Alerts

1. User clicks "Subscribe" → enters Telegram ID
2. Selects preferred region and purity
3. Chooses frequency (daily/weekly/instant)
4. Receives confirmation

### Flow 3: Daily Signal

1. User views today's signal (BUY/WAIT/AVOID)
2. Sees confidence level (HIGH/MEDIUM/LOW)
3. Reads reasoning and current metrics
4. Sees disclaimer

### Flow 4: UAE Market

1. User views premium vs international spot
2. Sees 7d/30d averages and trend
3. Checks best day to buy
4. Views making charges by purity

---

## Technical Requirements for Frontend

### Stack

- React or Next.js (recommended)
- Socket.IO for WebSocket (Phase 2)
- REST API integration
- Telegram WebApp ready

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Color Scheme (Recommended)

- Primary: Gold/amber tones (#D4AF37, #FFD700)
- Dark theme: Deep navy/black backgrounds
- Accent: Green ( gains), Red (losses)
- Neutral: White/gray text

### Data Update Frequency

- Live rates: Every 5 minutes (configurable)
- Signals: Once daily at 9 AM UAE time
- Charts: Real-time on demand

---

## API Endpoints Reference

```
GET  /gold-rates/live
GET  /gold-rates/live/:region
GET  /gold-rates/live/:region/:purity
GET  /gold-rates/history
GET  /gold-rates/history/:region/:purity/:period
GET  /gold-rates/chart
GET  /gold-rates/convert

GET  /signals/today
GET  /signals/history

POST /alerts/subscribe
POST /alerts/unsubscribe
GET  /alerts/status

GET  /uaemarts/premium
GET  /uaemarts/best-time
GET  /uaemarts/making-charges
GET  /uaemarts/vat-info
GET  /uaemarts/summary

GET  /affiliate/links
GET  /affiliate/stats
POST /affiliate/track

GET  /content/:slug
GET  /content/search
GET  /content/sitemap
```

---

## Key Design Principles

1. **Speed First** - Prices must load instantly (use cached data)
2. **Clarity** - Current price most prominent
3. **Trust** - Show disclaimer, source attribution
4. **Mobile-First** - Most users on mobile
5. **Dark Mode** - Default for financial apps

---

## Notes for Stitch AI

- This is a data-intensive app - prioritize information hierarchy
- Price charts are crucial
- Clear call-to-action for subscriptions
- Consider Widget/embedded views for partners

---

**Contact**: shaheer@project.com  
**Last Updated**: April 2026
