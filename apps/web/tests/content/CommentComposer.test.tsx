import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentComposer } from '@/components/content/CommentComposer';
import { useAuth } from '@/lib/auth/AuthContext';

import { ToastProvider } from '@/lib/toast/ToastContext';

vi.mock('@/lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/media/use-media', () => ({
  useUploadMedia: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    uploadProgress: 0,
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/posts/community/test-post',
}));

const renderWithToast = (ui: React.ReactElement) => render(<ToastProvider>{ui}</ToastProvider>);

describe('CommentComposer Component', () => {
  it('renders unauthenticated sign-in prompt when user is logged out', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    renderWithToast(<CommentComposer onSubmit={vi.fn()} />);

    expect(screen.getByText(/Sign in to join the discussion/i)).toBeDefined();
    const loginLink = screen.getByRole('link', { name: /Sign In to Comment/i });
    expect(loginLink.getAttribute('href')).toContain('/login?redirect=');
  });

  it('renders form and handles successful submission when authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        email: 'analyst@bloomberg.com',
        username: 'analyst',
        roles: ['USER'],
        status: 'ACTIVE',
      },
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    const onSubmitMock = vi.fn().mockResolvedValue(undefined);
    renderWithToast(<CommentComposer onSubmit={onSubmitMock} />);

    expect(screen.getByText(/Commenting as/i)).toBeDefined();
    expect(screen.getByText(/@analyst/i)).toBeDefined();

    const textarea = screen.getByLabelText(/Write a comment/i);
    const submitBtn = screen.getByRole('button', { name: /Post Comment/i });

    // Try empty submit
    expect(submitBtn).toBeDisabled();

    // Enter comment text
    fireEvent.change(textarea, { target: { value: 'Solid DCF cash flow projection.' } });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith('Solid DCF cash flow projection.', undefined);
    });
  });
});
