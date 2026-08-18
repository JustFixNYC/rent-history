import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import { accountQueryKeys } from "../../../../api/account/queryKeys";
import { getRhHistoryScanReview } from "../../../../api/account/api";

export type UseScanReviewParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  expectedPageCount: number;
  enabled?: boolean;
  /** Stop polling after this many ms while still `pending`, then fetch once with `acceptPartial` (default 180_000). */
  maxPollMs?: number;
};

const DEFAULT_MAX_POLL_MS = 180_000;
const PENDING_REFETCH_MS = 1500;

export const useScanReview = ({
  accessToken,
  historyId,
  expectedPageCount,
  enabled = true,
  maxPollMs = DEFAULT_MAX_POLL_MS,
}: UseScanReviewParams) => {
  const pollStartedRef = useRef<number | null>(null);
  const acceptPartialAttemptedRef = useRef(false);
  const queryEnabled = Boolean(
    enabled && accessToken && historyId && expectedPageCount > 0
  );

  useEffect(() => {
    if (queryEnabled) {
      pollStartedRef.current = Date.now();
      acceptPartialAttemptedRef.current = false;
    } else {
      pollStartedRef.current = null;
      acceptPartialAttemptedRef.current = false;
    }
  }, [queryEnabled, historyId, expectedPageCount]);

  return useQuery({
    queryKey: accountQueryKeys.scanReview(historyId ?? "", expectedPageCount),
    queryFn: () =>
      getRhHistoryScanReview(
        accessToken!,
        historyId!,
        expectedPageCount,
        acceptPartialAttemptedRef.current ? { acceptPartial: true } : undefined
      ),
    enabled: queryEnabled,
    refetchInterval: (query) => {
      if (query.state.error) return false;
      const data = query.state.data;
      if (!data || data.status !== "pending") return false;

      const elapsed =
        pollStartedRef.current !== null
          ? Date.now() - pollStartedRef.current
          : 0;

      if (elapsed >= maxPollMs) {
        if (!acceptPartialAttemptedRef.current) {
          acceptPartialAttemptedRef.current = true;
          return 1;
        }
        return false;
      }

      return PENDING_REFETCH_MS;
    },
  });
};
