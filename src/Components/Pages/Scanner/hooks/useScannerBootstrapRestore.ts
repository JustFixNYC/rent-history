import { useEffect, useState } from "react";
import { useLingui } from "@lingui/react";
import { useNavigate } from "react-router-dom";

import { useScanPipelineBootstrap } from "./useScanPipelineBootstrap";
import { useScanReviewBootstrap } from "./useScanReviewBootstrap";
import { getRhHistoryId } from "../../../../session/rhSessionStorage";
import {
  clearScannerStepState,
  readScannerStepState,
  writeScannerStepState,
} from "../scannerState";
import type { ScannerPhase } from "../scannerTypes";
import type { RhScanPipelineStatusResponse } from "../../../../api/account";

export type { ScannerPhase };

export type UseScannerBootstrapRestoreParams = {
  accessToken: string | undefined;
  historyId: string | null;
};

export type UseScannerBootstrapRestoreResult = {
  phase: ScannerPhase;
  setPhase: React.Dispatch<React.SetStateAction<ScannerPhase>>;
  expectedPageCount: number;
  setExpectedPageCount: React.Dispatch<React.SetStateAction<number>>;
  restoreStatus: "pending" | "done";
  setRestoreStatus: React.Dispatch<React.SetStateAction<"pending" | "done">>;
};

const NON_TERMINAL_PIPELINE_STATUSES = new Set([
  "awaiting_uploads",
  "stubs_ready",
  "processing_terminal",
  "running_analysis",
]);

export function shouldBootstrapCompiling(
  data: Pick<
    RhScanPipelineStatusResponse,
    "last_step_reached" | "scan_pipeline_status"
  >
): boolean {
  if (data.last_step_reached === "COMPILING") return true;
  const status = data.scan_pipeline_status;
  return status != null && NON_TERMINAL_PIPELINE_STATUSES.has(status);
}

export function useScannerBootstrapRestore({
  accessToken,
  historyId,
}: UseScannerBootstrapRestoreParams): UseScannerBootstrapRestoreResult {
  const navigate = useNavigate();
  const { i18n } = useLingui();
  const savedStep = readScannerStepState();

  const [phase, setPhase] = useState<ScannerPhase>(() =>
    savedStep?.phase === "scan-review" ? "scan-review" : "pre-scan"
  );
  const [expectedPageCount, setExpectedPageCount] = useState(() =>
    savedStep?.phase === "scan-review" ? savedStep.expectedPageCount : 0
  );
  const [restoreStatus, setRestoreStatus] = useState<"pending" | "done">(() =>
    savedStep?.phase === "scan-review" || getRhHistoryId() ? "pending" : "done"
  );

  const pipelineBootstrap = useScanPipelineBootstrap({
    accessToken,
    historyId: historyId ?? undefined,
    enabled: restoreStatus === "pending" && Boolean(historyId),
  });

  const pipelineChecked =
    !historyId || pipelineBootstrap.isSuccess || pipelineBootstrap.isError;

  const redirectToCompiling =
    pipelineBootstrap.data != null &&
    shouldBootstrapCompiling(pipelineBootstrap.data);

  const scanReviewBootstrap = useScanReviewBootstrap({
    accessToken,
    historyId: historyId ?? undefined,
    enabled:
      restoreStatus === "pending" && pipelineChecked && !redirectToCompiling,
  });

  useEffect(() => {
    if (restoreStatus !== "pending" || !pipelineChecked) return;

    if (redirectToCompiling) {
      clearScannerStepState();
      navigate(`/${i18n.locale}/compiling`);
      setRestoreStatus("done");
    }
  }, [
    i18n.locale,
    navigate,
    pipelineChecked,
    redirectToCompiling,
    restoreStatus,
  ]);

  useEffect(() => {
    if (
      restoreStatus !== "pending" ||
      !pipelineChecked ||
      redirectToCompiling
    ) {
      return;
    }
    if (scanReviewBootstrap.isLoading) return;

    const promoteToScanReview = (count: number) => {
      if (count <= 0) {
        resetToPreScan();
        return;
      }
      setPhase("scan-review");
      setExpectedPageCount(count);
      writeScannerStepState({ phase: "scan-review", expectedPageCount: count });
      setRestoreStatus("done");
    };

    const resetToPreScan = () => {
      setPhase("pre-scan");
      setExpectedPageCount(0);
      clearScannerStepState();
      setRestoreStatus("done");
    };

    if (scanReviewBootstrap.isError) {
      resetToPreScan();
      return;
    }

    const data = scanReviewBootstrap.data;
    if (!data) return;

    if (data.status === "ready" && data.pages.length > 0) {
      promoteToScanReview(data.db_count);
      return;
    }

    if (data.status === "pending") {
      promoteToScanReview(data.expected_page_count);
      return;
    }

    resetToPreScan();
  }, [
    pipelineChecked,
    redirectToCompiling,
    restoreStatus,
    scanReviewBootstrap.data,
    scanReviewBootstrap.isError,
    scanReviewBootstrap.isLoading,
  ]);

  return {
    phase,
    setPhase,
    expectedPageCount,
    setExpectedPageCount,
    restoreStatus,
    setRestoreStatus,
  };
}
