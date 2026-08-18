import { useEffect, useState } from "react";
import { useLingui } from "@lingui/react";
import { useNavigate } from "react-router-dom";

import { getRhHistoryId } from "../../../../session/rhSessionStorage";
import {
  clearScannerStepState,
  readScannerStepState,
  writeScannerStepState,
} from "../scanReviewState";
import { useScanPipelineBootstrap } from "../../Scanner/hooks/useScanPipelineBootstrap";
import { shouldBootstrapCompiling } from "../../Scanner/hooks/useScannerBootstrapRestore";
import { useScanReviewBootstrap } from "./useScanReviewBootstrap";

export type UseScanReviewBootstrapRestoreParams = {
  accessToken: string | undefined;
  historyId: string | null;
};

export type UseScanReviewBootstrapRestoreResult = {
  expectedPageCount: number;
  setExpectedPageCount: React.Dispatch<React.SetStateAction<number>>;
  restoreStatus: "pending" | "done";
};

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

  const pipelineChecked =
    !historyId || pipelineBootstrap.isSuccess || pipelineBootstrap.isError;

  const redirectToCompiling =
    pipelineBootstrap.data != null &&
    shouldBootstrapCompiling(pipelineBootstrap.data);

  const hasSavedCount =
    savedStep?.phase === "scan-review" && savedStep.expectedPageCount > 0;

  const scanReviewBootstrap = useScanReviewBootstrap({
    accessToken,
    historyId: historyId ?? undefined,
    enabled:
      restoreStatus === "pending" &&
      pipelineChecked &&
      !redirectToCompiling &&
      !hasSavedCount,
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

    if (hasSavedCount) {
      setExpectedPageCount(savedStep!.expectedPageCount);
      setRestoreStatus("done");
      return;
    }

    if (scanReviewBootstrap.isLoading) return;

    const applyScanReviewCount = (count: number) => {
      if (count <= 0) {
        clearScannerStepState();
        navigate(`/${i18n.locale}/scanner`);
        setRestoreStatus("done");
        return;
      }
      setExpectedPageCount(count);
      writeScannerStepState({ phase: "scan-review", expectedPageCount: count });
      setRestoreStatus("done");
    };

    if (scanReviewBootstrap.isError) {
      clearScannerStepState();
      navigate(`/${i18n.locale}/scanner`);
      setRestoreStatus("done");
      return;
    }

    const data = scanReviewBootstrap.data;
    if (!data) return;

    if (data.status === "ready" && data.pages.length > 0) {
      applyScanReviewCount(data.db_count);
      return;
    }

    if (data.status === "pending") {
      applyScanReviewCount(data.expected_page_count);
      return;
    }

    clearScannerStepState();
    navigate(`/${i18n.locale}/scanner`);
    setRestoreStatus("done");
  }, [
    hasSavedCount,
    i18n.locale,
    navigate,
    pipelineChecked,
    redirectToCompiling,
    restoreStatus,
    savedStep,
    scanReviewBootstrap.data,
    scanReviewBootstrap.isError,
    scanReviewBootstrap.isLoading,
  ]);

  return {
    expectedPageCount,
    setExpectedPageCount,
    restoreStatus,
  };
}
