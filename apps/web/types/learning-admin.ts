export type EditorialStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'NEEDS_UPDATE' | 'ARCHIVED';
export interface LearningAdminPost { id: string; title: string; slug: string; status: string; editorialStatus: EditorialStatus; categoryId: string | null; createdAt: string; updatedAt: string; publishedAt: string | null; }
export interface LearningQueueResponse { data: LearningAdminPost[]; meta: { page: number; limit: number; totalItems: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean; }; }
