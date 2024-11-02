import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BinanceService } from '../binance/binance.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class SyncScheduler implements OnModuleInit {
  constructor(
    private binanceService: BinanceService,
    private redisService: RedisService,
  ) {}

  async onModuleInit() {
    console.log('初始化同步 K 線資料...');
    await this.syncKlineData();
  }

  @Cron('0 0 * * *')
  async syncKlineData() {
    const klineData = await this.binanceService.fetchKlineData();
    await this.redisService.saveKlineData(klineData);
    console.log('K線資料更新完成');
  }
}
