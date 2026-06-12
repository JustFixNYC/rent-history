import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import type { Finding } from "../../types/finding";

import {
  IntroDescription,
  IntroEyebrow,
  IntroTitle,
} from "./ReviewCopy";
import { INTRO_VALUE_MAP, type IntroValues } from "./spec";

export function getIntroValues(finding: Finding): IntroValues {
  const year0 = INTRO_VALUE_MAP.year0(finding);
  const year1 = INTRO_VALUE_MAP.year1(finding);
  const rent0 = INTRO_VALUE_MAP.rent0(finding);
  const rent1 = INTRO_VALUE_MAP.rent1(finding);
  const percentIncrease = INTRO_VALUE_MAP.percentIncrease(finding);

  if (
    year0 == null ||
    year1 == null ||
    rent0 == null ||
    rent1 == null ||
    percentIncrease == null
  ) {
    throw new Error(
      "OVERCHARGE_PREHSTPA intro requires two rows with legal_rent values"
    );
  }

  return {
    findingYear: finding.finding_year,
    year0,
    year1,
    rent0,
    rent1,
    percentIncrease,
  };
}

export function getIntro(finding: Finding): FindingIntroPanelProps {
  const values = getIntroValues(finding);

  return {
    eyebrow: <IntroEyebrow findingYear={values.findingYear} />,
    title: <IntroTitle />,
    description: <IntroDescription percentIncrease={values.percentIncrease} />,
  };
}
