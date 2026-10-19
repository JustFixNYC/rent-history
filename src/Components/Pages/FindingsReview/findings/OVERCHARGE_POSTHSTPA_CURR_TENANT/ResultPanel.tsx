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

export function renderOverchargePosthstpaCurrTenantResult(
  finding: Finding
): FindingResultContent | null {
  const result = finding.result;
  if (!result) {
    return null;
  }

  const { rhYear, reportedYear } = getIntroValues(finding);

  const bodies: Record<FindingResult, ReactNode> = {
    potential_violation: (
      <ResultPotentialViolationBody
        rhYear={rhYear}
        reportedYear={reportedYear}
      />
    ),
    no_violation: <ResultNoViolationBody />,
    dismissed: <ResultDismissedBody />,
  };

  return buildFindingResultContent(result, bodies);
}
