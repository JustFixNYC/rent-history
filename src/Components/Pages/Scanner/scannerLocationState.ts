import type { RhEarlyValidation } from "../../../api/account/types";
import type { ScanCoverageFailure } from "../../../hooks/useScanPipelineStatus";

export type ScannerLocationState = {
  postCompileReturn?: boolean;
  scanPipelineFailures?: ScanCoverageFailure[];
};

export type ScanReviewLocationState = {
  showLaunchFailure?: boolean;
  awaitingRescanSuccess?: boolean;
  failedUploadCount?: number;
  reviewError?: string | null;
  scanPipelineFailures?: ScanCoverageFailure[];
  earlyValidation?: RhEarlyValidation | null;
};
