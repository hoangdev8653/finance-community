'use client';

import React from 'react';
import { MarketTickerItem, TickFlashState } from '../../types/market';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TickerItemProps {
  item: MarketTickerItem;
  flashState?: TickFlashState;
}

function TickerItemComponent({ item, flashState }: TickerItemProps) {
  const isPositive = item.change > 0;
  const isNegative = item.change < 0;

  // Format price based on currency and magnitude
  const formattedPrice = (() => {
    if (item.currency === 'POINTS') {
      return item.price.toLocaleString('vi-VN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (item.currency === 'USD') {
      return `$${item.price.toLocaleString('en-US', {
        minimumFractionDigits: item.price < 10 ? 2 : 1,
        maximumFractionDigits: 2,
      })}`;
    }

    // Currency VND
    if (item.price >= 1_000_000) {
      // e.g. Gold 83,500,000 -> 83.5M
      return `${(item.price / 1_000_000).toLocaleString('vi-VN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} tr`;
    }

    return item.price.toLocaleString('vi-VN');
  })();

  const formattedChangePercent = `${isPositive ? '+' : ''}${item.changePercent.toFixed(2)}%`;

  // Color classes for change
  const colorClass = isPositive
    ? 'text-emerald-600 dark:text-emerald-400'
    : isNegative
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-amber-500 dark:text-amber-400';

  // Flash highlight state
  const flashBgClass =
    flashState === 'up'
      ? 'bg-emerald-500/25 ring-1 ring-emerald-500/50 shadow-xs'
      : flashState === 'down'
        ? 'bg-rose-500/25 ring-1 ring-rose-500/50 shadow-xs'
        : 'bg-transparent';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs transition-all duration-300 select-none ${flashBgClass}`}
    >
      {/* Symbol Badge */}
      <span className="font-bold tracking-tight text-foreground font-sans">
        {item.symbol}
      </span>

      {/* Real-time Price */}
      <span className="font-mono font-semibold text-foreground">
        {formattedPrice}
      </span>

      {/* Change & Arrow */}
      <div className={`flex items-center gap-0.5 font-mono font-medium ${colorClass}`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : isNegative ? (
          <TrendingDown className="h-3 w-3" />
        ) : (
          <Minus className="h-3 w-3" />
        )}
        <span>{formattedChangePercent}</span>
      </div>
    </div>
  );
}

export const TickerItem = React.memo(TickerItemComponent);

