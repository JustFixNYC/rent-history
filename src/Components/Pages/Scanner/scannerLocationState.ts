import type { ScanCoverageFailure } from "../../../hooks/useScanPipelineStatus";

export type ScannerCaptureIntent =
  | { mode: "rescan"; pageIds: number[] }
  | { mode: "addMore" }
  | { mode: "restart" };

export type ScannerLocationState = {
  captureIntent?: ScannerCaptureIntent;
  postCompileReturn?: boolean;
  scanPipelineFailures?: ScanCoverageFailure[];
};

export type ScanReviewLocationState = {
  showLaunchFailure?: boolean;
  awaitingRescanSuccess?: boolean;
  failedUploadCount?: number;
  reviewError?: string | null;
  scanPipelineFailures?: ScanCoverageFailure[];
};
