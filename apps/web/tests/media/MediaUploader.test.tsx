import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MediaUploader } from '@/components/media/MediaUploader';
import * as mediaHooks from '@/lib/media/use-media';

vi.mock('@/lib/media/use-media');

describe('MediaUploader Component', () => {
  const mockUploadMedia = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(mediaHooks.useUploadMedia).mockReturnValue({
      mutateAsync: mockUploadMedia,
      isPending: false,
      uploadProgress: 0,
    } as any);
  });

  it('renders drop zone and triggers file input click', () => {
    const onSuccess = vi.fn();

    render(<MediaUploader onSuccess={onSuccess} label="Upload post cover" />);

    expect(screen.getByText(/Click to upload/i)).toBeDefined();
    expect(screen.getByText(/PNG, JPG, WebP, GIF up to 10MB/i)).toBeDefined();
  });

  it('rejects unsupported file MIME type before network upload', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    render(<MediaUploader onSuccess={onSuccess} onError={onError} />);

    const file = new File(['pdf data'], 'manual.pdf', { type: 'application/pdf' });
    const input = document.getElementById('media-uploader-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText(/File type is not supported/i)).toBeDefined();
      expect(mockUploadMedia).not.toHaveBeenCalled();
    });
  });

  it('handles successful file upload and invokes onSuccess callback', async () => {
    const mockMediaResult = {
      id: 'media-uuid-99',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      purpose: 'content',
    };

    mockUploadMedia.mockResolvedValueOnce(mockMediaResult);
    const onSuccess = vi.fn();

    render(<MediaUploader onSuccess={onSuccess} />);

    const file = new File(['valid image bytes'], 'chart.png', { type: 'image/png' });
    const input = document.getElementById('media-uploader-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUploadMedia).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith(mockMediaResult);
    });
  });

  it('renders preview image when currentPreviewUrl is provided', () => {
    const onClear = vi.fn();

    render(
      <MediaUploader
        onSuccess={vi.fn()}
        currentPreviewUrl="https://res.cloudinary.com/demo/image/upload/sample.jpg"
        onClear={onClear}
      />
    );

    const img = screen.getByRole('img', { name: /Uploaded preview/i });
    expect(img.getAttribute('src')).toBe('https://res.cloudinary.com/demo/image/upload/sample.jpg');

    const removeBtn = screen.getByRole('button', { name: /Remove image/i });
    fireEvent.click(removeBtn);
    expect(onClear).toHaveBeenCalled();
  });
});
