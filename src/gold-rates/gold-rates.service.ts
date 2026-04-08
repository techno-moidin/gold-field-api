import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GoldRate } from './entities/gold-rate.entity';
import {
  CreateGoldRateDto,
  BulkCreateGoldRateDto,
  HistoryQueryDto,
  ChartQueryDto,
  ConvertQueryDto,
} from './dto';
import {
  Region,
  Currency,
  GoldPurity,
  REGION_CURRENCY_MAP,
} from './enums/gold-rate.enums';

export interface LiveRateResponse {
  region: Region;
  currency: Currency;
  purity: GoldPurity;
  pricePerGram: number;
  pricePerOunce: number;
  bid: number;
  ask: number;
  change24h: number | null;
  changePercent24h: number | null;
  high24h: number | null;
  low24h: number | null;
  timestamp: Date;
  cached: boolean;
}

export interface HistoryResponse {
  data: GoldRate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChartDataPoint {
  timestamp: Date;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ConversionResponse {
  fromAmount: number;
  fromRegion: Region;
  fromCurrency: Currency;
  toRegion: Region;
  toCurrency: Currency;
  convertedAmount: number;
  rate: number;
}

@Injectable()
export class GoldRatesService {
  private readonly logger = new Logger(GoldRatesService.name);
  private readonly CACHE_KEYS = {
    LIVE_ALL: 'gold:live:all',
    LIVE_REGION: 'gold:live:region:',
    LIVE_REGION_PURITY: 'gold:live:region:purity:',
  };

  constructor(
    @InjectRepository(GoldRate)
    private goldRatesRepository: Repository<GoldRate>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createGoldRateDto: CreateGoldRateDto): Promise<GoldRate> {
    const rate = this.goldRatesRepository.create({
      ...createGoldRateDto,
      currency: REGION_CURRENCY_MAP[createGoldRateDto.region],
      timestamp: new Date(),
    });
    const saved = await this.goldRatesRepository.save(rate);
    await this.invalidateCache(
      createGoldRateDto.region,
      createGoldRateDto.purity,
    );
    return saved;
  }

  async bulkCreate(rates: BulkCreateGoldRateDto[]): Promise<GoldRate[]> {
    const entities = rates.map((rate) =>
      this.goldRatesRepository.create({
        ...rate,
        currency: REGION_CURRENCY_MAP[rate.region],
        timestamp: rate.timestamp ? new Date(rate.timestamp) : new Date(),
      }),
    );
    const saved = await this.goldRatesRepository.save(entities);
    for (const rate of rates) {
      await this.invalidateCache(rate.region, rate.purity);
    }
    return saved;
  }

  async getLiveAll(cached = true): Promise<LiveRateResponse[]> {
    const cacheKey = this.CACHE_KEYS.LIVE_ALL;

    if (cached) {
      const cached = await this.cacheManager.get<LiveRateResponse[]>(cacheKey);
      if (cached) {
        return cached.map((r) => ({ ...r, cached: true }));
      }
    }

    const rates = await this.getLatestRates();
    const response = rates.map((r) => ({ ...r, cached: false }));

    await this.cacheManager.set(cacheKey, response, 60);
    return response;
  }

  async getLiveByRegion(
    region: Region,
    cached = true,
  ): Promise<LiveRateResponse[]> {
    const cacheKey = `${this.CACHE_KEYS.LIVE_REGION}${region}`;

    if (cached) {
      const cached = await this.cacheManager.get<LiveRateResponse[]>(cacheKey);
      if (cached) {
        return cached.map((r) => ({ ...r, cached: true }));
      }
    }

    const rates = await this.getLatestRates(region);
    const response = rates.map((r) => ({ ...r, cached: false }));

    await this.cacheManager.set(cacheKey, response, 60);
    return response;
  }

  async getLiveByRegionAndPurity(
    region: Region,
    purity: GoldPurity,
    cached = true,
  ): Promise<LiveRateResponse | null> {
    const cacheKey = `${this.CACHE_KEYS.LIVE_REGION_PURITY}${region}:${purity}`;

    if (cached) {
      const cached = await this.cacheManager.get<LiveRateResponse>(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }
    }

    const rate = await this.goldRatesRepository.findOne({
      where: { region, purity, isActive: true },
      order: { timestamp: 'DESC' },
    });

    if (!rate) {
      return null;
    }

    const response: LiveRateResponse = {
      ...rate,
      cached: false,
    };

    await this.cacheManager.set(cacheKey, response, 60);
    return response;
  }

  async getHistory(query: HistoryQueryDto): Promise<HistoryResponse> {
    const { region, purity, startDate, endDate, limit = 100, page = 1 } = query;

    const where: Record<string, unknown> = {};
    if (region) where.region = region;
    if (purity) where.purity = purity;
    if (startDate && endDate) {
      where.timestamp = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.timestamp = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.timestamp = LessThanOrEqual(new Date(endDate));
    }

    const [data, total] = await this.goldRatesRepository.findAndCount({
      where,
      order: { timestamp: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAggregatedHistory(
    region: Region,
    purity: GoldPurity,
    period: 'day' | 'week' | 'month',
  ): Promise<
    Array<{
      period: Date;
      avgPrice: number;
      minPrice: number;
      maxPrice: number;
      open: number;
      close: number;
      tradeCount: number;
    }>
  > {
    const query = `
      SELECT 
        date_trunc('${period}', timestamp) as period,
        AVG(price_per_gram)::numeric as avgPrice,
        MIN(price_per_gram)::numeric as minPrice,
        MAX(price_per_gram)::numeric as maxPrice,
        FIRST_VALUE(price_per_gram) OVER (ORDER BY date_trunc('${period}', timestamp) ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING)::numeric as open,
        LAST_VALUE(price_per_gram) OVER (ORDER BY date_trunc('${period}', timestamp) ROWS BETWEEN 1 FOLLOWING AND 1 FOLLOWING)::numeric as close,
        COUNT(*)::integer as tradeCount
      FROM gold_rates
      WHERE region = $1 AND purity = $2
      GROUP BY period
      ORDER BY period DESC
      LIMIT 100
    `;

    return this.goldRatesRepository.query(query, [region, purity]);
  }

  async getChartData(query: ChartQueryDto): Promise<ChartDataPoint[]> {
    const { region, purity, interval = 60 } = query;

    const since = new Date();
    since.setMinutes(since.getMinutes() - interval);

    const where: Record<string, unknown> = {
      timestamp: MoreThanOrEqual(since),
    };
    if (region) where.region = region;
    if (purity) where.purity = purity;

    const rates = await this.goldRatesRepository.find({
      where,
      order: { timestamp: 'ASC' },
    });

    return rates.map((r) => ({
      timestamp: r.timestamp,
      price: Number(r.pricePerGram),
      open: Number(r.open ?? r.pricePerGram),
      high: Number(r.high24h ?? r.pricePerGram),
      low: Number(r.low24h ?? r.pricePerGram),
      close: Number(r.pricePerGram),
    }));
  }

  async convert(query: ConvertQueryDto): Promise<ConversionResponse> {
    const { amount, fromRegion, toRegion } = query;

    const fromRate = await this.getLiveByRegionAndPurity(
      fromRegion,
      GoldPurity.GOLD_24K,
      false,
    );
    const toRate = await this.getLiveByRegionAndPurity(
      toRegion,
      GoldPurity.GOLD_24K,
      false,
    );

    if (!fromRate || !toRate) {
      const fromCurrency = REGION_CURRENCY_MAP[fromRegion];
      const toCurrency = REGION_CURRENCY_MAP[toRegion];
      const exchangeRates: Record<string, number> = {
        USD: 1,
        INR: 83.5,
        AED: 3.67,
        SAR: 3.75,
        GBP: 0.79,
        EUR: 0.92,
      };
      const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      return {
        fromAmount: amount,
        fromRegion,
        fromCurrency,
        toRegion,
        toCurrency,
        convertedAmount: amount * rate,
        rate,
      };
    }

    const usdPerGram = amount / fromRate.pricePerGram;
    const convertedAmount = usdPerGram * toRate.pricePerGram;
    const rate = toRate.pricePerGram / fromRate.pricePerGram;

    return {
      fromAmount: amount,
      fromRegion,
      fromCurrency: fromRate.currency,
      toRegion,
      toCurrency: toRate.currency,
      convertedAmount,
      rate,
    };
  }

  async refreshRates(
    region?: Region,
    purity?: GoldPurity,
  ): Promise<{ success: boolean; message: string; refreshed: number }> {
    this.logger.log(
      `Refreshing rates for region: ${region}, purity: ${purity}`,
    );

    await this.cacheManager.del(this.CACHE_KEYS.LIVE_ALL);
    if (region) {
      await this.cacheManager.del(`${this.CACHE_KEYS.LIVE_REGION}${region}`);
      if (purity) {
        await this.cacheManager.del(
          `${this.CACHE_KEYS.LIVE_REGION_PURITY}${region}:${purity}`,
        );
      }
    }

    return {
      success: true,
      message: 'Cache invalidated successfully',
      refreshed: 1,
    };
  }

  private async getLatestRates(
    region?: Region,
    purity?: GoldPurity,
  ): Promise<Omit<LiveRateResponse, 'cached'>[]> {
    const queryBuilder = this.goldRatesRepository
      .createQueryBuilder('rate')
      .where('rate.isActive = :isActive', { isActive: true });

    if (region) {
      queryBuilder.andWhere('rate.region = :region', { region });
    }
    if (purity) {
      queryBuilder.andWhere('rate.purity = :purity', { purity });
    }

    const subQuery = queryBuilder
      .subQuery()
      .select('MAX(rate_inner.timestamp)')
      .from(GoldRate, 'rate_inner')
      .where('rate_inner.region = rate.region')
      .andWhere('rate_inner.purity = rate.purity')
      .getQuery();

    queryBuilder.andWhere(`rate.timestamp = (${subQuery})`);
    queryBuilder.orderBy('rate.region', 'ASC').addOrderBy('rate.purity', 'ASC');

    const rates = await queryBuilder.getMany();

    return rates.map((r) => ({
      region: r.region,
      currency: r.currency,
      purity: r.purity,
      pricePerGram: Number(r.pricePerGram),
      pricePerOunce: Number(r.pricePerOunce),
      bid: Number(r.bid),
      ask: Number(r.ask),
      change24h: r.change24h ? Number(r.change24h) : null,
      changePercent24h: r.changePercent24h ? Number(r.changePercent24h) : null,
      high24h: r.high24h ? Number(r.high24h) : null,
      low24h: r.low24h ? Number(r.low24h) : null,
      timestamp: r.timestamp,
    }));
  }

  private async invalidateCache(
    region: Region,
    purity: GoldPurity,
  ): Promise<void> {
    await Promise.all([
      this.cacheManager.del(this.CACHE_KEYS.LIVE_ALL),
      this.cacheManager.del(`${this.CACHE_KEYS.LIVE_REGION}${region}`),
      this.cacheManager.del(
        `${this.CACHE_KEYS.LIVE_REGION_PURITY}${region}:${purity}`,
      ),
    ]);
  }

  async findAll(): Promise<GoldRate[]> {
    return this.goldRatesRepository.find({
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }
}
