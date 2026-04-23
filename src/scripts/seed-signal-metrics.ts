import { DataSource } from 'typeorm';
import { SignalMetrics } from '../uaemarts/entities/signal-metrics.entity';

export async function seedSignalMetrics(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(SignalMetrics);

  const base24kPrice = 314.0;
  const usdToAed = 3.67;

  const metrics: SignalMetrics[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dailyVariation = (Math.random() - 0.5) * 10;
    const price24kAvg = base24kPrice + dailyVariation;

    const metric = repo.create({
      metricDate: date,
      price24kAvg: Number(price24kAvg.toFixed(2)),
      price24kHigh: Number((price24kAvg * 1.01).toFixed(2)),
      price24kLow: Number((price24kAvg * 0.99).toFixed(2)),
      usdToAed: 3.67,
      soukPremium: Number(((Math.random() * 5) + 2).toFixed(2)),
      volumeTraded: Number((Math.random() * 10000 + 1000).toFixed(0)),
    });

    metrics.push(metric);
  }

  await repo.save(metrics);
  console.log(`✅ Seeded ${metrics.length} signal metrics`);
}