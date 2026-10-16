import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import type { Finding } from "../../types/finding";

import { IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, type IntroValues } from "./spec";

export function getIntroValues(finding: Finding): IntroValues {
  const year0 = INTRO_VALUE_MAP.year0(finding);

  if (year0 == null) {
    throw new Error("HRVD intro requires row 0 with reg_year");
  }

  return {
    findingYear: INTRO_VALUE_MAP.findingYear(finding),
    year0,
  };
}

export function getIntro(finding: Finding): FindingIntroPanelProps {
  const values = getIntroValues(finding);

  return {
    title: <IntroTitle findingYear={values.findingYear} />,
  };
}
