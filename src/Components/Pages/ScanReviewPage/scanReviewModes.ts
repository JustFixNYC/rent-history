/**
 * Scan-review mode vocabulary.
 *
 * Page-level routing uses {@link ScanReviewEntryScreen} only —
 * `warningYearMismatch` is a flow-local phase inside `ScanReviewFlow`,
 * not an entry route.
 */

export const ScanReviewMode = {
  /** passed=true, warning present, year step eligible */
  warningOnly: "warningOnly",
  /** post-Continue declared year > scanned max (flow-local) */
  warningYearMismatch: "warningYearMismatch",
  /** partial page errors, no warning */
  partialPageErrors: "partialPageErrors",
  /** unrecoverable total failure */
  totalFailure: "totalFailure",
} as const;

export type ScanReviewMode =
  (typeof ScanReviewMode)[keyof typeof ScanReviewMode];

/** Page-level entry screens returned by `resolveScanReviewScreen`. */
export const ScanReviewEntryScreen = {
  /** hard failure / launch / upload / pipeline failed */
  unknownError: "unknownError",
  /** passed=false + warning + rescan signals, no year step */
  combinedFullRescan: "combinedFullRescan",
  /** all pages need rescan with no readable table signal */
  allNeedsRescan: "allNeedsRescan",
  /** warningOnly — routes to `ScanReviewFlow` */
  incrementalFlow: "incrementalFlow",
  /** routes to `ScanReviewErrorScreen` */
  partialPageErrors: "partialPageErrors",
  /** routes to `ScanReviewTotalFailureScreen` */
  totalFailure: "totalFailure",
} as const;

export type ScanReviewEntryScreen =
  (typeof ScanReviewEntryScreen)[keyof typeof ScanReviewEntryScreen];

/** Recovery screen variants for shared `ScanReviewRecoveryScreen`. */
export const ScanReviewRecoveryVariant = {
  combined: "combined",
  allNeedsRescan: "allNeedsRescan",
  unknown: "unknown",
} as const;

export type ScanReviewRecoveryVariant =
  (typeof ScanReviewRecoveryVariant)[keyof typeof ScanReviewRecoveryVariant];

/** In-flow phases inside `ScanReviewFlow` (not entry routing). */
export const ScanReviewFlowPhase = {
  yearSelect: "yearSelect",
  yearMismatch: "yearMismatch",
} as const;

export type ScanReviewFlowPhase =
  (typeof ScanReviewFlowPhase)[keyof typeof ScanReviewFlowPhase];

export type ScanReviewModeReferenceRow = {
  semanticMode: ScanReviewMode | ScanReviewRecoveryVariant;
  entryOrFlow: "entry" | "flow";
  entryScreen?: ScanReviewEntryScreen;
  conditionSummary: string;
};

/** Semantic mode ↔ routing reference for module docs. */
export const SCAN_REVIEW_MODE_REFERENCE: ScanReviewModeReferenceRow[] = [
  {
    semanticMode: ScanReviewRecoveryVariant.unknown,
    entryOrFlow: "entry",
    entryScreen: ScanReviewEntryScreen.unknownError,
    conditionSummary:
      "Non-pipeline entry, scan_pipeline_status=failed, or unrecoverable errors",
  },
  {
    semanticMode: ScanReviewRecoveryVariant.combined,
    entryOrFlow: "entry",
    entryScreen: ScanReviewEntryScreen.combinedFullRescan,
    conditionSummary:
      "passed=false + possible_missing_last_page + rescan signals + skip_last_reg_year_step=false",
  },
  {
    semanticMode: ScanReviewRecoveryVariant.allNeedsRescan,
    entryOrFlow: "entry",
    entryScreen: ScanReviewEntryScreen.allNeedsRescan,
    conditionSummary:
      "All pages in pages_needing_rescan, scanned_max_reg_year null, no labelable pages",
  },
  {
    semanticMode: ScanReviewMode.warningOnly,
    entryOrFlow: "entry",
    entryScreen: ScanReviewEntryScreen.incrementalFlow,
    conditionSummary:
      "passed=true, warning present, scanned_max_reg_year set (year step)",
  },
  {
    semanticMode: ScanReviewMode.warningYearMismatch,
    entryOrFlow: "flow",
    conditionSummary:
      "User Continue with declared year > scanned max (inside ScanReviewFlow)",
  },
  {
    semanticMode: ScanReviewMode.partialPageErrors,
    entryOrFlow: "entry",
    entryScreen: ScanReviewEntryScreen.partialPageErrors,
    conditionSummary:
      "passed=false, no warning, labelable pages_needing_rescan",
  },
  {
    semanticMode: ScanReviewMode.totalFailure,
    entryOrFlow: "entry",
    entryScreen: ScanReviewEntryScreen.totalFailure,
    conditionSummary:
      "Unrecoverable: no labelable pages, empty actionable metadata, or warning ineligible",
  },
];
