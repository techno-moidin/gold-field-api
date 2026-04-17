import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscriber,
  SubscriptionTier,
  AlertFrequency,
} from './entities/subscriber.entity';
import { TelegramService } from './telegram.service';

export interface SubscribeDto {
  telegramId?: string;
  telegramUsername?: string;
  whatsappPhone?: string;
  region?: string;
  purity?: string;
  frequency?: AlertFrequency;
}

export interface AlertPayload {
  type: 'SIGNAL' | 'PRICE' | 'WEEKLY';
  message: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Subscriber)
    private subscriberRepository: Repository<Subscriber>,
    private telegramService: TelegramService,
  ) {}

  async subscribe(
    dto: SubscribeDto,
  ): Promise<{ success: boolean; message: string }> {
    if (!dto.telegramId && !dto.whatsappPhone) {
      return {
        success: false,
        message: 'Telegram ID or WhatsApp number required',
      };
    }

    let subscriber = await this.subscriberRepository.findOne({
      where: dto.telegramId
        ? { telegramId: dto.telegramId }
        : { whatsappPhone: dto.whatsappPhone },
    });

    if (subscriber) {
      subscriber.isSubscribed = true;
      subscriber.isActive = true;
      if (dto.region) subscriber.preferredRegion = dto.region;
      if (dto.purity) subscriber.preferredPurity = dto.purity;
      if (dto.frequency) subscriber.alertFrequency = dto.frequency;
    } else {
      subscriber = this.subscriberRepository.create({
        telegramId: dto.telegramId,
        telegramUsername: dto.telegramUsername,
        whatsappPhone: dto.whatsappPhone,
        preferredRegion: dto.region || 'UAE',
        preferredPurity: dto.purity || '24K',
        alertFrequency: dto.frequency || AlertFrequency.DAILY,
        isSubscribed: true,
        isActive: true,
        tier: SubscriptionTier.FREE,
      });
    }

    await this.subscriberRepository.save(subscriber);
    this.logger.log(`Subscriber ${subscriber.id} subscribed`);

    return { success: true, message: 'Successfully subscribed to gold alerts' };
  }

  async unsubscribe(
    identifier: string,
  ): Promise<{ success: boolean; message: string }> {
    const subscriber = await this.subscriberRepository.findOne({
      where: [{ telegramId: identifier }, { whatsappPhone: identifier }],
    });

    if (!subscriber) {
      return { success: false, message: 'Not found in subscription list' };
    }

    subscriber.isSubscribed = false;
    await this.subscriberRepository.save(subscriber);

    return {
      success: true,
      message: 'Successfully unsubscribed from gold alerts',
    };
  }

  async getSubscriptionStatus(identifier: string): Promise<{
    subscribed: boolean;
    region: string;
    purity: string;
    frequency: string;
  } | null> {
    const subscriber = await this.subscriberRepository.findOne({
      where: [{ telegramId: identifier }, { whatsappPhone: identifier }],
    });

    if (!subscriber) {
      return null;
    }

    return {
      subscribed: subscriber.isSubscribed,
      region: subscriber.preferredRegion,
      purity: subscriber.preferredPurity,
      frequency: subscriber.alertFrequency,
    };
  }

  async getAllActiveSubscribers(): Promise<Subscriber[]> {
    return this.subscriberRepository.find({
      where: { isSubscribed: true, isActive: true },
    });
  }

  async getSubscriberCount(): Promise<{ total: number; active: number }> {
    const total = await this.subscriberRepository.count();
    const active = await this.subscriberRepository.count({
      where: { isSubscribed: true, isActive: true },
    });
    return { total, active };
  }

  async sendSignalAlert(signal: {
    signal: string;
    confidence: string;
    reasoning: string;
    price24k: number;
    date: string;
  }): Promise<{ sent: number; failed: number }> {
    const subscribers = await this.getAllActiveSubscribers();
    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      if (subscriber.telegramId) {
        const success = await this.telegramService.sendSignal(
          subscriber.telegramId,
          {
            signal: signal.signal,
            confidence: signal.confidence,
            reasoning: signal.reasoning,
            price24k: signal.price24k,
          },
        );

        if (success) {
          sent++;
          subscriber.lastAlertAt = new Date();
          await this.subscriberRepository.save(subscriber);
        } else {
          failed++;
        }
      }
    }

    this.logger.log(`Signal alert: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  async sendPriceAlert(priceData: {
    region: string;
    purity: string;
    price: number;
    change: number;
  }): Promise<{ sent: number; failed: number }> {
    const subscribers = await this.getAllActiveSubscribers();
    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      if (subscriber.telegramId) {
        const success = await this.telegramService.sendPriceAlert(
          subscriber.telegramId,
          priceData,
        );
        if (success) sent++;
        else failed++;
      }
    }

    return { sent, failed };
  }

  async updatePreferences(
    identifier: string,
    updates: { region?: string; purity?: string; frequency?: AlertFrequency },
  ): Promise<{ success: boolean; message: string }> {
    const subscriber = await this.subscriberRepository.findOne({
      where: [{ telegramId: identifier }, { whatsappPhone: identifier }],
    });

    if (!subscriber) {
      return { success: false, message: 'Subscriber not found' };
    }

    if (updates.region) subscriber.preferredRegion = updates.region;
    if (updates.purity) subscriber.preferredPurity = updates.purity;
    if (updates.frequency) subscriber.alertFrequency = updates.frequency;

    await this.subscriberRepository.save(subscriber);

    return { success: true, message: 'Preferences updated successfully' };
  }
}
