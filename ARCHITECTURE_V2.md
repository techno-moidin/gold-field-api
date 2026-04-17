# GOLD FIELD API - ARCHITECTURE (Updated)

Date: 2026-04-17

Overview

- Updated architecture reflecting Phase 1 completion and Phase 2+ planning.
- Core stack: NestJS 11, PostgreSQL 15, Redis 7; TypeORM; Axios.

Technologies

- Backend: Node.js 18+, NestJS 11
- Database: PostgreSQL 15
- Cache: Redis 7 (in-memory fallback during testing)
- Messaging: (future) WebSocket via Socket.IO (Phase 2)
- External feeds: Metal-API (primary), Mock data as fallback

Current Modules (Deployed)

- Signals: Daily signal engine, history, today view
- Alerts: Telegram bot integration, subscription management
- UAE Marts: Premium, best time, making charges, VAT info, summary
- Affiliate: Partner seeds, click tracking, conversions, stats
- Daily Alert Scheduler: 9 AM daily signal, weekly summary (Phase 1+)
- Gold Rates Core: live, history, chart, conversion
- External APIs: metal-api, mock-data

Data Model Summary

- GoldRate: region, purity, pricePerGram, pricePerOunce, bid, ask, change24h, timestamp, isActive
- Subscriber: telegramId, whatsappPhone, region, purity, frequency, isSubscribed, isActive
- AffiliatePartner: name, code, url, category, commissionRate, commissionCurrency, status
- AffiliateClick: subscriberId, partnerCode, clickedAt, converted, convertedAt
- SignalMetrics: price24kAvg, price24kHigh, price24kLow, usdToAed, soukPremium, volumeTraded
- SignalMetrics (new UAE) used by UAE Marts module

Data Flows and Endpoints

- REST: /gold-rates/_, /signals/_, /alerts/_, /uaemarts/_, /affiliate/_, /content/_
- Telegram bot: /alerts (Telegram webhook) and bot commands; token controlled via .env
- Timeline: Signals feed drives daily alerts via Daily Alert Scheduler
- UAE market data: premium/timing/making charges fed to UI and alerts
- Affiliate: clicks -> conversions -> earnings tracking

Caching and Persistence

- Redis-based cache for live and region data with TTL; fallback to in-process cache for development
- PostgreSQL for all historical and transactional data via TypeORM

Security & Compliance

- Not financial advice disclaimer embedded in signals
- Telegram bot access controlled by token; avoid logging full tokens

File Structure Map

- src/signals
- src/alerts
- src/uaemarts
- src/affiliate
- src/scheduler
- src/gold-rates
- src/external-api
- src/config
- src/gateway (Phase 2)
- tests (existing)

Notes

- Architecture is iterative. Phase 2 aims to introduce WebSockets, enhanced analytics, and more robust data pipelines.
