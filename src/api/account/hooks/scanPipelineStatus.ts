import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useNavigate,
  useNavigationType,
  type NavigationType,
} from "react-router-dom";
import { useLingui } from "@lingui/react";

import { getRhHistoryScanPipelineStatus } from "../api";
import { accountQueryKeys } from "../queryKeys";
import { writeScannerStepState } from "../../../Components/Pages/ScanReviewPage/scanReviewState";
import type { ScanReviewLocationState } from "../../../Components/Pages/Scanner/scannerLocationState";
import { historyResumePath } from "../../../utils/historyResumePath";
import {
  TERMINAL_PIPELINE_STATUSES,
  type ScanPipelineStatus,
} from "./scanPipelineUtils";

const POLL_INTERVAL_MS = 1500;

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
    queryKey: accountQueryKeys.scanPipelineStatus(historyId ?? ""),
    queryFn: () => getRhHistoryScanPipelineStatus(accessToken!, historyId!),
    enabled: Boolean(enabled && accessToken && historyId),
    staleTime: Infinity,
    retry: false,
  });

export type UseScanPipelineStatusParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  enabled?: boolean;
};

export function shouldShowCompilingFlowNav(
  navigationType: NavigationType,
  scanPipelineStatus: ScanPipelineStatus | null | undefined
): boolean {
  return navigationType === "POP" && scanPipelineStatus === "complete";
}

export function shouldAutoNavigateOnComplete(
  navigationType: NavigationType,
  scanPipelineStatus: ScanPipelineStatus | null | undefined
): boolean {
  return (
    (navigationType === "PUSH" || navigationType === "REPLACE") &&
    scanPipelineStatus === "complete"
  );
}

export const useScanPipelineStatus = ({
  accessToken,
  historyId,
  enabled = true,
}: UseScanPipelineStatusParams) => {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { i18n } = useLingui();
  const hasHandledTerminalRef = useRef(false);

  const queryEnabled = Boolean(enabled && accessToken && historyId);

  const query = useQuery({
    queryKey: accountQueryKeys.scanPipelineStatus(historyId ?? ""),
    queryFn: () => getRhHistoryScanPipelineStatus(accessToken!, historyId!),
    enabled: queryEnabled,
    refetchInterval: (currentQuery) => {
      if (currentQuery.state.error) return false;
      const status = currentQuery.state.data?.scan_pipeline_status;
      if (status == null) return POLL_INTERVAL_MS;
      if (TERMINAL_PIPELINE_STATUSES.has(status)) return false;
      return POLL_INTERVAL_MS;
    },
  });

  const status = query.data?.scan_pipeline_status ?? null;
  const isForwardVisit =
    navigationType === "PUSH" || navigationType === "REPLACE";
  const showFlowNav = shouldShowCompilingFlowNav(navigationType, status);

  useEffect(() => {
    hasHandledTerminalRef.current = false;
  }, [historyId]);

  useEffect(() => {
    const data = query.data;
    if (!data || hasHandledTerminalRef.current) return;

    if (data.scan_pipeline_status === "needs_rescan") {
      hasHandledTerminalRef.current = true;
      writeScannerStepState({ phase: "scan-review" });
      navigate(`/${i18n.locale}/scan-review`, {
        replace: true,
        state: {
          earlyValidation: data.early_validation ?? null,
        } satisfies ScanReviewLocationState,
      });
      return;
    }

    if (
      shouldAutoNavigateOnComplete(navigationType, data.scan_pipeline_status)
    ) {
      hasHandledTerminalRef.current = true;
      navigate(historyResumePath(i18n.locale, data.last_step_reached), {
        replace: true,
      });
    }
  }, [i18n.locale, navigate, navigationType, query.data]);

  return {
    ...query,
    status,
    isForwardVisit,
    showFlowNav,
  };
};
