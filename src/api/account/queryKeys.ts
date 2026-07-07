/** Root prefix for auth-provider account API (`/rh/*`) TanStack Query keys. */
const accountRoot = ["account"] as const;

export const accountQueryKeys = {
  all: accountRoot,
  scanReview: (historyId: string, expectedPageCount: number) =>
    [...accountRoot, "scan-review", historyId, expectedPageCount] as const,
  analysisPages: (historyId: string) =>
    [...accountRoot, "analysis-pages", historyId] as const,
  address: (historyId: string) =>
    [...accountRoot, "address", historyId] as const,
  findingsState: (historyId: string) =>
    [...accountRoot, "findings-state", historyId] as const,
  profile: () => [...accountRoot, "profile"] as const,
  histories: () => [...accountRoot, "histories"] as const,
};
