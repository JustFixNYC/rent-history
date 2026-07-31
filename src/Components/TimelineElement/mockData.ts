import type { TimelineItem } from "./types";

/**
 * Static mock timeline findings for `/dev` preview.
 * Replace with API response in a follow-up.
 */
export const mockTimelineElements: TimelineItem[] = [
  {
    type: "violation__destab__prehstpa",
    year: 2000,
    pills: ["violation", "destabilized"],
    data: {
      current_year: 2000,
      current_rent: 1200,
      vacancy_amount: 240,
      longevity_amount: 72,
      max_rent: 1512,
      hrvd_amount: 2500,
    },
  },
  {
    type: "violation__destab__prehstpa",
    year: 2003,
    pills: ["violation", "destabilized"],
    data: {
      current_year: 2003,
      current_rent: 1350,
      vacancy_amount: 270,
      longevity_amount: null,
      max_rent: 1620,
      hrvd_amount: 2500,
    },
  },
  {
    type: "no_violation__destab__prehstpa",
    year: 2000,
    pills: ["destabilized"],
    data: {
      current_year: 2000,
      current_rent: 1800,
      vacancy_amount: 360,
      longevity_amount: 180,
      max_rent: 2550,
      hrvd_amount: 2500,
    },
  },
  {
    type: "violation__destab__posthstpa",
    year: 2021,
    pills: ["violation", "destabilized"],
    data: {
      current_year: 2021,
    },
  },
  {
    type: "nonregistration__posthstpa__new_tenant",
    year: 2000,
    pills: ["violation", "missing_registration"],
    data: {
      current_year: 2000,
      previous_year: 1999,
      previous_rent: 1100,
      vacancy_amount: 220,
      longevity_amount: 66,
      max_rent: 1386,
      hrvd_amount: 2500,
      iai_amount: 11140,
    },
  },
];
