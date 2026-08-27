import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { postsService } from '@/lib/posts/posts-service';
import { buildPageMetadata } from '@/lib/seo/metadata-helpers';
import { AppShell } from '@/components/layout/AppShell';

interface DomainPageProps {
  params: Promise<{ domainSlug: string }>;
}

async function getDomain(slug: string) {
  const domains = await postsService.getDomains();
  return domains.find((domain) => domain.slug === slug && domain.isActive);
}

export async function generateMetadata({ params }: DomainPageProps): Promise<Metadata> {
  const { domainSlug } = await params;
  const domain = await getDomain(domainSlug);
  if (!domain) return buildPageMetadata({ title: 'Domain not found', noIndex: true });
  return buildPageMetadata({
    title: domain.name,
    description: domain.description || `Latest content from ${domain.name}`,
    canonicalPath: `/${domain.slug}`,
  });
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { domainSlug } = await params;
  const domain = await getDomain(domainSlug);
  if (!domain) notFound();

  const result = await postsService.getFeed({ domainId: domain.id, limit: 20 });

  return (
    <AppShell>
      <main className="space-y-8">
        <header className="border-b border-border pb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">{domain.code}</p>
          <h1 className="mt-2 text-4xl font-heading font-extrabold text-foreground">{domain.name}</h1>
          {domain.description && <p className="mt-3 max-w-2xl text-muted-foreground">{domain.description}</p>}
        </header>

        <section aria-labelledby="domain-posts-heading" className="space-y-4">
          <h2 id="domain-posts-heading" className="text-xl font-heading font-bold text-foreground">Latest articles</h2>
          {result.data.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">No published articles yet.</p>
          ) : (
            <div className="divide-y divide-border border-y border-border">
              {result.data.map((post) => (
                <article key={post.id} className="py-5">
                  <Link href={`/${domain.slug}/bai-viet/${encodeURIComponent(post.slug)}`} className="group">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{post.contentType}</p>
                    <h3 className="mt-1 text-xl font-heading font-bold text-foreground group-hover:text-primary">{post.title}</h3>
                    {post.metaDescription && <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{post.metaDescription}</p>}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
