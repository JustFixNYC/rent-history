import type { TimelineFindingType, TimelineItem } from "./types";

const PRESENT_YEAR = 2026;

/**
 * Static mock timeline findings for `/dev` preview.
 * Replace with API response in a follow-up.
 */
export const mockTimelineElements: TimelineItem[] = [
  {
    type: "destab__viol__prehstpa",
    year: 2000,
    pills: ["violation", "destabilized"],
    data: {
      legal_rent: 1200,
      vacancy_amount: 240,
      longevity_amount: 72,
      max_rent: 1512,
      hrvd_amount: 2500,
    },
  },
  {
    type: "destab__no_viol__prehstpa",
    year: 2000,
    pills: ["destabilized"],
    data: {
      legal_rent: 1800,
      vacancy_amount: 360,
      longevity_amount: 180,
      max_rent: 2550,
      hrvd_amount: 2500,
    },
  },
  {
    type: "destab__viol__posthstpa",
    year: 2021,
    pills: ["violation", "destabilized"],
    data: {
      program: "421a",
    },
  },
  {
    type: "nonreg__viol__prehstpa__new_tenant",
    year: 2000,
    pills: ["violation", "missing_registration"],
    data: {
      previous_year: 1999,
      previous_rent: 1100,
      vacancy_amount: 220,
      longevity_amount: 66,
      max_rent: 1386,
      hrvd_amount: 2500,
      iai_amount: 11140,
      program: "421a",
    },
  },
  {
    type: "nonreg__destab__prehstpa",
    year: 2000,
    pills: ["destabilized", "missing_registration"],
    data: {
      previous_year: 1999,
      previous_rent: 1800,
      vacancy_amount: 360,
      longevity_amount: 180,
      max_rent: 2550,
      hrvd_amount: 2500,
    },
  },
  {
    type: "nonreg__viol__prehstpa__same_tenant",
    year: 2000,
    pills: ["violation", "missing_registration"],
    data: {
      current_year: PRESENT_YEAR,
      current_rent: 2800,
      max_rent: 2100,
    },
  },
  {
    type: "nonreg__no_viol__same_tenant",
    year: 2000,
    pills: ["missing_registration", "currently_stabilized"],
    data: {
      current_year: PRESENT_YEAR,
      legal_rent: 1100,
      current_rent: 2000,
      max_rent: 2100,
    },
  },
  {
    type: "increase__viol__prehstpa",
    year: 2000,
    pills: ["violation"],
    data: {
      previous_year: 1999,
      previous_rent: 1100,
      legal_rent: 1500,
      vacancy_amount: 220,
      longevity_amount: 66,
      max_rent: 1386,
      iai_amount: 5000,
    },
  },
  {
    type: "increase__no_viol__prehstpa",
    year: 2000,
    pills: [],
    data: {
      previous_year: 1999,
      previous_rent: 1100,
      legal_rent: 1300,
      vacancy_amount: 220,
      longevity_amount: null,
      max_rent: 1386,
    },
  },
  {
    type: "nonreg__viol__posthstpa__new_tenant",
    year: 2021,
    pills: ["violation", "missing_registration"],
    data: {
      program: "j51",
    },
  },
  {
    type: "nonreg__viol__posthstpa__same_tenant",
    year: 2021,
    pills: ["violation", "missing_registration"],
    data: {
      current_year: PRESENT_YEAR,
      current_rent: 3200,
      max_rent: 2500,
      program: "421a",
    },
  },
  {
    type: "increase_legal__viol__posthstpa",
    year: 2022,
    pills: ["violation"],
    data: {
      legal_rent: 2800,
      rgb_increase_percentage: 3.25,
      iai_amount: 8000,
    },
  },
  {
    type: "increase_pref__viol__posthstpa",
    year: 2022,
    pills: ["violation"],
    data: {
      pref_rent: 2600,
      max_rent: 2400,
      iai_amount: 6000,
    },
  },
  {
    type: "increase_pref__no_viol__posthstpa",
    year: 2022,
    pills: [],
    data: {
      pref_rent: 2200,
    },
  },
  {
    type: "revoke_pref__viol__posthstpa",
    year: 2022,
    pills: ["violation"],
    data: {
      previous_year: 2021,
      pref_rent: 2100,
    },
  },
  {
    type: "pref_421a__viol",
    year: 2021,
    pills: ["violation"],
    data: {
      program_start_year: 2021,
      legal_rent: 3000,
      pref_rent: 2500,
    },
  },
  {
    type: "missing_reg",
    year: 2000,
    end_year: 2004,
    pills: ["missing_registration"],
    data: {},
  },
  {
    type: "temp_exemption",
    year: 2000,
    pills: ["temporary_exemption"],
    data: {},
  },
  {
    type: "still_stab",
    year: PRESENT_YEAR,
    pills: ["currently_stabilized"],
    data: {},
  },
  {
    type: "destab__sub_rehab__posthstpa",
    year: 2021,
    pills: ["destabilized"],
    data: {},
  },
  {
    type: "no_finding",
    year: PRESENT_YEAR,
    pills: [],
    data: {},
  },
];

/** All finding types represented in mock data (for dev preview smoke checks). */
export const mockTimelineFindingTypes: TimelineFindingType[] =
  mockTimelineElements.map((item) => item.type);
