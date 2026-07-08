import type { RhPageSummary } from "../../../api/account/types";

import type { ScanReviewPage } from "./ScanReviewPageCard";

export const mapScanReviewPagesWithImages = (
  pages: RhPageSummary[],
  imageUrlsByKey: Record<string, string>
): ScanReviewPage[] =>
  pages.map((page) => ({
    ...page,
    imageUrl: imageUrlsByKey[page.s3_key] ?? null,
  }));

export const isScanReviewClean = (
  pages: ScanReviewPage[],
  missingYearRanges: string[]
): boolean =>
  missingYearRanges.length === 0 && !pages.some((page) => page.needs_retake);

export const formatRegYearRange = (
  startYear?: number | null,
  endYear?: number | null
): string | null => {
  if (startYear != null && endYear != null) {
    return startYear === endYear
      ? String(startYear)
      : `${startYear}-${endYear}`;
  }
  if (startYear != null) {
    return String(startYear);
  }
  if (endYear != null) {
    return String(endYear);
  }
  return null;
};
