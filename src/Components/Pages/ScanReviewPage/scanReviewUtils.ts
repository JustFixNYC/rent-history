import type { ScanReviewPage } from "../../RentHistoryPageCard/pageCardUtils";

export const isScanReviewClean = (
  pages: ScanReviewPage[],
  missingYearRanges: string[]
): boolean =>
  missingYearRanges.length === 0 && !pages.some((page) => page.needs_retake);
