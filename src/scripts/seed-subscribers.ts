import { DataSource } from 'typeorm';
import { Subscriber, SubscriptionTier, AlertFrequency } from '../alerts/entities/subscriber.entity';

export async function seedSubscribers(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Subscriber);

  const subscribers: Subscriber[] = [
    repo.create({
      telegramId: '123456789',
      telegramUsername: 'gold_trader_uae',
      whatsappPhone: '+971501234567',
      tier: SubscriptionTier.PREMIUM,
      alertFrequency: AlertFrequency.INSTANT,
      preferredRegion: 'UAE',
      preferredPurity: '24K',
      isActive: true,
      isSubscribed: true,
    }),
    repo.create({
      telegramId: '987654321',
      telegramUsername: 'dubai_investor',
      whatsappPhone: '+971501234568',
      tier: SubscriptionTier.FREE,
      alertFrequency: AlertFrequency.DAILY,
      preferredRegion: 'UAE',
      preferredPurity: '22K',
      isActive: true,
      isSubscribed: true,
    }),
    repo.create({
      telegramId: '456789123',
      telegramUsername: 'mumbai_gold_lover',
      whatsappPhone: '+919876543210',
      tier: SubscriptionTier.FREE,
      alertFrequency: AlertFrequency.WEEKLY,
      preferredRegion: 'INDIA',
      preferredPurity: '24K',
      isActive: true,
      isSubscribed: true,
    }),
    repo.create({
      whatsappPhone: '+966501234567',
      tier: SubscriptionTier.PREMIUM,
      alertFrequency: AlertFrequency.INSTANT,
      preferredRegion: 'SAUDI',
      preferredPurity: '24K',
      isActive: true,
      isSubscribed: false,
    }),
  ];

  await repo.save(subscribers);
  console.log(`✅ Seeded ${subscribers.length} subscribers`);
}