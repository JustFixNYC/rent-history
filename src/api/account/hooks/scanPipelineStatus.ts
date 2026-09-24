import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useLingui } from "@lingui/react";

import { getRhHistoryScanPipelineStatus } from "../api";
import { accountQueryKeys } from "../queryKeys";
import { writeScannerStepState } from "../../../Components/Pages/ScanReviewPage/scanReviewState";
import type { ScanReviewLocationState } from "../../../Components/Pages/Scanner/scannerLocationState";
import { TERMINAL_PIPELINE_STATUSES } from "./scanPipelineUtils";

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

export const useScanPipelineStatus = ({
  accessToken,
  historyId,
  enabled = true,
}: UseScanPipelineStatusParams) => {
  const navigate = useNavigate();
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
  const showFlowNav = status === "complete";

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
  }, [i18n.locale, navigate, query.data]);

  return {
    ...query,
    status,
    showFlowNav,
  };
};
