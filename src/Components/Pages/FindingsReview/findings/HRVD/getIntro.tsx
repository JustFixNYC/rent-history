import type { FindingIntroPanelProps } from "../../FindingIntroPanel";
import type { Finding } from "../../types/finding";

import { IntroDescription, IntroEyebrow, IntroTitle } from "./ReviewCopy";
import { ROW_INDEX, type IntroValues } from "./spec";

export function getIntroValues(finding: Finding): IntroValues {
  const year0 = finding.data.rows[ROW_INDEX.tenancy]?.reg_year;

  if (year0 == null) {
    throw new Error("HRVD intro requires row 0 with reg_year");
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
