import type { ReactNode } from "react";

import { buildFindingResultContent } from "../../resultCopy";
import type { Finding, FindingResult } from "../../types/finding";
import type { FindingResultContent } from "../../types/findingModule";

import {
  ResultDismissedBody,
  ResultNoViolationBody,
  ResultPotentialViolationBody,
} from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

export function renderNonregistrationPrefrentPosthstpaResult(
  finding: Finding
): FindingResultContent | null {
  const result = finding.result;
  if (!result) {
    return null;
  }

  const row0 = finding.data.rows[ROW_INDEX.context];
  const copyProps = {
    missingFromYear: (row0?.reg_year ?? 0) + 1,
  };

  const bodies: Record<FindingResult, ReactNode> = {
    potential_violation: <ResultPotentialViolationBody {...copyProps} />,
    no_violation: <ResultNoViolationBody {...copyProps} />,
    dismissed: <ResultDismissedBody />,
  };

  return buildFindingResultContent(result, bodies);
}
