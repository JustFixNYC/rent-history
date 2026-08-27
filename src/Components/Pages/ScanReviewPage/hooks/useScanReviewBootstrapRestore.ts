import { useEffect, useState } from "react";
import { useLingui } from "@lingui/react";
import { useNavigate } from "react-router-dom";

import type { RhScanPipelineStatusResponse } from "../../../../api/account";
import { getRhHistoryId } from "../../../../session/rhSessionStorage";
import {
  clearScannerStepState,
  readScannerStepState,
  writeScannerStepState,
} from "../scanReviewState";
import { useScanPipelineBootstrap } from "../../Scanner/hooks/useScanPipelineBootstrap";
import { shouldBootstrapCompiling } from "../../Scanner/hooks/useScannerBootstrapRestore";

export type UseScanReviewBootstrapRestoreParams = {
  accessToken: string | undefined;
  historyId: string | null;
};

export type UseScanReviewBootstrapRestoreResult = {
  restoreStatus: "pending" | "done";
  pipelineBootstrapFailed: boolean;
  pipelineBootstrapLoading: boolean;
  retryPipelineBootstrap: () => void;
  pipelineData: RhScanPipelineStatusResponse | undefined;
};

export function useScanReviewBootstrapRestore({
  accessToken,
  historyId,
}: UseScanReviewBootstrapRestoreParams): UseScanReviewBootstrapRestoreResult {
  const navigate = useNavigate();
  const { i18n } = useLingui();
  const [savedStep] = useState(() => readScannerStepState());

  const [restoreStatus, setRestoreStatus] = useState<"pending" | "done">(() =>
    savedStep?.phase === "scan-review" || getRhHistoryId() ? "pending" : "done"
  );

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

  const hasSavedScanReview = savedStep?.phase === "scan-review";

  useEffect(() => {
    if (restoreStatus !== "pending" || !pipelineGatePassed) return;

    const data = pipelineBootstrap.data;
    if (!data) return;

    if (data.scan_pipeline_status === "needs_rescan") {
      writeScannerStepState({ phase: "scan-review" });
      setRestoreStatus("done");
      return;
    }

    if (redirectToCompiling) {
      clearScannerStepState();
      navigate(`/${i18n.locale}/compiling`);
      setRestoreStatus("done");
      return;
    }

    if (hasSavedScanReview) {
      setRestoreStatus("done");
      return;
    }

    clearScannerStepState();
    navigate(`/${i18n.locale}/scanner`);
    setRestoreStatus("done");
  }, [
    hasSavedScanReview,
    i18n.locale,
    navigate,
    pipelineBootstrap.data,
    pipelineGatePassed,
    redirectToCompiling,
    restoreStatus,
  ]);

  return {
    restoreStatus,
    pipelineBootstrapFailed,
    pipelineBootstrapLoading,
    retryPipelineBootstrap: () => {
      void pipelineBootstrap.refetch();
    },
    pipelineData: pipelineBootstrap.data,
  };
}
