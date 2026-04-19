# Gold Field API - TypeScript Types

Copy these types to your React project for type-safe API integration.

---

## Enums

```typescript
// regions.ts
export enum Region {
  UAE = 'UAE',
  USA = 'USA',
  INDIA = 'INDIA',
  SAUDI = 'SAUDI',
  UK = 'UK',
  EU = 'EU',
}

export enum GoldPurity {
  GOLD_24K = '24K',
  GOLD_22K = '22K',
  GOLD_18K = '18K',
}

export enum Currency {
  AED = 'AED',
  USD = 'USD',
  INR = 'INR',
  SAR = 'SAR',
  GBP = 'GBP',
  EUR = 'EUR',
}

export enum SignalType {
  BUY = 'BUY',
  WAIT = 'WAIT',
  AVOID = 'AVOID',
}

export enum SignalConfidence {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum AlertFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  INSTANT = 'INSTANT',
}

export enum PartnerCategory {
  TRADING = 'trading',
  BROKER = 'broker',
  DEALER = 'dealer',
}
```

---

## Gold Rates Types

```typescript
// gold-rates.types.ts

export interface GoldRate {
  id: string;
  region: Region;
  currency: Currency;
  purity: GoldPurity;
  pricePerGram: number;
  pricePerOunce: number;
  bid: number;
  ask: number;
  change24h: number | null;
  changePercent24h: number | null;
  high24h: number | null;
  low24h: number | null;
  open?: number;
  previousClose?: number;
  timestamp: Date;
  isActive: boolean;
}

export interface LiveRateResponse {
  region: Region;
  currency: Currency;
  purity: GoldPurity;
  pricePerGram: number;
  pricePerOunce: number;
  bid: number;
  ask: number;
  change24h: number | null;
  changePercent24h: number | null;
  high24h: number | null;
  low24h: number | null;
  timestamp: Date;
  cached: boolean;
}

export interface HistoryQuery {
  region?: Region;
  purity?: GoldPurity;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export interface HistoryResponse {
  data: GoldRate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChartQuery {
  region?: Region;
  purity?: GoldPurity;
  interval?: number;
}

export interface ChartDataPoint {
  timestamp: Date;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ConvertQuery {
  amount: number;
  fromRegion: Region;
  toRegion: Region;
}

export interface ConversionResponse {
  fromAmount: number;
  fromRegion: Region;
  fromCurrency: Currency;
  toRegion: Region;
  toCurrency: Currency;
  convertedAmount: number;
  rate: number;
}

export interface AggregatedData {
  period: Date;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  open: number;
  close: number;
  tradeCount: number;
}
```

---

## Signals Types

```typescript
// signals.types.ts

export interface SignalMetrics {
  price24k: number;
  change24h: number;
  changePercent24h: number;
  trend7d: number;
  trend30d: number;
  localPremium: number;
}

export interface SignalResponse {
  date: string;
  signal: SignalType;
  confidence: SignalConfidence;
  reasoning: string;
  metrics: SignalMetrics;
  disclaimer: string;
  lastUpdated: Date;
}

export interface SignalHistoryItem {
  date: string;
  signal: SignalType;
  confidence: SignalConfidence;
  reasoning: string;
}

export interface SignalHistoryResponse {
  data: SignalHistoryItem[];
  total: number;
}
```

---

## Alerts Types

```typescript
// alerts.types.ts

export interface SubscribeDto {
  telegramId?: string;
  telegramUsername?: string;
  whatsappPhone?: string;
  region?: string;
  purity?: string;
  frequency?: AlertFrequency;
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
}

export interface UnsubscribeDto {
  identifier: string;
}

export interface SubscriptionStatus {
  subscribed: boolean;
  region: string;
  purity: string;
  frequency: string;
}

export interface SubscriberStats {
  total: number;
  active: number;
}

export interface UpdatePreferencesDto {
  identifier: string;
  region?: string;
  purity?: string;
  frequency?: AlertFrequency;
}
```

---

## UAE Marts Types

```typescript
// uaemarts.types.ts

export interface UaePremium {
  current: number;
  average7d: number;
  average30d: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
}

export interface BestTimeToBuy {
  bestDay: string;
  bestTime: string;
  reason: string;
  averagePriceDiff: number;
}

export interface MakingChargePrices {
  min: number;
  max: number;
  average: number;
}

export interface MakingCharges {
  purity: string;
  perGram: MakingChargePrices;
  perPiece: MakingChargePrices;
  tips: string[];
}

export interface VatInfo {
  rate: number;
  appliesTo: string[];
  tips: string[];
}

export interface UaeMarketSummary {
  premium: UaePremium;
  bestTime: BestTimeToBuy;
  makingCharges: MakingCharges[];
  vatInfo: VatInfo;
  lastUpdated: Date;
}
```

---

## Affiliate Types

```typescript
// affiliate.types.ts

export interface AffiliateLink {
  code: string;
  name: string;
  url: string;
  category: string;
  description?: string;
  commission?: string;
}

export interface TrackClickDto {
  code: string;
  subscriberId?: string;
  utmSource?: string;
  utmMedium?: string;
}

export interface TrackClickResponse {
  success: boolean;
  redirectUrl: string;
}

export interface MarkConvertedDto {
  clickId: string;
  conversionValue?: number;
  conversionCurrency?: string;
}

export interface ClickStats {
  totalClicks: number;
  convertedClicks: number;
  conversionRate: number;
  totalEarnings: number;
}

export interface PartnerStats {
  partnerId: string;
  partnerName: string;
  clicks: number;
  conversions: number;
  earnings: number;
}
```

---

## Content Types

```typescript
// content.types.ts

export interface ContentPage {
  slug: string;
  title: string;
  content: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  lastUpdated: Date;
}

export interface SitemapEntry {
  loc: string;
  lastmod: Date;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}
```

---

## API Client Service

```typescript
// api-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Gold Rates
  async getLiveRates(region?: string, purity?: string) {
    const params = new URLSearchParams();
    if (region) params.append('region', region);
    if (purity) params.append('purity', purity);
    return this.client.get(`/gold-rates/live?${params}`);
  }

  async getHistory(query: HistoryQuery) {
    return this.client.get('/gold-rates/history', { params: query });
  }

  async getChartData(query: ChartQuery) {
    return this.client.get('/gold-rates/chart', { params: query });
  }

  async convertCurrency(query: ConvertQuery) {
    return this.client.get('/gold-rates/convert', { params: query });
  }

  // Signals
  async getTodaySignal() {
    return this.client.get('/signals/today');
  }

  async getSignalHistory(days = 30) {
    return this.client.get('/signals/history', { params: { days } });
  }

  // Alerts
  async subscribe(data: SubscribeDto) {
    return this.client.post('/alerts/subscribe', data);
  }

  async unsubscribe(identifier: string) {
    return this.client.post('/alerts/unsubscribe', { identifier });
  }

  async getSubscriptionStatus(identifier: string) {
    return this.client.get('/alerts/status', { params: { identifier } });
  }

  // UAE Marts
  async getPremium() {
    return this.client.get('/uaemarts/premium');
  }

  async getBestTime() {
    return this.client.get('/uaemarts/best-time');
  }

  async getMakingCharges() {
    return this.client.get('/uaemarts/making-charges');
  }

  async getMarketSummary() {
    return this.client.get('/uaemarts/summary');
  }

  // Affiliate
  async getAffiliateLinks() {
    return this.client.get('/affiliate/links');
  }

  async trackClick(data: TrackClickDto) {
    return this.client.post('/affiliate/track', data);
  }

  async getAffiliateStats() {
    return this.client.get('/affiliate/stats');
  }

  // Content
  async getPage(slug: string) {
    return this.client.get(`/content/${slug}`);
  }

  async searchPages(query: string) {
    return this.client.get('/content/search', { params: { q: query } });
  }
}

export const api = new ApiClient();
export default api;
```

---

## React Query Hooks Example

```typescript
// hooks/useGoldRates.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../api-client';

export function useLiveRates(region?: string, purity?: string) {
  return useQuery({
    queryKey: ['liveRates', region, purity],
    queryFn: () => api.getLiveRates(region, purity),
    refetchInterval: 300000, // 5 minutes
  });
}

export function useTodaySignal() {
  return useQuery({
    queryKey: ['todaySignal'],
    queryFn: () => api.getTodaySignal(),
    refetchInterval: 3600000, // 1 hour
  });
}

export function useMarketSummary() {
  return useQuery({
    queryKey: ['marketSummary'],
    queryFn: () => api.getMarketSummary(),
    refetchInterval: 300000,
  });
}
```

---

**Copy to your project** → `src/types/gold-field.ts`

---

**Last Updated**: April 2026
