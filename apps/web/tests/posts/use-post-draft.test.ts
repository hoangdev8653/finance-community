import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePostDraft, PostDraft } from '@/lib/posts/use-post-draft';

const value: PostDraft = {
  title: 'Bài nháp', contentType: 'COMMUNITY', lessonOrder: 1, tags: [],
  coverMediaId: null, body: 'Nội dung', metaTitle: '', metaDescription: '',
};

describe('usePostDraft', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('autosaves after debounce and clears the draft', async () => {
    const { result, rerender } = renderHook(({ draft }) => usePostDraft('draft:test', draft), { initialProps: { draft: value } });
    rerender({ draft: { ...value, body: 'Gewijzigde nội dung' } });
    await waitFor(() => expect(window.localStorage.getItem('draft:test')).not.toBeNull());
    expect(JSON.parse(window.localStorage.getItem('draft:test') || '{}')).toMatchObject({ body: 'Gewijzigde nội dung' });
    act(() => result.current.clearDraft());
    expect(window.localStorage.getItem('draft:test')).toBeNull();
  });

  it('restores an existing draft', async () => {
    window.localStorage.setItem('draft:test', JSON.stringify(value));
    const { result } = renderHook(() => usePostDraft('draft:test', { ...value, title: '' }));
    await waitFor(() => expect(result.current.restoredDraft).toEqual(value));
    expect(result.current.status).toBe('restored');
  });
});
