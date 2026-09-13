export interface CourseItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  publishedArticleCount: number;
  createdAt: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  viewCount: number;
}

export interface CourseDetailResponse {
  series: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    createdAt: string;
  };
  articles: CourseLesson[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface QueryCourseParams {
  page?: number;
  limit?: number;
}
