import type { Finding } from "../../types/finding";

/** Wire finding type constant for registry lookup. */
export const TYPE = "OVERCHARGE_PREFRENT_POSTHSTPA" as const;

/** Row index bindings for this type (single source of truth). */
export const ROW_INDEX = {
  row0: 0,
  row1: 1,
} as const;

/** Keys the user may patch per row during review (OCR + step fields). */
export const PATCHABLE_KEYS = {
  row0: ["apt_stat", "legal_rent", "pref_rent"] as const,
  row1: ["apt_stat", "pref_rent", "gets_vacancy_increase"] as const,
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
  year0: (finding: Finding) => finding.data.rows[ROW_INDEX.row0]?.reg_year,
  year1: (finding: Finding) => finding.data.rows[ROW_INDEX.row1]?.reg_year,
  rent0: (finding: Finding) =>
    finding.data.rows[ROW_INDEX.row0]?.pref_rent ?? null,
  rent1: (finding: Finding) =>
    finding.data.rows[ROW_INDEX.row1]?.pref_rent ?? null,
  percentIncrease: (finding: Finding) => {
    const rent0 = finding.data.rows[ROW_INDEX.row0]?.pref_rent;
    const rent1 = finding.data.rows[ROW_INDEX.row1]?.pref_rent;
    if (typeof rent0 !== "number" || typeof rent1 !== "number" || rent0 === 0) {
      return null;
    }
    return Math.round(((rent1 - rent0) / rent0) * 100);
  },
} as const;

export type IntroValues = {
  findingYear: number;
  year0: number;
  year1: number;
  rent0: number;
  rent1: number;
  percentIncrease: number;
};
