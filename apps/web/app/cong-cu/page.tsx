import { redirect } from 'next/navigation';

type ToolsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

/**
 * The individual tool pages are the canonical experience. Preserve old
 * /cong-cu links, including tab-specific shared URLs, without rendering a
 * duplicate all-in-one calculator dashboard.
 */
export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const { tab } = await searchParams;

  if (tab === 'loan') redirect('/cong-cu/tinh-khoan-vay');
  if (tab === 'stock') redirect('/cong-cu/dinh-gia-co-phieu');

  redirect('/cong-cu/lai-kep');
}
