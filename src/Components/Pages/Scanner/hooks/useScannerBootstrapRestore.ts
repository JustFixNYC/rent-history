import { useEffect, useState } from "react";
import { useLingui } from "@lingui/react";
import { useNavigate } from "react-router-dom";

import { useScanPipelineBootstrap } from "./useScanPipelineBootstrap";
import { getRhHistoryId } from "../../../../session/rhSessionStorage";
import {
  clearScannerStepState,
  readScannerStepState,
} from "../../ScanReviewPage/scanReviewState";
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
  const savedScanReview = savedStep?.phase === "scan-review";

  const [phase, setPhase] = useState<ScannerPhase>("pre-scan");
  const [expectedPageCount, setExpectedPageCount] = useState(0);
  const [restoreStatus, setRestoreStatus] = useState<"pending" | "done">(() =>
    savedScanReview || getRhHistoryId() ? "pending" : "done"
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

  useEffect(() => {
    if (restoreStatus !== "pending" || !pipelineChecked) return;

    if (redirectToCompiling) {
      clearScannerStepState();
      navigate(`/${i18n.locale}/compiling`);
      setRestoreStatus("done");
      return;
    }

    if (savedScanReview) {
      navigate(`/${i18n.locale}/scan-review`);
      setRestoreStatus("done");
      return;
    }

    setRestoreStatus("done");
  }, [
    i18n.locale,
    navigate,
    pipelineChecked,
    redirectToCompiling,
    restoreStatus,
    savedScanReview,
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
