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
