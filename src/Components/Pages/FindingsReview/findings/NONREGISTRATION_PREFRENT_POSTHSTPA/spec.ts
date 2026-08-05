import type { Finding } from "../../types/finding";

/** Wire finding type constant for registry lookup. */
export const TYPE = "NONREGISTRATION_PREFRENT_POSTHSTPA" as const;

/** Row index bindings for this type (single source of truth). */
export const ROW_INDEX = {
  context: 0,
  user: 1,
} as const;

/** Keys the user may patch per row during review (OCR + step fields). */
export const PATCHABLE_KEYS = {
  row0: ["apt_stat", "legal_rent", "pref_rent"] as const,
  row1: ["gets_vacancy_increase"] as const,
};

/** OCR `renderLeft` — Apt Stat dropdown (`apt_stat` on `finding.data.rows`). */
export const OCR_LEFT_FIELD = "apt_stat" as const;

/** Display-only keys — never sent in shape-A answers. */
export const EXCLUDED_ANSWER_KEYS = ["tenants"] as const;

/** Interactive step ids returned by `getSteps()` (intro is pinned, not listed). */
export const INTERACTIVE_STEP_IDS = ["ocr_confirm", "vacancy"] as const;

/**
 * Intro template placeholders → `finding.data` paths.
 * Used by `getIntroValues` and Lingui `Trans` to render the intro copy.
 */
export const INTRO_VALUE_MAP = {
  findingYear: (finding: Finding) => finding.finding_year,
  year0: (finding: Finding) => finding.data.rows[ROW_INDEX.context]?.reg_year,
  year1: (finding: Finding) => finding.data.rows[ROW_INDEX.user]?.reg_year,
  vacancyYear: (finding: Finding) =>
    finding.data.rows[ROW_INDEX.context]?.reg_year,
  missingFromYear: (finding: Finding) => {
    const year0 = finding.data.rows[ROW_INDEX.context]?.reg_year;
    return typeof year0 === "number" ? year0 + 1 : null;
  },
} as const;

export type IntroValues = {
  findingYear: number;
  year0: number;
  year1: number;
  vacancyYear: number;
  missingFromYear: number;
};
