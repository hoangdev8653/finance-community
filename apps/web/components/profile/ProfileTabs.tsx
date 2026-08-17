'use client';

import React from 'react';
import { FileText, Users } from 'lucide-react';

export type ProfileTabType = 'analyses' | 'followers' | 'following';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
  analysesCount?: number;
  followersCount?: number;
  followingCount?: number;
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  analysesCount,
  followersCount,
  followingCount,
}: ProfileTabsProps) {
  const tabs = [
    {
      id: 'analyses' as const,
      label: 'Analyses',
      icon: FileText,
      count: analysesCount,
    },
    {
      id: 'followers' as const,
      label: 'Followers',
      icon: Users,
      count: followersCount,
    },
    {
      id: 'following' as const,
      label: 'Following',
      icon: Users,
      count: followingCount,
    },
  ];

  return (
    <div className="border-b border-border">
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
              className={`flex items-center gap-2 py-3 border-b-2 font-mono text-xs sm:text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary ${
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.5 rounded text-2xs ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
