# Frontend Integration - Quick Start

## Step 1: Install Dependencies

```bash
npm install axios @tanstack/react-query framer-motion
```

## Step 2: Copy Types

Copy `TYPEScript_TYPES.md` contents to:

```
src/types/gold-field.ts
```

## Step 3: Set Up API Client

Create `src/lib/api.ts`:

```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export default api;
```

## Step 4: Create Hooks

Create `src/hooks/useGoldRates.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { LiveRateResponse } from '../types/gold-field';

export function useLiveRates() {
  return useQuery<LiveRateResponse[]>({
    queryKey: ['liveRates'],
    queryFn: async () => {
      const { data } = await api.get('/gold-rates/live');
      return data;
    },
    refetchInterval: 300000,
  });
}

export function useLiveByRegion(region: string) {
  return useQuery({
    queryKey: ['liveRates', region],
    queryFn: async () => {
      const { data } = await api.get(`/gold-rates/live/${region}`);
      return data;
    },
    refetchInterval: 300000,
  });
}
```

## Step 5: Basic Price Card Component

```tsx
// src/components/PriceCard.tsx
import { LiveRateResponse } from '../types/gold-field';

interface PriceCardProps {
  rate: LiveRateResponse;
}

export function PriceCard({ rate }: PriceCardProps) {
  const isPositive = (rate.changePercent24h ?? 0) >= 0;

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="text-sm text-slate-400">{rate.region}</div>
      <div className="text-2xl font-bold text-gold-400">
        {rate.currency} {rate.pricePerGram.toFixed(2)}
      </div>
      <div
        className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}
      >
        {isPositive ? '+' : ''}
        {rate.changePercent24h?.toFixed(2)}%
      </div>
    </div>
  );
}
```

## Step 6: App Query Provider

```tsx
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLiveRates } from './hooks/useGoldRates';
import { PriceCard } from './components/PriceCard';

const queryClient = new QueryClient();

function PriceGrid() {
  const { data: rates, isLoading, error } = useLiveRates();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading rates</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {rates?.map((rate) => (
        <PriceCard key={`${rate.region}-${rate.purity}`} rate={rate} />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PriceGrid />
    </QueryClientProvider>
  );
}
```

---

## Minimum Viable Product (MVP) Screens

### MVP 1: Price Grid (Home)

- Show all regions' 24K prices
- Color-coded 24h change
- Pull to refresh

### MVP 2: Signal Display

- Today's BUY/WAIT/AVOID
- Confidence badge
- Reasoning card

### MVP 3: Subscribe Flow

- Form: Telegram ID input
- Select: Region, Purity, Frequency
- Submit to `/alerts/subscribe`

---

## Common Issues & Fixes

| Issue               | Fix                                      |
| ------------------- | ---------------------------------------- |
| CORS error          | Proxy through Vite or Next.js API routes |
| Prices not updating | Check refetchInterval (5 min default)    |
| Type errors         | Import types from copied file            |
| Build fails         | Check REACT*APP* env vars set            |

---

## File Structure Recommendation

```
src/
├── components/
│   ├── PriceCard.tsx
│   ├── SignalBadge.tsx
│   ├── PremiumGauge.tsx
│   └── Skeletons.tsx
├── hooks/
│   ├── useGoldRates.ts
│   ├── useSignals.ts
│   ├── useAlerts.ts
│   └── useUaeMart.ts
├── lib/
│   └── api.ts
├── types/
│   └── gold-field.ts
├── screens/
│   ├── HomeScreen.tsx
│   ├── SignalScreen.tsx
│   └── AlertsScreen.tsx
└── App.tsx
```

---

## Next Steps

1. Run `npm run dev`
2. Test `/gold-rates/live` endpoint first
3. Build price grid
4. Add signal screen
5. Add subscribe form
6. Style with Tailwind

---

**For detailed API calls see `API_REFERENCE.md`**

**Last Updated**: April 2026
