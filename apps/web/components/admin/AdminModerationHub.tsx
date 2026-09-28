'use client';

import React, { useState } from 'react';
import { PostModerationTable } from '@/components/admin/PostModerationTable';
import { ModerationQueueTable } from '@/components/moderation/ModerationQueueTable';
import { FileCheck, ShieldAlert } from 'lucide-react';

export function AdminModerationHub() {
  const [activeTab, setActiveTab] = useState<'posts' | 'reports'>('posts');

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
            activeTab === 'posts'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Duyệt bài viết</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
            activeTab === 'reports'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Báo cáo vi phạm</span>
        </button>
      </div>

      {activeTab === 'posts' ? <PostModerationTable /> : <ModerationQueueTable />}
    </div>
  );
}
