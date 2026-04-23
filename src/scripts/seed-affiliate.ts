import { DataSource } from 'typeorm';
import {
  AffiliatePartner,
  PartnerStatus,
  PartnerCategory,
} from '../affiliate/entities/affiliate-partner.entity';
import { AffiliateClick } from '../affiliate/entities/affiliate-click.entity';

export async function seedAffiliatePartners(
  dataSource: DataSource,
): Promise<void> {
  const partnerRepo = dataSource.getRepository(AffiliatePartner);
  const clickRepo = dataSource.getRepository(AffiliateClick);

  const partners: AffiliatePartner[] = [
    partnerRepo.create({
      name: 'Gold Dubai Brokers',
      code: 'GOLDDB',
      description: 'Leading gold broker in Dubai with competitive rates',
      url: 'https://golddubai.ae',
      category: PartnerCategory.BROKER,
      status: PartnerStatus.ACTIVE,
      commissionRate: 2.5,
      commissionCurrency: 'USD',
      commissionType: 'percentage',
    }),
    partnerRepo.create({
      name: 'Malabar Gold & Diamonds',
      code: 'MALABAR',
      description: 'Trusted jewelry brand across UAE',
      url: 'https://malabargold.com/uae',
      category: PartnerCategory.JEWELRY,
      status: PartnerStatus.ACTIVE,
      commissionRate: 1.5,
      commissionCurrency: 'USD',
      commissionType: 'percentage',
    }),
    partnerRepo.create({
      name: 'Joyalukkas',
      code: 'JOYALUKKAS',
      description: 'Premium jewelry shopping destination',
      url: 'https://joyalukkas.com/uae',
      category: PartnerCategory.JEWELRY,
      status: PartnerStatus.ACTIVE,
      commissionRate: 1.5,
      commissionCurrency: 'USD',
      commissionType: 'percentage',
    }),
    partnerRepo.create({
      name: 'Gold Forex Trading',
      code: 'GOLDFX',
      description: 'Gold trading platform with real-time rates',
      url: 'https://goldforex.com',
      category: PartnerCategory.TRADING,
      status: PartnerStatus.ACTIVE,
      commissionRate: 3.0,
      commissionCurrency: 'USD',
      commissionType: 'percentage',
    }),
    partnerRepo.create({
      name: 'GoldTracker App',
      code: 'GOLDAPP',
      description: 'Mobile app for gold price tracking',
      url: 'https://goldtracker.app',
      category: PartnerCategory.APPS,
      status: PartnerStatus.ACTIVE,
      commissionRate: 0.5,
      commissionCurrency: 'USD',
      commissionType: 'percentage',
    }),
  ];

  await partnerRepo.save(partners);
  console.log(`✅ Seeded ${partners.length} affiliate partners`);

  const clicks: AffiliateClick[] = [
    clickRepo.create({
      subscriberId: undefined,
      partnerCode: 'GOLDDB',
      partnerUrl: 'https://golddubai.ae',
      converted: true,
      conversionValue: 5000,
      conversionCurrency: 'AED',
      utmSource: 'telegram',
      utmMedium: 'gold_alert',
    }),
    clickRepo.create({
      subscriberId: undefined,
      partnerCode: 'MALABAR',
      partnerUrl: 'https://malabargold.com/uae',
      converted: false,
      utmSource: 'whatsapp',
      utmMedium: 'daily_alert',
    }),
  ];

  await clickRepo.save(clicks);
  console.log(`✅ Seeded ${clicks.length} affiliate clicks`);
}