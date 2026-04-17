# Validation Plan — Gold Field API

Date: 2026-04-17

Prerequisites

- Node.js 18+, PostgreSQL 15, Redis 7 (local or remote)
- Telegram Bot Token configured in .env (TELEGRAM_BOT_TOKEN)
- Server running (npm run start:dev)

1. Telegram Bot Validation

- Start bot and send /start -> Expect welcome message from bot (on Telegram)
- Send /subscribe -> Expect confirmation of subscription
- Send /signal -> Expect today's signal payload
- Ensure bot responds to /help and /price commands

2. REST API Validation

- GET /gold-rates/live -> list of rates
- GET /gold-rates/live/:region -> UAE, etc.
- GET /gold-rates/history -> paginated data
- GET /signals/today -> today signal object
- GET /signals/history?days=7 -> history data
- POST /alerts/subscribe with Telegram ID -> create subscriber (requires bot token to be enabled)
- POST /affiliate/seed -> seed default partners
- GET /uaemarts/summary -> UAE market summary

3. Edge Case Testing

- Invalid region returns 404 or empty data with message
- Missing Telegram token leads to bot disabled warning
- Mock data fallback when Metal-API key missing

4. Performance Checklist

- Basic smoke tests; ensure no sensitive data exposed
- Check cache TTLs for live data and summary

5. Rollback Plan

- If token causes issues, revert .env change and restart

Contact/Notes

- Document all test results in SPEC or dedicated test log
