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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldRatesController = void 0;
const common_1 = require("@nestjs/common");
const gold_rates_service_1 = require("./gold-rates.service");
const dto_1 = require("./dto");
const gold_rate_enums_1 = require("./enums/gold-rate.enums");
let GoldRatesController = class GoldRatesController {
    goldRatesService;
    constructor(goldRatesService) {
        this.goldRatesService = goldRatesService;
    }
    create(createGoldRateDto) {
        return this.goldRatesService.create(createGoldRateDto);
    }
    bulkCreate(rates) {
        if (!Array.isArray(rates) || rates.length === 0) {
            throw new common_1.BadRequestException('Rates array is required');
        }
        return this.goldRatesService.bulkCreate(rates);
    }
    async getLiveRates(query) {
        if (query.region && query.purity) {
            const rate = await this.goldRatesService.getLiveByRegionAndPurity(query.region, query.purity);
            if (!rate) {
                throw new common_1.BadRequestException(`No rate found for ${query.region} ${query.purity}`);
            }
            return rate;
        }
        if (query.region) {
            return this.goldRatesService.getLiveByRegion(query.region);
        }
        return this.goldRatesService.getLiveAll();
    }
    async getLiveByRegion(region) {
        return this.goldRatesService.getLiveByRegion(region);
    }
    async getLiveByRegionAndPurity(region, purity) {
        const rate = await this.goldRatesService.getLiveByRegionAndPurity(region, purity);
        if (!rate) {
            throw new common_1.BadRequestException(`No rate found for ${region} ${purity}`);
        }
        return rate;
    }
    async getHistory(query) {
        return this.goldRatesService.getHistory(query);
    }
    async getAggregatedHistory(region, purity, period) {
        if (!['day', 'week', 'month'].includes(period)) {
            throw new common_1.BadRequestException('Period must be: day, week, or month');
        }
        return this.goldRatesService.getAggregatedHistory(region, purity, period);
    }
    async getChartData(query) {
        return this.goldRatesService.getChartData(query);
    }
    async convert(query) {
        return this.goldRatesService.convert(query);
    }
    async refreshRates(query) {
        return this.goldRatesService.refreshRates(query.region, query.purity);
    }
    findAll() {
        return this.goldRatesService.findAll();
    }
};
exports.GoldRatesController = GoldRatesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateGoldRateDto]),
    __metadata("design:returntype", void 0)
], GoldRatesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], GoldRatesController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Get)('live'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LiveRateQueryDto]),
    __metadata("design:returntype", Promise)
], GoldRatesController.prototype, "getLiveRates", null);
__decorate([
    (0, common_1.Get)('live/:region'),
    __param(0, (0, common_1.Param)('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GoldRatesController.prototype, "getLiveByRegion", null);
__decorate([
    (0, common_1.Get)('live/:region/:purity'),
    __param(0, (0, common_1.Param)('region')),
    __param(1, (0, common_1.Param)('purity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GoldRatesController.prototype, "getLiveByRegionAndPurity", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.HistoryQueryDto]),
    __metadata("design:returntype", Promise)
], GoldRatesController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('history/:region/:purity/:period'),
    __param(0, (0, common_1.Param)('region')),
    __param(1, (0, common_1.Param)('purity')),
    __param(2, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GoldRatesController.prototype, "getAggregatedHistory", null);
__decorate([
    (0, common_1.Get)('chart'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ChartQueryDto]),
    __metadata("design:returntype", Promise)
], GoldRatesController.prototype, "getChartData", null);
__decorate([
    (0, common_1.Get)('convert'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ConvertQueryDto]),
    __metadata("design:returntype", Promise)
], GoldRatesController.prototype, "convert", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RefreshRateQueryDto]),
    __metadata("design:returntype", Promise)
], GoldRatesController.prototype, "refreshRates", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GoldRatesController.prototype, "findAll", null);
exports.GoldRatesController = GoldRatesController = __decorate([
    (0, common_1.Controller)('gold-rates'),
    __metadata("design:paramtypes", [gold_rates_service_1.GoldRatesService])
], GoldRatesController);
//# sourceMappingURL=gold-rates.controller.js.map