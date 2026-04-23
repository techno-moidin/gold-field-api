import { DataSource } from 'typeorm';
import { databaseConfig } from '../config';
import { GoldRate } from '../gold-rates/entities/gold-rate.entity';
import {
  Region,
  GoldPurity,
  Currency,
  REGION_CURRENCY_MAP,
} from '../gold-rates/enums/gold-rate.enums';

export async function seedGoldRates(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(GoldRate);

  const regions = Object.values(Region) as Region[];
  const purities = Object.values(GoldPurity) as GoldPurity[];

  const baseRates: Record<Currency, number> = {
    [Currency.USD]: 85.5,
    [Currency.INR]: 7100.0,
    [Currency.AED]: 314.0,
    [Currency.SAR]: 321.0,
    [Currency.GBP]: 68.0,
    [Currency.EUR]: 78.5,
  };

  const purityMultipliers: Record<GoldPurity, number> = {
    [GoldPurity.GOLD_24K]: 1.0,
    [GoldPurity.GOLD_22K]: 0.9167,
    [GoldPurity.GOLD_18K]: 0.75,
  };

  const goldRates: GoldRate[] = [];
  const now = new Date();

  for (const region of regions) {
    const currency = REGION_CURRENCY_MAP[region];
    const basePrice = baseRates[currency];
    const variation = (Math.random() - 0.5) * (basePrice * 0.02);

    for (const purity of purities) {
      const purityPrice = basePrice * purityMultipliers[purity];
      const regionalPrice = purityPrice + variation;
      const spread = regionalPrice * 0.002;
      const change24h = (Math.random() - 0.5) * 2;
      const changePercent24h = (change24h / regionalPrice) * 100;

      const goldRate = repo.create({
        region,
        currency,
        purity,
        pricePerGram: Number(regionalPrice.toFixed(2)),
        pricePerOunce: Number((regionalPrice * 31.1035).toFixed(2)),
        bid: Number((regionalPrice - spread).toFixed(2)),
        ask: Number((regionalPrice + spread).toFixed(2)),
        change24h: Number(change24h.toFixed(2)),
        changePercent24h: Number(changePercent24h.toFixed(2)),
        high24h: Number((regionalPrice * 1.005).toFixed(2)),
        low24h: Number((regionalPrice * 0.995).toFixed(2)),
        open: Number((regionalPrice - change24h).toFixed(2)),
        previousClose: Number((regionalPrice - change24h).toFixed(2)),
        isActive: true,
        timestamp: now,
      });

      goldRates.push(goldRate);
    }
  }

  await repo.save(goldRates);
  console.log(`✅ Seeded ${goldRates.length} gold rates`);
}