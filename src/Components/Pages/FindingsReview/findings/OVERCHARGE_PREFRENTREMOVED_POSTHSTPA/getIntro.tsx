import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import type { Finding } from "../../types/finding";

import { IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, TYPE, type IntroValues } from "./spec";

export function getIntroValues(finding: Finding): IntroValues {
  const year0 = INTRO_VALUE_MAP.year0(finding);
  const year1 = INTRO_VALUE_MAP.year1(finding);

  if (year0 == null || year1 == null) {
    throw new Error(`${TYPE} intro requires two rows with reg_year values`);
  }

  return {
    findingYear: finding.finding_year,
    year0,
    year1,
  };
}

export function getIntro(finding: Finding): FindingIntroPanelProps {
  const { year1 } = getIntroValues(finding);

  return {
    title: <IntroTitle year1={year1} />,
  };
}
