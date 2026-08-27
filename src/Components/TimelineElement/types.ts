import type { TimelinePillType } from "./TimelineElement";

export type TimelineFindingType =
  | "destab__viol__prehstpa"
  | "destab__no_viol__prehstpa"
  | "destab__viol__posthstpa"
  | "nonreg__viol__prehstpa__new_tenant"
  | "nonreg__destab__prehstpa"
  | "nonreg__viol__prehstpa__same_tenant"
  | "nonreg__no_viol__same_tenant"
  | "increase__viol__prehstpa"
  | "increase__no_viol__prehstpa"
  | "nonreg__viol__posthstpa__new_tenant"
  | "nonreg__viol__posthstpa__same_tenant"
  | "increase_legal__viol__posthstpa"
  | "increase_pref__viol__posthstpa"
  | "increase_pref__no_viol__posthstpa"
  | "revoke_pref__viol__posthstpa"
  | "pref_421a__viol";

export type TimelineRentKind = "legal" | "preferential";

/** All fields optional; copy components assert values they need before use. */
export type TimelineElementData = {
  /** Present/analysis year from API (e.g. 2026 for RGB comparison). */
  current_year?: number;
  previous_year?: number;
  /** Document legal regulated rent. */
  legal_rent?: number;
  /** Document preferential rent. */
  pref_rent?: number;
  /** User-supplied current rent from rent questions. */
  current_rent?: number;
  previous_rent?: number;
  vacancy_amount?: number;
  longevity_amount?: number | null;
  iai_amount?: number;
  max_rent?: number;
  hrvd_amount?: number;
  rgb_increase_percentage?: number;
  program_start_year?: number;
};

export type TimelineItem = {
  type: TimelineFindingType;
  year: number;
  end_year?: number;
  pills: TimelinePillType[];
  data: TimelineElementData;
};
