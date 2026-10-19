import type { Finding } from "../../types/finding";

/** Wire finding type constant for registry lookup. */
export const TYPE = "OVERCHARGE_POSTHSTPA_CURR_TENANT" as const;

/** Row index bindings for this type (single source of truth). */
export const ROW_INDEX = {
  context: 0,
  user: 1,
} as const;

/** Keys the user may patch per row during review (OCR fields). */
export const PATCHABLE_KEYS = {
  row0: ["apt_stat", "legal_rent"] as const,
};

/** OCR `renderLeft` — Apt Stat dropdown (`apt_stat` on `finding.data.rows`). */
export const OCR_LEFT_FIELD = "apt_stat" as const;

/** Display-only keys — never sent in shape-A answers. */
export const EXCLUDED_ANSWER_KEYS = ["tenants"] as const;

/** Interactive step ids returned by `getSteps()` (intro is pinned, not listed). */
export const INTERACTIVE_STEP_IDS = ["ocr_confirm"] as const;

/**
 * Intro template placeholders → `finding.data` paths.
 * Used by `getIntroValues` and Lingui `Trans` to render result copy.
 */
export const INTRO_VALUE_MAP = {
  findingYear: (finding: Finding) => finding.finding_year,
  rhYear: (finding: Finding) => finding.data.rows[ROW_INDEX.context]?.reg_year,
  reportedYear: (finding: Finding) => finding.finding_year,
  reportedRent: (finding: Finding) =>
    finding.data.rows[ROW_INDEX.user]?.legal_rent ?? null,
} as const;

export type IntroValues = {
  findingYear: number;
  rhYear: number;
  reportedYear: number;
  reportedRent: number;
};
