import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import type { Finding } from "../../types/finding";

import { IntroDescription, IntroEyebrow, IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, TYPE, type IntroValues } from "./spec";

export function getIntroValues(finding: Finding): IntroValues {
  const year0 = INTRO_VALUE_MAP.year0(finding);

  if (year0 == null) {
    throw new Error(`${TYPE} intro requires a row with reg_year`);
  }

  return {
    findingYear: finding.finding_year,
    year0,
  };
}

export function getIntro(finding: Finding): FindingIntroPanelProps {
  const values = getIntroValues(finding);

  return {
    eyebrow: <IntroEyebrow findingYear={values.findingYear} />,
    title: <IntroTitle />,
    description: <IntroDescription />,
  };
}
