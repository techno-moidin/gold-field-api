"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MockDataService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDataService = void 0;
const common_1 = require("@nestjs/common");
const gold_rate_enums_1 = require("../gold-rates/enums/gold-rate.enums");
let MockDataService = MockDataService_1 = class MockDataService {
    logger = new common_1.Logger(MockDataService_1.name);
    baseRates = {
        [gold_rate_enums_1.Currency.USD]: 85.5,
        [gold_rate_enums_1.Currency.INR]: 7100.0,
        [gold_rate_enums_1.Currency.AED]: 314.0,
        [gold_rate_enums_1.Currency.SAR]: 321.0,
        [gold_rate_enums_1.Currency.GBP]: 68.0,
        [gold_rate_enums_1.Currency.EUR]: 78.5,
    };
    purityMultipliers = {
        [gold_rate_enums_1.GoldPurity.GOLD_24K]: 1.0,
        [gold_rate_enums_1.GoldPurity.GOLD_22K]: 0.9167,
        [gold_rate_enums_1.GoldPurity.GOLD_18K]: 0.75,
    };
    generateRates() {
        const rates = [];
        const now = new Date();
        const basePrice = this.baseRates[gold_rate_enums_1.Currency.USD];
        const variation = (Math.random() - 0.5) * 0.5;
        const currentPrice = basePrice + variation;
        for (const region of Object.values(gold_rate_enums_1.Region)) {
            const currency = gold_rate_enums_1.REGION_CURRENCY_MAP[region];
            const regionalBase = this.baseRates[currency] ||
                currentPrice * this.getExchangeRate(currency);
            const regionalVariation = (Math.random() - 0.5) * (regionalBase * 0.01);
            const pricePerGram = regionalBase + regionalVariation;
            for (const purity of Object.values(gold_rate_enums_1.GoldPurity)) {
                const purityPrice = pricePerGram * this.purityMultipliers[purity];
                const spread = purityPrice * 0.002;
                const change24h = (Math.random() - 0.5) * 2;
                const changePercent24h = (change24h / purityPrice) * 100;
                rates.push({
                    region,
                    currency,
                    purity,
                    pricePerGram: Number(purityPrice.toFixed(2)),
                    pricePerOunce: Number((purityPrice * 31.1035).toFixed(2)),
                    bid: Number((purityPrice - spread).toFixed(2)),
                    ask: Number((purityPrice + spread).toFixed(2)),
                    change24h: Number(change24h.toFixed(2)),
                    changePercent24h: Number(changePercent24h.toFixed(2)),
                    high24h: Number((purityPrice * 1.005).toFixed(2)),
                    low24h: Number((purityPrice * 0.995).toFixed(2)),
                    open: Number((purityPrice - change24h).toFixed(2)),
                    previousClose: Number((purityPrice - change24h).toFixed(2)),
                    timestamp: now,
                });
            }
        }
        return rates;
    }
    getExchangeRate(currency) {
        const rates = {
            [gold_rate_enums_1.Currency.USD]: 1,
            [gold_rate_enums_1.Currency.INR]: 83.5,
            [gold_rate_enums_1.Currency.AED]: 3.67,
            [gold_rate_enums_1.Currency.SAR]: 3.75,
            [gold_rate_enums_1.Currency.GBP]: 0.79,
            [gold_rate_enums_1.Currency.EUR]: 0.92,
        };
        return rates[currency] || 1;
    }
};
exports.MockDataService = MockDataService;
exports.MockDataService = MockDataService = MockDataService_1 = __decorate([
    (0, common_1.Injectable)()
], MockDataService);
//# sourceMappingURL=mock-data.service.js.map