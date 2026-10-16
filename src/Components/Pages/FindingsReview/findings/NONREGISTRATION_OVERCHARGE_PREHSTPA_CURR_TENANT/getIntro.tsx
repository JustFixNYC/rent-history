import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import type { Finding } from "../../types/finding";

import { IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, type IntroValues } from "./spec";

export function getIntroValues(finding: Finding): IntroValues {
  const year0 = INTRO_VALUE_MAP.year0(finding);
  const year1 = INTRO_VALUE_MAP.year1(finding);
  const lastRegistrationYear = INTRO_VALUE_MAP.lastRegistrationYear(finding);
  const reportedRentRaw = INTRO_VALUE_MAP.reportedRent(finding);

  if (
    year0 == null ||
    year1 == null ||
    lastRegistrationYear == null ||
    reportedRentRaw == null ||
    (typeof reportedRentRaw !== "number" && typeof reportedRentRaw !== "string")
  ) {
    throw new Error(
      "NONREGISTRATION_OVERCHARGE_PREHSTPA_CURR_TENANT intro requires two rows with reg_year and user legal_rent"
    );
  }

  const reportedRent =
    typeof reportedRentRaw === "number"
      ? reportedRentRaw
      : Number.parseFloat(reportedRentRaw);

  if (Number.isNaN(reportedRent)) {
    throw new Error(
      "NONREGISTRATION_OVERCHARGE_PREHSTPA_CURR_TENANT intro requires numeric legal_rent on user row"
    );
  }

  return {
    findingYear: finding.finding_year,
    year0,
    year1,
    lastRegistrationYear,
    reportedRent,
  };
}

export function getIntro(finding: Finding): FindingIntroPanelProps {
  const { year0, year1 } = getIntroValues(finding);

  return {
    title: <IntroTitle year0={year0} year1={year1} />,
  };
}
