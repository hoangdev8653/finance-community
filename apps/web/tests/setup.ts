import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock('@/lib/posts/use-post-bookmark', () => ({
  usePostBookmark: vi.fn(() => ({
    isBookmarked: false,
    isLoading: false,
    toggleBookmark: vi.fn(),
  })),
}));

