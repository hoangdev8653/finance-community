export type MarketCategory = 'INDEX' | 'STOCK' | 'COMMODITY' | 'FX' | 'CRYPTO';

export type CurrencyType = 'VND' | 'USD' | 'POINTS';

export interface MarketTickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: CurrencyType;
  category: MarketCategory;
  updatedAt: string;
}

export type TickFlashState = 'up' | 'down' | null;
