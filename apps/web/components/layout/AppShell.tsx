'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { cn } from '@/lib/utils/cn';

export interface AppShellProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
  showRightSidebar?: boolean;
  hideSidebar?: boolean;
  className?: string;
  mainClassName?: string;
}

export function AppShell({
  children,
  rightSidebar,
  showRightSidebar = false,
  hideSidebar = true,
  className,
  mainClassName,
}: AppShellProps) {
  return (
    <div className={cn('w-full min-h-[calc(100vh-5rem)] bg-slate-100 dark:bg-[#0b0f17]', className)}>
      {/* Main Expansive Container — Centered with max-w-[1440px] */}
      <div className="max-w-[1440px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col xl:flex-row items-start gap-6 lg:gap-8 min-w-0">
          {/* Main Feed Content — Takes generous 70%+ breathing space */}
          <main className={cn('flex-1 w-full space-y-6 min-w-0', mainClassName)}>
            {children}
          </main>

          {/* Right Sidebar Widgets — Compact 310px width with sticky positioning */}
          {showRightSidebar && rightSidebar && (
            <aside className="w-full xl:w-[320px] 2xl:w-[340px] shrink-0 space-y-6 xl:sticky xl:top-24">
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
