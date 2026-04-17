import { Module } from '@nestjs/common';
import { DailyAlertScheduler } from './daily-alert-scheduler.service';
import { AlertsModule } from '../alerts/alerts.module';
import { SignalsModule } from '../signals/signals.module';

@Module({
  imports: [AlertsModule, SignalsModule],
  providers: [DailyAlertScheduler],
  exports: [DailyAlertScheduler],
})
export class DailyAlertSchedulerModule {}
