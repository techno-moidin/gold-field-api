import { Controller, Get, Query, Post } from '@nestjs/common';
import { SignalsService } from './signals.service';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Get('today')
  async getTodaySignal(@Query('refresh') refresh?: string): Promise<{
    date: string;
    signal: string;
    confidence: string;
    reasoning: string;
    metrics: {
      price24k: number;
      change24h: number;
      changePercent24h: number;
      trend7d: number;
      trend30d: number;
      localPremium: number;
    };
    disclaimer: string;
    lastUpdated: string;
  }> {
    const signal = await this.signalsService.getTodaySignal(refresh === 'true');

    return {
      date: signal.date,
      signal: signal.signal,
      confidence: signal.confidence,
      reasoning: signal.reasoning,
      metrics: signal.metrics,
      disclaimer: signal.disclaimer,
      lastUpdated: signal.lastUpdated.toISOString(),
    };
  }

  @Get('history')
  async getSignalHistory(@Query('days') days?: string): Promise<{
    data: Array<{
      date: string;
      signal: string;
      confidence: string;
      reasoning: string;
    }>;
    total: number;
  }> {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.signalsService.getSignalHistory(daysNum);
  }

  @Post('refresh')
  async refreshSignal() {
    return this.signalsService.refreshSignal();
  }
}
