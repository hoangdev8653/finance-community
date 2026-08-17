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
        [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-foreground [&_h2]:border-b [&_h2]:border-border/60 [&_h2]:pb-2
        [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-foreground
        [&_h4]:font-serif [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-foreground
        [&_p]:font-sans [&_p]:text-base sm:[&_p]:text-lg [&_p]:leading-relaxed [&_p]:text-foreground/90 [&_p]:mb-6
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-muted/20 [&_blockquote]:py-2 [&_blockquote]:px-4 [&_blockquote]:rounded-r [&_blockquote]:italic [&_blockquote]:text-foreground/80 [&_blockquote]:my-6
        [&_code]:font-mono [&_code]:text-xs sm:[&_code]:text-sm [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary
        [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border [&_pre]:my-6
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-6 [&_ul]:text-foreground/90
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-6 [&_ol]:text-foreground/90
        [&_li]:leading-relaxed
        [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:opacity-80 [&_a]:font-medium
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-sm
        [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-2.5 [&_th]:text-left [&_th]:font-semibold
        [&_td]:border [&_td]:border-border [&_td]:p-2.5"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
