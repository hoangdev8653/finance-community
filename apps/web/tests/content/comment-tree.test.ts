import { describe, it, expect } from 'vitest';
import { buildCommentTree } from '@/lib/comments/comment-tree';
import { SerializedComment } from '@/types/comments';

describe('buildCommentTree utility', () => {
  const createMockComment = (
    id: string,
    parentId: string | null = null,
    isDeleted = false
  ): SerializedComment => ({
    id,
    postId: 'post-1',
    authorId: `author-${id}`,
    parentId,
    body: isDeleted ? '[Comment deleted]' : `Comment body ${id}`,
    status: 'VISIBLE',
    createdAt: '2026-08-15T12:00:00Z',
    updatedAt: '2026-08-15T12:00:00Z',
    deletedAt: isDeleted ? '2026-08-15T12:05:00Z' : null,
    isDeleted,
    authorProfile: {
      username: isDeleted ? '[deleted]' : `user_${id}`,
      displayName: isDeleted ? null : `User ${id}`,
      avatarMediaId: null,
    },
  });

  it('returns empty array for empty input', () => {
    expect(buildCommentTree([])).toEqual([]);
  });

  it('correctly categorizes root comments and nests child replies', () => {
    const comments: SerializedComment[] = [
      createMockComment('1', null),
      createMockComment('2', '1'),
      createMockComment('3', '1'),
      createMockComment('4', null),
    ];

    const tree = buildCommentTree(comments);

    expect(tree).toHaveLength(2);
    expect(tree[0].id).toBe('1');
    expect(tree[0].replies).toHaveLength(2);
    expect(tree[0].replies[0].id).toBe('2');
    expect(tree[0].replies[1].id).toBe('3');
    expect(tree[1].id).toBe('4');
    expect(tree[1].replies).toHaveLength(0);
  });

  it('supports deep nesting (multi-level replies)', () => {
    const comments: SerializedComment[] = [
      createMockComment('1', null),
      createMockComment('2', '1'),
      createMockComment('3', '2'),
    ];

    const tree = buildCommentTree(comments);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('1');
    expect(tree[0].replies).toHaveLength(1);
    expect(tree[0].replies[0].id).toBe('2');
    expect(tree[0].replies[0].replies).toHaveLength(1);
    expect(tree[0].replies[0].replies[0].id).toBe('3');
  });

  it('preserves replies under soft-deleted parents', () => {
    const comments: SerializedComment[] = [
      createMockComment('1', null, true), // deleted parent
      createMockComment('2', '1'), // active reply
    ];

    const tree = buildCommentTree(comments);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('1');
    expect(tree[0].isDeleted).toBe(true);
    expect(tree[0].body).toBe('[Comment deleted]');
    expect(tree[0].replies).toHaveLength(1);
    expect(tree[0].replies[0].id).toBe('2');
  });

  it('promotes orphaned replies whose parent is missing to root level', () => {
    const comments: SerializedComment[] = [
      createMockComment('2', 'non-existent-parent'),
    ];

    const tree = buildCommentTree(comments);

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('2');
  });
});
