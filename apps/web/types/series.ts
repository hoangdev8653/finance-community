export interface SeriesItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  publishedArticleCount: number;
  createdAt: string;
}

export interface SeriesArticleItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  viewCount: number;
}

export interface SeriesDetailResponse {
  series: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    createdAt: string;
  };
  articles: SeriesArticleItem[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface QuerySeriesParams {
  page?: number;
  limit?: number;
}
