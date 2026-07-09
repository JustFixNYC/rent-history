import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { accountQueryKeys } from "../queryKeys";
import {
  combineRhHistoryPages,
  getRhHistoryAnalysisPages,
  getRhHistoryScanReview,
} from "../api";

export type UseRhScanReviewBootstrapParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  /** True once historyId + token are known, before phase is finalized. */
  enabled: boolean;
};

export const useRhScanReviewBootstrap = ({
  accessToken,
  historyId,
  enabled,
}: UseRhScanReviewBootstrapParams) =>
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

export type UseRhScanReviewParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  expectedPageCount: number;
  enabled?: boolean;
  /** Stop polling after this many ms while still `pending`, then fetch once with `acceptPartial` (default 180_000). */
  maxPollMs?: number;
};

const DEFAULT_MAX_POLL_MS = 180_000;
const PENDING_REFETCH_MS = 1500;

export const useRhScanReview = ({
  accessToken,
  historyId,
  expectedPageCount,
  enabled = true,
  maxPollMs = DEFAULT_MAX_POLL_MS,
}: UseRhScanReviewParams) => {
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
          return 0;
        }
        return false;
      }

      return PENDING_REFETCH_MS;
    },
  });
};

export type UseRhHistoryAnalysisPagesParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  enabled?: boolean;
};

export const useRhHistoryAnalysisPages = ({
  accessToken,
  historyId,
  enabled = false,
}: UseRhHistoryAnalysisPagesParams) =>
  useQuery({
    queryKey: accountQueryKeys.analysisPages(historyId ?? ""),
    queryFn: () => getRhHistoryAnalysisPages(accessToken!, historyId!),
    enabled: Boolean(enabled && accessToken && historyId),
  });

export const useCombineRhHistoryPages = () =>
  useMutation({
    mutationFn: ({
      accessToken,
      historyId,
    }: {
      accessToken: string;
      historyId: string;
    }) => combineRhHistoryPages(accessToken, historyId),
  });
