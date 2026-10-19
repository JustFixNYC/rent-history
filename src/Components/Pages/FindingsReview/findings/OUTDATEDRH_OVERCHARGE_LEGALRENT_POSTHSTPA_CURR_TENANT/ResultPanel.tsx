import type { ReactNode } from "react";

import { buildFindingResultContent } from "../../resultCopy";
import type { Finding, FindingResult } from "../../types/finding";
import type { FindingResultContent } from "../../types/findingModule";

import { getIntroValues } from "./getIntro";
import {
  ResultDismissedBody,
  ResultNoViolationBody,
  ResultPotentialViolationBody,
} from "./ReviewCopy";

export function renderOutdatedrhOverchargeLegalrentPosthstpaCurrTenantResult(
  finding: Finding
): FindingResultContent | null {
  const result = finding.result;
  if (!result) {
    return null;
  }

  const { year0, year1, reportedRent } = getIntroValues(finding);

  const bodies: Record<FindingResult, ReactNode> = {
    potential_violation: (
      <ResultPotentialViolationBody
        year0={year0}
        year1={year1}
        reportedRent={reportedRent}
      />
    ),
    no_violation: <ResultNoViolationBody year0={year0} year1={year1} />,
    dismissed: <ResultDismissedBody />,
  };

  return buildFindingResultContent(result, bodies);
}
