import { apiClient } from '../api/client';
import { MarketTickerItem } from '../../types/market';

export const marketService = {
  /**
   * Get real-time financial market ticker indices and quotes
   * GET /api/v1/market/ticker
   */
  async getTicker(): Promise<MarketTickerItem[]> {
    const response = await apiClient.get<MarketTickerItem[]>('/market/ticker');
    return response.data;
  },
};
