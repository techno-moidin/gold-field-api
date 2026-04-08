"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const gold_rate_scheduler_service_1 = require("./gold-rate-scheduler.service");
const metal_api_service_1 = require("../external-api/metal-api.service");
const mock_data_service_1 = require("../external-api/mock-data.service");
const gold_rates_module_1 = require("../gold-rates/gold-rates.module");
let SchedulerModule = class SchedulerModule {
};
exports.SchedulerModule = SchedulerModule;
exports.SchedulerModule = SchedulerModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot(), gold_rates_module_1.GoldRatesModule],
        providers: [gold_rate_scheduler_service_1.GoldRateSchedulerService, metal_api_service_1.MetalApiService, mock_data_service_1.MockDataService],
        exports: [gold_rate_scheduler_service_1.GoldRateSchedulerService],
    })
], SchedulerModule);
//# sourceMappingURL=scheduler.module.js.map