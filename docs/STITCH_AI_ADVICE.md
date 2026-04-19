# Design Advice for Stitch AI - Gold Field App

## General Approach

This is a **data-first financial app** where information density and readability are critical. Users come specifically to check prices - don't hide them.

---

## Layout Recommendations

### 1. Home Screen - Price Grid

- **Header**: App logo + settings icon
- **Main Content**: Region cards in 2x3 grid
  - Each card shows: Region flag/name | Current 24K price | 24h change %
- **Quick Filter**: Horizontal scroll of purities (24K | 22K | 18K)
- **Bottom Nav**: Home | Signals | Alerts | UAE Market | More

### 2. Price Detail Screen

- **Hero**: Large current price (biggest text)
- **Sparkline**: Last 24h price movement
- **Details Card**:
  - Price per gram/ounce
  - Bid/Ask spread
  - 24h High/Low
- **Historical Tabs**: 1D | 1W | 1M | 3M | 1Y

### 3. Signals Screen

- **Today's Signal**: Large BUY/WAIT/AVOID badge with color
- **Confidence**: HIGH/MEDIUM/LOW pill
- **Reasoning**: Expandable card with metrics
- **History**: Timeline view of past signals

### 4. UAE Market Screen

- **Premium Gauge**: Visual indicator (low/normal/high)
- **Stats Row**: 7d avg | 30d avg | Trend arrow
- **Best Time Card**: Day + time + reasoning
- **Making Charges**: Accordion by purity

---

## Component Guidelines

### Price Cards

- Background: Slight elevation (shadow-sm)
- Corner radius: 12px
- Padding: 16px
- Change indicator: Green pill (up), Red pill (down)

### Buttons

- Primary: Gold fill, dark text
- Secondary: Outline
- Height: 44px minimum (touch target)

### Input Fields

- Border: 1px gray-300
- Focus: Gold border
- Height: 48px

### Bottom Sheet (for mobile)

- Use for: Filters, Region selection, Subscribe form
- Snap points: 25%, 50%, 90%

---

## Color Usage

| Element        | Color                |
| -------------- | -------------------- |
| Primary        | #D4AF37 (gold)       |
| Background     | #0F172A (dark slate) |
| Surface        | #1E293B              |
| Text Primary   | #F8FAFC              |
| Text Secondary | #94A3B8              |
| Success/Gain   | #22C55E              |
| Error/Loss     | #EF4444              |
| Warning        | #F59E0B              |

---

## Typography

- **Font**: Inter or system-ui (clean, readable)
- **Price Display**: 32px-48px, bold
- **Section Headers**: 18px, semibold
- **Body**: 14px-16px, regular
- **Captions**: 12px, medium

---

## Animations & Transitions

- **Price updates**: Brief highlight (gold glow) - 300ms
- **Screen transitions**: Slide - 200ms ease-out
- **Cards**: Scale on press - 100ms
- **Charts**: Draw-in animation - 500ms

---

## Best Practices

1. **Show prices immediately** - Don't require login/signup for basic view
2. **Cache aggressively** - Show cached data while fetching fresh
3. **Skeleton loaders** - For price cards
4. **Pull-to-refresh** - Standard mobile pattern
5. **Offline indicator** - When connection lost

---

## Specific Features to Highlight

### Signal Badge Design

```
┌─────────────┐
│    BUY      │  ← Green background
│   HIGH      │  ← Smaller confidence below
└─────────────┘
```

### Premium Gauge

```
Low ──●──────── High
    ↑
  3-5% optimal
```

### Chart Design

- Dark background
- Gold line for price
- Green/red gradient fill below
- Crosshair on touch

---

## Questions for Your Team

1. Which regions are priority? (UAE + home region first?)
2. Show prices in local currency or USD?
3. Telegram bot flow: WebView or external app?
4. Need admin dashboard for affiliate partners?
5. Push notifications or Telegram only?

---

**Document Version**: 1.0  
**For**: Gold Field App Frontend Design  
**Using**: Google Stitch AI
