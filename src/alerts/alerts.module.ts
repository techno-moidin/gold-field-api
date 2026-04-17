import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { TelegramService } from './telegram.service';
import { Subscriber } from './entities/subscriber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber])],
  controllers: [AlertsController],
  providers: [AlertsService, TelegramService],
  exports: [AlertsService, TelegramService],
})
export class AlertsModule {}
