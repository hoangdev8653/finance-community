import { describe, it, expect, vi, beforeEach } from 'vitest';
import { featureFlagsService } from '@/lib/feature-flags/feature-flags-service';
import { apiClient } from '@/lib/api/client';

describe('Feature Flags Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getPublicFlags() returns validated flag map on success', async () => {
    const mockFlags = { enable_rich_editor: true, enable_charts: false };
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockFlags,
    } as any);

    const result = await featureFlagsService.getPublicFlags();

    expect(result).toEqual(mockFlags);
  });

  it('getPublicFlags() throws on network error', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network Error'));

    await expect(featureFlagsService.getPublicFlags()).rejects.toThrow('Network Error');
  });

  it('getPublicFlags() returns empty map for malformed response', async () => {
    // API returns an array instead of an object
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [{ key: 'flag', value: true }],
    } as any);

    const result = await featureFlagsService.getPublicFlags();

    expect(result).toEqual({});
  });
});
