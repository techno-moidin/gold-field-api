# Gold Field API - WebSocket Integration Guide

> **Note**: WebSocket is planned for Phase 2. This guide is for future implementation.

---

## WebSocket Connection

### Connection URL

```
ws://localhost:3000
```

### JavaScript Client Example

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  autoConnect: true,
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to Gold Field API');
});

socket.on('disconnect', () => {
  console.log('Disconnected from Gold Field API');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

---

## Events: Client → Server

### Subscribe to Rate Updates

```javascript
socket.emit('subscribe', {
  region: 'UAE',
  purity: '24K',
});
```

**Payload:**

```json
{
  "region": "UAE",
  "purity": "24K"
}
```

### Unsubscribe

```javascript
socket.emit('unsubscribe', {
  region: 'UAE',
  purity: '24K',
});
```

### Subscribe to All Rates

```javascript
socket.emit('subscribe', {
  region: 'ALL',
  purity: 'ALL',
});
```

### Heartbeat/Ping

```javascript
socket.emit('ping');
```

---

## Events: Server → Client

### Rate Update (Single)

```javascript
socket.on('rateUpdate', (data) => {
  console.log('Price update:', data);
});
```

**Payload:**

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
  "timestamp": "2026-04-19T10:30:00.000Z"
}
```

### Bulk Update (After Fetch)

```javascript
socket.on('bulkUpdate', (data) => {
  console.log('All rates updated:', data);
});
```

**Payload:**

```json
[
  {
    "region": "UAE",
    "currency": "AED",
    "purity": "24K",
    "pricePerGram": 325.50,
    ...
  },
  {
    "region": "USA",
    "currency": "USD",
    "purity": "24K",
    "pricePerGram": 88.50,
    ...
  }
]
```

### Subscription Confirmation

```javascript
socket.on('subscribed', (data) => {
  console.log('Subscribed to:', data.room);
});
```

**Payload:**

```json
{
  "room": "UAE-24K"
}
```

### Heartbeat Response

```javascript
socket.on('pong', () => {
  console.log('Heartbeat received');
});
```

### Error Event

```javascript
socket.on('error', (data) => {
  console.error('WebSocket error:', data.message);
});
```

**Payload:**

```json
{
  "code": "INVALID_ROOM",
  "message": "Invalid region or purity"
}
```

---

## Room Naming Convention

| Room        | Description     |
| ----------- | --------------- |
| `UAE-24K`   | UAE 24K rates   |
| `UAE-22K`   | UAE 22K rates   |
| `UAE-18K`   | UAE 18K rates   |
| `USA-24K`   | USA 24K rates   |
| `INDIA-24K` | India 24K rates |
| `ALL`       | All rates       |

---

## Complete Example

```javascript
import { io } from 'socket.io-client';

class GoldFieldSocket {
  constructor() {
    this.socket = io('http://localhost:3000');
    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('✓ Connected');
    });

    this.socket.on('disconnect', () => {
      console.log('✗ Disconnected');
    });

    this.socket.on('rateUpdate', (data) => {
      this.onPriceUpdate?.(data);
    });

    this.socket.on('bulkUpdate', (data) => {
      this.onBulkUpdate?.(data);
    });

    this.socket.on('subscribed', (data) => {
      console.log('Subscribed to:', data.room);
    });
  }

  subscribe(region, purity) {
    this.socket.emit('subscribe', { region, purity });
  }

  unsubscribe(region, purity) {
    this.socket.emit('unsubscribe', { region, purity });
  }

  ping() {
    this.socket.emit('ping');
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Usage
const goldSocket = new GoldFieldSocket();

goldSocket.onPriceUpdate = (price) => {
  console.log('New price:', price.pricePerGram);
};

goldSocket.subscribe('UAE', '24K');
```

---

## Reconnection Strategy

```javascript
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
```

---

## Error Codes

| Code            | Description                       |
| --------------- | --------------------------------- |
| `INVALID_ROOM`  | Invalid region/purity combination |
| `RATE_LIMIT`    | Too many connections              |
| `AUTH_REQUIRED` | Authentication needed (future)    |

---

## Implementation Checklist

- [ ] Install socket.io-client
- [ ] Set up connection management
- [ ] Implement subscribe/unsubscribe
- [ ] Handle rateUpdate events
- [ ] Handle bulkUpdate events
- [ ] Add reconnection logic
- [ ] Add error handling
- [ ] Implement heartbeat (optional)

---

**Last Updated**: April 2026
