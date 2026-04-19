# Gold Field API - Error Handling & Environment

---

## Environment Variables

Create a `.env` file in your React project root:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3000
REACT_APP_API_TIMEOUT=10000

# WebSocket (Phase 2)
REACT_APP_WS_URL=ws://localhost:3000

# Feature Flags
REACT_APP_ENABLE_WS=false
REACT_APP_ENABLE_ANALYTICS=false
```

---

## Error Handling

### API Error Response Format

```typescript
interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
```

### Axios Error Interceptor

```typescript
// src/utils/apiErrorHandler.ts
import { AxiosError } from 'axios';

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      // Network error
      return 'Unable to connect to server. Please check your internet connection.';
    }

    const status = error.response.status;

    switch (status) {
      case 400:
        return error.response.data?.message || 'Invalid request';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.response.data?.message || 'An error occurred';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
```

### React Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-gold-500 text-black rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Loading States

### Skeleton Loaders

```typescript
// src/components/Skeletons.tsx
export function PriceCardSkeleton() {
  return (
    <div className="animate-pulse bg-slate-800 rounded-lg p-4">
      <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
      <div className="h-8 bg-slate-700 rounded w-1/2"></div>
    </div>
  );
}

export function PriceGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <PriceCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

## Offline Handling

```typescript
// src/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Usage in component
function App() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="p-4 bg-yellow-500 text-black text-center">
        You are offline. Some features may not work.
      </div>
    );
  }

  return <YourApp />;
}
```

---

## Data Caching Strategy

### React Query Configuration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Cache Durations by Endpoint

| Endpoint            | Stale Time | Description        |
| ------------------- | ---------- | ------------------ |
| `/gold-rates/live`  | 5 min      | Live prices        |
| `/gold-rates/chart` | 1 min      | Chart data         |
| `/signals/today`    | 1 hour     | Daily signal       |
| `/signals/history`  | 24 hours   | Historical signals |
| `/uaemarts/*`       | 5 min      | Market data        |
| `/affiliate/links`  | 1 hour     | Static-ish data    |
| `/content/*`        | 24 hours   | Static content     |

---

## Quick Setup Checklist

- [ ] Install dependencies:

  ```bash
  npm install axios @tanstack/react-query
  ```

- [ ] Create `.env` file with `REACT_APP_API_URL`

- [ ] Add `ApiClient` class to your project

- [ ] Set up React Query provider in `App.tsx`

- [ ] Create custom hooks for each endpoint

- [ ] Add error boundary component

- [ ] Handle offline state

---

**Last Updated**: April 2026
