'use client';

import React from 'react';
import { FileText } from 'lucide-react';

export type ProfileTabType = 'analyses';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
  analysesCount?: number;
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  analysesCount,
}: ProfileTabsProps) {
  const tabs = [
    {
      id: 'analyses' as const,
      label: 'Bài viết & Phân tích',
      icon: FileText,
      count: analysesCount,
    },
  ];

  return (
    <div className="w-full border-b border-border/80">
      <nav
        className="flex space-x-6 overflow-x-auto no-scrollbar"
        aria-label="Profile navigation tabs"
        role="tablist"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`group relative flex items-center gap-2.5 pb-3.5 pt-2 text-sm font-bold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }`}
                aria-hidden="true"
              />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {/* Active Underline Pill */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
