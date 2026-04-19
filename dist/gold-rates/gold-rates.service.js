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
var GoldRatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldRatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const gold_rate_entity_1 = require("./entities/gold-rate.entity");
const gold_rate_enums_1 = require("./enums/gold-rate.enums");
let GoldRatesService = GoldRatesService_1 = class GoldRatesService {
    goldRatesRepository;
    cacheManager;
    logger = new common_1.Logger(GoldRatesService_1.name);
    CACHE_KEYS = {
        LIVE_ALL: 'gold:live:all',
        LIVE_REGION: 'gold:live:region:',
        LIVE_REGION_PURITY: 'gold:live:region:purity:',
    };
    constructor(goldRatesRepository, cacheManager) {
        this.goldRatesRepository = goldRatesRepository;
        this.cacheManager = cacheManager;
    }
    async create(createGoldRateDto) {
        const rate = this.goldRatesRepository.create({
            ...createGoldRateDto,
            currency: gold_rate_enums_1.REGION_CURRENCY_MAP[createGoldRateDto.region],
            timestamp: new Date(),
        });
        const saved = await this.goldRatesRepository.save(rate);
        await this.invalidateCache(createGoldRateDto.region, createGoldRateDto.purity);
        return saved;
    }
    async bulkCreate(rates) {
        const entities = rates.map((rate) => this.goldRatesRepository.create({
            ...rate,
            currency: gold_rate_enums_1.REGION_CURRENCY_MAP[rate.region],
            timestamp: rate.timestamp ? new Date(rate.timestamp) : new Date(),
        }));
        const saved = await this.goldRatesRepository.save(entities);
        for (const rate of rates) {
            await this.invalidateCache(rate.region, rate.purity);
        }
        return saved;
    }
    async getLiveAll(cached = true) {
        const cacheKey = this.CACHE_KEYS.LIVE_ALL;
        if (cached) {
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                return cached.map((r) => ({ ...r, cached: true }));
            }
        }
        const rates = await this.getLatestRates();
        const response = rates.map((r) => ({ ...r, cached: false }));
        await this.cacheManager.set(cacheKey, response, 60);
        return response;
    }
    async getLiveByRegion(region, cached = true) {
        const cacheKey = `${this.CACHE_KEYS.LIVE_REGION}${region}`;
        if (cached) {
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                return cached.map((r) => ({ ...r, cached: true }));
            }
        }
        const rates = await this.getLatestRates(region);
        const response = rates.map((r) => ({ ...r, cached: false }));
        await this.cacheManager.set(cacheKey, response, 60);
        return response;
    }
    async getLiveByRegionAndPurity(region, purity, cached = true) {
        const cacheKey = `${this.CACHE_KEYS.LIVE_REGION_PURITY}${region}:${purity}`;
        if (cached) {
            const cached = await this.cacheManager.get(cacheKey);
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
        const response = {
            ...rate,
            cached: false,
        };
        await this.cacheManager.set(cacheKey, response, 60);
        return response;
    }
    async getHistory(query) {
        const { region, purity, startDate, endDate, limit = 100, page = 1 } = query;
        const where = {};
        if (region)
            where.region = region;
        if (purity)
            where.purity = purity;
        if (startDate && endDate) {
            where.timestamp = (0, typeorm_2.Between)(new Date(startDate), new Date(endDate));
        }
        else if (startDate) {
            where.timestamp = (0, typeorm_2.MoreThanOrEqual)(new Date(startDate));
        }
        else if (endDate) {
            where.timestamp = (0, typeorm_2.LessThanOrEqual)(new Date(endDate));
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
    async getAggregatedHistory(region, purity, period) {
        const query = `
      SELECT 
        date_trunc('${period}', timestamp) as period,
        AVG(price_per_gram)::numeric as avgPrice,
        MIN(price_per_gram)::numeric as minPrice,
        MAX(price_per_gram)::numeric as maxPrice,
        (SELECT price_per_gram FROM gold_rates r2 
         WHERE date_trunc('${period}', r2.timestamp) = date_trunc('${period}', r1.timestamp) 
         AND r2.region = r1.region AND r2.purity = r1.purity
         ORDER BY r2.timestamp ASC LIMIT 1)::numeric as open,
        (SELECT price_per_gram FROM gold_rates r2 
         WHERE date_trunc('${period}', r2.timestamp) = date_trunc('${period}', r1.timestamp) 
         AND r2.region = r1.region AND r2.purity = r1.purity
         ORDER BY r2.timestamp DESC LIMIT 1)::numeric as close,
        COUNT(*)::integer as tradeCount
      FROM gold_rates r1
      WHERE region = $1 AND purity = $2
      GROUP BY date_trunc('${period}', timestamp)
      ORDER BY period DESC
      LIMIT 100
    `;
        return this.goldRatesRepository.query(query, [region, purity]);
    }
    async getChartData(query) {
        const { region, purity, interval = 60 } = query;
        const since = new Date();
        since.setMinutes(since.getMinutes() - interval);
        const where = {
            timestamp: (0, typeorm_2.MoreThanOrEqual)(since),
        };
        if (region)
            where.region = region;
        if (purity)
            where.purity = purity;
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
    async convert(query) {
        const { amount, fromRegion, toRegion } = query;
        const fromRate = await this.getLiveByRegionAndPurity(fromRegion, gold_rate_enums_1.GoldPurity.GOLD_24K, false);
        const toRate = await this.getLiveByRegionAndPurity(toRegion, gold_rate_enums_1.GoldPurity.GOLD_24K, false);
        if (!fromRate || !toRate) {
            const fromCurrency = gold_rate_enums_1.REGION_CURRENCY_MAP[fromRegion];
            const toCurrency = gold_rate_enums_1.REGION_CURRENCY_MAP[toRegion];
            const exchangeRates = {
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
    async refreshRates(region, purity) {
        this.logger.log(`Refreshing rates for region: ${region}, purity: ${purity}`);
        await this.cacheManager.del(this.CACHE_KEYS.LIVE_ALL);
        if (region) {
            await this.cacheManager.del(`${this.CACHE_KEYS.LIVE_REGION}${region}`);
            if (purity) {
                await this.cacheManager.del(`${this.CACHE_KEYS.LIVE_REGION_PURITY}${region}:${purity}`);
            }
        }
        return {
            success: true,
            message: 'Cache invalidated successfully',
            refreshed: 1,
        };
    }
    async getLatestRates(region, purity) {
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
            .from(gold_rate_entity_1.GoldRate, 'rate_inner')
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
    async invalidateCache(region, purity) {
        await Promise.all([
            this.cacheManager.del(this.CACHE_KEYS.LIVE_ALL),
            this.cacheManager.del(`${this.CACHE_KEYS.LIVE_REGION}${region}`),
            this.cacheManager.del(`${this.CACHE_KEYS.LIVE_REGION_PURITY}${region}:${purity}`),
        ]);
    }
    async findAll() {
        return this.goldRatesRepository.find({
            order: { timestamp: 'DESC' },
            take: 100,
        });
    }
};
exports.GoldRatesService = GoldRatesService;
exports.GoldRatesService = GoldRatesService = GoldRatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gold_rate_entity_1.GoldRate)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], GoldRatesService);
//# sourceMappingURL=gold-rates.service.js.map