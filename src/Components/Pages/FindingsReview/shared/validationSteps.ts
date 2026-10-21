/**
 * Findings Review validation step variant catalog (types only).
 *
 * Figma: Rent-History-Calculator-Design (fileKey nzuXsm5GhU0vNQG31xViYw)
 * - OCR confirm values: 7198:12327
 * - Vacancy (Self / Single / Multiple): 7198:12650
 *   - selfTenant: 7198:12651
 *   - singleTenant: 7198:12675
 *   - multipleTenants: 7198:12703
 * - Tenancy / longevity: 7198:12739
 *   - singleTenant: 7198:12753
 *   - multipleTenants: 7198:12783
 * - Succession: 7502:9736
 */

export type VacancyStepVariant =
  | "selfTenant"
  | "singleTenant"
  | "multipleTenants";

export type TenancyStepVariant = "singleTenant" | "multipleTenants";

/** Boolean yes/no step; wire answers map directly (no vacancy inversion). */
export type SuccessionStepKind = "succession";

/** OCR confirm field layout (types only; wired in getSteps via buildStandardOcrRows / buildPrefRentOcrRows). */
export type OcrLayoutVariant =
  | "legalRentOnlySingleRow"
  | "legalRentOnlyTwoRows"
  | "prefRentSingleRow"
  | "prefRentTwoRow"
  | "prefRentRemovedTwoRow";

/**
 * OCR layout → FINDING_MODULES registry keys:
 * - legalRentOnlySingleRow: HRVD; NONREGISTRATION/OUTDATEDRH curr-tenant legal types;
 *   OVERCHARGE_CURR_RENT_MISMATCH_POSTHSTPA_CURR_TENANT; OVERCHARGE_EXPIREDLEASE_POSTHSTPA_CURR_TENANT
 * - legalRentOnlyTwoRows: OVERCHARGE_PREHSTPA, OVERCHARGE_LEGALRENT_POSTHSTPA
 * - prefRentSingleRow: PREFRENT_421A; NONREG/OUTDATEDRH pref curr-tenant types
 * - prefRentTwoRow: OVERCHARGE_PREFRENT_POSTHSTPA
 * - prefRentRemovedTwoRow: OVERCHARGE_PREFRENTREMOVED_POSTHSTPA (row0 omits no-pref checkbox)
 */
