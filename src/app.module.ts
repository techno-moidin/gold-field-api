import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoldRatesModule } from './gold-rates/gold-rates.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SignalsModule } from './signals/signals.module';
import { AlertsModule } from './alerts/alerts.module';
import { UaeMartsModule } from './uaemarts/uaemarts.module';
import { AffiliateModule } from './affiliate/affiliate.module';
import { DailyAlertSchedulerModule } from './scheduler/daily-alert-scheduler.module';
import { databaseConfig, redisConfig } from './config';
import { GoldRate } from './gold-rates/entities/gold-rate.entity';
import { Subscriber } from './alerts/entities/subscriber.entity';
import { SignalMetrics } from './uaemarts/entities/signal-metrics.entity';
import { AffiliatePartner } from './affiliate/entities/affiliate-partner.entity';
import { AffiliateClick } from './affiliate/entities/affiliate-click.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      entities: [
        GoldRate,
        Subscriber,
        SignalMetrics,
        AffiliatePartner,
        AffiliateClick,
      ],
      synchronize: true,
      logging: databaseConfig.host === 'localhost',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: redisConfig.ttl * 1000,
      max: 1000,
      store: 'memory',
    }),
    GoldRatesModule,
    SchedulerModule,
    SignalsModule,
    AlertsModule,
    UaeMartsModule,
    AffiliateModule,
    DailyAlertSchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
