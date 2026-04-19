# Gold Field API - Frontend Integration Guide

**Base URL**: `http://localhost:3000`  
**Production**: `https://api.goldfield.example.com`  
**Version**: v1

---

## Table of Contents

1. [Gold Rates](#gold-rates)
2. [Signals](#signals)
3. [Alerts](#alerts)
4. [UAE Marts](#uae-marts)
5. [Affiliate](#affiliate)
6. [Content](#content)

---

## Gold Rates

### GET All Live Rates

```bash
curl -X GET "http://localhost:3000/gold-rates/live" \
  -H "Content-Type: application/json"
```

**Response:**

```json
[
  {
    "region": "UAE",
    "currency": "AED",
    "purity": "24K",
    "pricePerGram": 325.5,
    "pricePerOunce": 10125.0,
    "bid": 324.0,
    "ask": 327.0,
    "change24h": 2.5,
    "changePercent24h": 0.77,
    "high24h": 328.0,
    "low24h": 322.0,
    "timestamp": "2026-04-19T10:30:00.000Z",
    "cached": false
  },
  {
    "region": "USA",
    "currency": "USD",
    "purity": "24K",
    "pricePerGram": 88.5,
    "pricePerOunce": 2752.0,
    "bid": 88.0,
    "ask": 89.0,
    "change24h": 1.2,
    "changePercent24h": 1.37,
    "high24h": 89.0,
    "low24h": 87.0,
    "timestamp": "2026-04-19T10:30:00.000Z",
    "cached": false
  }
]
```

### GET Live Rates by Region

```bash
curl -X GET "http://localhost:3000/gold-rates/live/UAE" \
  -H "Content-Type: application/json"
```

**Response:**

```json
[
  {
    "region": "UAE",
    "currency": "AED",
    "purity": "24K",
    "pricePerGram": 325.5,
    "pricePerOunce": 10125.0,
    "bid": 324.0,
    "ask": 327.0,
    "change24h": 2.5,
    "changePercent24h": 0.77,
    "high24h": 328.0,
    "low24h": 322.0,
    "timestamp": "2026-04-19T10:30:00.000Z",
    "cached": false
  },
  {
    "region": "UAE",
    "currency": "AED",
    "purity": "22K",
    "pricePerGram": 298.5,
    "pricePerOunce": 9285.0,
    "bid": 297.0,
    "ask": 300.0,
    "change24h": 2.0,
    "changePercent24h": 0.67,
    "high24h": 301.0,
    "low24h": 296.0,
    "timestamp": "2026-04-19T10:30:00.000Z",
    "cached": false
  },
  {
    "region": "UAE",
    "currency": "AED",
    "purity": "18K",
    "pricePerGram": 244.1,
    "pricePerOunce": 7590.0,
    "bid": 243.0,
    "ask": 245.0,
    "change24h": 1.5,
    "changePercent24h": 0.62,
    "high24h": 246.0,
    "low24h": 242.0,
    "timestamp": "2026-04-19T10:30:00.000Z",
    "cached": false
  }
]
```

### GET Live Rate by Region & Purity

```bash
curl -X GET "http://localhost:3000/gold-rates/live/UAE/24K" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "region": "UAE",
  "currency": "AED",
  "purity": "24K",
  "pricePerGram": 325.5,
  "pricePerOunce": 10125.0,
  "bid": 324.0,
  "ask": 327.0,
  "change24h": 2.5,
  "changePercent24h": 0.77,
  "high24h": 328.0,
  "low24h": 322.0,
  "timestamp": "2026-04-19T10:30:00.000Z",
  "cached": false
}
```

### GET Historical Rates

```bash
curl -X GET "http://localhost:3000/gold-rates/history?region=UAE&purity=24K&limit=10&page=1" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|------------|------|----------|---------|-------------|
| region | string | No | all | Region code (UAE, USA, INDIA, etc.) |
| purity | string | No | all | Purity (24K, 22K, 18K) |
| startDate | string | No | - | ISO date string |
| endDate | string | No | - | ISO date string |
| limit | number | No | 100 | Items per page |
| page | number | No | 1 | Page number |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "region": "UAE",
      "purity": "24K",
      "currency": "AED",
      "pricePerGram": 325.5,
      "pricePerOunce": 10125.0,
      "bid": 324.0,
      "ask": 327.0,
      "change24h": 2.5,
      "changePercent24h": 0.77,
      "high24h": 328.0,
      "low24h": 322.0,
      "timestamp": "2026-04-19T10:30:00.000Z",
      "isActive": true
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

### GET Aggregated History (OHLC)

```bash
curl -X GET "http://localhost:3000/gold-rates/history/UAE/24K/day" \
  -H "Content-Type: application/json"
```

**Response:**

```json
[
  {
    "period": "2026-04-19T00:00:00.000Z",
    "avgPrice": 325.5,
    "minPrice": 322.0,
    "maxPrice": 328.0,
    "open": 323.0,
    "close": 325.5,
    "tradeCount": 24
  },
  {
    "period": "2026-04-18T00:00:00.000Z",
    "avgPrice": 323.0,
    "minPrice": 320.0,
    "maxPrice": 326.0,
    "open": 321.0,
    "close": 323.0,
    "tradeCount": 30
  }
]
```

### GET Chart Data

```bash
curl -X GET "http://localhost:3000/gold-rates/chart?region=UAE&purity=24K&interval=60" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|------------|------|----------|---------|-------------|
| region | string | No | all | Region code |
| purity | string | No | all | Purity |
| interval | number | No | 60 | Minutes of history (60 = last 60 mins) |

**Response:**

```json
[
  {
    "timestamp": "2026-04-19T10:00:00.000Z",
    "price": 323.0,
    "open": 323.0,
    "high": 325.0,
    "low": 322.0,
    "close": 324.0
  },
  {
    "timestamp": "2026-04-19T10:30:00.000Z",
    "price": 325.5,
    "open": 324.0,
    "high": 328.0,
    "low": 323.0,
    "close": 325.5
  }
]
```

### GET Currency Conversion

```bash
curl -X GET "http://localhost:3000/gold-rates/convert?amount=1000&fromRegion=UAE&toRegion=USA" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "fromAmount": 1000,
  "fromRegion": "UAE",
  "fromCurrency": "AED",
  "toRegion": "USA",
  "toCurrency": "USD",
  "convertedAmount": 272.48,
  "rate": 0.27248
}
```

### POST Create New Rate (Admin)

```bash
curl -X POST "http://localhost:3000/gold-rates" \
  -H "Content-Type: application/json" \
  -d '{
    "region": "UAE",
    "purity": "24K",
    "pricePerGram": 325.50,
    "pricePerOunce": 10125.00,
    "bid": 324.00,
    "ask": 327.00
  }'
```

**Payload:**

```json
{
  "region": "UAE",
  "purity": "24K",
  "pricePerGram": 325.5,
  "pricePerOunce": 10125.0,
  "bid": 324.0,
  "ask": 327.0,
  "change24h": 2.5,
  "changePercent24h": 0.77,
  "high24h": 328.0,
  "low24h": 322.0,
  "open": 323.0,
  "previousClose": 323.0
}
```

### POST Bulk Create Rates (Admin)

```bash
curl -X POST "http://localhost:3000/gold-rates/bulk" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "region": "UAE",
      "purity": "24K",
      "pricePerGram": 325.50,
      "pricePerOunce": 10125.00,
      "bid": 324.00,
      "ask": 327.00
    },
    {
      "region": "USA",
      "purity": "24K",
      "pricePerGram": 88.50,
      "pricePerOunce": 2752.00,
      "bid": 88.00,
      "ask": 89.00
    }
  ]'
```

### POST Refresh Cache

```bash
curl -X POST "http://localhost:3000/gold-rates/refresh" \
  -H "Content-Type: application/json"
```

---

## Signals

### GET Today's Signal

```bash
curl -X GET "http://localhost:3000/signals/today" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "date": "2026-04-19",
  "signal": "BUY",
  "confidence": "HIGH",
  "reasoning": "Price dropped today, potential entry point. Weekly trend is down. Local market premium is reasonable.",
  "metrics": {
    "price24k": 325.5,
    "change24h": 2.5,
    "changePercent24h": 0.77,
    "trend7d": -1.2,
    "trend30d": -3.5,
    "localPremium": 4.2
  },
  "disclaimer": "This signal is for informational purposes only and does not constitute financial advice. Always consult a qualified financial advisor before making investment decisions.",
  "lastUpdated": "2026-04-19T09:00:00.000Z"
}
```

### GET Signal History

```bash
curl -X GET "http://localhost:3000/signals/history?days=30" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "data": [
    {
      "date": "2026-04-19",
      "signal": "BUY",
      "confidence": "HIGH",
      "reasoning": "Price dropped today, potential entry point."
    },
    {
      "date": "2026-04-18",
      "signal": "WAIT",
      "confidence": "MEDIUM",
      "reasoning": "Mixed indicators. No clear buy signal."
    }
  ],
  "total": 30
}
```

### POST Refresh Signal

```bash
curl -X POST "http://localhost:3000/signals/refresh" \
  -H "Content-Type: application/json"
```

---

## Alerts

### POST Subscribe

```bash
curl -X POST "http://localhost:3000/alerts/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "telegramUsername": "johndoe",
    "region": "UAE",
    "purity": "24K",
    "frequency": "DAILY"
  }'
```

**Payload:**

```json
{
  "telegramId": "123456789",
  "telegramUsername": "johndoe",
  "whatsappPhone": "+971501234567",
  "region": "UAE",
  "purity": "24K",
  "frequency": "DAILY"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully subscribed to gold alerts"
}
```

### POST Unsubscribe

```bash
curl -X POST "http://localhost:3000/alerts/unsubscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "123456789"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully unsubscribed from gold alerts"
}
```

### GET Subscription Status

```bash
curl -X GET "http://localhost:3000/alerts/status?identifier=123456789" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "subscribed": true,
  "region": "UAE",
  "purity": "24K",
  "frequency": "DAILY"
}
```

### GET Alert Stats

```bash
curl -X GET "http://localhost:3000/alerts/stats" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "total": 150,
  "active": 120
}
```

### POST Update Preferences

```bash
curl -X POST "http://localhost:3000/alerts/update-preferences" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "123456789",
    "region": "INDIA",
    "purity": "22K",
    "frequency": "WEEKLY"
  }'
```

---

## UAE Marts

### GET Premium Data

```bash
curl -X GET "http://localhost:3000/uaemarts/premium" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "current": 4.5,
  "average7d": 4.2,
  "average30d": 4.0,
  "trend": "stable",
  "recommendation": "Premium is reasonable"
}
```

### GET Best Time to Buy

```bash
curl -X GET "http://localhost:3000/uaemarts/best-time" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "bestDay": "Friday",
  "bestTime": "10 AM - 12 PM",
  "reason": "Early morning tends to have better prices before weekend crowd. Friday and Saturday are popular shopping days in Dubai.",
  "averagePriceDiff": 2.5
}
```

### GET Making Charges

```bash
curl -X GET "http://localhost:3000/uaemarts/making-charges" \
  -H "Content-Type: application/json"
```

**Response:**

```json
[
  {
    "purity": "24K",
    "perGram": {
      "min": 5,
      "max": 15,
      "average": 8
    },
    "perPiece": {
      "min": 50,
      "max": 200,
      "average": 100
    },
    "tips": [
      "Ask for making charges separately from gold price",
      "Compare across multiple shops in Deira/Gold Souk",
      "Bargaining is expected and accepted"
    ]
  },
  {
    "purity": "22K",
    "perGram": {
      "min": 3,
      "max": 10,
      "average": 6
    },
    "perPiece": {
      "min": 30,
      "max": 150,
      "average": 75
    },
    "tips": [
      "Best for everyday jewelry",
      "Lower making charges than 24K",
      "More durable for daily wear"
    ]
  },
  {
    "purity": "18K",
    "perGram": {
      "min": 2,
      "max": 8,
      "average": 5
    },
    "perPiece": {
      "min": 20,
      "max": 100,
      "average": 50
    },
    "tips": [
      "Best value for fashion jewelry",
      "Widely available in malls",
      "Lower resale value compared to higher purity"
    ]
  }
]
```

### GET VAT Information

```bash
curl -X GET "http://localhost:3000/uaemarts/vat-info" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "rate": 5,
  "appliesTo": [
    "Gold jewelry",
    "Gold coins under 100g",
    "Gold bars",
    "Making charges"
  ],
  "tips": [
    "VAT is added on top of the gold price",
    "Gold jewelry is subject to 5% VAT",
    "Export of gold may be VAT refundable",
    "Some gold items may be exempt - check with seller"
  ]
}
```

### GET Market Summary

```bash
curl -X GET "http://localhost:3000/uaemarts/summary" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "premium": {
    "current": 4.50,
    "average7d": 4.20,
    "average30d": 4.00,
    "trend": "stable",
    "recommendation": "Premium is reasonable"
  },
  "bestTime": {
    "bestDay": "Friday",
    "bestTime": "10 AM - 12 PM",
    "reason": "Early morning tends to have better prices before weekend crowd.",
    "averagePriceDiff": 2.50
  },
  "makingCharges": [...],
  "vatInfo": {...},
  "lastUpdated": "2026-04-19T10:30:00.000Z"
}
```

---

## Affiliate

### GET All Affiliate Links

```bash
curl -X GET "http://localhost:3000/affiliate/links" \
  -H "Content-Type: application/json"
```

**Response:**

```json
[
  {
    "code": "bullionvault",
    "name": "BullionVault",
    "url": "https://www.bullionvault.com/",
    "category": "trading",
    "commission": "0.5%"
  },
  {
    "code": "apmex",
    "name": "APMEX",
    "url": "https://www.apmex.com/",
    "category": "broker",
    "commission": "1.0%"
  }
]
```

### POST Track Click

```bash
curl -X POST "http://localhost:3000/affiliate/track" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "bullionvault",
    "subscriberId": "123456789",
    "utmSource": "telegram"
  }'
```

**Response:**

```json
{
  "success": true,
  "redirectUrl": "https://www.bullionvault.com/?ref=goldfield"
}
```

### GET Stats

```bash
curl -X GET "http://localhost:3000/affiliate/stats" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "totalClicks": 1500,
  "convertedClicks": 120,
  "conversionRate": 8.0,
  "totalEarnings": 5000.0
}
```

### GET Partner Stats

```bash
curl -X GET "http://localhost:3000/affiliate/partner-stats" \
  -H "Content-Type: application/json"
```

**Response:**

```json
[
  {
    "partnerId": "1",
    "partnerName": "BullionVault",
    "clicks": 500,
    "conversions": 45,
    "earnings": 2500.0
  }
]
```

---

## Content

### GET Page by Slug

```bash
curl -X GET "http://localhost:3000/content/home" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "slug": "home",
  "title": "Gold Field API - Real-Time Gold Rates",
  "content": "Real-time gold rates for global markets. Track prices across USA, India, UAE, Saudi Arabia, UK, and EU.",
  "description": "Real-time gold rates API for global markets",
  "keywords": ["gold rates", "gold price", "api", "precious metals"],
  "lastUpdated": "2026-04-19T10:30:00.000Z"
}
```

### Search Pages

```bash
curl -X GET "http://localhost:3000/content/search?q=gold" \
  -H "Content-Type: application/json"
```

### GET Sitemap

```bash
curl -X GET "http://localhost:3000/content/sitemap" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "urlset": [
    {
      "url": {
        "loc": "/content/home",
        "lastmod": "2026-04-19T10:30:00.000Z",
        "changefreq": "weekly",
        "priority": 0.8
      }
    }
  ]
}
```

---

## Enums Reference

### Regions

- UAE, USA, INDIA, SAUDI, UK, EU

### Purities

- 24K, 22K, 18K

### Signal Types

- BUY, WAIT, AVOID

### Signal Confidence

- HIGH, MEDIUM, LOW

### Alert Frequency

- DAILY, WEEKLY, INSTANT

### Partner Categories

- TRADING, BROKER, DEALER

---

## Quick Reference - Frontend Common Calls

| Feature          | URL                      | Method |
| ---------------- | ------------------------ | ------ |
| Load all prices  | /gold-rates/live         | GET    |
| Prices by region | /gold-rates/live/:region | GET    |
| Today's signal   | /signals/today           | GET    |
| Subscribe        | /alerts/subscribe        | POST   |
| Unsubscribe      | /alerts/unsubscribe      | POST   |
| Premium data     | /uaemarts/premium        | GET    |
| Best time        | /uaemarts/best-time      | GET    |
| Making charges   | /uaemarts/making-charges | GET    |
| Affiliate links  | /affiliate/links         | GET    |
| Track click      | /affiliate/track         | POST   |

---

**Last Updated**: April 2026
