import { PostEntity, CategoryEntity, TagEntity, PaginatedResult } from '../../types/content';

export const MOCK_CATEGORIES: CategoryEntity[] = [
  { id: 'cat-macro', name: 'Macroeconomics', slug: 'macroeconomics', scope: 'COMMUNITY', sortOrder: 1, description: null, icon: null, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-stock', name: 'Stock Market', slug: 'stock-market', scope: 'COMMUNITY', sortOrder: 2, description: null, icon: null, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-investing', name: 'Investing', slug: 'investing', scope: 'COMMUNITY', sortOrder: 3, description: null, icon: null, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-personal', name: 'Personal Finance', slug: 'personal-finance', scope: 'COMMUNITY', sortOrder: 4, description: null, icon: null, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-crypto', name: 'Crypto', slug: 'crypto', scope: 'COMMUNITY', sortOrder: 5, description: null, icon: null, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'cat-valuation', name: 'Valuation', slug: 'valuation', scope: 'COMMUNITY', sortOrder: 6, description: null, icon: null, createdAt: '2026-01-01T00:00:00Z' },
];

export const MOCK_TAGS: TagEntity[] = [
  { id: 'tag-investing', name: 'investing', slug: 'investing', usageCount: 56, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-personal-finance', name: 'personal-finance', slug: 'personal-finance', usageCount: 48, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-stock-market', name: 'stock-market', slug: 'stock-market', usageCount: 42, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-crypto', name: 'crypto', slug: 'crypto', usageCount: 31, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-valuation', name: 'valuation', slug: 'valuation', usageCount: 27, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-macroeconomics', name: 'macroeconomics', slug: 'macroeconomics', usageCount: 25, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag-derivatives', name: 'derivatives', slug: 'derivatives', usageCount: 18, createdAt: '2026-01-01T00:00:00Z' },
];

export const MOCK_POSTS: PostEntity[] = [
  {
    id: 'post-1',
    title: 'Financial Analysis and Market Intelligence',
    slug: 'financial-analysis-and-market-intelligence',
    contentType: 'COMMUNITY',
    status: 'PUBLISHED',
    authorId: '987fcdeb-1234-5678-abcd-ef0123456789',
    categoryId: 'cat-macro',
    body: '### Executive Summary\n\nThis is a high-conviction financial analysis exploring macroeconomic liquidity dynamics and asset valuation multiples.',
    coverMediaId: null,
    metaTitle: 'Financial Analysis and Market Intelligence',
    metaDescription: 'Meta description excerpt tit amet, consectetur adipiscing elit. Restams store promotion and convenience hosts to export a notta line more.',
    viewCount: 1240,
    publishedAt: '2026-08-17T10:30:00Z',
    createdAt: '2026-08-17T09:00:00Z',
    updatedAt: '2026-08-17T10:30:00Z',
    deletedAt: null,
  },
  {
    id: 'post-2',
    title: 'Financial Analysis Pulls & Market Intelligence',
    slug: 'financial-analysis-pulls-market-intelligence',
    contentType: 'COMMUNITY',
    status: 'PUBLISHED',
    authorId: '12345678-abcd-ef01-2345-6789abcdef01',
    categoryId: 'cat-stock',
    body: '### Market Pull Analysis\n\nExamining multi-timeframe moving average convergences and order block structures.',
    coverMediaId: null,
    metaTitle: 'Financial Analysis Pulls & Market Intelligence',
    metaDescription: 'Meta description excerpt tit amet, consectetur adipiscing elit. Restams store promotion and convenience hosts to export a notta line more.',
    viewCount: 30200,
    publishedAt: '2026-08-16T14:15:00Z',
    createdAt: '2026-08-16T12:00:00Z',
    updatedAt: '2026-08-16T14:15:00Z',
    deletedAt: null,
  },
  {
    id: 'post-3',
    title: 'Fixed Income Multiples & Monetary Policy Shift',
    slug: 'fixed-income-multiples-monetary-policy-shift',
    contentType: 'COMMUNITY',
    status: 'PUBLISHED',
    authorId: '56781234-ef01-abcd-2345-abcdef012345',
    categoryId: 'cat-investing',
    body: '### Fixed Income Research\n\nAnalyzing corporate debt spreads, duration sensitivity, and yield curve inversion indicators across global fixed income markets.',
    coverMediaId: null,
    metaTitle: 'Fixed Income Multiples & Monetary Policy Shift',
    metaDescription: 'Analyzing corporate debt spreads, duration sensitivity, and yield curve inversion indicators across global fixed income markets.',
    viewCount: 4500,
    publishedAt: '2026-08-14T08:00:00Z',
    createdAt: '2026-08-14T07:30:00Z',
    updatedAt: '2026-08-14T08:00:00Z',
    deletedAt: null,
  },
  {
    id: 'post-4',
    title: 'Modern Quantitative Valuation: Discounted Cash Flow in High-Rate Environments',
    slug: 'modern-quantitative-valuation-dcf-high-rate-environments',
    contentType: 'SERIES',
    status: 'PUBLISHED',
    authorId: 'abcdef01-2345-6789-abcd-ef0123456789',
    categoryId: 'cat-valuation',
    body: '### DCF Valuation Framework\n\nPractical frameworks for adjusting WACC, terminal growth assumptions, and cost of capital under shifting monetary regimes.',
    coverMediaId: null,
    metaTitle: 'Modern Quantitative Valuation',
    metaDescription: 'Practical frameworks for adjusting WACC, terminal growth assumptions, and cost of capital under shifting monetary regimes.',
    viewCount: 8900,
    publishedAt: '2026-08-12T16:45:00Z',
    createdAt: '2026-08-12T15:00:00Z',
    updatedAt: '2026-08-12T16:45:00Z',
    deletedAt: null,
  },
];

export function getMockPaginatedFeed(params?: {
  categoryId?: string;
  tagId?: string;
  contentType?: string;
  page?: number;
  limit?: number;
}): PaginatedResult<PostEntity> {
  let filtered = [...MOCK_POSTS];

  if (params?.categoryId) {
    filtered = filtered.filter((p) => p.categoryId === params.categoryId);
  }

  if (params?.contentType) {
    filtered = filtered.filter((p) => p.contentType === params.contentType);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const data = filtered.slice((page - 1) * limit, page * limit);

  return {
    data,
    meta: {
      totalItems,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
