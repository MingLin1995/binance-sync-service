import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CustomLogger } from '../common/services/logger.service';

@Injectable()
export class BinanceService {
  private readonly logger = new CustomLogger(BinanceService.name);

  async fetch24hrData() {
    try {
      const url = `https://fapi.binance.com/fapi/v1/ticker/24hr`;
      const response = await axios.get(url);
      return response.data
        .map((entry) => ({
          symbol: entry.symbol,
          quote_volume: entry.quoteVolume,
        }))
        .sort((a, b) => b.quote_volume - a.quote_volume);
    } catch (error) {
      this.logger.error('Failed to fetch 24hr data', error.stack);
      throw this.handleError(error);
    }
  }

  async fetchKlineData(symbol: string, interval: string, limit = 240) {
    try {
      const url = `https://fapi.binance.com/fapi/v1/klines`;
      const response = await axios.get(url, {
        params: { symbol, interval, limit },
      });

      if (response.status === 200) {
        const klinesData = response.data;
        klinesData.reverse(); // 反轉數據，最新的在前面
        return klinesData.map((entry) => parseFloat(entry[4])); // 只回傳收盤價
      }

      throw new Error('Failed to fetch kline data');
    } catch (error) {
      this.logger.error(
        `Failed to fetch kline data for ${symbol}`,
        error.stack,
      );
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      return new Error(
        error.response?.data?.message ||
          'Failed to fetch data from Binance API',
      );
    }
    return new Error('An unexpected error occurred');
  }
}
