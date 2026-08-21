export interface AuthorProfile {
  username: string;
  displayName: string | null;
  avatarMediaId: string | null;
}

export interface SerializedComment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  mediaId?: string | null;
  media?: { id: string; secureUrl: string } | null;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isDeleted: boolean;
  authorProfile?: AuthorProfile | null;
}

export interface ThreadedComment extends SerializedComment {
  replies: ThreadedComment[];
}

export interface CreateCommentDto {
  body: string;
  parentId?: string;
  mediaId?: string;
}

export interface UpdateCommentDto {
  body: string;
}

export interface QueryCommentsParams {
  page?: number;
  limit?: number;
}
