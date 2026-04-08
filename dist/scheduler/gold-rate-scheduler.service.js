"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoldRateSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldRateSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const metal_api_service_1 = require("../external-api/metal-api.service");
const mock_data_service_1 = require("../external-api/mock-data.service");
const gold_rates_service_1 = require("../gold-rates/gold-rates.service");
const config_1 = require("../config");
let GoldRateSchedulerService = GoldRateSchedulerService_1 = class GoldRateSchedulerService {
    metalApiService;
    mockDataService;
    goldRatesService;
    schedulerRegistry;
    logger = new common_1.Logger(GoldRateSchedulerService_1.name);
    isInitialized = false;
    intervalId = null;
    constructor(metalApiService, mockDataService, goldRatesService, schedulerRegistry) {
        this.metalApiService = metalApiService;
        this.mockDataService = mockDataService;
        this.goldRatesService = goldRatesService;
        this.schedulerRegistry = schedulerRegistry;
    }
    onModuleInit() {
        this.logger.log('Gold Rate Scheduler initialized');
        this.isInitialized = true;
        if (config_1.metalApiConfig.updateIntervalMinutes > 0) {
            const intervalMs = config_1.metalApiConfig.updateIntervalMinutes * 60 * 1000;
            this.intervalId = setInterval(() => {
                void this.fetchAndStoreRates();
            }, intervalMs);
            this.schedulerRegistry.addInterval('gold-rate-fetch', this.intervalId);
            this.logger.log(`Scheduled rate updates every ${config_1.metalApiConfig.updateIntervalMinutes} minutes`);
        }
        void this.fetchAndStoreRates();
    }
    onModuleDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.logger.log('Gold Rate Scheduler destroyed');
    }
    handleCron() {
        this.logger.debug('Cron job triggered');
    }
    async fetchAndStoreRates() {
        this.logger.log('Starting rate fetch cycle...');
        try {
            const rates = await this.fetchRates();
            if (rates.length === 0) {
                return { success: false, count: 0, error: 'No rates fetched' };
            }
            const bulkDto = rates.map((rate) => ({
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to fetch and store rates: ${message}`);
            return { success: false, count: 0, error: message };
        }
    }
    async fetchRates() {
        if (!config_1.metalApiConfig.apiKey ||
            config_1.metalApiConfig.apiKey === 'your_metal_api_key_here') {
            this.logger.warn('No Metal-API key configured, using mock data');
            return this.mockDataService.generateRates();
        }
        const result = await this.metalApiService.fetchGoldRates();
        if (!result.success) {
            this.logger.warn(`Metal-API failed, falling back to mock data: ${result.error}`);
            return this.mockDataService.generateRates();
        }
        return this.transformMetalApiRates();
    }
    transformMetalApiRates() {
        return this.mockDataService.generateRates();
    }
};
exports.GoldRateSchedulerService = GoldRateSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GoldRateSchedulerService.prototype, "handleCron", null);
exports.GoldRateSchedulerService = GoldRateSchedulerService = GoldRateSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metal_api_service_1.MetalApiService,
        mock_data_service_1.MockDataService,
        gold_rates_service_1.GoldRatesService,
        schedule_1.SchedulerRegistry])
], GoldRateSchedulerService);
//# sourceMappingURL=gold-rate-scheduler.service.js.map