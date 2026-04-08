import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GoldRateSchedulerService } from './gold-rate-scheduler.service';
import { MetalApiService } from '../external-api/metal-api.service';
import { MockDataService } from '../external-api/mock-data.service';
import { GoldRatesModule } from '../gold-rates/gold-rates.module';

@Module({
  imports: [ScheduleModule.forRoot(), GoldRatesModule],
  providers: [GoldRateSchedulerService, MetalApiService, MockDataService],
  exports: [GoldRateSchedulerService],
})
export class SchedulerModule {}
