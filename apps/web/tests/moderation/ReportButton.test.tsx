import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportButton } from '@/components/moderation/ReportButton';
import * as authContext from '@/lib/auth/AuthContext';
import * as navigation from 'next/navigation';

vi.mock('@/lib/auth/AuthContext');
vi.mock('next/navigation');
vi.mock('@/lib/moderation/use-moderation', () => ({
  useFileReport: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('ReportButton Component', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(navigation.useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(navigation.usePathname).mockReturnValue('/posts/community/test-slug');
  });

  it('redirects to /login if clicked when unauthenticated', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
    } as any);

    render(
      <ReportButton
        targetType="POST"
        targetId="post-123"
        targetTitle="Test Post Title"
      />
    );

    const button = screen.getByRole('button', { name: /Đăng nhập để báo cáo Post/i });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/login?returnUrl=')
    );
  });

  it('opens ReportModal when authenticated user clicks report button', () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-1', roles: ['MEMBER'] },
    } as any);

    render(
      <ReportButton
        targetType="COMMENT"
        targetId="comment-123"
        variant="text"
      />
    );

    const button = screen.getByRole('button', { name: /Báo cáo Comment/i });
    fireEvent.click(button);

    expect(screen.getByRole('dialog', { name: /Report Comment/i })).toBeDefined();
  });
});
