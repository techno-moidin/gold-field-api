import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UaeMartsController } from './uaemarts.controller';
import { UaeMartsService } from './uaemarts.service';
import { GoldRatesModule } from '../gold-rates/gold-rates.module';
import { SignalMetrics } from './entities/signal-metrics.entity';
import { GoldRate } from '../gold-rates/entities/gold-rate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SignalMetrics, GoldRate]),
    GoldRatesModule,
  ],
  controllers: [UaeMartsController],
  providers: [UaeMartsService],
  exports: [UaeMartsService],
})
export class UaeMartsModule {}
