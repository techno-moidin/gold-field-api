import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';

@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Get('links')
  async getLinks(@Query('refresh') refresh?: string) {
    return this.affiliateService.getAllLinks(refresh === 'true');
  }

  @Post('track')
  async trackClick(
    @Body()
    body: {
      code: string;
      subscriberId?: string;
      utmSource?: string;
      utmMedium?: string;
    },
  ) {
    return this.affiliateService.trackClick(
      body.code,
      body.subscriberId,
      body.utmSource,
      body.utmMedium,
    );
  }

  @Post('convert')
  async markConverted(
    @Body()
    body: {
      clickId: string;
      conversionValue?: number;
      conversionCurrency?: string;
    },
  ) {
    return this.affiliateService.markConverted(
      body.clickId,
      body.conversionValue,
      body.conversionCurrency,
    );
  }

  @Get('stats')
  async getStats(@Query('partnerCode') partnerCode?: string) {
    return this.affiliateService.getStats(partnerCode);
  }

  @Get('partner-stats')
  async getPartnerStats() {
    return this.affiliateService.getPartnerStats();
  }

  @Post('seed')
  async seedPartners() {
    await this.affiliateService.seedDefaultPartners();
    return { success: true, message: 'Default partners seeded' };
  }

  @Get('redirect/:code')
  async redirect(@Param('code') code: string) {
    const result = await this.affiliateService.trackClick(code);
    return result;
  }
}
