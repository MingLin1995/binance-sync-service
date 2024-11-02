import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BinanceService {
  async fetchKlineData(symbol = 'BTCUSDT', interval = '5m', limit = 10) {
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await axios.get(url);
    return response.data;
  }
}
