import { Injectable, Logger, Optional } from '@nestjs/common';
import { MarketTickerItem } from './market.types';
import { SystemSettingsRepository } from '../../database/repositories/system-settings.repository';

export const MARKET_QUOTES_SETTINGS_KEY = 'market_quotes_latest';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);
  private cachedItems: MarketTickerItem[] = [];
  private lastFetchTime = 0;
  // 15-second near real-time polling cadence during trading hours
  private readonly CACHE_TTL_MS = 15000;
  private hasInitializedFromDb = false;

  // Baseline data snapshot (resilient fallback for initial boot before DB/network population)
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
      isMarketOpen: false,
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
      isMarketOpen: false,
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
      isMarketOpen: false,
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
      isMarketOpen: false,
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
      isMarketOpen: false,
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
      isMarketOpen: true,
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
      isMarketOpen: true,
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
      isMarketOpen: true,
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
      isMarketOpen: true,
    },
  ];

  constructor(
    @Optional() private readonly settingsRepo?: SystemSettingsRepository
  ) {}

  /**
   * Determines if Vietnam Stock Exchange (HOSE / HNX / VN30) is currently in trading session:
   * - Days: Monday to Friday (day 1 to 5)
   * - Morning Session: 09:00 - 11:30 (ICT)
   * - Afternoon Session: 13:00 - 15:05 (ICT, includes ATC & closing cross matching buffer)
   * Outside this window, market is closed; prices freeze at last closing price.
   */
  isVietnamStockMarketOpen(date = new Date()): boolean {
    const vnTimeStr = date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    const vnDate = new Date(vnTimeStr);
    const day = vnDate.getDay(); // 0 is Sunday, 6 is Saturday

    if (day === 0 || day === 6) {
      return false;
    }

    const totalMinutes = vnDate.getHours() * 60 + vnDate.getMinutes();

    // Morning session: 09:00 (540m) to 11:30 (690m)
    const isMorning = totalMinutes >= 540 && totalMinutes <= 690;

    // Afternoon session: 13:00 (780m) to 15:05 (905m)
    const isAfternoon = totalMinutes >= 780 && totalMinutes <= 905;

    return isMorning || isAfternoon;
  }

  /**
   * Initializes market baseline snapshot from Database if available.
   * Ensures recent Friday/closing values survive server restarts over the weekend.
   */
  private async initFromDb(): Promise<void> {
    if (this.hasInitializedFromDb || !this.settingsRepo) {
      this.hasInitializedFromDb = true;
      return;
    }

    try {
      const record = await this.settingsRepo.findByKey(MARKET_QUOTES_SETTINGS_KEY);
      if (record && record.value && Array.isArray((record.value as any).items)) {
        const dbItems = (record.value as any).items as MarketTickerItem[];
        if (dbItems.length > 0) {
          this.baseItems = dbItems;
          this.cachedItems = dbItems;
          this.logger.log(`Initialized ${dbItems.length} market quotes from database snapshot`);
        }
      }
    } catch (err) {
      this.logger.debug(`Could not read market snapshot from DB: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      this.hasInitializedFromDb = true;
    }
  }

  /**
   * Persists latest quotes snapshot to database asynchronously.
   */
  private saveSnapshotToDb(items: MarketTickerItem[], isMarketOpen: boolean): void {
    if (!this.settingsRepo) return;

    this.settingsRepo
      .upsertTx(
        null,
        MARKET_QUOTES_SETTINGS_KEY,
        {
          items,
          savedAt: new Date().toISOString(),
          marketSession: isMarketOpen ? 'OPEN' : 'CLOSED',
        },
        'Snapshot giá thị trường tài chính mới nhất'
      )
      .catch((err) => {
        this.logger.debug(`Failed to persist market quotes to DB: ${err instanceof Error ? err.message : String(err)}`);
      });
  }

  async getTicker(): Promise<MarketTickerItem[]> {
    if (!this.hasInitializedFromDb) {
      await this.initFromDb();
    }

    const now = Date.now();
    if (this.cachedItems.length > 0 && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cachedItems;
    }

    try {
      // 1. Clone base items with current timestamp
      const updatedList = this.baseItems.map((item) => ({
        ...item,
        updatedAt: new Date().toISOString(),
      }));

      // 2. Concurrently fetch live data across asset classes
      await Promise.allSettled([
        this.fetchLiveCrypto(updatedList),
        this.fetchLiveGlobal(updatedList),
        this.fetchLiveVietnamMarket(updatedList),
      ]);

      this.cachedItems = updatedList;
      this.lastFetchTime = now;
      return this.cachedItems;
    } catch (err) {
      this.logger.warn(`Market ticker fetch encountered an issue: ${err instanceof Error ? err.message : String(err)}`);
      return this.cachedItems.length > 0 ? this.cachedItems : this.baseItems;
    }
  }

  /**
   * Crypto (24/7): Real-time updates from Binance Public API.
   */
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
            target.isMarketOpen = true;
          }
        } else if (entry.symbol === 'ETHUSDT') {
          const target = items.find((i) => i.symbol === 'ETH');
          if (target) {
            target.price = parseFloat(entry.lastPrice);
            target.change = parseFloat(entry.priceChange);
            target.changePercent = parseFloat(entry.priceChangePercent);
            target.isMarketOpen = true;
          }
        }
      }
    } catch {
      // Keep baseline on timeout/network issue
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Global FX & Commodities: USD/VND and Global Gold from Yahoo Finance.
   */
  private async fetchLiveGlobal(items: MarketTickerItem[]): Promise<void> {
    const symbols = ['VND=X', 'GC=F'];

    await Promise.all(
      symbols.map(async (ySymbol) => {
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
              sjc.isMarketOpen = true;
            }
          } else if (ySymbol === 'VND=X') {
            const fx = items.find((i) => i.symbol === 'USD/VND');
            if (fx) {
              fx.price = Math.round(price);
              fx.change = Math.round(rawChange);
              fx.changePercent = Math.round(rawChangePercent * 100) / 100;
              fx.isMarketOpen = true;
            }
          }
        } catch {
          // Ignore network errors
        } finally {
          clearTimeout(timeoutId);
        }
      })
    );
  }

  /**
   * Helper to normalize payload from any custom provider or securities company API
   */
  private extractQuotesFromPayload(payload: any): Array<{ symbol: string; price: number; change: number; changePercent: number }> {
    const list = Array.isArray(payload) ? payload : (payload?.data || payload?.quotes || payload?.items);
    if (!Array.isArray(list)) return [];

    const results: Array<{ symbol: string; price: number; change: number; changePercent: number }> = [];
    for (const row of list) {
      const rawSymbol = row.symbol || row.code || row.ticker;
      const rawPrice = row.price ?? row.close ?? row.lastPrice ?? row.indexValue;

      if (rawSymbol && typeof rawPrice === 'number') {
        const symbol = String(rawSymbol).toUpperCase();
        const normalizedSymbol = symbol === 'VNINDEX' ? 'VN-INDEX' : symbol;
        const change = typeof row.change === 'number' ? row.change : (row.priceChange ?? 0);
        const changePercent = typeof row.changePercent === 'number' ? row.changePercent : (row.pctChange ?? row.priceChangePercent ?? 0);

        // Adjust price if reported in 1,000 VND units for stocks
        const multiplier = (!normalizedSymbol.includes('INDEX') && rawPrice < 1000) ? 1000 : 1;
        results.push({
          symbol: normalizedSymbol,
          price: Math.round(rawPrice * multiplier * 100) / 100,
          change: Math.round(change * multiplier * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
        });
      }
    }
    return results;
  }

  /**
   * Vietnam Stock Market (HOSE / VN30 / Stocks):
   * - During trading hours (Mon-Fri 09:00-11:30 & 13:00-15:05 ICT):
   *   Polls market data every 15s.
   *   Supports official API provider credentials via environment variables:
   *   `VIETNAM_MARKET_API_URL`, `VIETNAM_MARKET_API_KEY`, `VIETNAM_MARKET_ACCESS_TOKEN`.
   *   Saves each update to PostgreSQL DB snapshot.
   * - Outside trading hours (Nights, weekends, lunch break):
   *   Freezes queries, does not poll external endpoints, and serves last closing prices from DB.
   */
  private async fetchLiveVietnamMarket(items: MarketTickerItem[]): Promise<void> {
    const isMarketOpen = this.isVietnamStockMarketOpen();
    const vnSymbols = ['VN-INDEX', 'VN30', 'VCB', 'FPT', 'HPG'];

    // Mark market status on all Vietnam items
    for (const sym of vnSymbols) {
      const target = items.find((i) => i.symbol === sym);
      if (target) {
        target.isMarketOpen = isMarketOpen;
      }
    }

    // Outside trading hours: freeze and reuse stored closing prices from DB
    if (!isMarketOpen) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    let hasUpdatedData = false;

    try {
      const customApiUrl = process.env.VIETNAM_MARKET_API_URL;
      const apiKey = process.env.VIETNAM_MARKET_API_KEY;
      const accessToken = process.env.VIETNAM_MARKET_ACCESS_TOKEN;

      // 1. Primary: If user configured official provider in .env, query official API with headers
      if (customApiUrl && (apiKey || accessToken)) {
        const headers: Record<string, string> = {
          'User-Agent': 'FinancePulse-MarketService/1.0',
          'Accept': 'application/json',
        };
        if (apiKey) {
          headers['X-API-KEY'] = apiKey;
        }
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const res = await fetch(customApiUrl, {
          signal: controller.signal,
          headers,
        });

        if (res.ok) {
          const json = await res.json();
          const parsed = this.extractQuotesFromPayload(json);
          if (parsed.length > 0) {
            for (const q of parsed) {
              const target = items.find((i) => i.symbol === q.symbol);
              if (target) {
                target.price = q.price;
                target.change = q.change;
                target.changePercent = q.changePercent;
                hasUpdatedData = true;
              }
            }
          }
        }
      }

      // 2. Secondary: If custom provider not configured, try public data feeds
      if (!hasUpdatedData) {
        const indicesUrl = 'https://finfo-api.vndirect.com.vn/v4/market_indices?q=code:VNINDEX,VN30&sort=tradingDate&size=2';
        const indicesRes = await fetch(indicesUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' },
        }).catch(() => null);

        if (indicesRes && indicesRes.ok) {
          const json = (await indicesRes.json().catch(() => null)) as any;
          const parsed = this.extractQuotesFromPayload(json);
          for (const q of parsed) {
            const target = items.find((i) => i.symbol === q.symbol);
            if (target) {
              target.price = q.price;
              target.change = q.change;
              target.changePercent = q.changePercent;
              hasUpdatedData = true;
            }
          }
        }

        const stocksUrl = 'https://finfo-api.vndirect.com.vn/v4/stock_prices?q=code:VCB,FPT,HPG&sort=date&size=3';
        const stocksRes = await fetch(stocksUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' },
        }).catch(() => null);

        if (stocksRes && stocksRes.ok) {
          const json = (await stocksRes.json().catch(() => null)) as any;
          const parsed = this.extractQuotesFromPayload(json);
          for (const q of parsed) {
            const target = items.find((i) => i.symbol === q.symbol);
            if (target) {
              target.price = q.price;
              target.change = q.change;
              target.changePercent = q.changePercent;
              hasUpdatedData = true;
            }
          }
        }
      }

      // When fresh market data is retrieved, save to DB snapshot for weekend/closed sessions
      if (hasUpdatedData) {
        this.saveSnapshotToDb(items, true);
      }
    } catch (err) {
      this.logger.debug(`Live Vietnam market fetch issue: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
