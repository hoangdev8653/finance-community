'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PostDraft {
  title: string;
  contentType: 'SERIES' | 'COMMUNITY';
  categoryId?: string;
  domainId?: string;
  seriesId?: string;
  lessonOrder: number;
  tags: string[];
  coverMediaId: string | null;
  body: string;
  metaTitle: string;
  metaDescription: string;
}

type DraftStatus = 'idle' | 'saving' | 'saved' | 'restored';

export function usePostDraft(key: string, value: PostDraft, enabled = true) {
  const [status, setStatus] = useState<DraftStatus>('idle');
  const [restoredDraft, setRestoredDraft] = useState<PostDraft | null>(null);
  const firstRender = useRef(true);
  const restoring = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        restoring.current = true;
        setRestoredDraft(JSON.parse(raw) as PostDraft);
        setStatus('restored');
      }
    } catch {
      window.localStorage.removeItem(key);
    }
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (restoring.current) {
      restoring.current = false;
      return;
    }
    if (!value.title.trim() && !value.body.trim()) return;
    setStatus('saving');
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStatus('saved');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [enabled, key, value]);

  const clearDraft = useCallback(() => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    setRestoredDraft(null);
    setStatus('idle');
  }, [key]);

  return { restoredDraft, status, clearDraft };
}
