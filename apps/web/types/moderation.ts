export type ReportTargetType = 'POST' | 'COMMENT' | 'USER';

export type ReportStatus = 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

export type ModerationActionType =
  | 'WARN'
  | 'HIDE_CONTENT'
  | 'SUSPEND'
  | 'BAN'
  | 'DISMISS';

export interface CreateReportDto {
  reportedPostId?: string;
  reportedCommentId?: string;
  reportedUserId?: string;
  reason: string;
  description?: string;
}

export interface ReportItem {
  id: string;
  reporterId: string | null;
  reportedPostId: string | null;
  reportedCommentId: string | null;
  reportedUserId: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export interface QueryReportsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedReportsResponse {
  data: ReportItem[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ExecuteModerationActionDto {
  reportId?: string;
  targetPostId?: string;
  targetCommentId?: string;
  targetUserId?: string;
  actionType: ModerationActionType;
  reason: string;
  metadata?: Record<string, any>;
}

export interface ModerationActionItem {
  id: string;
  moderatorId: string;
  reportId: string | null;
  actionType: ModerationActionType;
  targetUserId: string | null;
  reason: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export const REPORT_REASONS = [
  {
    key: 'SPAM',
    label: 'Spam or Commercial Promotion',
    description: 'Promotional advertising, affiliate links, or commercial solicitation.',
  },
  {
    key: 'MISINFORMATION',
    label: 'Financial Misinformation / Manipulation',
    description: 'Deceptive market manipulation, false disclosures, or unverified claims.',
  },
  {
    key: 'HARASSMENT',
    label: 'Harassment or Offensive Language',
    description: 'Hate speech, defamation, hostile behavior, or abusive language.',
  },
  {
    key: 'PLAGIARISM',
    label: 'Plagiarism / Copyright Violation',
    description: 'Unattributed copying of analytical content or intellectual property.',
  },
  {
    key: 'OTHER',
    label: 'Other Policy Violation',
    description: 'General violation of the community platform code of conduct.',
  },
] as const;
