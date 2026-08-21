'use client';

import React from 'react';
import { Award, ShieldCheck, Flame, Star } from 'lucide-react';

interface ReputationBadgeProps {
  score?: number;
  badge?: string | null;
  className?: string;
  showScore?: boolean;
}

export function ReputationBadge({
  score = 0,
  badge,
  className = '',
  showScore = true,
}: ReputationBadgeProps) {
  if (!badge && (!score || score <= 0)) return null;

  const getBadgeDetails = (b?: string | null) => {
    switch (b?.toUpperCase()) {
      case 'TOP_ANALYST':
        return {
          label: 'Top Analyst',
          icon: Star,
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        };
      case 'VERIFIED_EXPERT':
        return {
          label: 'Verified Expert',
          icon: ShieldCheck,
          color: 'bg-primary/10 text-primary border-primary/30',
        };
      case 'MARKET_VETERAN':
        return {
          label: 'Market Veteran',
          icon: Flame,
          color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        };
      default:
        return {
          label: b || 'Contributor',
          icon: Award,
          color: 'bg-muted text-muted-foreground border-border',
        };
    }
  };

  const badgeInfo = badge ? getBadgeDetails(badge) : null;
  const Icon = badgeInfo ? badgeInfo.icon : Award;

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {badgeInfo && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-2xs font-mono font-semibold ${badgeInfo.color}`}
          title={`Huy hiệu tác giả: ${badgeInfo.label}`}
        >
          <Icon className="h-3 w-3" />
          <span>{badgeInfo.label}</span>
        </span>
      )}

      {showScore && score > 0 && (
        <span
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-mono text-2xs font-semibold"
          title={`Điểm uy tín đóng góp: ${score} rep`}
        >
          <span className="text-primary font-bold">+{score}</span>
          <span className="text-[10px] opacity-75">rep</span>
        </span>
      )}
    </div>
  );
}
