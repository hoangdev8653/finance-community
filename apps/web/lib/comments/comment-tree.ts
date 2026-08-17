import { SerializedComment, ThreadedComment } from '../../types/comments';

/**
 * Reconstructs a flat chronological list of comments into a hierarchical tree in linear O(N) time.
 * Handles deleted parents, maintains descendant attachments, and gracefully promotes orphaned replies.
 */
export function buildCommentTree(comments: SerializedComment[]): ThreadedComment[] {
  if (!comments || comments.length === 0) {
    return [];
  }

  // 1. Initialize map with cloned threaded comment nodes
  const commentMap = new Map<string, ThreadedComment>();
  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    });
  });

  const rootComments: ThreadedComment[] = [];

  // 2. Linear pass to attach children to parents or place at root
  comments.forEach((original) => {
    const node = commentMap.get(original.id)!;
    if (node.parentId && commentMap.has(node.parentId)) {
      const parent = commentMap.get(node.parentId)!;
      parent.replies.push(node);
    } else {
      // Root comment or orphaned reply whose parent record does not exist
      rootComments.push(node);
    }
  });

  return rootComments;
}
