import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlertsService } from '../alerts/alerts.service';
import { SignalsService } from '../signals/signals.service';

@Injectable()
export class DailyAlertScheduler implements OnModuleInit {
  private readonly logger = new Logger(DailyAlertScheduler.name);

  constructor(
    private alertsService: AlertsService,
    private signalsService: SignalsService,
  ) {}

  onModuleInit() {
    this.logger.log('Daily Alert Scheduler initialized');
  }

  @Cron('0 9 * * *', { timeZone: 'Asia/Dubai' })
  async handleDailySignal() {
    this.logger.log('Running daily signal alert at 9 AM UAE time');
    await this.sendDailySignal();
  }

  @Cron('0 9 * * 5', { timeZone: 'Asia/Dubai' })
  async handleWeeklySummary() {
    this.logger.log('Running weekly summary alert on Friday 9 AM UAE time');
    await this.sendWeeklySummary();
  }

  async sendDailySignal() {
    try {
      const signal = await this.signalsService.getTodaySignal();

      const result = await this.alertsService.sendSignalAlert({
        signal: signal.signal,
        confidence: signal.confidence,
        reasoning: signal.reasoning,
        price24k: signal.metrics.price24k,
        date: signal.date,
      });

      this.logger.log(`Daily signal sent: ${result.sent} subscribers notified`);
      return result;
    } catch (error) {
      this.logger.error('Failed to send daily signal', error);
      return { sent: 0, failed: 0 };
    }
  }

  async sendWeeklySummary() {
    try {
      const history = await this.signalsService.getSignalHistory(7);

      const buyCount = history.data.filter(
        (s) => String(s.signal) === 'BUY',
      ).length;
      const waitCount = history.data.filter(
        (s) => String(s.signal) === 'WAIT',
      ).length;
      const avoidCount = history.data.filter(
        (s) => String(s.signal) === 'AVOID',
      ).length;

      this.logger.log(
        `Weekly summary: BUY=${buyCount}, WAIT=${waitCount}, AVOID=${avoidCount}`,
      );

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to send weekly summary', error);
      return { success: false };
    }
  }

  @Cron('0 * * * *', { timeZone: 'Asia/Dubai' })
  async handleHourlyCheck() {
    this.logger.debug('Hourly health check');
    return Promise.resolve();
  }
}
