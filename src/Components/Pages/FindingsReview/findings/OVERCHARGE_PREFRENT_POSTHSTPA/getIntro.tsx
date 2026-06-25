import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import { createIntroValuesGetter } from "../../shared/introValues";
import type { Finding } from "../../types/finding";

import { IntroDescription, IntroEyebrow, IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, TYPE, type IntroValues } from "./spec";

export const getIntroValues: (finding: Finding) => IntroValues =
  createIntroValuesGetter({
    findingType: TYPE,
    valueMap: INTRO_VALUE_MAP,
    missingDataMessage: `${TYPE} intro requires two rows with pref_rent values`,
  });

export function getIntro(finding: Finding): FindingIntroPanelProps {
  const values = getIntroValues(finding);

  return {
    eyebrow: <IntroEyebrow findingYear={values.findingYear} />,
    title: <IntroTitle />,
    description: <IntroDescription percentIncrease={values.percentIncrease} />,
  };
}
