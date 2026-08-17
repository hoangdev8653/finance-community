import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarPicker } from '@/components/media/AvatarPicker';
import * as mediaHooks from '@/lib/media/use-media';

vi.mock('@/lib/media/use-media');

describe('AvatarPicker Component', () => {
  const mockUploadMedia = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(mediaHooks.useUploadMedia).mockReturnValue({
      mutateAsync: mockUploadMedia,
      isPending: false,
      uploadProgress: 0,
    } as any);
  });

  it('renders default user icon placeholder when no avatar exists', () => {
    vi.mocked(mediaHooks.useMediaDetail).mockReturnValue({ data: undefined } as any);

    render(<AvatarPicker value={null} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Upload Avatar/i })).toBeDefined();
  });

  it('renders preview image when currentAvatarUrl is provided', () => {
    vi.mocked(mediaHooks.useMediaDetail).mockReturnValue({ data: undefined } as any);

    render(
      <AvatarPicker
        value={null}
        currentAvatarUrl="https://res.cloudinary.com/demo/image/upload/avatar.jpg"
        onChange={vi.fn()}
      />
    );

    const img = screen.getByRole('img', { name: /Profile avatar preview/i });
    expect(img.getAttribute('src')).toBe('https://res.cloudinary.com/demo/image/upload/avatar.jpg');
    expect(screen.getByRole('button', { name: /Change Avatar/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Remove/i })).toBeDefined();
  });

  it('handles remove action and clears avatar', () => {
    vi.mocked(mediaHooks.useMediaDetail).mockReturnValue({ data: undefined } as any);
    const onChange = vi.fn();

    render(
      <AvatarPicker
        value="avatar-id-1"
        currentAvatarUrl="https://res.cloudinary.com/demo/image/upload/avatar.jpg"
        onChange={onChange}
      />
    );

    const removeBtn = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
