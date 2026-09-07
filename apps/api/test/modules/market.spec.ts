import { MarketService, MARKET_QUOTES_SETTINGS_KEY } from '../../src/modules/market/market.service';
import { MarketController } from '../../src/modules/market/market.controller';
import { SystemSettingsRepository } from '../../src/database/repositories/system-settings.repository';

describe('MarketModule', () => {
  let marketService: MarketService;
  let marketController: MarketController;
  let mockSettingsRepo: jest.Mocked<SystemSettingsRepository>;

  beforeEach(() => {
    mockSettingsRepo = {
      findByKey: jest.fn().mockResolvedValue(undefined),
      upsertTx: jest.fn().mockResolvedValue({} as any),
      findAll: jest.fn().mockResolvedValue([]),
    } as any;

    marketService = new MarketService(mockSettingsRepo);
    marketController = new MarketController(marketService);
  });

  describe('isVietnamStockMarketOpen', () => {
    it('should return false on weekends (Saturday & Sunday)', () => {
      // 2026-09-12 is Saturday
      const saturday = new Date('2026-09-12T03:00:00Z'); // 10:00 AM ICT
      expect(marketService.isVietnamStockMarketOpen(saturday)).toBe(false);

      // 2026-09-13 is Sunday
      const sunday = new Date('2026-09-13T07:00:00Z'); // 14:00 PM ICT
      expect(marketService.isVietnamStockMarketOpen(sunday)).toBe(false);
    });

    it('should return true during weekday morning session (09:00 - 11:30 ICT)', () => {
      // 2026-09-09 is Wednesday, 03:00:00 UTC = 10:00:00 ICT
      const wednesdayMorning = new Date('2026-09-09T03:00:00Z');
      expect(marketService.isVietnamStockMarketOpen(wednesdayMorning)).toBe(true);
    });

    it('should return false during weekday lunch break (11:31 - 12:59 ICT)', () => {
      // 2026-09-09 05:00:00 UTC = 12:00:00 ICT
      const wednesdayLunch = new Date('2026-09-09T05:00:00Z');
      expect(marketService.isVietnamStockMarketOpen(wednesdayLunch)).toBe(false);
    });

    it('should return true during weekday afternoon session (13:00 - 15:05 ICT)', () => {
      // 2026-09-09 07:00:00 UTC = 14:00:00 ICT
      const wednesdayAfternoon = new Date('2026-09-09T07:00:00Z');
      expect(marketService.isVietnamStockMarketOpen(wednesdayAfternoon)).toBe(true);
    });

    it('should return false outside weekday trading hours (e.g. evening or night)', () => {
      // 2026-09-09 13:00:00 UTC = 20:00:00 ICT (8:00 PM)
      const wednesdayNight = new Date('2026-09-09T13:00:00Z');
      expect(marketService.isVietnamStockMarketOpen(wednesdayNight)).toBe(false);
    });
  });

  describe('MarketService', () => {
    it('should return a list of ticker items including indices, stocks, commodities, fx, and crypto', async () => {
      const items = await marketService.getTicker();

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(8);

      const symbols = items.map((i) => i.symbol);
      expect(symbols).toContain('VN-INDEX');
      expect(symbols).toContain('VN30');
      expect(symbols).toContain('VCB');
      expect(symbols).toContain('FPT');
      expect(symbols).toContain('HPG');
      expect(symbols).toContain('SJC');
      expect(symbols).toContain('USD/VND');
      expect(symbols).toContain('BTC');

      const vnIndex = items.find((i) => i.symbol === 'VN-INDEX');
      expect(vnIndex).toBeDefined();
      expect(typeof vnIndex!.price).toBe('number');
      expect(typeof vnIndex!.change).toBe('number');
      expect(typeof vnIndex!.changePercent).toBe('number');
      expect(vnIndex!.currency).toBe('POINTS');
      expect(vnIndex!.category).toBe('INDEX');
    });

    it('should utilize in-memory caching for consecutive calls within TTL', async () => {
      const firstCall = await marketService.getTicker();
      const secondCall = await marketService.getTicker();

      expect(firstCall).toBe(secondCall);
    });

    it('should handle external API failures gracefully without crashing', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network connection timeout'));

      const fallbackService = new MarketService(mockSettingsRepo);
      const items = await fallbackService.getTicker();

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(8);

      global.fetch = originalFetch;
    });

    it('should fetch and update live Vietnam market data during trading hours from VNDIRECT', async () => {
      // Force market to be open
      jest.spyOn(marketService, 'isVietnamStockMarketOpen').mockReturnValue(true);

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes('market_indices')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [
                  { code: 'VNINDEX', indexValue: 1305.2, change: 12.5, pctChange: 0.97 },
                  { code: 'VN30', indexValue: 1360.0, change: 15.0, pctChange: 1.12 },
                ],
              }),
          });
        }

        if (url.includes('stock_prices')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [
                  { code: 'VCB', close: 93.5, change: 2.0, pctChange: 2.19 },
                  { code: 'FPT', close: 138.0, change: 2.8, pctChange: 2.07 },
                  { code: 'HPG', close: 27.5, change: 0.65, pctChange: 2.42 },
                ],
              }),
          });
        }

        return Promise.resolve({ ok: false });
      });

      const items = await marketService.getTicker();
      const vnIndex = items.find((i) => i.symbol === 'VN-INDEX');
      const vcb = items.find((i) => i.symbol === 'VCB');

      expect(vnIndex).toBeDefined();
      expect(vnIndex!.price).toBe(1305.2);
      expect(vnIndex!.change).toBe(12.5);
      expect(vnIndex!.changePercent).toBe(0.97);
      expect(vnIndex!.isMarketOpen).toBe(true);

      expect(vcb).toBeDefined();
      expect(vcb!.price).toBe(93500); // 93.5 * 1000
      expect(vcb!.change).toBe(2000); // 2.0 * 1000
      expect(vcb!.changePercent).toBe(2.19);
      expect(vcb!.isMarketOpen).toBe(true);

      // Verify that quotes were saved to DB
      expect(mockSettingsRepo.upsertTx).toHaveBeenCalledWith(
        null,
        MARKET_QUOTES_SETTINGS_KEY,
        expect.objectContaining({ marketSession: 'OPEN' }),
        expect.any(String)
      );

      global.fetch = originalFetch;
    });

    it('should prioritize official Vietnam market API provider when env variables are configured', async () => {
      process.env.VIETNAM_MARKET_API_URL = 'https://custom-market-api.vn/quotes';
      process.env.VIETNAM_MARKET_API_KEY = 'test_secret_key_123';
      jest.spyOn(marketService, 'isVietnamStockMarketOpen').mockReturnValue(true);

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation((url: string, init?: any) => {
        if (url === 'https://custom-market-api.vn/quotes') {
          expect(init?.headers).toEqual(
            expect.objectContaining({
              'X-API-KEY': 'test_secret_key_123',
            })
          );
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: [
                  { symbol: 'VN-INDEX', price: 1320.5, change: 18.2, changePercent: 1.4 },
                  { symbol: 'VCB', price: 95000, change: 3000, changePercent: 3.26 },
                ],
              }),
          });
        }
        return Promise.resolve({ ok: false });
      });

      const items = await marketService.getTicker();
      const vnIndex = items.find((i) => i.symbol === 'VN-INDEX');
      const vcb = items.find((i) => i.symbol === 'VCB');

      expect(vnIndex?.price).toBe(1320.5);
      expect(vcb?.price).toBe(95000);

      delete process.env.VIETNAM_MARKET_API_URL;
      delete process.env.VIETNAM_MARKET_API_KEY;
      global.fetch = originalFetch;
    });

    it('should NOT call VNDIRECT when outside trading hours, freezing last closing prices and setting isMarketOpen=false', async () => {
      // Force market to be closed (e.g. weekend or night)
      jest.spyOn(marketService, 'isVietnamStockMarketOpen').mockReturnValue(false);

      const originalFetch = global.fetch;
      const fetchSpy = jest.fn().mockResolvedValue({ ok: false });
      global.fetch = fetchSpy;

      const items = await marketService.getTicker();
      const vnIndex = items.find((i) => i.symbol === 'VN-INDEX');

      expect(vnIndex).toBeDefined();
      expect(vnIndex!.isMarketOpen).toBe(false);

      // Verify VNDIRECT endpoints were NOT requested
      const calledUrls = fetchSpy.mock.calls.map((call) => call[0] as string);
      expect(calledUrls.some((u) => u && u.includes('finfo-api.vndirect.com.vn'))).toBe(false);

      global.fetch = originalFetch;
    });

    it('should restore saved quotes from DB snapshot on startup', async () => {
      const savedSnapshot: any = {
        key: MARKET_QUOTES_SETTINGS_KEY,
        value: {
          items: [
            {
              symbol: 'VCB',
              name: 'Vietcombank',
              price: 95000,
              change: 3000,
              changePercent: 3.26,
              currency: 'VND',
              category: 'STOCK',
              updatedAt: '2026-09-04T08:00:00.000Z',
              isMarketOpen: false,
            },
          ],
        },
      };

      mockSettingsRepo.findByKey.mockResolvedValue(savedSnapshot);

      const newService = new MarketService(mockSettingsRepo);
      // Closed session so it relies on DB snapshot
      jest.spyOn(newService, 'isVietnamStockMarketOpen').mockReturnValue(false);

      const items = await newService.getTicker();
      const vcb = items.find((i) => i.symbol === 'VCB');

      expect(vcb).toBeDefined();
      expect(vcb!.price).toBe(95000);
      expect(mockSettingsRepo.findByKey).toHaveBeenCalledWith(MARKET_QUOTES_SETTINGS_KEY);
    });
  });

  describe('MarketController', () => {
    it('should call getTicker on MarketService and return ticker items', async () => {
      const spy = jest.spyOn(marketService, 'getTicker');
      const result = await marketController.getTicker();

      expect(spy).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(8);
    });
  });
});
