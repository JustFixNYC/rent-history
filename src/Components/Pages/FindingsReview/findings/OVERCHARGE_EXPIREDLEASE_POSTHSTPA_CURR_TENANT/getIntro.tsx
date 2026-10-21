import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import { parseNumericRent } from "../../shared/introValues";
import type { Finding } from "../../types/finding";

import { IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, TYPE, type IntroValues } from "./spec";

export function getIntroValues(finding: Finding): IntroValues {
  const rhYear = INTRO_VALUE_MAP.rhYear(finding);
  const reportedYear = INTRO_VALUE_MAP.reportedYear(finding);

  const missingDataMessage = `${TYPE} intro requires context and user rows with reg_year and user legal_rent`;
  const invalidReportedRentMessage = `${TYPE} requires numeric legal_rent on user row`;

  if (rhYear == null || reportedYear == null) {
    throw new Error(missingDataMessage);
  }

  const reportedRent = parseNumericRent(INTRO_VALUE_MAP.reportedRent(finding), {
    ifMissing: missingDataMessage,
    ifNotNumeric: invalidReportedRentMessage,
  });

  return {
    findingYear: finding.finding_year,
    rhYear,
    reportedYear,
    reportedRent,
  };
}

export function getIntro(finding: Finding): FindingIntroPanelProps {
  const { rhYear } = getIntroValues(finding);

  return {
    title: <IntroTitle rhYear={rhYear} />,
  };
}
