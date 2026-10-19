import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import type { Finding } from "../../types/finding";

import { IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, TYPE, type IntroValues } from "./spec";

export function getIntroValues(finding: Finding): IntroValues {
  const rhYear = INTRO_VALUE_MAP.rhYear(finding);
  const reportedYear = INTRO_VALUE_MAP.reportedYear(finding);
  const reportedRentRaw = INTRO_VALUE_MAP.reportedRent(finding);

  if (
    rhYear == null ||
    reportedYear == null ||
    reportedRentRaw == null ||
    (typeof reportedRentRaw !== "number" && typeof reportedRentRaw !== "string")
  ) {
    throw new Error(
      `${TYPE} intro requires context and user rows with reg_year and user legal_rent`
    );
  }

  const reportedRent =
    typeof reportedRentRaw === "number"
      ? reportedRentRaw
      : Number.parseFloat(reportedRentRaw);

  if (Number.isNaN(reportedRent)) {
    throw new Error(`${TYPE} requires numeric legal_rent on user row`);
  }

  return {
    findingYear: finding.finding_year,
    rhYear,
    reportedYear,
    reportedRent,
  };
}

export function getIntro(_finding: Finding): FindingIntroPanelProps {
  return {
    title: <IntroTitle />,
  };
}
