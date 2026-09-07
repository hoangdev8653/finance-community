'use client';

import React, { useState, useEffect } from 'react';
import { useMarketTicker } from '../../lib/market/use-market-ticker';
import { TickerItem } from './TickerItem';
import { Eye, EyeOff } from 'lucide-react';

export function MarketTickerBar() {
  const { items, flashStates } = useMarketTicker();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('market_ticker_visible');
      if (saved !== null) {
        setIsVisible(saved === 'true');
      }
    } catch {
      // Ignore in restricted environments
    }
  }, []);

  const handleToggle = (visible: boolean) => {
    setIsVisible(visible);
    try {
      localStorage.setItem('market_ticker_visible', String(visible));
    } catch {
      // Ignore
    }
  };

  if (!items || items.length === 0) return null;

  if (!isVisible) {
    return (
      <div className="bg-background/90 border-b border-border px-4 py-1 flex justify-end">
        <button
          type="button"
          onClick={() => handleToggle(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition font-medium cursor-pointer"
          title="Mở thanh chỉ số thị trường"
          aria-label="Hiện chỉ số thị trường"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Hiện chỉ số thị trường</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative z-40 h-9 w-full max-w-full overflow-hidden border-b border-border bg-background/95 backdrop-blur-xs select-none transition-all duration-200"
      aria-label="Thanh chỉ số thị trường trực tiếp"
      data-testid="market-ticker-bar"
    >
      <div className="flex h-full w-full min-w-0 items-center">
        {/* Live Indicator Badge (Left Anchor) */}
        <div className="relative z-10 flex h-full shrink-0 items-center gap-2 border-r border-border bg-background px-3 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="hidden sm:inline text-xs font-bold tracking-wider text-foreground uppercase font-mono">
            Thị Trường
          </span>
        </div>

        {/* Marquee Ticker Track */}
        <div className="group relative flex flex-1 min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)]">
          <div className="flex w-max shrink-0 items-center gap-4 pr-4 animate-[marquee-loop_45s_linear_infinite] group-hover:[animation-play-state:paused]">
            {items.map((item) => (
              <React.Fragment key={`ticker-1-${item.symbol}`}>
                <TickerItem item={item} flashState={flashStates[item.symbol]} />
                <span className="h-3 w-px bg-border/70 shrink-0" />
              </React.Fragment>
            ))}
          </div>

          {/* Duplicate set for continuous seamless loop */}
          <div
            className="flex w-max shrink-0 items-center gap-4 pr-4 animate-[marquee-loop_45s_linear_infinite] group-hover:[animation-play-state:paused]"
            aria-hidden="true"
          >
            {items.map((item) => (
              <React.Fragment key={`ticker-2-${item.symbol}`}>
                <TickerItem item={item} flashState={flashStates[item.symbol]} />
                <span className="h-3 w-px bg-border/70 shrink-0" />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Hide Toggle Button (Right Anchor) */}
        <div className="relative z-10 flex h-full shrink-0 items-center border-l border-border bg-background px-2">
          <button
            type="button"
            onClick={() => handleToggle(false)}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
            title="Thu gọn dải chỉ số thị trường"
            aria-label="Ẩn dải chỉ số"
          >
            <EyeOff className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
