import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BinanceService } from '../binance/binance.service';
import { RedisService } from '../redis/redis.service';
import { CustomLogger } from '../common/services/logger.service';

@Injectable()
export class SyncScheduler implements OnModuleInit {
  private readonly logger = new CustomLogger(SyncScheduler.name);

  constructor(
    private binanceService: BinanceService,
    private redisService: RedisService,
  ) {}

  async onModuleInit() {
    // 啟動後馬上執行第一次
    await this.syncKlineData();
  }

  // 直接使用 @Cron 裝飾器，每 5 分鐘執行一次
  @Cron('0 */5 * * * *')
  async syncKlineData() {
    try {
      this.logger.verbose('開始同步 24hr symbol & volume');
      const fetchData = await this.binanceService.fetch24hrData();
      await this.redisService.save24hrData(fetchData);
      this.logger.verbose('完成同步 24hr symbol & volume');
    } catch (error) {
      this.logger.error('Failed to sync 24hr data', error.stack);
      throw error;
    }
  }
}
