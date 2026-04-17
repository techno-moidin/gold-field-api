"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldRatesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const gold_rates_service_1 = require("./gold-rates.service");
const gold_rates_controller_1 = require("./gold-rates.controller");
const gold_rate_entity_1 = require("./entities/gold-rate.entity");
let GoldRatesModule = class GoldRatesModule {
};
exports.GoldRatesModule = GoldRatesModule;
exports.GoldRatesModule = GoldRatesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([gold_rate_entity_1.GoldRate])],
        providers: [gold_rates_service_1.GoldRatesService],
        controllers: [gold_rates_controller_1.GoldRatesController],
        exports: [gold_rates_service_1.GoldRatesService],
    })
], GoldRatesModule);
//# sourceMappingURL=gold-rates.module.js.map