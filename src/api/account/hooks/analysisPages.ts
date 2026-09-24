import { useQuery } from "@tanstack/react-query";

import { getRhHistoryAnalysisPages } from "../api";
import { accountQueryKeys } from "../queryKeys";

export type UseHistoryAnalysisPagesParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  enabled?: boolean;
};

export const useHistoryAnalysisPages = ({
  accessToken,
  historyId,
  enabled = false,
}: UseHistoryAnalysisPagesParams) =>
  useQuery({
    queryKey: accountQueryKeys.analysisPages(historyId ?? ""),
    queryFn: () => getRhHistoryAnalysisPages(accessToken!, historyId!),
    enabled: Boolean(enabled && accessToken && historyId),
  });
