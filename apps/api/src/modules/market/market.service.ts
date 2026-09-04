import { Injectable, Logger } from '@nestjs/common';
import { MarketTickerItem } from './market.types';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);
  private cachedItems: MarketTickerItem[] = [];
  private lastFetchTime = 0;
  private readonly CACHE_TTL_MS = 15000; // 15 seconds

  // Baseline data snapshot (Reflects healthy real market snapshot)
  private baseItems: MarketTickerItem[] = [
    {
      symbol: 'VN-INDEX',
      name: 'VN-Index',
      price: 1285.5,
      change: 8.45,
      changePercent: 0.66,
      currency: 'POINTS',
      category: 'INDEX',
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: 'VN30',
      name: 'VN30-Index',
      price: 1342.1,
      change: 11.2,
      changePercent: 0.84,
      currency: 'POINTS',
      category: 'INDEX',
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: 'VCB',
      name: 'Vietcombank',
      price: 91500,
      change: 1500,
      changePercent: 1.67,
      currency: 'VND',
      category: 'STOCK',
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: 'FPT',
      name: 'FPT Corp',
      price: 135200,
      change: 3200,
      changePercent: 2.42,
      currency: 'VND',
      category: 'STOCK',
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: 'HPG',
      name: 'Hòa Phát',
      price: 26850,
      change: -250,
      changePercent: -0.92,
      currency: 'VND',
      category: 'STOCK',
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: 'SJC',
      name: 'Vàng SJC',
      price: 83500000,
      change: 500000,
      changePercent: 0.6,
      currency: 'VND',
      category: 'COMMODITY',
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: 'USD/VND',
      name: 'Tỷ giá USD/VND',
      price: 25450,
      change: 25,
      changePercent: 0.1,
      currency: 'VND',
      category: 'FX',
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 64250.0,
      change: 1180.5,
      changePercent: 1.87,
      currency: 'USD',
      category: 'CRYPTO',
      updatedAt: new Date().toISOString(),
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2685.2,
      change: 48.3,
      changePercent: 1.83,
      currency: 'USD',
      category: 'CRYPTO',
      updatedAt: new Date().toISOString(),
    },
  ];

  async getTicker(): Promise<MarketTickerItem[]> {
    const now = Date.now();
    if (this.cachedItems.length > 0 && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cachedItems;
    }

    try {
      // 1. Clone base items
      const updatedList = this.baseItems.map((item) => ({
        ...item,
        updatedAt: new Date().toISOString(),
      }));

      // 2. Concurrently fetch live market data from external adapters
      await Promise.allSettled([
        this.fetchLiveCrypto(updatedList),
        this.fetchLiveVietnamMarket(updatedList),
      ]);

      this.cachedItems = updatedList;
      this.lastFetchTime = now;
      return this.cachedItems;
    } catch (err) {
      this.logger.warn(`Market ticker fetch encountered an issue: ${err instanceof Error ? err.message : String(err)}`);
      // Return cached or base if error occurs
      return this.cachedItems.length > 0 ? this.cachedItems : this.baseItems;
    }
  }

  private async fetchLiveCrypto(items: MarketTickerItem[]): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(
        'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]',
        { signal: controller.signal }
      );

      if (!response.ok) return;

      const data = (await response.json()) as Array<{
        symbol: string;
        lastPrice: string;
        priceChange: string;
        priceChangePercent: string;
      }>;

      for (const entry of data) {
        if (entry.symbol === 'BTCUSDT') {
          const target = items.find((i) => i.symbol === 'BTC');
          if (target) {
            target.price = parseFloat(entry.lastPrice);
            target.change = parseFloat(entry.priceChange);
            target.changePercent = parseFloat(entry.priceChangePercent);
          }
        } else if (entry.symbol === 'ETHUSDT') {
          const target = items.find((i) => i.symbol === 'ETH');
          if (target) {
            target.price = parseFloat(entry.lastPrice);
            target.change = parseFloat(entry.priceChange);
            target.changePercent = parseFloat(entry.priceChangePercent);
          }
        }
      }
    } catch {
      // Ignore network errors, base snapshot is already in place
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchLiveVietnamMarket(items: MarketTickerItem[]): Promise<void> {
    const symbolMap: Record<string, string> = {
      '^VNINDEX.VN': 'VN-INDEX',
      'VCB.VN': 'VCB',
      'FPT.VN': 'FPT',
      'HPG.VN': 'HPG',
      'VND=X': 'USD/VND',
      'GC=F': 'GOLD_GLOBAL',
    };

    const yahooSymbols = Object.keys(symbolMap);

    await Promise.all(
      yahooSymbols.map(async (ySymbol) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}?interval=1d`;
          const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          });

          if (!response.ok) return;

          const data = (await response.json()) as {
            chart?: {
              result?: Array<{
                meta?: {
                  regularMarketPrice?: number;
                  chartPreviousClose?: number;
                  previousClose?: number;
                };
              }>;
            };
          };

          const meta = data.chart?.result?.[0]?.meta;
          if (!meta || typeof meta.regularMarketPrice !== 'number') return;

          const price = meta.regularMarketPrice;
          const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
          const rawChange = price - prev;
          const rawChangePercent = prev > 0 ? (rawChange / prev) * 100 : 0;

          if (ySymbol === 'GC=F') {
            const sjc = items.find((i) => i.symbol === 'SJC');
            if (sjc && prev > 0) {
              const goldChangePercent = Math.round(rawChangePercent * 100) / 100;
              sjc.changePercent = goldChangePercent;
              sjc.change = Math.round(sjc.price * (goldChangePercent / 100));
            }
            return;
          }

          const targetSymbol = symbolMap[ySymbol];
          const target = items.find((i) => i.symbol === targetSymbol);
          if (!target) return;

          if (target.currency === 'POINTS') {
            target.price = Math.round(price * 100) / 100;
            target.change = Math.round(rawChange * 100) / 100;
            target.changePercent = Math.round(rawChangePercent * 100) / 100;

            // Coordinate VN30 movement proportionally
            const vn30 = items.find((i) => i.symbol === 'VN30');
            if (vn30) {
              vn30.changePercent = target.changePercent;
              vn30.change = Math.round(vn30.price * (target.changePercent / 100) * 100) / 100;
              vn30.price = Math.round((vn30.price + vn30.change) * 100) / 100;
            }
          } else if (target.currency === 'VND') {
            target.price = Math.round(price);
            target.change = Math.round(rawChange);
            target.changePercent = Math.round(rawChangePercent * 100) / 100;
          }
        } catch {
          // Fallback seamlessly to baseline
        } finally {
          clearTimeout(timeoutId);
        }
      })
    );
  }
}
