'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { adminService } from '@/lib/admin/admin-service';

export function PlatformPageViewTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/quan-tri') || lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;
    void adminService.recordPageView().catch(() => {
      // Analytics should never interrupt page navigation when the API is unavailable.
    });
  }, [pathname]);

  return null;
}
