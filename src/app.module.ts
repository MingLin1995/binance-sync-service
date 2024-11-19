import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BinanceService } from './binance/binance.service';
import { RedisService } from './redis/redis.service';
import { SyncScheduler } from './scheduler/sync.scheduler';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, BinanceService, RedisService, SyncScheduler],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude('health', 'metrics') // 要排除的路由
      .forRoutes('*');
  }
}
