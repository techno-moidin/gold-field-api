import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  AffiliatePartner,
  PartnerStatus,
  PartnerCategory,
} from './entities/affiliate-partner.entity';
import { AffiliateClick } from './entities/affiliate-click.entity';

export interface AffiliateLink {
  code: string;
  name: string;
  url: string;
  category: string;
  description?: string;
  commission?: string;
}

export interface ClickStats {
  totalClicks: number;
  convertedClicks: number;
  conversionRate: number;
  totalEarnings: number;
}

export interface PartnerStats {
  partnerId: string;
  partnerName: string;
  clicks: number;
  conversions: number;
  earnings: number;
}

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);
  private readonly CACHE_KEY_LINKS = 'affiliate:links';

  constructor(
    @InjectRepository(AffiliatePartner)
    private partnerRepository: Repository<AffiliatePartner>,
    @InjectRepository(AffiliateClick)
    private clickRepository: Repository<AffiliateClick>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getAllLinks(forceRefresh = false): Promise<AffiliateLink[]> {
    if (!forceRefresh) {
      const cached = await this.cacheManager.get<AffiliateLink[]>(
        this.CACHE_KEY_LINKS,
      );
      if (cached) return cached;
    }

    const partners = await this.partnerRepository.find({
      where: { status: PartnerStatus.ACTIVE },
      order: { name: 'ASC' },
    });

    const links: AffiliateLink[] = partners.map((p) => ({
      code: p.code,
      name: p.name,
      url: p.url,
      category: p.category,
      description: p.description,
      commission:
        p.commissionType === 'percentage'
          ? `${p.commissionRate}%`
          : `${p.commissionAmount} ${p.commissionCurrency}`,
    }));

    await this.cacheManager.set(this.CACHE_KEY_LINKS, links, 3600);
    return links;
  }

  async trackClick(
    code: string,
    subscriberId?: string,
    utmSource?: string,
    utmMedium?: string,
  ): Promise<{ success: boolean; redirectUrl: string }> {
    const partner = await this.partnerRepository.findOne({
      where: { code, status: PartnerStatus.ACTIVE },
    });

    if (!partner) {
      return { success: false, redirectUrl: '' };
    }

    const click = this.clickRepository.create({
      partnerCode: code,
      partnerUrl: partner.url,
      subscriberId,
      utmSource,
      utmMedium,
    });

    await this.clickRepository.save(click);
    this.logger.log(`Tracked click for partner: ${code}`);

    return { success: true, redirectUrl: partner.url };
  }

  async markConverted(
    clickId: string,
    conversionValue?: number,
    conversionCurrency?: string,
  ): Promise<{ success: boolean; message: string }> {
    const click = await this.clickRepository.findOne({
      where: { id: clickId },
    });

    if (!click) {
      return { success: false, message: 'Click not found' };
    }

    click.converted = true;
    click.convertedAt = new Date();
    if (conversionValue) click.conversionValue = conversionValue;
    if (conversionCurrency) click.conversionCurrency = conversionCurrency;

    await this.clickRepository.save(click);

    this.logger.log(
      `Conversion tracked for ${click.partnerCode}: ${conversionValue || 0} ${conversionCurrency || 'USD'}`,
    );

    return { success: true, message: 'Conversion recorded' };
  }

  async getStats(partnerCode?: string): Promise<ClickStats> {
    const whereCondition = partnerCode ? { partnerCode } : {};

    const totalClicks = await this.clickRepository.count({
      where: whereCondition,
    });

    const convertedClicks = await this.clickRepository.count({
      where: { ...whereCondition, converted: true },
    });

    const conversionRate =
      totalClicks > 0 ? (convertedClicks / totalClicks) * 100 : 0;

    const convertedClicksData = await this.clickRepository.find({
      where: { ...whereCondition, converted: true },
    });

    const totalEarnings = convertedClicksData.reduce(
      (sum, click) => sum + (click.conversionValue || 0),
      0,
    );

    return {
      totalClicks,
      convertedClicks,
      conversionRate: Number(conversionRate.toFixed(2)),
      totalEarnings: Number(totalEarnings.toFixed(2)),
    };
  }

  async getPartnerStats(): Promise<PartnerStats[]> {
    const partners = await this.partnerRepository.find({
      where: { status: PartnerStatus.ACTIVE },
    });

    const stats: PartnerStats[] = [];

    for (const partner of partners) {
      const clicks = await this.clickRepository.count({
        where: { partnerCode: partner.code },
      });

      const conversions = await this.clickRepository.count({
        where: { partnerCode: partner.code, converted: true },
      });

      const convertedClicks = await this.clickRepository.find({
        where: { partnerCode: partner.code, converted: true },
      });

      const earnings = convertedClicks.reduce(
        (sum, click) => sum + (click.conversionValue || 0),
        0,
      );

      stats.push({
        partnerId: partner.id,
        partnerName: partner.name,
        clicks,
        conversions,
        earnings: Number(earnings.toFixed(2)),
      });
    }

    return stats;
  }

  async addPartner(
    partnerData: Partial<AffiliatePartner>,
  ): Promise<AffiliatePartner> {
    const partner = this.partnerRepository.create(partnerData);
    return this.partnerRepository.save(partner);
  }

  async seedDefaultPartners(): Promise<void> {
    const count = await this.partnerRepository.count();
    if (count > 0) return;

    const defaultPartners: Partial<AffiliatePartner>[] = [
      {
        name: 'BullionVault',
        code: 'bullionvault',
        description: 'Buy physical gold & silver stored in professional vaults',
        url: 'https://www.bullionvault.com/',
        category: PartnerCategory.TRADING,
        commissionRate: 0.5,
        commissionType: 'percentage',
        commissionCurrency: 'USD',
        status: PartnerStatus.ACTIVE,
      },
      {
        name: 'APMEX',
        code: 'apmex',
        description: 'Largest selection of precious metals online',
        url: 'https://www.apmex.com/',
        category: PartnerCategory.BROKER,
        commissionRate: 1.0,
        commissionType: 'percentage',
        commissionCurrency: 'USD',
        status: PartnerStatus.ACTIVE,
      },
      {
        name: 'JM Bullion',
        code: 'jmbullion',
        description: 'Trusted precious metals dealer',
        url: 'https://www.jmbullion.com/',
        category: PartnerCategory.BROKER,
        commissionRate: 1.0,
        commissionType: 'percentage',
        commissionCurrency: 'USD',
        status: PartnerStatus.ACTIVE,
      },
      {
        name: 'Silver Gold Bull',
        code: 'sgb',
        description: 'Global precious metals dealer',
        url: 'https://www.silvergoldbull.com/',
        category: PartnerCategory.TRADING,
        commissionRate: 0.75,
        commissionType: 'percentage',
        commissionCurrency: 'USD',
        status: PartnerStatus.ACTIVE,
      },
    ];

    for (const partner of defaultPartners) {
      await this.partnerRepository.save(partner);
    }

    await this.cacheManager.del(this.CACHE_KEY_LINKS);
    this.logger.log('Default affiliate partners seeded');
  }
}
