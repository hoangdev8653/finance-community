import React from 'react';
import { DashboardTabType } from '../../types/dashboard';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils/cn';

interface DashboardTabsProps {
  activeTab: DashboardTabType;
  onTabChange: (tab: DashboardTabType) => void;
  publishedCount?: number;
  draftsCount?: number;
}

export function DashboardTabs({
  activeTab,
  onTabChange,
  publishedCount,
  draftsCount,
}: DashboardTabsProps) {
  const tabs: { id: DashboardTabType; label: string; count?: number }[] = [
    { id: 'published', label: 'Published Research', count: publishedCount },
    { id: 'drafts', label: 'Drafts', count: draftsCount },
    { id: 'bookmarks', label: 'Saved Bookmarks' },
    { id: 'archived', label: 'Archived Notes' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % tabs.length;
      onTabChange(tabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      onTabChange(tabs[prevIndex].id);
    }
  };

  return (
    <div className="border-b border-border overflow-x-auto scrollbar-none" role="tablist" aria-label="Research status views">
      <nav className="-mb-px flex space-x-4 sm:space-x-6 min-w-full" aria-label="Tabs">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                'group inline-flex items-center gap-2 border-b-2 py-3.5 sm:py-4 px-1 text-xs sm:text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap shrink-0 cursor-pointer',
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className="px-1.5 py-0 text-[11px] font-mono"
                >
                  {tab.count}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
