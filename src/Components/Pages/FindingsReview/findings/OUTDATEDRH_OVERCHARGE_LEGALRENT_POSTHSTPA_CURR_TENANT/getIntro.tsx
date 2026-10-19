import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import { createCurrTenantIntroValuesGetter } from "../../shared/introValues";
import type { Finding } from "../../types/finding";

import { IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, TYPE, type IntroValues } from "./spec";

export const getIntroValues: (finding: Finding) => IntroValues =
  createCurrTenantIntroValuesGetter<IntroValues>({
    valueMap: INTRO_VALUE_MAP,
    missingDataMessage: `${TYPE} intro requires two rows with reg_year and user legal_rent`,
    invalidReportedRentMessage: `${TYPE} intro requires numeric legal_rent on user row`,
  });

export function getIntro(finding: Finding): FindingIntroPanelProps {
  const { year0, year1 } = getIntroValues(finding);

  return {
    title: <IntroTitle year0={year0} year1={year1} />,
  };
}
