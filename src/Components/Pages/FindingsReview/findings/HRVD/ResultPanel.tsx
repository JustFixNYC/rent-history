import type { ReactNode } from "react";

import { buildFindingResultContent } from "../../resultCopy";
import type { Finding, FindingResult } from "../../types/finding";
import type { FindingResultContent } from "../../types/findingModule";

import {
  ResultDismissedBody,
  ResultNoViolationBody,
  ResultPotentialViolationBody,
} from "./ReviewCopy";

export function renderHrvdResult(
  finding: Finding
): FindingResultContent | null {
  const result = finding.result;
  if (!result) {
    return null;
  }

  const copyProps = { year: finding.finding_year };

  const bodies: Record<FindingResult, ReactNode> = {
    potential_violation: <ResultPotentialViolationBody {...copyProps} />,
    no_violation: <ResultNoViolationBody {...copyProps} />,
    dismissed: <ResultDismissedBody />,
  };

  return buildFindingResultContent(result, bodies);
}
