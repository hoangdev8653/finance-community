'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { marketService } from './market-service';
import { MarketTickerItem, TickFlashState } from '../../types/market';

const FALLBACK_TICKER_ITEMS: MarketTickerItem[] = [
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

export function useMarketTicker() {
  const [flashStates, setFlashStates] = useState<Record<string, TickFlashState>>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  const {
    data: tickerData,
    isLoading,
    isError,
    refetch,
  } = useQuery<MarketTickerItem[]>({
    queryKey: ['market-ticker'],
    queryFn: async () => {
      try {
        return await marketService.getTicker();
      } catch {
        return FALLBACK_TICKER_ITEMS;
      }
    },
    initialData: FALLBACK_TICKER_ITEMS,
    refetchInterval: 15000, // 15s polling
    refetchOnWindowFocus: false,
  });

  const items = tickerData || FALLBACK_TICKER_ITEMS;

  useEffect(() => {
    if (!items || items.length === 0) return;

    const newFlashes: Record<string, TickFlashState> = {};
    let hasChanges = false;

    items.forEach((item) => {
      const prevPrice = prevPricesRef.current[item.symbol];
      if (prevPrice !== undefined && prevPrice !== item.price) {
        newFlashes[item.symbol] = item.price > prevPrice ? 'up' : 'down';
        hasChanges = true;
      }
      prevPricesRef.current[item.symbol] = item.price;
    });

    if (hasChanges) {
      setFlashStates((prev) => ({ ...prev, ...newFlashes }));

      // Clear flash animation after 1000ms
      const timer = setTimeout(() => {
        setFlashStates({});
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [items]);

  return {
    items,
    flashStates,
    isLoading,
    isError,
    refetch,
  };
}
