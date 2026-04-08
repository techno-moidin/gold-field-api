import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoldRatesService } from './gold-rates.service';
import { GoldRatesController } from './gold-rates.controller';
import { GoldRate } from './entities/gold-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GoldRate])],
  providers: [GoldRatesService],
  controllers: [GoldRatesController],
})
export class GoldRatesModule {}
