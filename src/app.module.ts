import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BinanceService } from './binance/binance.service';
import { RedisService } from './redis/redis.service';
import { SyncScheduler } from './scheduler/sync.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, BinanceService, RedisService, SyncScheduler],
})
export class AppModule {}
