/**
 * The raw feature flag map returned by GET /api/v1/feature-flags.
 * Keys are flag identifiers; values are boolean enabled/disabled states.
 */
export type FeatureFlagMap = Record<string, boolean>;

/**
 * Context value shape provided by FeatureFlagProvider.
 */
export interface FeatureFlagContextValue {
  /** The complete flag map from the server */
  flags: FeatureFlagMap;
  /** Whether flags are still being loaded for the first time */
  isLoading: boolean;
  /** Whether the flag fetch encountered an error */
  isError: boolean;
  /** Check a specific flag value with optional default */
  getFlag: (key: string, defaultValue?: boolean) => boolean;
  /** Force-refresh flags from the server */
  refetch: () => Promise<unknown>;
}

/**
 * Props for the FeatureGate declarative component.
 */
export interface FeatureGateProps {
  /** The feature flag key to check */
  flag: string;
  /** Default value if the flag is unknown or not yet loaded (default: false) */
  defaultValue?: boolean;
  /** Optional fallback content when the flag is disabled */
  fallback?: React.ReactNode;
  /** Content to render when the flag is enabled */
  children: React.ReactNode;
}
