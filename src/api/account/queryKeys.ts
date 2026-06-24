/** Root prefix for auth-provider account API (`/rh/*`) TanStack Query keys. */
const accountRoot = ["account"] as const;

export const accountQueryKeys = {
  all: accountRoot,
  pagesReadiness: (historyId: string, numPages: number) =>
    [...accountRoot, "pages-readiness", historyId, numPages] as const,
  analysisPages: (historyId: string) =>
    [...accountRoot, "analysis-pages", historyId] as const,
  address: (historyId: string) =>
    [...accountRoot, "address", historyId] as const,
  profile: () => [...accountRoot, "profile"] as const,
};
