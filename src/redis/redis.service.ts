import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    console.log(
      process.env.REDIS_HOST,
      process.env.REDIS_PORT,
      process.env.REDIS_PASSWORD,
    );
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });

    this.redis.on('error', (err) => {
      console.error('Redis 連接失敗', err);
    });
  }

  async saveKlineData(data: any) {
    try {
      await this.redis.set('KlineData', JSON.stringify(data), 'EX', 86400);
    } catch (error) {
      console.error('儲存 K 線資料失敗', error);
      throw error;
    }
  }
}
