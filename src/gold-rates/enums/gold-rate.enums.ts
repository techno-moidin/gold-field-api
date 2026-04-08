export enum Region {
  USA = 'USA',
  INDIA = 'INDIA',
  UAE = 'UAE',
  SAUDI = 'SAUDI',
  UK = 'UK',
  EU = 'EU',
}

export enum Currency {
  USD = 'USD',
  INR = 'INR',
  AED = 'AED',
  SAR = 'SAR',
  GBP = 'GBP',
  EUR = 'EUR',
}

export enum GoldPurity {
  GOLD_24K = '24K',
  GOLD_22K = '22K',
  GOLD_18K = '18K',
}

export const REGION_CURRENCY_MAP: Record<Region, Currency> = {
  [Region.USA]: Currency.USD,
  [Region.INDIA]: Currency.INR,
  [Region.UAE]: Currency.AED,
  [Region.SAUDI]: Currency.SAR,
  [Region.UK]: Currency.GBP,
  [Region.EU]: Currency.EUR,
};
