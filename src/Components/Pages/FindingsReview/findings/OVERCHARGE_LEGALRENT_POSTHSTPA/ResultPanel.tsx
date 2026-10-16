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

export function renderLegalrentPosthstpaResult(
  finding: Finding
): FindingResultContent | null {
  const result = finding.result;
  if (!result) {
    return null;
  }

  const { year0, year1 } = getIntroValues(finding);
  const copyProps = { year0, year1 };

  const bodies: Record<FindingResult, ReactNode> = {
    potential_violation: <ResultPotentialViolationBody {...copyProps} />,
    no_violation: <ResultNoViolationBody {...copyProps} />,
    dismissed: <ResultDismissedBody {...copyProps} />,
  };

  return buildFindingResultContent(result, bodies);
}
