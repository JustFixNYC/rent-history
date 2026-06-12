import type { Finding } from "../../types/finding";

/** Wire finding type constant for registry lookup. */
export const TYPE = "OVERCHARGE_PREHSTPA" as const;

/** Row index bindings for this type (single source of truth). */
export const ROW_INDEX = {
  tenancy: 0,
  vacancy: 1,
} as const;

/** Keys the user may patch per row during review (OCR + step fields). */
export const PATCHABLE_KEYS = {
  row0: ["legal_rent", "tenancy_start"] as const,
  row1: ["legal_rent", "gets_vacancy_increase"] as const,
};

/**
 * OCR `renderLeft` — Figma Apt Stat dropdown (`apt_stat` on `finding.data.rows`).
 * Excluded from pilot until fixture rows include the field; `getSteps` uses an empty placeholder.
 */
export const DEFERRED_OCR_LEFT_FIELD = "apt_stat" as const;

/** Analysis-only keys — never sent in shape-A answers. */
export const EXCLUDED_ANSWER_KEYS = ["rgb_pct", "tenants"] as const;

/** Interactive step ids returned by `getSteps()` (intro is pinned, not listed). */
export const INTERACTIVE_STEP_IDS = [
  "ocr_confirm",
  "vacancy",
  "tenancy_start",
] as const;

/**
 * Intro template placeholders → `finding.data` paths.
 * Used by `getIntroValues` and Lingui `Trans` to render the intro copy.
 */
export const INTRO_VALUE_MAP = {
  findingYear: (finding: Finding) => finding.finding_year,
  year0: (finding: Finding) => finding.data.rows[ROW_INDEX.tenancy]?.reg_year,
  year1: (finding: Finding) => finding.data.rows[ROW_INDEX.vacancy]?.reg_year,
  rent0: (finding: Finding) =>
    finding.data.rows[ROW_INDEX.tenancy]?.legal_rent ?? null,
  rent1: (finding: Finding) =>
    finding.data.rows[ROW_INDEX.vacancy]?.legal_rent ?? null,
  percentIncrease: (finding: Finding) => {
    const rent0 = finding.data.rows[ROW_INDEX.tenancy]?.legal_rent;
    const rent1 = finding.data.rows[ROW_INDEX.vacancy]?.legal_rent;
    if (rent0 == null || rent1 == null || rent0 === 0) {
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
