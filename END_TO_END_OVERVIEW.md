# End-to-End Overview — Gold Field API

Date: 2026-04-17

1. Purpose

- Deliver live gold rates, actionable daily signals, local UAE market insights, and affiliate monetization hooks via a single backend API suite.

2. Actors

- User (site visitor, subscriber, affiliate partner)
- Telegram bot user (subscribers to alerts)
- Admin (seed data, monitor system)
- System services (Signal engine, Alerts, UAE Marts, Affiliate, Scheduler)

3. System Overview

- Core data: gold_rates (live, history), subscribers, affiliate clicks, signal metrics
- Services: SignalsService, AlertsService, TelegramService, UaeMartsService, AffiliateService, DailyAlertScheduler
- Data stores: PostgreSQL, Redis (cache)
- External: Metal-API (primary), Mock data fallback

4. Data Flow Overview

- Data Ingest: Scheduler fetches data from external API or mock service
- Persistence: writes to gold_rates, signal_metrics, and related tables
- Signal Generation: daily signal engine computes BUY/WAIT/AVOID
- Alerts: subscribers receive daily signals and price alerts via Telegram bot or future channels
- UAE Marts: premium/ timing making charges are cached and served on /uaemarts endpoints
- Affiliate: clicks tracked, conversions recorded, earnings calculated
- Admin: seed affiliates, configure preferences

5. User Journeys

- Visitor lands on site, views live rates, optional historical data, and empty signal state
- Subscriber joins Telegram alerts and/or subscribes via REST API
- Daily signal auto-sent by scheduler; user receives notification
- User clicks affiliate links; clicks tracked; conversions recorded
- Admin seeds default affiliate partners via /affiliate/seed

6. API Mapping (High-Level)

- Live data: /gold-rates/live, /gold-rates/live/:region, /gold-rates/live/:region/:purity
- History & Chart: /gold-rates/history, /gold-rates/chart, /gold-rates/convert
- Signals: /signals/today, /signals/history
- Alerts: /alerts/subscribe, /alerts/subscribe (webhook), /alerts/stats
- UAE: /uaemarts/summary, /uaemarts/premium, /uaemarts/making-charges
- Affiliate: /affiliate/links, /affiliate/track, /affiliate/seed
- Content/SEO: /content/:slug, /content/sitemap

7. Deployment & Environment

- Local: PostgreSQL and Redis (via docker-compose or local install)
- Production: cloud DB/Redis with environment variables for tokens and keys
- Node: 18+; NestJS 11

8. Edge Scenarios

- Missing Telegram token -> Bot disabled gracefully
- External API key missing -> Fall back to mock data
- Cache misses -> Recompute and repopulate cache

9. Glossary

- Premium: UAE market premium vs international spot
- Making charges: fees charged for making jewelry
- OHLC/MA: analytics terms used in future

10. Interactions Summary

- A single source of truth on SPEC maintains the design constraints; new modules follow same patterns
