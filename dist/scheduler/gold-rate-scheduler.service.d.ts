import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { MetalApiService } from '../external-api/metal-api.service';
import { MockDataService } from '../external-api/mock-data.service';
import { GoldRatesService } from '../gold-rates/gold-rates.service';
export declare class GoldRateSchedulerService implements OnModuleInit, OnModuleDestroy {
    private readonly metalApiService;
    private readonly mockDataService;
    private readonly goldRatesService;
    private readonly schedulerRegistry;
    private readonly logger;
    private isInitialized;
    private intervalId;
    constructor(metalApiService: MetalApiService, mockDataService: MockDataService, goldRatesService: GoldRatesService, schedulerRegistry: SchedulerRegistry);
    onModuleInit(): void;
    onModuleDestroy(): void;
    handleCron(): void;
    fetchAndStoreRates(): Promise<{
        success: boolean;
        count: number;
        error?: string;
    }>;
    private fetchRates;
    private transformMetalApiRates;
}
