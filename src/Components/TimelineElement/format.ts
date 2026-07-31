const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatTimelineCurrency = (amount: number): string =>
  currencyFormatter.format(amount);

/**
 * Assert a timeline data field is present. Throws when missing so composers
 * fail loudly in development rather than rendering incomplete copy.
 */
export function requireTimelineField<T>(
  value: T | undefined | null,
  fieldName: string
): T {
  if (value === undefined || value === null) {
    throw new Error(`Timeline copy missing required data field: ${fieldName}`);
  }
  return value;
}
