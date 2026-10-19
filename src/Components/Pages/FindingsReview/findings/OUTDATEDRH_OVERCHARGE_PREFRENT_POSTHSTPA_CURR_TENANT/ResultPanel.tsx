import type { ReactNode } from "react";

import { buildFindingResultContent } from "../../resultCopy";
import type { Finding, FindingResult } from "../../types/finding";
import type { FindingResultContent } from "../../types/findingModule";

import { getIntroValues } from "./getIntro";
import {
  ResultDismissedBody,
  ResultNoViolationBody,
  ResultPotentialViolationContinuousBody,
  ResultPotentialViolationNotContinuousBody,
} from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

export function renderOutdatedrhOverchargePrefrentPosthstpaCurrTenantResult(
  finding: Finding
): FindingResultContent | null {
  const result = finding.result;
  if (!result) {
    return null;
  }

  const { year0, year1, reportedRent } = getIntroValues(finding);
  const getsVacancyIncrease =
    finding.data.rows[ROW_INDEX.user]?.gets_vacancy_increase;

  let potentialViolationBody: ReactNode;
  if (getsVacancyIncrease === false) {
    potentialViolationBody = (
      <ResultPotentialViolationContinuousBody
        year0={year0}
        year1={year1}
        reportedRent={reportedRent}
      />
    );
  } else {
    potentialViolationBody = (
      <ResultPotentialViolationNotContinuousBody
        year0={year0}
        year1={year1}
        reportedRent={reportedRent}
      />
    );
  }

  const bodies: Record<FindingResult, ReactNode> = {
    potential_violation: potentialViolationBody,
    no_violation: <ResultNoViolationBody year0={year0} year1={year1} />,
    dismissed: <ResultDismissedBody />,
  };

  return buildFindingResultContent(result, bodies);
}
