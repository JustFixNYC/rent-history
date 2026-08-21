import type {
  RhEarlyValidation,
  RhPageRescanInfo,
} from "../../../api/account/types";
import type { ScanReviewLocationState } from "../Scanner/scannerLocationState";

export type ScanReviewMode = "A" | "B" | "C" | "D" | "E";

export type ScanReviewModeAState = {
  mode: "A";
  earlyValidation: RhEarlyValidation;
};

export type ScanReviewModeBState = {
  mode: "B";
  earlyValidation: RhEarlyValidation;
};

export type ScanReviewModeCState = {
  mode: "C";
  earlyValidation: RhEarlyValidation;
};

export type ScanReviewModeDState = {
  mode: "D";
  pages: RhPageRescanInfo[];
  documentTotalPages: number | null;
};

export type ScanReviewModeEState = {
  mode: "E";
};

export type ScanReviewErrorState =
  | ScanReviewModeAState
  | ScanReviewModeBState
  | ScanReviewModeCState
  | ScanReviewModeDState
  | ScanReviewModeEState;

export function isNonPipelineScanReviewEntry(
  locationState: ScanReviewLocationState | null | undefined
): boolean {
  if (!locationState) return false;
  return Boolean(
    locationState.showLaunchFailure ||
      (locationState.failedUploadCount ?? 0) > 0 ||
      locationState.reviewError ||
      locationState.awaitingRescanSuccess
  );
}

export function hasScanReviewWarning(
  earlyValidation: RhEarlyValidation
): boolean {
  return earlyValidation.warnings.length > 0;
}

export function isWarningStepEligible(
  earlyValidation: RhEarlyValidation
): boolean {
  return (
    hasScanReviewWarning(earlyValidation) &&
    earlyValidation.scanned_max_reg_year != null
  );
}

export function formatPageRescanLabel(
  page: RhPageRescanInfo,
  documentTotalPages: number | null
): string | null {
  const pageNumber = page.page_number;
  if (pageNumber == null) return null;

  const totalPages = page.total_pages ?? documentTotalPages;
  if (totalPages != null) {
    return `Page ${pageNumber} of ${totalPages}`;
  }

  return `Page ${pageNumber}`;
}

export function getLabelableRescanPages(
  earlyValidation: RhEarlyValidation
): RhPageRescanInfo[] {
  return earlyValidation.pages_needing_rescan.filter(
    (page) =>
      formatPageRescanLabel(page, earlyValidation.document_total_pages) != null
  );
}

function hasActionableRescanMetadata(
  earlyValidation: RhEarlyValidation
): boolean {
  return earlyValidation.pages_needing_rescan.some(
    (page) => page.id != null || page.page_number != null
  );
}

export function resolveScanReviewErrorState(
  locationState: ScanReviewLocationState | null | undefined,
  earlyValidation: RhEarlyValidation | null | undefined
): ScanReviewErrorState {
  if (isNonPipelineScanReviewEntry(locationState)) {
    return { mode: "E" };
  }

  if (!earlyValidation) {
    return { mode: "E" };
  }

  const warningPresent = hasScanReviewWarning(earlyValidation);

  if (warningPresent && !isWarningStepEligible(earlyValidation)) {
    return { mode: "E" };
  }

  if (earlyValidation.passed) {
    if (warningPresent) {
      return { mode: "A", earlyValidation };
    }
    return { mode: "E" };
  }

  if (warningPresent) {
    return { mode: "C", earlyValidation };
  }

  const labelablePages = getLabelableRescanPages(earlyValidation);
  if (labelablePages.length > 0) {
    return {
      mode: "D",
      pages: labelablePages,
      documentTotalPages: earlyValidation.document_total_pages,
    };
  }

  if (!hasActionableRescanMetadata(earlyValidation)) {
    return { mode: "E" };
  }

  return { mode: "E" };
}
