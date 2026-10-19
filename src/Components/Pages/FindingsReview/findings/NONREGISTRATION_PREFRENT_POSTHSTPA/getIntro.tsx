import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import type { Finding } from "../../types/finding";

import { IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, TYPE, type IntroValues } from "./spec";

export function getIntroValues(finding: Finding): IntroValues {
  const year0 = INTRO_VALUE_MAP.year0(finding);
  const year1 = INTRO_VALUE_MAP.year1(finding);
  const vacancyYear = INTRO_VALUE_MAP.vacancyYear(finding);
  const missingFromYear = INTRO_VALUE_MAP.missingFromYear(finding);
  const reportedRentRaw = INTRO_VALUE_MAP.reportedRent(finding);

  if (
    year0 == null ||
    year1 == null ||
    vacancyYear == null ||
    missingFromYear == null ||
    reportedRentRaw == null ||
    (typeof reportedRentRaw !== "number" && typeof reportedRentRaw !== "string")
  ) {
    throw new Error(`${TYPE} intro requires two rows with reg_year values`);
  }

  const reportedRent =
    typeof reportedRentRaw === "number"
      ? reportedRentRaw
      : Number.parseFloat(reportedRentRaw);

  if (Number.isNaN(reportedRent)) {
    throw new Error(`${TYPE} intro requires numeric legal_rent on user row`);
  }

  return {
    findingYear: finding.finding_year,
    year0,
    year1,
    vacancyYear,
    missingFromYear,
    reportedRent,
  };
}

export function getIntro(finding: Finding): FindingIntroPanelProps {
  const { missingFromYear, year1 } = getIntroValues(finding);

  return {
    title: <IntroTitle missingFromYear={missingFromYear} year1={year1} />,
  };
}
