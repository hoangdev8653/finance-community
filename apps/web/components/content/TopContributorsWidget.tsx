'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserCheck, UserPlus } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useAuth } from '@/lib/auth/AuthContext';

const TOP_CONTRIBUTORS = [
  {
    id: 'c-1',
    name: 'Sarah Chen, CFA',
    role: 'Trưởng nhóm Nghiên cứu & Định giá',
    username: 'sarah_chen_cfa',
    articlesCount: 14,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-2',
    name: 'Nguyễn Việt Cường',
    role: 'Chuyên viên Phân tích Vĩ mô',
    username: 'cuong_macro',
    articlesCount: 9,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-3',
    name: 'Trần Minh Hoàng',
    role: 'Quản lý Quỹ & Thị trường vốn',
    username: 'hoang_tran_fund',
    articlesCount: 11,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'c-4',
    name: 'Lê Thu Trang',
    role: 'Nghiên cứu Ngành Ngân hàng',
    username: 'trang_banking',
    articlesCount: 7,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
];

export function TopContributorsWidget() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowingMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-[#253044] bg-white dark:bg-[#111827] p-4 sm:p-5 space-y-3.5 shadow-xs">
      <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
        {t('editorial.activeVoices')}
      </h3>

      <div className="space-y-3">
        {TOP_CONTRIBUTORS.map((contributor) => {
          const isFollowing = !!followingMap[contributor.id];
          return (
            <div
              key={contributor.id}
              className="flex items-center justify-between gap-2.5 p-2 -mx-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
            >
              <Link
                href={`/profile/${contributor.username}`}
                className="flex items-center gap-2.5 min-w-0 group"
              >
                <Avatar
                  src={contributor.avatarUrl}
                  fallback={contributor.name.slice(0, 2).toUpperCase()}
                  size="md"
                  className="ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 rounded-full"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                    {contributor.name}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1">
                    {contributor.role}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    {contributor.articlesCount} bài viết
                  </span>
                </div>
              </Link>

              {isAuthenticated && <button
                type="button"
                onClick={(e) => toggleFollow(contributor.id, e)}
                className={`shrink-0 inline-flex h-8 items-center gap-1.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs ${
                  isFollowing
                    ? 'bg-teal-100 dark:bg-teal-950 text-teal-950 dark:text-teal-200 border border-teal-300 dark:border-teal-800'
                    : 'bg-slate-900 dark:bg-[#162033] hover:bg-slate-800 text-white dark:text-slate-200'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-3 w-3 text-teal-700" />
                    <span>Đang theo dõi</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3" />
                    <span>Theo dõi</span>
                  </>
                )}
              </button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
