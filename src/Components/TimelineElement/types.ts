import type { TimelinePillType } from "./TimelineElement";

export type TimelineFindingType =
  | "violation__destab__prehstpa"
  | "no_violation__destab__prehstpa"
  | "violation__destab__posthstpa"
  | "nonregistration__posthstpa__new_tenant";

export type TimelineRentKind = "legal" | "preferential";

/** All fields optional; copy components assert values they need before use. */
export type TimelineElementData = {
  current_year?: number;
  previous_year?: number;
  current_rent?: number;
  previous_rent?: number;
  vacancy_amount?: number;
  longevity_amount?: number | null;
  iai_amount?: number;
  max_rent?: number;
  hrvd_amount?: number;
};

export type TimelineItem = {
  type: TimelineFindingType;
  year: number;
  end_year?: number;
  pills: TimelinePillType[];
  data: TimelineElementData;
};
