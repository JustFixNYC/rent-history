import type { RhHistoryList } from "../api/account";

type LastStepReached = NonNullable<RhHistoryList["last_step_reached"]>;

/**
 * Sub-path (without locale prefix) a user returns to when resuming an
 * in-progress rent history, keyed by the last flow step they reached.
 */
const RESUME_SUBPATH_BY_STEP: Partial<Record<LastStepReached, string>> = {
  ADDRESS_CONFIRMATION: "confirm-address",
  APARTMENT_INFO: "scanner",
  DOCUMENT_SCAN: "scanner",
  COMPILING: "compiling",
  SCAN_REVIEW: "scanner",
  FINDINGS_OVERVIEW: "findings-overview",
  FINDINGS_REVIEW: "findings-review",
  REPORT: "report",
};

/** Fallback for histories with no (or an earlier) recorded step. */
const DEFAULT_RESUME_SUBPATH = "confirm-address";

/**
 * Build the locale-prefixed route a user should land on when resuming a
 * history. Unknown or missing steps fall back to confirm-address.
 */
export function historyResumePath(
  locale: string,
  lastStepReached: RhHistoryList["last_step_reached"]
): string {
  const subpath =
    (lastStepReached && RESUME_SUBPATH_BY_STEP[lastStepReached]) ??
    DEFAULT_RESUME_SUBPATH;
  return `/${locale}/${subpath}`;
}
