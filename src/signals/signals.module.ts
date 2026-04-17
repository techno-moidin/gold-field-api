import { Module } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoldRate } from '../gold-rates/entities/gold-rate.entity';
import { GoldRatesModule } from '../gold-rates/gold-rates.module';

@Module({
  imports: [TypeOrmModule.forFeature([GoldRate]), GoldRatesModule],
  controllers: [SignalsController],
  providers: [SignalsService],
  exports: [SignalsService],
})
export class SignalsModule {}
