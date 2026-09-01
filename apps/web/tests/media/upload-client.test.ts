import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadClient, validateMediaFile } from '@/lib/media/upload-client';

describe('Upload Client & Validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'demo';
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY = 'test-key';
  });

  it('validates allowed image MIME types and size limits', () => {
    const validFile = new File(['content'], 'chart.png', { type: 'image/png' });
    expect(validateMediaFile(validFile).valid).toBe(true);

    const invalidTypeFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    const typeResult = validateMediaFile(invalidTypeFile);
    expect(typeResult.valid).toBe(false);
    expect(typeResult.error).toContain('File type is not supported');

    // 11 MB oversized file
    const oversizedFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'huge.jpg', { type: 'image/jpeg' });
    const sizeResult = validateMediaFile(oversizedFile);
    expect(sizeResult.valid).toBe(false);
    expect(sizeResult.error).toContain('File exceeds the 10MB limit');
  });

  it('uploadToCloudinary constructs FormData and handles successful response', async () => {
    const mockFile = new File(['image_binary_data'], 'cover.webp', { type: 'image/webp' });
    const signatureData = {
      timestamp: 1720000000,
      signature: 'sha256_mock_sig',
      folder: 'posts',
    };

    const mockCloudinaryResponse = {
      public_id: 'posts/cover_abc',
      secure_url: 'https://res.cloudinary.com/demo/image/upload/cover_abc.webp',
      resource_type: 'image',
      format: 'webp',
      width: 1200,
      height: 630,
      bytes: 154000,
    };

    class MockXHRSuccess {
      status = 200;
      responseText = JSON.stringify(mockCloudinaryResponse);
      upload = {};
      onload: any;
      onerror: any;

      open = vi.fn();
      send = vi.fn().mockImplementation(function (this: any) {
        if (this.onload) this.onload();
      });
    }

    vi.stubGlobal('XMLHttpRequest', MockXHRSuccess);

    const progressCallback = vi.fn();
    const result = await uploadClient.uploadToCloudinary(mockFile, signatureData, progressCallback);

    expect(result).toEqual(mockCloudinaryResponse);
    expect(progressCallback).toHaveBeenCalledWith(100);
  });

  it('uploadToCloudinary rejects when XMLHttpRequest encounters network error', async () => {
    const mockFile = new File(['image_binary_data'], 'cover.webp', { type: 'image/webp' });
    const signatureData = {
      timestamp: 1720000000,
      signature: 'sha256_mock_sig',
      folder: 'posts',
    };

    class MockXHRError {
      status = 0;
      responseText = '';
      upload = {};
      onload: any;
      onerror: any;

      open = vi.fn();
      send = vi.fn().mockImplementation(function (this: any) {
        if (this.onerror) this.onerror();
      });
    }

    vi.stubGlobal('XMLHttpRequest', MockXHRError);

    await expect(
      uploadClient.uploadToCloudinary(mockFile, signatureData)
    ).rejects.toThrow('Network error occurred during Cloudinary upload.');
  });
});
