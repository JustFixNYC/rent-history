export type RentHistoryPageCardData = {
  id?: number;
  s3_key: string;
  start_year?: number | null;
  end_year?: number | null;
  imageUrl?: string | null;
  needs_retake?: boolean;
};

export type ScanReviewPage = RentHistoryPageCardData & {
  id: number;
  needs_retake: boolean;
};

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

export const mapPagesWithImageUrls = <T extends { s3_key: string }>(
  pages: T[],
  imageUrlsByKey: Record<string, string>
): Array<T & { imageUrl: string | null }> =>
  pages.map((page) => ({
    ...page,
    imageUrl: imageUrlsByKey[page.s3_key] ?? null,
  }));
