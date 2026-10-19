import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import { parseNumericRent } from "../../shared/introValues";
import type { Finding } from "../../types/finding";

import { IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, TYPE, type IntroValues } from "./spec";

export function getIntroValues(finding: Finding): IntroValues {
  const year0 = INTRO_VALUE_MAP.year0(finding);
  const year1 = INTRO_VALUE_MAP.year1(finding);
  const vacancyYear = INTRO_VALUE_MAP.vacancyYear(finding);
  const missingFromYear = INTRO_VALUE_MAP.missingFromYear(finding);

  const missingDataMessage = `${TYPE} intro requires two rows with reg_year values`;
  const invalidReportedRentMessage = `${TYPE} intro requires numeric legal_rent on user row`;

  if (
    year0 == null ||
    year1 == null ||
    vacancyYear == null ||
    missingFromYear == null
  ) {
    throw new Error(missingDataMessage);
  }

  const reportedRent = parseNumericRent(INTRO_VALUE_MAP.reportedRent(finding), {
    ifMissing: missingDataMessage,
    ifNotNumeric: invalidReportedRentMessage,
  });

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
