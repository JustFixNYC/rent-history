import type { RhEarlyValidation } from "../../../api/account/types";

export type ScannerLocationState = {
  postCompileReturn?: boolean;
};

export type ScanReviewLocationState = {
  showLaunchFailure?: boolean;
  awaitingRescanSuccess?: boolean;
  failedUploadCount?: number;
  reviewError?: string | null;
  earlyValidation?: RhEarlyValidation | null;
};
