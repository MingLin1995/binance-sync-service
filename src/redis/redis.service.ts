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
}
