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
  /** passed=false + warning + year step */
  errorsAndWarning: "errorsAndWarning",
  /** partial page errors, no warning */
  partialPageErrors: "partialPageErrors",
  /** unrecoverable total failure */
  totalFailure: "totalFailure",
} as const;

export type ScanReviewMode =
  (typeof ScanReviewMode)[keyof typeof ScanReviewMode];

/** Page-level entry screens returned by `resolveScanReviewScreen`. */
export const ScanReviewEntryScreen = {
  /** warningOnly or errorsAndWarning — routes to `ScanReviewFlow` */
  incrementalFlow: "incrementalFlow",
  /** routes to `ScanReviewErrorScreen` */
  partialPageErrors: "partialPageErrors",
  /** routes to `ScanReviewTotalFailureScreen` */
  totalFailure: "totalFailure",
} as const;

export type ScanReviewEntryScreen =
  (typeof ScanReviewEntryScreen)[keyof typeof ScanReviewEntryScreen];

/** In-flow phases inside `ScanReviewFlow` (not entry routing). */
export const ScanReviewFlowPhase = {
  yearSelect: "yearSelect",
  yearMismatch: "yearMismatch",
} as const;

export type ScanReviewFlowPhase =
  (typeof ScanReviewFlowPhase)[keyof typeof ScanReviewFlowPhase];

export type ScanReviewModeReferenceRow = {
  semanticMode: ScanReviewMode;
  entryOrFlow: "entry" | "flow";
  entryScreen?: ScanReviewEntryScreen;
  conditionSummary: string;
};

/** Semantic mode ↔ routing reference for module docs. */
export const SCAN_REVIEW_MODE_REFERENCE: ScanReviewModeReferenceRow[] = [
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
    semanticMode: ScanReviewMode.errorsAndWarning,
    entryOrFlow: "entry",
    entryScreen: ScanReviewEntryScreen.incrementalFlow,
    conditionSummary: "passed=false + warning + year step eligible",
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
      "Unrecoverable: non-pipeline entry, no labelable pages, or missing reg year signal",
  },
];
