import { MarketService } from '../../src/modules/market/market.service';
import { MarketController } from '../../src/modules/market/market.controller';

describe('MarketModule', () => {
  let marketService: MarketService;
  let marketController: MarketController;

  beforeEach(() => {
    marketService = new MarketService();
    marketController = new MarketController(marketService);
  });

  describe('MarketService', () => {
    it('should return a list of real-time ticker items including indices, stocks, commodities, fx, and crypto', async () => {
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

      // Validate structure of an item
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
