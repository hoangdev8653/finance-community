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
  hideSidebar = false,
  className,
  mainClassName,
}: AppShellProps) {
  return (
    <div className={cn('w-full flex min-h-[calc(100vh-4rem)]', className)}>
      {/* Left Sidebar — Full-bleed on the left edge with right vertical border */}
      {!hideSidebar && (
        <Sidebar className="hidden lg:flex w-[230px] shrink-0" />
      )}

      {/* Main Content Canvas — Maximized content width with compact right sidebar */}
      <div className="flex-1 bg-[#f0f4f9] dark:bg-slate-950 min-w-0 py-6 px-6 lg:px-8">
        <div className="w-full flex flex-col xl:flex-row items-start gap-6 lg:gap-8 min-w-0">
          {/* Main Feed Content — Takes expansive space */}
          <main className={cn('flex-1 w-full space-y-6 min-w-0', mainClassName)}>
            {children}
          </main>

          {/* Right Sidebar Widgets — Compact width */}
          {showRightSidebar && rightSidebar && (
            <aside className="w-full xl:w-[285px] 2xl:w-[300px] shrink-0 space-y-6 xl:sticky xl:top-20">
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
