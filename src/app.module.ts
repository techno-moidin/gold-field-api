import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoldRatesModule } from './gold-rates/gold-rates.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { databaseConfig, redisConfig } from './config';
import { GoldRate } from './gold-rates/entities/gold-rate.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      entities: [GoldRate],
      synchronize: true,
      logging: databaseConfig.host === 'localhost',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: redisConfig.ttl * 1000,
      max: 1000,
      stores: [
        {
          type: 'redis',
          options: {
            host: redisConfig.host,
            port: redisConfig.port,
          },
        },
      ],
    }),
    GoldRatesModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
