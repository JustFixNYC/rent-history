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
  expectedPageCount: number;
  setExpectedPageCount: React.Dispatch<React.SetStateAction<number>>;
  restoreStatus: "pending" | "done";
  pipelineBootstrapFailed: boolean;
  pipelineBootstrapLoading: boolean;
  retryPipelineBootstrap: () => void;
  pipelineData: RhScanPipelineStatusResponse | undefined;
};

function resolveExpectedPageCount(data: RhScanPipelineStatusResponse): number {
  const count = data.expected_page_count ?? data.uploads_observed_count;
  return count > 0 ? count : 0;
}

export function useScanReviewBootstrapRestore({
  accessToken,
  historyId,
}: UseScanReviewBootstrapRestoreParams): UseScanReviewBootstrapRestoreResult {
  const navigate = useNavigate();
  const { i18n } = useLingui();
  const savedStep = readScannerStepState();

  const [expectedPageCount, setExpectedPageCount] = useState(
    () => savedStep?.expectedPageCount ?? 0
  );
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

  const hasSavedScanReview =
    savedStep?.phase === "scan-review" && savedStep.expectedPageCount > 0;

  useEffect(() => {
    if (restoreStatus !== "pending" || !pipelineGatePassed) return;

    const data = pipelineBootstrap.data;
    if (!data) return;

    if (data.scan_pipeline_status === "needs_rescan") {
      const count = resolveExpectedPageCount(data);
      setExpectedPageCount(count);
      if (count > 0) {
        writeScannerStepState({
          phase: "scan-review",
          expectedPageCount: count,
        });
      }
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
      setExpectedPageCount(savedStep!.expectedPageCount);
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
    savedStep,
  ]);

  return {
    expectedPageCount,
    setExpectedPageCount,
    restoreStatus,
    pipelineBootstrapFailed,
    pipelineBootstrapLoading,
    retryPipelineBootstrap: () => {
      void pipelineBootstrap.refetch();
    },
    pipelineData: pipelineBootstrap.data,
  };
}
