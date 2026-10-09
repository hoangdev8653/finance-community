import { redirect } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  redirect(`/bai-viet/cong-dong?category=${encodeURIComponent(slug)}`);
}
