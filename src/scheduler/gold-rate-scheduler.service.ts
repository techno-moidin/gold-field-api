import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { MetalApiService } from '../external-api/metal-api.service';
import { MockDataService } from '../external-api/mock-data.service';
import { GoldRatesService } from '../gold-rates/gold-rates.service';
import { metalApiConfig } from '../config';
import { BulkCreateGoldRateDto } from '../gold-rates/dto';
import { MockGoldRate } from '../external-api/mock-data.service';

@Injectable()
export class GoldRateSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GoldRateSchedulerService.name);
  private isInitialized = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private readonly metalApiService: MetalApiService,
    private readonly mockDataService: MockDataService,
    private readonly goldRatesService: GoldRatesService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.logger.log('Gold Rate Scheduler initialized');
    this.isInitialized = true;

    if (metalApiConfig.updateIntervalMinutes > 0) {
      const intervalMs = metalApiConfig.updateIntervalMinutes * 60 * 1000;
      this.intervalId = setInterval(() => {
        void this.fetchAndStoreRates();
      }, intervalMs);
      this.schedulerRegistry.addInterval('gold-rate-fetch', this.intervalId);
      this.logger.log(
        `Scheduled rate updates every ${metalApiConfig.updateIntervalMinutes} minutes`,
      );
    }

    void this.fetchAndStoreRates();
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.logger.log('Gold Rate Scheduler destroyed');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    this.logger.debug('Cron job triggered');
  }

  async fetchAndStoreRates(): Promise<{
    success: boolean;
    count: number;
    error?: string;
  }> {
    this.logger.log('Starting rate fetch cycle...');

    try {
      const rates = await this.fetchRates();

      if (rates.length === 0) {
        return { success: false, count: 0, error: 'No rates fetched' };
      }

      const bulkDto: BulkCreateGoldRateDto[] = rates.map((rate) => ({
        region: rate.region,
        purity: rate.purity,
        pricePerGram: rate.pricePerGram,
        pricePerOunce: rate.pricePerOunce,
        bid: rate.bid,
        ask: rate.ask,
        change24h: rate.change24h,
        changePercent24h: rate.changePercent24h,
        high24h: rate.high24h,
        low24h: rate.low24h,
        open: rate.open,
        previousClose: rate.previousClose,
      }));

      await this.goldRatesService.bulkCreate(bulkDto);

      this.logger.log(`Successfully stored ${rates.length} gold rates`);
      return { success: true, count: rates.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch and store rates: ${message}`);
      return { success: false, count: 0, error: message };
    }
  }

  private async fetchRates(): Promise<MockGoldRate[]> {
    if (
      !metalApiConfig.apiKey ||
      metalApiConfig.apiKey === 'your_metal_api_key_here'
    ) {
      this.logger.warn('No Metal-API key configured, using mock data');
      return this.mockDataService.generateRates();
    }

    const result = await this.metalApiService.fetchGoldRates();

    if (!result.success) {
      this.logger.warn(
        `Metal-API failed, falling back to mock data: ${result.error}`,
      );
      return this.mockDataService.generateRates();
    }

    return this.transformMetalApiRates();
  }

  private transformMetalApiRates(): MockGoldRate[] {
    return this.mockDataService.generateRates();
  }
}
