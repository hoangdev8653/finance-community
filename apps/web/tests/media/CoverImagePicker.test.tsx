import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoverImagePicker } from '@/components/media/CoverImagePicker';
import * as mediaHooks from '@/lib/media/use-media';

vi.mock('@/lib/media/use-media');

describe('CoverImagePicker Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(mediaHooks.useUploadMedia).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      uploadProgress: 0,
    } as any);
  });

  it('renders upload area when value is null', () => {
    vi.mocked(mediaHooks.useMediaDetail).mockReturnValue({ data: undefined } as any);

    render(<CoverImagePicker value={null} onChange={vi.fn()} />);

    expect(screen.getByText('Cover Image (Optional)')).toBeDefined();
    expect(screen.getByText(/Click to upload/i)).toBeDefined();
  });

  it('renders existing cover image preview when value is present', () => {
    vi.mocked(mediaHooks.useMediaDetail).mockReturnValue({
      data: {
        id: 'cover-123',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/cover.jpg',
        purpose: 'cover',
      },
    } as any);

    render(<CoverImagePicker value="cover-123" onChange={vi.fn()} />);

    const img = screen.getByRole('img', { name: /Uploaded preview/i });
    expect(img.getAttribute('src')).toBe('https://res.cloudinary.com/demo/image/upload/cover.jpg');
  });
});
