'use client';

import type { MouseEvent } from 'react';

const categories = [
  { id: 'hoc-tap', label: 'Học tập' },
  { id: 'cong-dong', label: 'Cộng đồng' },
  { id: 'cong-cu', label: 'Công cụ tài chính' },
  { id: 'ho-tro', label: 'Thông tin & hỗ trợ' },
];

export function ExploreSectionNav() {
  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
    window.history.pushState(null, '', `#${id}`);
  };

  return (
    <nav aria-label="Danh mục khám phá" className="flex flex-wrap gap-2">
      {categories.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(event) => scrollToSection(event, id)}
          className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
