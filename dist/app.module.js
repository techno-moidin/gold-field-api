"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const gold_rates_module_1 = require("./gold-rates/gold-rates.module");
const scheduler_module_1 = require("./scheduler/scheduler.module");
const signals_module_1 = require("./signals/signals.module");
const alerts_module_1 = require("./alerts/alerts.module");
const uaemarts_module_1 = require("./uaemarts/uaemarts.module");
const affiliate_module_1 = require("./affiliate/affiliate.module");
const daily_alert_scheduler_module_1 = require("./scheduler/daily-alert-scheduler.module");
const content_module_1 = require("./content/content.module");
const config_2 = require("./config");
const gold_rate_entity_1 = require("./gold-rates/entities/gold-rate.entity");
const subscriber_entity_1 = require("./alerts/entities/subscriber.entity");
const signal_metrics_entity_1 = require("./uaemarts/entities/signal-metrics.entity");
const affiliate_partner_entity_1 = require("./affiliate/entities/affiliate-partner.entity");
const affiliate_click_entity_1 = require("./affiliate/entities/affiliate-click.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: config_2.databaseConfig.host,
                port: config_2.databaseConfig.port,
                username: config_2.databaseConfig.username,
                password: config_2.databaseConfig.password,
                database: config_2.databaseConfig.database,
                entities: [
                    gold_rate_entity_1.GoldRate,
                    subscriber_entity_1.Subscriber,
                    signal_metrics_entity_1.SignalMetrics,
                    affiliate_partner_entity_1.AffiliatePartner,
                    affiliate_click_entity_1.AffiliateClick,
                ],
                synchronize: true,
                logging: config_2.databaseConfig.host === 'localhost',
            }),
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                ttl: config_2.redisConfig.ttl * 1000,
                max: 1000,
                store: 'memory',
            }),
            gold_rates_module_1.GoldRatesModule,
            scheduler_module_1.SchedulerModule,
            signals_module_1.SignalsModule,
            alerts_module_1.AlertsModule,
            uaemarts_module_1.UaeMartsModule,
            affiliate_module_1.AffiliateModule,
            daily_alert_scheduler_module_1.DailyAlertSchedulerModule,
            content_module_1.ContentModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map