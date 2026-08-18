import { useEffect, useState } from "react";
import { useLingui } from "@lingui/react";
import { useNavigate } from "react-router-dom";

import { useScanPipelineBootstrap } from "./useScanPipelineBootstrap";
import { getRhHistoryId } from "../../../../session/rhSessionStorage";
import {
  clearScannerStepState,
  readScannerStepState,
} from "../../ScanReviewPage/scanReviewState";
import type { ScannerCaptureIntent } from "../scannerLocationState";
import type { ScannerPhase } from "../scannerTypes";
import type { RhScanPipelineStatusResponse } from "../../../../api/account";

export type { ScannerPhase };

export type UseScannerBootstrapRestoreParams = {
  accessToken: string | undefined;
  historyId: string | null;
  captureIntent?: ScannerCaptureIntent;
};

export type UseScannerBootstrapRestoreResult = {
  phase: ScannerPhase;
  setPhase: React.Dispatch<React.SetStateAction<ScannerPhase>>;
  expectedPageCount: number;
  setExpectedPageCount: React.Dispatch<React.SetStateAction<number>>;
  restoreStatus: "pending" | "done";
  setRestoreStatus: React.Dispatch<React.SetStateAction<"pending" | "done">>;
  deferScannerInit: boolean;
  pipelineBootstrapFailed: boolean;
  pipelineBootstrapLoading: boolean;
  retryPipelineBootstrap: () => void;
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
  captureIntent,
}: UseScannerBootstrapRestoreParams): UseScannerBootstrapRestoreResult {
  const navigate = useNavigate();
  const { i18n } = useLingui();
  const savedStep = readScannerStepState();
  const savedScanReview = savedStep?.phase === "scan-review" && !captureIntent;

  const [phase, setPhase] = useState<ScannerPhase>(() =>
    captureIntent ? "scanning" : "pre-scan"
  );
  const [expectedPageCount, setExpectedPageCount] = useState(() => {
    if (!captureIntent) return 0;
    if (captureIntent.mode === "restart") return 0;
    return savedStep?.expectedPageCount ?? 0;
  });
  const [restoreStatus, setRestoreStatus] = useState<"pending" | "done">(() =>
    savedScanReview || getRhHistoryId() ? "pending" : "done"
  );
  const [redirectedScanReview, setRedirectedScanReview] = useState(false);

  const deferScannerInit =
    redirectedScanReview || (savedScanReview && restoreStatus === "pending");

  const pipelineBootstrap = useScanPipelineBootstrap({
    accessToken,
    historyId: historyId ?? undefined,
    enabled: restoreStatus === "pending" && Boolean(historyId),
  });

  const pipelineGatePassed = !historyId || pipelineBootstrap.isSuccess;
  const pipelineBootstrapFailed =
    Boolean(historyId) && pipelineBootstrap.isError;
  const pipelineBootstrapLoading =
    Boolean(historyId) &&
    restoreStatus === "pending" &&
    pipelineBootstrap.isLoading;

  const redirectToCompiling =
    pipelineBootstrap.data != null &&
    shouldBootstrapCompiling(pipelineBootstrap.data);

  useEffect(() => {
    if (restoreStatus !== "pending" || !pipelineGatePassed) return;

    if (redirectToCompiling) {
      clearScannerStepState();
      navigate(`/${i18n.locale}/compiling`);
      setRestoreStatus("done");
      return;
    }

    if (savedScanReview) {
      setRedirectedScanReview(true);
      navigate(`/${i18n.locale}/scan-review`);
      setRestoreStatus("done");
      return;
    }

    setRestoreStatus("done");
  }, [
    i18n.locale,
    navigate,
    pipelineGatePassed,
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
    deferScannerInit,
    pipelineBootstrapFailed,
    pipelineBootstrapLoading,
    retryPipelineBootstrap: () => {
      void pipelineBootstrap.refetch();
    },
  };
}
