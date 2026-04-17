import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GoldRate } from '../gold-rates/entities/gold-rate.entity';
import { Region, GoldPurity } from '../gold-rates/enums/gold-rate.enums';

export enum SignalType {
  BUY = 'BUY',
  WAIT = 'WAIT',
  AVOID = 'AVOID',
}

export enum SignalConfidence {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface SignalResponse {
  date: string;
  signal: SignalType;
  confidence: SignalConfidence;
  reasoning: string;
  metrics: SignalMetrics;
  disclaimer: string;
  lastUpdated: Date;
}

export interface SignalMetrics {
  price24k: number;
  change24h: number;
  changePercent24h: number;
  trend7d: number;
  trend30d: number;
  localPremium: number;
}

export interface SignalHistoryItem {
  date: string;
  signal: SignalType;
  confidence: SignalConfidence;
  reasoning: string;
}

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);
  private readonly CACHE_KEY_TODAY = 'signal:today';
  private readonly CACHE_KEY_HISTORY = 'signal:history';

  constructor(
    @InjectRepository(GoldRate)
    private goldRatesRepository: Repository<GoldRate>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getTodaySignal(forceRefresh = false): Promise<SignalResponse> {
    if (!forceRefresh) {
      const cached = await this.cacheManager.get<SignalResponse>(
        this.CACHE_KEY_TODAY,
      );
      if (cached) {
        return cached;
      }
    }

    const signal = await this.generateSignal();
    await this.cacheManager.set(this.CACHE_KEY_TODAY, signal, 3600);
    return signal;
  }

  async getSignalHistory(
    days = 30,
  ): Promise<{ data: SignalHistoryItem[]; total: number }> {
    const cacheKey = `${this.CACHE_KEY_HISTORY}:${days}`;
    const cached = await this.cacheManager.get<{
      data: SignalHistoryItem[];
      total: number;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rates = await this.goldRatesRepository.find({
      where: {
        region: Region.UAE,
        purity: GoldPurity.GOLD_24K,
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
    });

    const signalHistory: SignalHistoryItem[] = [];
    const dailyPrices: Map<string, number> = new Map();

    for (const rate of rates) {
      const dateKey = rate.timestamp.toISOString().split('T')[0];
      if (!dailyPrices.has(dateKey)) {
        dailyPrices.set(dateKey, Number(rate.pricePerGram));
      }
    }

    const sortedDays = Array.from(dailyPrices.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, days);

    for (let i = 0; i < sortedDays.length; i++) {
      const [date, price] = sortedDays[i];
      const signal = this.calculateSignalForPrice(price, sortedDays, i);
      signalHistory.push({
        date,
        signal: signal.type,
        confidence: signal.confidence,
        reasoning: signal.reasoning,
      });
    }

    const result = { data: signalHistory, total: signalHistory.length };
    await this.cacheManager.set(cacheKey, result, 86400);
    return result;
  }

  private async generateSignal(): Promise<SignalResponse> {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const todayRates = await this.goldRatesRepository.find({
      where: {
        region: Region.UAE,
        purity: GoldPurity.GOLD_24K,
        timestamp: MoreThanOrEqual(todayStart),
      },
      order: { timestamp: 'DESC' },
      take: 1,
    });

    const weekRates = await this.goldRatesRepository.find({
      where: {
        region: Region.UAE,
        purity: GoldPurity.GOLD_24K,
        timestamp: Between(weekStart, todayStart),
      },
      order: { timestamp: 'ASC' },
    });

    const monthRates = await this.goldRatesRepository.find({
      where: {
        region: Region.UAE,
        purity: GoldPurity.GOLD_24K,
        timestamp: Between(monthStart, todayStart),
      },
      order: { timestamp: 'ASC' },
    });

    if (todayRates.length === 0 || weekRates.length === 0) {
      return this.createDefaultSignal('Insufficient data to generate signal');
    }

    const currentPrice = Number(todayRates[0].pricePerGram);
    const change24h = todayRates[0].change24h
      ? Number(todayRates[0].change24h)
      : 0;
    const changePercent24h = todayRates[0].changePercent24h
      ? Number(todayRates[0].changePercent24h)
      : 0;

    const weekPrices = weekRates.map((r) => Number(r.pricePerGram));
    const weekStartPrice = weekPrices[0] || currentPrice;
    const weekEndPrice = weekPrices[weekPrices.length - 1] || currentPrice;
    const weekTrend = ((weekEndPrice - weekStartPrice) / weekStartPrice) * 100;

    const monthPrices = monthRates.map((r) => Number(r.pricePerGram));
    const monthStartPrice = monthPrices[0] || currentPrice;
    const monthEndPrice = monthPrices[monthPrices.length - 1] || currentPrice;
    const monthTrend =
      ((monthEndPrice - monthStartPrice) / monthStartPrice) * 100;

    const localPremium = this.estimateLocalPremium(currentPrice);

    const signal = this.determineSignal(
      currentPrice,
      change24h,
      changePercent24h,
      weekTrend,
      monthTrend,
      localPremium,
    );

    const metrics: SignalMetrics = {
      price24k: currentPrice,
      change24h,
      changePercent24h,
      trend7d: Number(weekTrend.toFixed(2)),
      trend30d: Number(monthTrend.toFixed(2)),
      localPremium,
    };

    return {
      date: new Date().toISOString().split('T')[0],
      signal: signal.type,
      confidence: signal.confidence,
      reasoning: signal.reasoning,
      metrics,
      disclaimer:
        'This signal is for informational purposes only and does not constitute financial advice. Always consult a qualified financial advisor before making investment decisions.',
      lastUpdated: new Date(),
    };
  }

  private determineSignal(
    price: number,
    change24h: number,
    changePercent24h: number,
    weekTrend: number,
    monthTrend: number,
    localPremium: number,
  ): { type: SignalType; confidence: SignalConfidence; reasoning: string } {
    let buyScore = 0;
    let avoidScore = 0;

    if (changePercent24h < -1) {
      buyScore += 2;
      avoidScore -= 1;
    } else if (changePercent24h > 2) {
      avoidScore += 2;
      buyScore -= 1;
    }

    if (weekTrend < -2) {
      buyScore += 2;
    } else if (weekTrend > 2) {
      avoidScore += 1;
    }

    if (monthTrend < -5) {
      buyScore += 2;
    } else if (monthTrend > 5) {
      avoidScore += 2;
    }

    if (localPremium < 2) {
      buyScore += 1;
    } else if (localPremium > 5) {
      avoidScore += 1;
    }

    if (Math.abs(changePercent24h) > 5) {
      return {
        type: SignalType.WAIT,
        confidence: SignalConfidence.HIGH,
        reasoning:
          'Extreme price volatility detected (>5%). Waiting for stabilization.',
      };
    }

    const isWeekend = new Date().getDay() === 5 || new Date().getDay() === 6;
    if (isWeekend) {
      return {
        type: SignalType.WAIT,
        confidence: SignalConfidence.MEDIUM,
        reasoning: 'Weekend - using Friday signal. Markets closed.',
      };
    }

    if (buyScore >= 3 && buyScore > avoidScore) {
      const confidence =
        buyScore >= 4
          ? SignalConfidence.HIGH
          : buyScore >= 3
            ? SignalConfidence.MEDIUM
            : SignalConfidence.LOW;
      return {
        type: SignalType.BUY,
        confidence,
        reasoning: this.generateBuyReasoning(
          changePercent24h,
          weekTrend,
          localPremium,
        ),
      };
    } else if (avoidScore >= 2 && avoidScore > buyScore) {
      return {
        type: SignalType.AVOID,
        confidence:
          avoidScore >= 3 ? SignalConfidence.HIGH : SignalConfidence.MEDIUM,
        reasoning: this.generateAvoidReasoning(
          changePercent24h,
          weekTrend,
          localPremium,
        ),
      };
    } else {
      return {
        type: SignalType.WAIT,
        confidence: SignalConfidence.MEDIUM,
        reasoning:
          'Mixed indicators. No clear buy or sell signal. Consider waiting for clearer direction.',
      };
    }
  }

  private generateBuyReasoning(
    change24h: number,
    weekTrend: number,
    premium: number,
  ): string {
    const reasons: string[] = [];

    if (change24h < 0) {
      reasons.push('Price dropped today, potential entry point');
    }
    if (weekTrend < 0) {
      reasons.push('Weekly trend is down, buying at relatively lower price');
    }
    if (premium < 3) {
      reasons.push('Local market premium is reasonable');
    }
    if (reasons.length === 0) {
      reasons.push('Multiple positive indicators detected');
    }
    return reasons.join('. ') + '.';
  }

  private generateAvoidReasoning(
    change24h: number,
    weekTrend: number,
    premium: number,
  ): string {
    const reasons: string[] = [];

    if (change24h > 0) {
      reasons.push('Price increased significantly today');
    }
    if (weekTrend > 2) {
      reasons.push('Weekly uptrend suggests possible overvaluation');
    }
    if (premium > 4) {
      reasons.push('Local premium is high compared to international spot');
    }
    if (reasons.length === 0) {
      reasons.push('Multiple indicators suggest waiting');
    }
    return reasons.join('. ') + '.';
  }

  private calculateSignalForPrice(
    price: number,
    allPrices: [string, number][],
    index: number,
  ): { type: SignalType; confidence: SignalConfidence; reasoning: string } {
    if (index >= allPrices.length - 1) {
      return {
        type: SignalType.WAIT,
        confidence: SignalConfidence.LOW,
        reasoning: 'Insufficient data for comparison',
      };
    }

    const nextPrice = allPrices[index + 1][1];
    const changePercent = ((price - nextPrice) / nextPrice) * 100;

    if (changePercent < -1) {
      return {
        type: SignalType.BUY,
        confidence: SignalConfidence.LOW,
        reasoning: `Price dropped ${changePercent.toFixed(1)}% from previous day`,
      };
    } else if (changePercent > 1.5) {
      return {
        type: SignalType.AVOID,
        confidence: SignalConfidence.LOW,
        reasoning: `Price increased ${changePercent.toFixed(1)}% from previous day`,
      };
    }

    return {
      type: SignalType.WAIT,
      confidence: SignalConfidence.LOW,
      reasoning: 'Price remained stable',
    };
  }

  private estimateLocalPremium(currentPrice: number): number {
    const internationalSpot = currentPrice / 1.05;
    const premium =
      ((currentPrice - internationalSpot) / internationalSpot) * 100;
    return Number(premium.toFixed(2));
  }

  private createDefaultSignal(reason: string): SignalResponse {
    return {
      date: new Date().toISOString().split('T')[0],
      signal: SignalType.WAIT,
      confidence: SignalConfidence.LOW,
      reasoning: reason,
      metrics: {
        price24k: 0,
        change24h: 0,
        changePercent24h: 0,
        trend7d: 0,
        trend30d: 0,
        localPremium: 0,
      },
      disclaimer:
        'This signal is for informational purposes only and does not constitute financial advice.',
      lastUpdated: new Date(),
    };
  }

  async refreshSignal(): Promise<SignalResponse> {
    await this.cacheManager.del(this.CACHE_KEY_TODAY);
    return this.getTodaySignal(true);
  }
}
