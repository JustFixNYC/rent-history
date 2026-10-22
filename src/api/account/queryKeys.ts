/** Root prefix for auth-provider account API (`/rh/*`) TanStack Query keys. */
const accountRoot = ["account"] as const;

export const accountQueryKeys = {
  all: accountRoot,
  scanPipelineStatus: (historyId: string) =>
    [...accountRoot, "scan-pipeline-status", historyId] as const,
  analysisPages: (historyId: string) =>
    [...accountRoot, "analysis-pages", historyId] as const,
  findingsState: (historyId: string) =>
    [...accountRoot, "findings-state", historyId] as const,
  profile: () => [...accountRoot, "profile"] as const,
  histories: () => [...accountRoot, "histories"] as const,
};
