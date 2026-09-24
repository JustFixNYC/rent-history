import { useQuery } from "@tanstack/react-query";

import { accountQueryKeys } from "../../../../api/account/queryKeys";
import { getRhHistoryScanReview } from "../../../../api/account/api";

export type UseScanReviewBootstrapParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  /** True once historyId + token are known, before phase is finalized. */
  enabled: boolean;
};

export const useScanReviewBootstrap = ({
  accessToken,
  historyId,
  enabled,
}: UseScanReviewBootstrapParams) =>
  useQuery({
    queryKey: accountQueryKeys.scanReviewBootstrap(historyId ?? ""),
    queryFn: () =>
      getRhHistoryScanReview(accessToken!, historyId!, 1, {
        acceptPartial: true,
      }),
    enabled: Boolean(enabled && accessToken && historyId),
    staleTime: Infinity,
    retry: false,
  });
