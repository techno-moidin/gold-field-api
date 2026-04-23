import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { databaseConfig } from '../config';
import { GoldRate } from '../gold-rates/entities/gold-rate.entity';
import { Subscriber } from '../alerts/entities/subscriber.entity';
import { SignalMetrics } from '../uaemarts/entities/signal-metrics.entity';
import { AffiliatePartner } from '../affiliate/entities/affiliate-partner.entity';
import { AffiliateClick } from '../affiliate/entities/affiliate-click.entity';
import { seedGoldRates } from './seed-gold-rates';
import { seedSubscribers } from './seed-subscribers';
import { seedSignalMetrics } from './seed-signal-metrics';
import { seedAffiliatePartners } from './seed-affiliate';

async function seed() {
  console.log('🌱 Starting database seed...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database,
    entities: [GoldRate, Subscriber, SignalMetrics, AffiliatePartner, AffiliateClick],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Database connected\n');

    console.log('--- Seeding Gold Rates ---');
    await seedGoldRates(dataSource);

    console.log('\n--- Seeding Subscribers ---');
    await seedSubscribers(dataSource);

    console.log('\n--- Seeding Signal Metrics ---');
    await seedSignalMetrics(dataSource);

    console.log('\n--- Seeding Affiliate Partners ---');
    await seedAffiliatePartners(dataSource);

    console.log('\n✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    process.exit(0);
  }
}

seed();