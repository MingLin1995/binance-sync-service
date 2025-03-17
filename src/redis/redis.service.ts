import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CustomLogger } from '../common/services/logger.service';

@Injectable()
export class RedisService {
  private readonly logger = new CustomLogger(RedisService.name);
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection failed', err.stack);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });
  }

  async save24hrData(data: any) {
    try {
      const key = 'symbol_quote_volume_data';
      const serializedData = JSON.stringify(data);

      await this.redis.set(key, serializedData, 'EX', 60 * 30);
    } catch (error) {
      this.logger.error('Failed to save 24hr data to Redis', error.stack);
      throw error;
    }
  }

  async get24hrData() {
    const key = 'symbol_quote_volume_data';
    const data = await this.redis.get(key);
    return JSON.parse(data);
  }

  async saveKlineData(
    timeInterval: string,
    symbolData: Array<Record<string, any>>,
  ) {
    try {
      const key = `kline_data_${timeInterval}`;
      const serializedData = JSON.stringify(symbolData);

      const expiryMinutes = this.getExpiryMinutes(timeInterval);
      await this.redis.set(key, serializedData, 'EX', expiryMinutes * 60);
    } catch (error) {
      this.logger.error(
        `Failed to save kline data for ${timeInterval}`,
        error.stack,
      );
      throw error;
    }
  }

  async getKlineData(timeInterval: string) {
    const key = `kline_data_${timeInterval}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  private getExpiryMinutes(timeInterval: string): number {
    const expiryMap: Record<string, number> = {
      '5m': 5, // 5分鐘
      '15m': 15, // 15分鐘
      '30m': 30, // 30分鐘
      '1h': 60, // 1小時
      '2h': 120, // 2小時
      '4h': 240, // 4小時
      '1d': 1440, // 24小時
      '1w': 10080, // 1週
      '1M': 43200, // 1個月
    };
    return expiryMap[timeInterval];
  }
}
