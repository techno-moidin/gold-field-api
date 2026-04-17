import { Controller, Get, Post, Query } from '@nestjs/common';
import { UaeMartsService } from './uaemarts.service';

@Controller('uaemarts')
export class UaeMartsController {
  constructor(private readonly uaeMartsService: UaeMartsService) {}

  @Get('premium')
  async getPremium(@Query('refresh') refresh?: string) {
    return this.uaeMartsService.getPremium(refresh === 'true');
  }

  @Get('best-time')
  async getBestTime() {
    return this.uaeMartsService.getBestTime();
  }

  @Get('making-charges')
  async getMakingCharges() {
    return this.uaeMartsService.getMakingCharges();
  }

  @Get('vat-info')
  async getVatInfo() {
    return this.uaeMartsService.getVatInfo();
  }

  @Get('summary')
  async getSummary(@Query('refresh') refresh?: string) {
    return this.uaeMartsService.getSummary(refresh === 'true');
  }

  @Post('refresh')
  async refreshData() {
    return this.uaeMartsService.refreshData();
  }
}
