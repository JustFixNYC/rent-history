import type {
  RhEarlyValidation,
  RhPageRescanInfo,
} from "../../../api/account/types";
import type { ScanReviewLocationState } from "../Scanner/scannerLocationState";

export type ScanReviewPartialError = {
  kind: "partial";
  pages: RhPageRescanInfo[];
  documentTotalPages: number | null;
};

export type ScanReviewTotalError = {
  kind: "total";
};

export type ScanReviewErrorState =
  | ScanReviewPartialError
  | ScanReviewTotalError;

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

export function formatPageRescanLabel(
  page: RhPageRescanInfo,
  documentTotalPages: number | null
): string | null {
  const pageNumber = page.page_number;
  const totalPages = page.total_pages ?? documentTotalPages;
  if (pageNumber == null || totalPages == null) return null;
  return `Page ${pageNumber} of ${totalPages}`;
}

export function getLabelableRescanPages(
  earlyValidation: RhEarlyValidation
): RhPageRescanInfo[] {
  return earlyValidation.pages_needing_rescan.filter(
    (page) =>
      formatPageRescanLabel(page, earlyValidation.document_total_pages) != null
  );
}

export function resolveScanReviewErrorState(
  locationState: ScanReviewLocationState | null | undefined,
  earlyValidation: RhEarlyValidation | null | undefined
): ScanReviewErrorState {
  if (isNonPipelineScanReviewEntry(locationState)) {
    return { kind: "total" };
  }

  if (!earlyValidation || earlyValidation.passed) {
    return { kind: "total" };
  }

  const labelablePages = getLabelableRescanPages(earlyValidation);
  if (labelablePages.length === 0) {
    return { kind: "total" };
  }

  return {
    kind: "partial",
    pages: labelablePages,
    documentTotalPages: earlyValidation.document_total_pages,
  };
}
