import type {
  RhEarlyValidation,
  RhPageRescanInfo,
} from "../../../api/account/types";
import type { ScanReviewLocationState } from "../Scanner/scannerLocationState";
import { ScanReviewEntryScreen, ScanReviewMode } from "./scanReviewModes";

/** Entry screen: incremental flow, warning-only path. */
export type ScanReviewWarningOnlyFlowState = {
  screen: typeof ScanReviewEntryScreen.incrementalFlow;
  flowMode: typeof ScanReviewMode.warningOnly;
  earlyValidation: RhEarlyValidation;
};

/** Entry screen: incremental flow, errors + warning path. */
export type ScanReviewErrorsAndWarningFlowState = {
  screen: typeof ScanReviewEntryScreen.incrementalFlow;
  flowMode: typeof ScanReviewMode.errorsAndWarning;
  earlyValidation: RhEarlyValidation;
};

export type ScanReviewIncrementalFlowState =
  | ScanReviewWarningOnlyFlowState
  | ScanReviewErrorsAndWarningFlowState;

/** Entry screen: partial page errors with Page N callout. */
export type ScanReviewPartialPageErrorsState = {
  screen: typeof ScanReviewEntryScreen.partialPageErrors;
  pages: RhPageRescanInfo[];
  documentTotalPages: number | null;
};

/** Entry screen: unrecoverable total failure. */
export type ScanReviewTotalFailureState = {
  screen: typeof ScanReviewEntryScreen.totalFailure;
};

export type ScanReviewScreenState =
  | ScanReviewIncrementalFlowState
  | ScanReviewPartialPageErrorsState
  | ScanReviewTotalFailureState;

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

/**
 * Resolves the scan-review **entry screen** from pipeline early_validation and
 * router location state.
 *
 * Returns `incrementalFlow`, `partialPageErrors`, or `totalFailure` only.
 * `warningYearMismatch` is a flow-local phase inside
 * `ScanReviewFlow` after Continue — not resolved here (Task 6).
 */
export function resolveScanReviewScreen(
  locationState: ScanReviewLocationState | null | undefined,
  earlyValidation: RhEarlyValidation | null | undefined
): ScanReviewScreenState {
  if (isNonPipelineScanReviewEntry(locationState)) {
    return { screen: ScanReviewEntryScreen.totalFailure };
  }

  if (!earlyValidation) {
    return { screen: ScanReviewEntryScreen.totalFailure };
  }

  const warningPresent = hasScanReviewWarning(earlyValidation);

  if (warningPresent && !isWarningStepEligible(earlyValidation)) {
    return { screen: ScanReviewEntryScreen.totalFailure };
  }

  if (earlyValidation.passed) {
    if (warningPresent) {
      return {
        screen: ScanReviewEntryScreen.incrementalFlow,
        flowMode: ScanReviewMode.warningOnly,
        earlyValidation,
      };
    }
    return { screen: ScanReviewEntryScreen.totalFailure };
  }

  if (warningPresent) {
    return {
      screen: ScanReviewEntryScreen.incrementalFlow,
      flowMode: ScanReviewMode.errorsAndWarning,
      earlyValidation,
    };
  }

  const labelablePages = getLabelableRescanPages(earlyValidation);
  if (labelablePages.length > 0) {
    return {
      screen: ScanReviewEntryScreen.partialPageErrors,
      pages: labelablePages,
      documentTotalPages: earlyValidation.document_total_pages,
    };
  }

  if (!hasActionableRescanMetadata(earlyValidation)) {
    return { screen: ScanReviewEntryScreen.totalFailure };
  }

  return { screen: ScanReviewEntryScreen.totalFailure };
}
