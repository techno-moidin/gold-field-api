import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertFrequency } from './entities/subscriber.entity';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('subscribe')
  async subscribe(
    @Body()
    body: {
      telegramId?: string;
      telegramUsername?: string;
      whatsappPhone?: string;
      region?: string;
      purity?: string;
      frequency?: AlertFrequency;
    },
  ) {
    return this.alertsService.subscribe({
      telegramId: body.telegramId,
      telegramUsername: body.telegramUsername,
      whatsappPhone: body.whatsappPhone,
      region: body.region,
      purity: body.purity,
      frequency: body.frequency,
    });
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() body: { identifier: string }) {
    return this.alertsService.unsubscribe(body.identifier);
  }

  @Get('status')
  async getStatus(@Query('identifier') identifier: string) {
    const status = await this.alertsService.getSubscriptionStatus(identifier);
    if (!status) {
      return { subscribed: false, message: 'Not found in subscription list' };
    }
    return status;
  }

  @Get('stats')
  async getStats() {
    return this.alertsService.getSubscriberCount();
  }

  @Post('send-signal')
  async sendSignalAlert(
    @Body()
    body: {
      signal: string;
      confidence: string;
      reasoning: string;
      price24k: number;
      date: string;
    },
  ) {
    return this.alertsService.sendSignalAlert(body);
  }

  @Post('send-price-alert')
  async sendPriceAlert(
    @Body()
    body: {
      region: string;
      purity: string;
      price: number;
      change: number;
    },
  ) {
    return this.alertsService.sendPriceAlert(body);
  }

  @Post('update-preferences')
  async updatePreferences(
    @Body()
    body: {
      identifier: string;
      region?: string;
      purity?: string;
      frequency?: AlertFrequency;
    },
  ) {
    return this.alertsService.updatePreferences(body.identifier, {
      region: body.region,
      purity: body.purity,
      frequency: body.frequency,
    });
  }
}
