import React from 'react';

interface PostContentRendererProps {
  body: string | null;
}

export interface ContentHeading { id: string; text: string; level: 2 | 3; }

export function extractContentHeadings(body: string | null): ContentHeading[] {
  if (!body) return [];
  const used = new Map<string, number>();

  if (/<h[23]/i.test(body)) {
    return Array.from(body.matchAll(/<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi)).map((match) => {
      const text = match[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
      const base = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      return { id: count ? `${base}-${count + 1}` : base, text, level: Number(match[1]) as 2 | 3 };
    }).filter((heading) => heading.text);
  }

  // Fallback for Markdown headings ## and ###
  const headings: ContentHeading[] = [];
  const lines = body.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length as 2 | 3;
      const text = match[2].replace(/[*_`#]/g, '').trim();
      if (!text) continue;
      const base = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      headings.push({ id: count ? `${base}-${count + 1}` : base, text, level });
    }
  }
  return headings;
}

function addHeadingIds(html: string, headings: ContentHeading[]): string {
  let index = 0;
  return html.replace(/<h([23])([^>]*)>/gi, (tag, level, attributes) => {
    const heading = headings[index++];
    if (heading && Number(level) === heading.level) {
      const cleanAttrs = attributes.replace(/id=["'][^"']*["']/gi, '').trim();
      return `<h${level} id="${heading.id}" ${cleanAttrs} class="scroll-mt-28">`;
    }
    return tag;
  });
}

function optimizeCloudinaryImages(html: string): string {
  return html.replace(/(<img\b[^>]*\bsrc=["'])(https:\/\/res\.cloudinary\.com\/[^"']+)(["'][^>]*>)/gi, (_match, prefix, source, suffix) => {
    if (!source.includes('/image/upload/')) return `${prefix}${source}${suffix}`;
    const [base, rest] = source.split('/image/upload/');
    if (!rest || /^(?:f_auto|q_auto|w_\d+)/.test(rest)) return `${prefix}${source}${suffix}`;
    return `${prefix}${base}/image/upload/f_auto,q_auto,w_1200/${rest}${suffix}`;
  });
}

export function PostContentRenderer({ body }: PostContentRendererProps) {
  if (!body || body.trim().length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground italic">
        No content provided for this analysis.
      </div>
    );
  }

  const headings = extractContentHeadings(body);
  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none 
        [&_h2]:font-heading [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-slate-900 dark:[&_h2]:text-slate-100 [&_h2]:border-b [&_h2]:border-slate-200/80 dark:[&_h2]:border-slate-800 [&_h2]:pb-3
        [&_h3]:font-heading [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-slate-900 dark:[&_h3]:text-slate-100
        [&_h4]:font-heading [&_h4]:text-lg sm:[&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-slate-900 dark:[&_h4]:text-slate-100
        [&_p]:font-sans [&_p]:text-base sm:[&_p]:text-lg lg:[&_p]:text-xl [&_p]:leading-relaxed [&_p]:text-slate-800 dark:[&_p]:text-slate-200 [&_p]:mb-6
        [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-600 [&_blockquote]:bg-emerald-50/50 dark:[&_blockquote]:bg-emerald-950/20 [&_blockquote]:py-3 [&_blockquote]:px-5 [&_blockquote]:rounded-r-xl [&_blockquote]:italic [&_blockquote]:text-slate-800 dark:[&_blockquote]:text-slate-200 [&_blockquote]:my-6
        [&_code]:font-mono [&_code]:text-xs sm:[&_code]:text-sm md:[&_code]:text-base [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800 [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-emerald-700 dark:[&_code]:text-emerald-400
        [&_pre]:bg-slate-900 [&_pre]:p-4 sm:[&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-slate-800 [&_pre]:my-6 [&_pre]:max-w-full
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-100
        [&_ul]:list-disc [&_ul]:pl-5 sm:[&_ul]:pl-6 [&_ul]:space-y-2.5 sm:[&_ul]:space-y-3 [&_ul]:mb-6 [&_ul]:text-slate-800 dark:[&_ul]:text-slate-200 [&_ul]:text-sm sm:[&_ul]:text-base lg:[&_ul]:text-lg
        [&_ol]:list-decimal [&_ol]:pl-5 sm:[&_ol]:pl-6 [&_ol]:space-y-2.5 sm:[&_ol]:space-y-3 [&_ol]:mb-6 [&_ol]:text-slate-800 dark:[&_ol]:text-slate-200 [&_ol]:text-sm sm:[&_ol]:text-base lg:[&_ol]:text-lg
        [&_li]:leading-relaxed
        [&_a]:text-emerald-600 dark:[&_a]:text-emerald-400 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:opacity-80 [&_a]:font-medium
        [&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-border
        [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:my-6 [&_table]:text-sm sm:[&_table]:text-base
        [&_th]:border [&_th]:border-slate-200 dark:[&_th]:border-slate-800 [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800/80 [&_th]:p-2.5 sm:[&_th]:p-3 [&_th]:text-left [&_th]:font-semibold [&_th]:whitespace-nowrap
        [&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-slate-800 [&_td]:p-2.5 sm:[&_td]:p-3"
      dangerouslySetInnerHTML={{ __html: addHeadingIds(optimizeCloudinaryImages(body), headings) }}
    />
  );
}
