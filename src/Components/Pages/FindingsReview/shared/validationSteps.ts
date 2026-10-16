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
