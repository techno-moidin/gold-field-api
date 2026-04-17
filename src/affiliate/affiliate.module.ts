import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliateController } from './affiliate.controller';
import { AffiliateService } from './affiliate.service';
import { AffiliatePartner } from './entities/affiliate-partner.entity';
import { AffiliateClick } from './entities/affiliate-click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AffiliatePartner, AffiliateClick])],
  controllers: [AffiliateController],
  providers: [AffiliateService],
  exports: [AffiliateService],
})
export class AffiliateModule {}
