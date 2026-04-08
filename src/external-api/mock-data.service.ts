import { Injectable, Logger } from '@nestjs/common';
import {
  Region,
  GoldPurity,
  Currency,
  REGION_CURRENCY_MAP,
} from '../gold-rates/enums/gold-rate.enums';

export interface MockGoldRate {
  region: Region;
  currency: Currency;
  purity: GoldPurity;
  pricePerGram: number;
  pricePerOunce: number;
  bid: number;
  ask: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  open: number;
  previousClose: number;
  timestamp: Date;
}

@Injectable()
export class MockDataService {
  private readonly logger = new Logger(MockDataService.name);

  private baseRates: Record<Currency, number> = {
    [Currency.USD]: 85.5,
    [Currency.INR]: 7100.0,
    [Currency.AED]: 314.0,
    [Currency.SAR]: 321.0,
    [Currency.GBP]: 68.0,
    [Currency.EUR]: 78.5,
  };

  private purityMultipliers: Record<GoldPurity, number> = {
    [GoldPurity.GOLD_24K]: 1.0,
    [GoldPurity.GOLD_22K]: 0.9167,
    [GoldPurity.GOLD_18K]: 0.75,
  };

  generateRates(): MockGoldRate[] {
    const rates: MockGoldRate[] = [];
    const now = new Date();
    const basePrice = this.baseRates[Currency.USD];
    const variation = (Math.random() - 0.5) * 0.5;
    const currentPrice = basePrice + variation;

    for (const region of Object.values(Region)) {
      const currency = REGION_CURRENCY_MAP[region];
      const regionalBase =
        this.baseRates[currency] ||
        currentPrice * this.getExchangeRate(currency);
      const regionalVariation = (Math.random() - 0.5) * (regionalBase * 0.01);
      const pricePerGram = regionalBase + regionalVariation;

      for (const purity of Object.values(GoldPurity)) {
        const purityPrice = pricePerGram * this.purityMultipliers[purity];
        const spread = purityPrice * 0.002;
        const change24h = (Math.random() - 0.5) * 2;
        const changePercent24h = (change24h / purityPrice) * 100;

        rates.push({
          region,
          currency,
          purity,
          pricePerGram: Number(purityPrice.toFixed(2)),
          pricePerOunce: Number((purityPrice * 31.1035).toFixed(2)),
          bid: Number((purityPrice - spread).toFixed(2)),
          ask: Number((purityPrice + spread).toFixed(2)),
          change24h: Number(change24h.toFixed(2)),
          changePercent24h: Number(changePercent24h.toFixed(2)),
          high24h: Number((purityPrice * 1.005).toFixed(2)),
          low24h: Number((purityPrice * 0.995).toFixed(2)),
          open: Number((purityPrice - change24h).toFixed(2)),
          previousClose: Number((purityPrice - change24h).toFixed(2)),
          timestamp: now,
        });
      }
    }

    return rates;
  }

  private getExchangeRate(currency: Currency): number {
    const rates: Record<Currency, number> = {
      [Currency.USD]: 1,
      [Currency.INR]: 83.5,
      [Currency.AED]: 3.67,
      [Currency.SAR]: 3.75,
      [Currency.GBP]: 0.79,
      [Currency.EUR]: 0.92,
    };
    return rates[currency] || 1;
  }
}
