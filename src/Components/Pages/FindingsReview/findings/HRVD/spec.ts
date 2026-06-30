import type { Finding } from "../../types/finding";

/** Wire finding type constant for registry lookup. */
export const TYPE = "HRVD" as const;

/** Row index bindings for this type (single source of truth). */
export const ROW_INDEX = {
  tenancy: 0,
} as const;

/** Keys the user may patch per row during review (OCR + step fields). */
export const PATCHABLE_KEYS = {
  row0: ["apt_stat", "legal_rent", "tenancy_start"] as const,
};

/** OCR `renderLeft` — Apt Stat dropdown (`apt_stat` on `finding.data.rows`). */
export const OCR_LEFT_FIELD = "apt_stat" as const;

/** Display-only keys — never sent in shape-A answers. */
export const EXCLUDED_ANSWER_KEYS = ["tenants"] as const;

/** Interactive step ids returned by `getSteps()` (intro is pinned, not listed). */
export const INTERACTIVE_STEP_IDS = ["ocr_confirm", "tenancy_start"] as const;

/**
 * Intro template placeholders → `finding.data` paths.
 * Used by `getIntroValues` and Lingui `Trans` to render the intro copy.
 */
export const INTRO_VALUE_MAP = {
  findingYear: (finding: Finding) => finding.finding_year,
  year0: (finding: Finding) => finding.data.rows[ROW_INDEX.tenancy]?.reg_year,
} as const;

export type IntroValues = {
  findingYear: number;
  year0: number;
};

export function getTenancyRowTenants(finding: Finding): string[] {
  return finding.data.rows[ROW_INDEX.tenancy]?.tenants?.filter(Boolean) ?? [];
}
