import { useEffect, useState } from "react";
import { useLingui } from "@lingui/react";
import { useNavigate } from "react-router-dom";

import type { RhScanPipelineStatusResponse } from "../types";
import { getRhHistoryId } from "../../../session/rhSessionStorage";
import {
  clearScannerStepState,
  readScannerStepState,
  writeScannerStepState,
} from "../../../Components/Pages/ScanReviewPage/scanReviewState";
import type { ScannerPhase } from "../../../Components/Pages/Scanner/scannerTypes";
import { useScanPipelineBootstrap } from "./scanPipelineStatus";
import { shouldBootstrapCompiling } from "./scanPipelineUtils";

export type UseScanPipelineBootstrapGateParams = {
  accessToken: string | undefined;
  historyId: string | null;
  restorePending: boolean;
};

export type UseScanPipelineBootstrapGateResult = {
  pipelineData: RhScanPipelineStatusResponse | undefined;
  pipelineGatePassed: boolean;
  pipelineBootstrapFailed: boolean;
  pipelineBootstrapLoading: boolean;
  retryPipelineBootstrap: () => void;
  redirectToCompiling: boolean;
};

function useScanPipelineBootstrapGate({
  accessToken,
  historyId,
  restorePending,
}: UseScanPipelineBootstrapGateParams): UseScanPipelineBootstrapGateResult {
  const pipelineBootstrap = useScanPipelineBootstrap({
    accessToken,
    historyId: historyId ?? undefined,
    enabled: restorePending && Boolean(historyId),
  });

  const pipelineGatePassed = !historyId || pipelineBootstrap.isSuccess;
  const pipelineBootstrapFailed =
    Boolean(historyId) && pipelineBootstrap.isError;
  const pipelineBootstrapLoading =
    Boolean(historyId) && restorePending && pipelineBootstrap.isLoading;

  const redirectToCompiling =
    pipelineBootstrap.data != null &&
    shouldBootstrapCompiling(pipelineBootstrap.data);

  return {
    pipelineData: pipelineBootstrap.data,
    pipelineGatePassed,
    pipelineBootstrapFailed,
    pipelineBootstrapLoading,
    retryPipelineBootstrap: () => {
      void pipelineBootstrap.refetch();
    },
    redirectToCompiling,
  };
}

export type UseScannerBootstrapRestoreParams = {
  accessToken: string | undefined;
  historyId: string | null;
};

export type UseScannerBootstrapRestoreResult = {
  phase: ScannerPhase;
  setPhase: React.Dispatch<React.SetStateAction<ScannerPhase>>;
  restoreStatus: "pending" | "done";
  setRestoreStatus: React.Dispatch<React.SetStateAction<"pending" | "done">>;
  deferScannerInit: boolean;
  pipelineBootstrapFailed: boolean;
  pipelineBootstrapLoading: boolean;
  retryPipelineBootstrap: () => void;
};

export function useScannerBootstrapRestore({
  accessToken,
  historyId,
}: UseScannerBootstrapRestoreParams): UseScannerBootstrapRestoreResult {
  const navigate = useNavigate();
  const { i18n } = useLingui();
  const [savedStep] = useState(() => readScannerStepState());
  const savedScanReview = savedStep?.phase === "scan-review";

  const [phase, setPhase] = useState<ScannerPhase>("pre-scan");
  const [restoreStatus, setRestoreStatus] = useState<"pending" | "done">(() =>
    savedScanReview || getRhHistoryId() ? "pending" : "done"
  );
  const [redirectedScanReview, setRedirectedScanReview] = useState(false);

  const deferScannerInit =
    redirectedScanReview || (savedScanReview && restoreStatus === "pending");

  const {
    pipelineGatePassed,
    pipelineBootstrapFailed,
    pipelineBootstrapLoading,
    retryPipelineBootstrap,
    redirectToCompiling,
  } = useScanPipelineBootstrapGate({
    accessToken,
    historyId,
    restorePending: restoreStatus === "pending",
  });

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
    restoreStatus,
    setRestoreStatus,
    deferScannerInit,
    pipelineBootstrapFailed,
    pipelineBootstrapLoading,
    retryPipelineBootstrap,
  };
}

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

  const hasSavedScanReview = savedStep?.phase === "scan-review";

  const {
    pipelineData,
    pipelineGatePassed,
    pipelineBootstrapFailed,
    pipelineBootstrapLoading,
    retryPipelineBootstrap,
    redirectToCompiling,
  } = useScanPipelineBootstrapGate({
    accessToken,
    historyId,
    restorePending: restoreStatus === "pending",
  });

  useEffect(() => {
    if (restoreStatus !== "pending" || !pipelineGatePassed) return;

    const data = pipelineData;
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
    pipelineData,
    pipelineGatePassed,
    redirectToCompiling,
    restoreStatus,
  ]);

  return {
    restoreStatus,
    pipelineBootstrapFailed,
    pipelineBootstrapLoading,
    retryPipelineBootstrap,
    pipelineData,
  };
}
