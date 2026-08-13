import { useQuery } from "@tanstack/react-query";

import { accountQueryKeys } from "../../../../api/account/queryKeys";
import { getRhHistoryScanPipelineStatus } from "../../../../api/account/api";

export type UseScanPipelineBootstrapParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  /** True once historyId + token are known, before phase is finalized. */
  enabled: boolean;
};

export const useScanPipelineBootstrap = ({
  accessToken,
  historyId,
  enabled,
}: UseScanPipelineBootstrapParams) =>
  useQuery({
    queryKey: accountQueryKeys.scanPipelineBootstrap(historyId ?? ""),
    queryFn: () => getRhHistoryScanPipelineStatus(accessToken!, historyId!),
    enabled: Boolean(enabled && accessToken && historyId),
    staleTime: Infinity,
    retry: false,
  });
