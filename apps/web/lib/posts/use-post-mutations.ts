'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsService } from './posts-service';
import { CreatePostDto, UpdatePostDto } from '../../types/content';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePostDto) => postsService.createPost(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdatePostDto) => postsService.updatePost(postId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeletePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => postsService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeletePostFromAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postsService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-posts'] });
    },
  });
}
