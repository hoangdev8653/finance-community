'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import type { ContentHeading } from './PostContentRenderer';

export function PostTableOfContents({ headings }: { headings: ContentHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '');

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveId(visible[0].target.id);
    }, { rootMargin: '-96px 0px -65% 0px', threshold: [0, 1] });
    headings.forEach(({ id }) => document.getElementById(id) && observer.observe(document.getElementById(id)!));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;
  return <nav aria-label="Mục lục bài viết" className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800/90 dark:bg-slate-900">
    <div className="mb-3 flex items-center gap-2 font-heading text-sm font-bold"><List className="h-4 w-4 text-emerald-600" />Mục lục</div>
    <ol className="space-y-1 border-l border-slate-200 dark:border-slate-700">
      {headings.map((heading) => <li key={heading.id}>
        <a href={`#${heading.id}`} onClick={(event) => { event.preventDefault(); document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.history.replaceState(null, '', `#${heading.id}`); }} aria-current={activeId === heading.id ? 'location' : undefined} className={`block border-l-2 py-1.5 text-sm leading-snug transition-colors ${heading.level === 3 ? 'pl-5' : 'pl-3 font-semibold'} ${activeId === heading.id ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-emerald-700 dark:text-slate-400'}`}>{heading.text}</a>
      </li>)}
    </ol>
  </nav>;
}
