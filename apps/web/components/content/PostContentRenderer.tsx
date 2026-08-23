import React from 'react';

interface PostContentRendererProps {
  body: string | null;
}

export function PostContentRenderer({ body }: PostContentRendererProps) {
  if (!body || body.trim().length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground italic">
        No content provided for this analysis.
      </div>
    );
  }

  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none 
        [&_h2]:font-heading [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-slate-900 dark:[&_h2]:text-slate-100 [&_h2]:border-b [&_h2]:border-slate-200/80 dark:[&_h2]:border-slate-800 [&_h2]:pb-3
        [&_h3]:font-heading [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-slate-900 dark:[&_h3]:text-slate-100
        [&_h4]:font-heading [&_h4]:text-lg sm:[&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-slate-900 dark:[&_h4]:text-slate-100
        [&_p]:font-sans [&_p]:text-lg sm:[&_p]:text-xl [&_p]:leading-[1.8] [&_p]:text-slate-800 dark:[&_p]:text-slate-200 [&_p]:mb-6
        [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-600 [&_blockquote]:bg-emerald-50/50 dark:[&_blockquote]:bg-emerald-950/20 [&_blockquote]:py-3 [&_blockquote]:px-5 [&_blockquote]:rounded-r-xl [&_blockquote]:italic [&_blockquote]:text-slate-800 dark:[&_blockquote]:text-slate-200 [&_blockquote]:my-6
        [&_code]:font-mono [&_code]:text-sm sm:[&_code]:text-base [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800 [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-emerald-700 dark:[&_code]:text-emerald-400
        [&_pre]:bg-slate-900 [&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-slate-800 [&_pre]:my-6
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-100
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-3 [&_ul]:mb-6 [&_ul]:text-slate-800 dark:[&_ul]:text-slate-200 [&_ul]:text-base sm:[&_ul]:text-lg
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-3 [&_ol]:mb-6 [&_ol]:text-slate-800 dark:[&_ol]:text-slate-200 [&_ol]:text-base sm:[&_ol]:text-lg
        [&_li]:leading-[1.8]
        [&_a]:text-emerald-600 dark:[&_a]:text-emerald-400 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:opacity-80 [&_a]:font-medium
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-base
        [&_th]:border [&_th]:border-slate-200 dark:[&_th]:border-slate-800 [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800/80 [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold
        [&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-slate-800 [&_td]:p-3"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
