import { Injectable, OnModuleInit } from '@nestjs/common';
import { BinanceService } from '../binance/binance.service';
import { RedisService } from '../redis/redis.service';
import { CustomLogger } from '../common/services/logger.service';

interface TimeInterval {
  interval: string;
  minutes: number;
}

@Injectable()
export class SyncScheduler implements OnModuleInit {
  private readonly logger = new CustomLogger(SyncScheduler.name);
  private readonly REQUEST_DELAY = 450; // 本地 100/執行100s 150/執行150s  AWS 450/執行220s
  private readonly timeIntervals: TimeInterval[] = [
    { interval: '5m', minutes: 5 },
    { interval: '15m', minutes: 15 },
    { interval: '30m', minutes: 30 },
    { interval: '1h', minutes: 60 },
    { interval: '2h', minutes: 120 },
    { interval: '4h', minutes: 240 },
    { interval: '1d', minutes: 1440 },
    { interval: '1w', minutes: 1440 },
    { interval: '1M', minutes: 1440 },
  ];

  constructor(
    private binanceService: BinanceService,
    private redisService: RedisService,
  ) {}

  async onModuleInit() {
    setInterval(() => this.updateSymbolData(), 5 * 60 * 1000);

    await this.updateSymbolData();

    this.timeIntervals.forEach((interval) => {
      const intervalMs = interval.minutes * 60 * 1000;
      setInterval(() => this.syncInterval(interval.interval), intervalMs);
    });

    await Promise.all(
      this.timeIntervals.map((interval) =>
        this.syncInterval(interval.interval),
      ),
    );
  }

  private async updateSymbolData() {
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

  private async syncInterval(intervalStr: string) {
    const startTime = new Date();

    try {
      await this.syncKlineDataByInterval(intervalStr);

      const executionTime = (new Date().getTime() - startTime.getTime()) / 1000;
      this.logger.verbose(
        `${intervalStr} 更新完成，執行時間: ${executionTime}秒`,
      );
    } catch (error) {
      this.logger.error(`Failed to sync ${intervalStr}`, error.stack);
    }
  }

  private async syncKlineDataByInterval(interval: string) {
    try {
      this.logger.verbose(`開始同步 ${interval} K線數據`);
      const symbolData = await this.redisService.get24hrData();
      if (!symbolData) {
        throw new Error('No symbol data available in Redis');
      }

      const klineDataArray: Array<Record<string, { closePrices: number[] }>> =
        [];
      for (const { symbol } of symbolData) {
        try {
          const closePrices = await this.binanceService.fetchKlineData(
            symbol,
            interval,
          );

          const symbolObj: Record<string, { closePrices: number[] }> = {};
          symbolObj[symbol] = { closePrices };
          klineDataArray.push(symbolObj);

          await new Promise((resolve) =>
            setTimeout(resolve, this.REQUEST_DELAY),
          );
        } catch (error) {
          this.logger.error(
            `同步 ${symbol} ${interval} K線數據失敗`,
            error.stack,
          );
          continue;
        }
      }

      await this.redisService.saveKlineData(interval, klineDataArray);
      this.logger.verbose(`完成同步所有 ${interval} K線數據`);
    } catch (error) {
      this.logger.error(`Failed to sync ${interval} kline data`, error.stack);
      throw error;
    }
  }
}
