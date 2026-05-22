import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { accountQueryKeys } from "../queryKeys";
import {
  combineRhHistoryPages,
  getRhHistoryAnalysisPages,
  getRhHistoryPagesReadiness,
} from "../../rhAuth";

/** Thrown when pages-readiness returns HTTP 200 with `status: "excess"`. */
export class RhPagesReadinessExcessError extends Error {
  constructor() {
    super("Pages readiness excess");
    this.name = "RhPagesReadinessExcessError";
  }
}

export type UseRhPagesReadinessParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  numPages: number;
  enabled?: boolean;
  /** Stop polling after this many ms while still `pending` (default 180_000). */
  maxPollMs?: number;
};

const DEFAULT_MAX_POLL_MS = 180_000;
const PENDING_REFETCH_MS = 1500;

export const useRhPagesReadiness = ({
  accessToken,
  historyId,
  numPages,
  enabled = true,
  maxPollMs = DEFAULT_MAX_POLL_MS,
}: UseRhPagesReadinessParams) => {
  const pollStartedRef = useRef<number | null>(null);
  const queryEnabled = Boolean(
    enabled && accessToken && historyId && numPages > 0
  );

  useEffect(() => {
    if (queryEnabled) {
      pollStartedRef.current = Date.now();
    } else {
      pollStartedRef.current = null;
    }
  }, [queryEnabled]);

  return useQuery({
    queryKey: accountQueryKeys.pagesReadiness(historyId ?? "", numPages),
    queryFn: async () => {
      const result = await getRhHistoryPagesReadiness(
        accessToken!,
        historyId!,
        numPages
      );
      if (result.status === "excess") {
        throw new RhPagesReadinessExcessError();
      }
      return result;
    },
    enabled: queryEnabled,
    refetchInterval: (query) => {
      if (query.state.error) return false;
      const data = query.state.data;
      if (!data || data.status !== "pending") return false;
      if (
        pollStartedRef.current !== null &&
        Date.now() - pollStartedRef.current >= maxPollMs
      ) {
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
