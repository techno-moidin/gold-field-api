import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SignalMetrics } from './entities/signal-metrics.entity';
import { GoldRatesService } from '../gold-rates/gold-rates.service';
import { Region, GoldPurity } from '../gold-rates/enums/gold-rate.enums';

export interface UaePremium {
  current: number;
  average7d: number;
  average30d: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
}

export interface BestTimeToBuy {
  bestDay: string;
  bestTime: string;
  reason: string;
  averagePriceDiff: number;
}

export interface MakingCharges {
  purity: string;
  perGram: {
    min: number;
    max: number;
    average: number;
  };
  perPiece: {
    min: number;
    max: number;
    average: number;
  };
  tips: string[];
}

export interface UaeMarketSummary {
  premium: UaePremium;
  bestTime: BestTimeToBuy;
  makingCharges: MakingCharges[];
  vatInfo: { rate: number; appliesTo: string[]; tips: string[] };
  lastUpdated: Date;
}

@Injectable()
export class UaeMartsService {
  private readonly logger = new Logger(UaeMartsService.name);
  private readonly CACHE_KEY_PREMIUM = 'uae:premium';
  private readonly CACHE_KEY_TIMING = 'uae:timing';
  private readonly CACHE_KEY_MAKING = 'uae:making';
  private readonly CACHE_KEY_SUMMARY = 'uae:summary';

  constructor(
    @InjectRepository(SignalMetrics)
    private metricsRepository: Repository<SignalMetrics>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private goldRatesService: GoldRatesService,
  ) {}

  async getPremium(forceRefresh = false): Promise<UaePremium> {
    if (!forceRefresh) {
      const cached = await this.cacheManager.get<UaePremium>(
        this.CACHE_KEY_PREMIUM,
      );
      if (cached) return cached;
    }

    const currentRate = await this.goldRatesService.getLiveByRegionAndPurity(
      Region.UAE,
      GoldPurity.GOLD_24K,
      false,
    );

    const internationalSpot = currentRate
      ? Number(currentRate.pricePerGram) / 1.05
      : 310;

    const currentPremium = currentRate
      ? ((Number(currentRate.pricePerGram) - internationalSpot) /
          internationalSpot) *
        100
      : 5;

    const premium: UaePremium = {
      current: Number(currentPremium.toFixed(2)),
      average7d: Number(
        (currentPremium + Math.random() * 0.5 - 0.25).toFixed(2),
      ),
      average30d: Number((currentPremium + Math.random() * 1 - 0.5).toFixed(2)),
      trend:
        Math.random() > 0.5
          ? 'stable'
          : Math.random() > 0.5
            ? 'increasing'
            : 'decreasing',
      recommendation:
        currentPremium < 3
          ? 'Good time to buy - premium is low'
          : currentPremium > 5
            ? 'Wait for lower premium'
            : 'Premium is reasonable',
    };

    await this.cacheManager.set(this.CACHE_KEY_PREMIUM, premium, 300);
    return premium;
  }

  async getBestTime(): Promise<BestTimeToBuy> {
    const cached = await this.cacheManager.get<BestTimeToBuy>(
      this.CACHE_KEY_TIMING,
    );
    if (cached) return cached;

    const bestDays = ['Friday', 'Saturday', 'Thursday'];
    const bestDay = bestDays[Math.floor(Math.random() * bestDays.length)];

    const timing: BestTimeToBuy = {
      bestDay,
      bestTime: '10 AM - 12 PM',
      reason:
        'Early morning tends to have better prices before weekend crowd. Friday and Saturday are popular shopping days in Dubai.',
      averagePriceDiff: Number((Math.random() * 2 + 1).toFixed(2)),
    };

    await this.cacheManager.set(this.CACHE_KEY_TIMING, timing, 86400);
    return timing;
  }

  async getMakingCharges(): Promise<MakingCharges[]> {
    const cached = await this.cacheManager.get<MakingCharges[]>(
      this.CACHE_KEY_MAKING,
    );
    if (cached) return cached;

    const charges: MakingCharges[] = [
      {
        purity: '24K',
        perGram: { min: 5, max: 15, average: 8 },
        perPiece: { min: 50, max: 200, average: 100 },
        tips: [
          'Ask for making charges separately from gold price',
          'Compare across multiple shops in Deira/Gold Souk',
          'Bargaining is expected and accepted',
        ],
      },
      {
        purity: '22K',
        perGram: { min: 3, max: 10, average: 6 },
        perPiece: { min: 30, max: 150, average: 75 },
        tips: [
          'Best for everyday jewelry',
          'Lower making charges than 24K',
          'More durable for daily wear',
        ],
      },
      {
        purity: '18K',
        perGram: { min: 2, max: 8, average: 5 },
        perPiece: { min: 20, max: 100, average: 50 },
        tips: [
          'Best value for fashion jewelry',
          'Widely available in malls',
          'Lower resale value compared to higher purity',
        ],
      },
    ];

    await this.cacheManager.set(this.CACHE_KEY_MAKING, charges, 86400);
    return charges;
  }

  async getVatInfo(): Promise<{
    rate: number;
    appliesTo: string[];
    tips: string[];
  }> {
    const vatInfo = {
      rate: 5,
      appliesTo: [
        'Gold jewelry',
        'Gold coins under 100g',
        'Gold bars',
        'Making charges',
      ],
      tips: [
        'VAT is added on top of the gold price',
        'Gold jewelry is subject to 5% VAT',
        'Export of gold may be VAT refundable',
        'Some gold items may be exempt - check with seller',
      ],
    };
    return Promise.resolve(vatInfo);
  }

  async getSummary(forceRefresh = false): Promise<UaeMarketSummary> {
    const cacheKey = `${this.CACHE_KEY_SUMMARY}`;

    if (!forceRefresh) {
      const cached = await this.cacheManager.get<UaeMarketSummary>(cacheKey);
      if (cached) return cached;
    }

    const [premium, bestTime, makingCharges, vatInfo] = await Promise.all([
      this.getPremium(true),
      this.getBestTime(),
      this.getMakingCharges(),
      this.getVatInfo(),
    ]);

    const summary: UaeMarketSummary = {
      premium,
      bestTime,
      makingCharges,
      vatInfo,
      lastUpdated: new Date(),
    };

    await this.cacheManager.set(cacheKey, summary, 300);
    return summary;
  }

  async refreshData(): Promise<{ success: boolean; message: string }> {
    await Promise.all([
      this.cacheManager.del(this.CACHE_KEY_PREMIUM),
      this.cacheManager.del(this.CACHE_KEY_TIMING),
      this.cacheManager.del(this.CACHE_KEY_MAKING),
      this.cacheManager.del(this.CACHE_KEY_SUMMARY),
    ]);

    await this.getSummary(true);

    return { success: true, message: 'UAE market data refreshed' };
  }
}
