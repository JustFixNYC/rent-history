import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import { createCurrTenantIntroValuesGetter } from "../../shared/introValues";
import type { Finding } from "../../types/finding";

import { IntroTitle } from "./ReviewCopy";
import { INTRO_VALUE_MAP, type IntroValues } from "./spec";

const FINDING_TYPE = "NONREGISTRATION_OVERCHARGE_PREHSTPA_CURR_TENANT";

export const getIntroValues: (finding: Finding) => IntroValues =
  createCurrTenantIntroValuesGetter<IntroValues>({
    valueMap: INTRO_VALUE_MAP,
    missingDataMessage: `${FINDING_TYPE} intro requires two rows with reg_year and user legal_rent`,
    invalidReportedRentMessage: `${FINDING_TYPE} intro requires numeric legal_rent on user row`,
    requireLastRegistrationYear: true,
  });

export function getIntro(finding: Finding): FindingIntroPanelProps {
  const { year0, year1 } = getIntroValues(finding);

  return {
    title: <IntroTitle year0={year0} year1={year1} />,
  };
}
