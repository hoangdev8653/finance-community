'use client';

import React, { useState } from 'react';
import { PostModerationTable } from '@/components/admin/PostModerationTable';
import { ModerationQueueTable } from '@/components/moderation/ModerationQueueTable';
import { FileCheck, ShieldAlert, ShieldCheck } from 'lucide-react';

export function AdminModerationHub() {
  const [activeTab, setActiveTab] = useState<'posts' | 'reports'>('posts');

  return (
    <div className="community-area mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Trung tâm quản trị</p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">Kiểm duyệt nội dung</h1>
          </div>
        </div>
        <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1 sm:w-auto" role="group" aria-label="Loại nội dung cần kiểm duyệt">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}

          aria-pressed={activeTab === 'posts'}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 sm:flex-none ${
            activeTab === 'posts'
              ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Duyệt bài viết</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}

          aria-pressed={activeTab === 'reports'}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 sm:flex-none ${
            activeTab === 'reports'
              ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Báo cáo vi phạm</span>
        </button>
        </div>
      </div>

      {activeTab === 'posts' ? <PostModerationTable /> : <ModerationQueueTable />}
    </div>
  );
}
