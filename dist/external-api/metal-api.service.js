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
var MetalApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const config_1 = require("../config");
let MetalApiService = MetalApiService_1 = class MetalApiService {
    logger = new common_1.Logger(MetalApiService_1.name);
    client;
    constructor() {
        this.client = axios_1.default.create({
            baseURL: config_1.metalApiConfig.baseUrl,
            timeout: 10000,
            headers: {
                'x-access-key': config_1.metalApiConfig.apiKey,
                'Content-Type': 'application/json',
            },
        });
    }
    async fetchGoldRates() {
        try {
            this.logger.log('Fetching gold rates from Metal-API...');
            const response = await this.client.get('/v1/latest', {
                params: {
                    base: 'USD',
                    metals: 'XAU',
                    currencies: 'USD,INR,AED,SAR,GBP,EUR',
                },
            });
            this.logger.log(`Fetched ${response.data.length} gold rates`);
            return {
                success: true,
                rates: response.data,
            };
        }
        catch (error) {
            const axiosError = error;
            const message = axiosError.response?.data
                ? JSON.stringify(axiosError.response.data)
                : axiosError.message;
            this.logger.error(`Failed to fetch rates: ${message}`);
            return {
                success: false,
                rates: [],
                error: message,
            };
        }
    }
    async fetchRateForRegion(metal, currency) {
        try {
            const response = await this.client.get('/v1/latest', {
                params: {
                    base: currency,
                    metals: metal,
                },
            });
            return response.data[0] || null;
        }
        catch (error) {
            const axiosError = error;
            this.logger.error(`Failed to fetch ${metal}/${currency}: ${axiosError.message}`);
            return null;
        }
    }
};
exports.MetalApiService = MetalApiService;
exports.MetalApiService = MetalApiService = MetalApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetalApiService);
//# sourceMappingURL=metal-api.service.js.map