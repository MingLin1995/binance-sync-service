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
      const formattedData = response.data
        .map((entry) => ({
          symbol: entry.symbol,
          quote_volume: entry.quoteVolume,
        }))
        .sort((a, b) => b.quote_volume - a.quote_volume);

      return formattedData;
    } catch (error) {
      this.logger.error('Failed to fetch 24hr data', error.stack);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            'Failed to fetch data from Binance API',
        );
      }
      throw new Error('An unexpected error occurred');
    }
  }
}
