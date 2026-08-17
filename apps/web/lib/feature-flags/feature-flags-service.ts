import { apiClient } from '../api/client';
import type { FeatureFlagMap } from '../../types/feature-flags';

/**
 * Validates that the API response is a plain object with string keys and boolean values.
 * Returns the validated map, or an empty map if the response is malformed.
 */
function validateFlagMap(data: unknown): FeatureFlagMap {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }

  const validated: FeatureFlagMap = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (typeof key === 'string' && typeof value === 'boolean') {
      validated[key] = value;
    }
  }
  return validated;
}

export const featureFlagsService = {
  /**
   * Fetch the public feature flag map for client-side UI gating.
   * GET /api/v1/feature-flags
   *
   * Response is validated to ensure only string-boolean pairs are accepted.
   * Malformed or non-object responses degrade safely to an empty map.
   */
  async getPublicFlags(): Promise<FeatureFlagMap> {
    const response = await apiClient.get<unknown>('/feature-flags');
    return validateFlagMap(response.data);
  },
};
