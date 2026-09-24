import { useEffect, useState } from "react";

import { useScanReviewBootstrap } from "./useScanReviewBootstrap";
import { getRhHistoryId } from "../../../../session/rhSessionStorage";
import {
  clearScannerStepState,
  readScannerStepState,
  writeScannerStepState,
} from "../scannerState";
import type { ScannerPhase } from "../scannerTypes";

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

export function useScannerBootstrapRestore({
  accessToken,
  historyId,
}: UseScannerBootstrapRestoreParams): UseScannerBootstrapRestoreResult {
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

  const scanReviewBootstrap = useScanReviewBootstrap({
    accessToken,
    historyId: historyId ?? undefined,
    enabled: restoreStatus === "pending",
  });

  useEffect(() => {
    if (restoreStatus !== "pending" || scanReviewBootstrap.isLoading) return;

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
