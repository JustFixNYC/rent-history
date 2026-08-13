import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useNavigate,
  useNavigationType,
  type NavigationType,
} from "react-router-dom";
import { useLingui } from "@lingui/react";

import { accountQueryKeys } from "../api/account/queryKeys";
import { getRhHistoryScanPipelineStatus } from "../api/account/api";
import type { RhScanPipelineStatusResponse } from "../api/account";
import { writeScannerStepState } from "../Components/Pages/Scanner/scannerState";
import { historyResumePath } from "../utils/historyResumePath";

import type { ScanPipelineStatus } from "../Components/Pages/CompilingWaitingPage/deriveCompilingMilestones";

const TERMINAL_PIPELINE_STATUSES = new Set<NonNullable<ScanPipelineStatus>>([
  "complete",
  "needs_rescan",
  "failed",
]);

const POLL_INTERVAL_MS = 1500;

export type ScanCoverageFailure = {
  code: string;
  message: string;
};

export type CompilingScanReviewLocationState = {
  scanPipelineFailures?: ScanCoverageFailure[];
  postCompileReturn?: boolean;
};

export type UseScanPipelineStatusParams = {
  accessToken: string | undefined;
  historyId: string | undefined;
  enabled?: boolean;
};

export function parseEarlyValidationFailures(
  earlyValidation: unknown
): ScanCoverageFailure[] {
  if (!earlyValidation || typeof earlyValidation !== "object") return [];
  const failures = (earlyValidation as { failures?: unknown }).failures;
  if (!Array.isArray(failures)) return [];

  return failures.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const { code, message } = entry as { code?: unknown; message?: unknown };
    if (typeof code !== "string" || typeof message !== "string") return [];
    return [{ code, message }];
  });
}

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

function resolveExpectedPageCount(data: RhScanPipelineStatusResponse): number {
  const count = data.expected_page_count ?? data.uploads_observed_count;
  return count > 0 ? count : 1;
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
      writeScannerStepState({
        phase: "scan-review",
        expectedPageCount: resolveExpectedPageCount(data),
      });
      navigate(`/${i18n.locale}/scanner`, {
        replace: true,
        state: {
          scanPipelineFailures: parseEarlyValidationFailures(
            data.early_validation
          ),
        } satisfies CompilingScanReviewLocationState,
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
