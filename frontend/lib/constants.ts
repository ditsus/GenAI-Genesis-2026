/**
 * App-wide constants. Use for API base URL, feature flags, and env-derived values.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
