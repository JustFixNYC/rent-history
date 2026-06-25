import type { ReactNode } from "react";

import { buildFindingResultContent } from "../../resultCopy";
import type { Finding, FindingResult } from "../../types/finding";
import type { FindingResultContent } from "../../types/findingModule";

import {
  ResultDismissedBody,
  ResultNoViolationBody,
  ResultPotentialViolationNoBody,
  ResultPotentialViolationYesBody,
} from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

export function renderNonregistrationPrehstpaResult(
  finding: Finding
): FindingResultContent | null {
  const result = finding.result;
  if (!result) {
    return null;
  }

  const row0 = finding.data.rows[ROW_INDEX.context];
  const row1 = finding.data.rows[ROW_INDEX.user];
  const vacancyYear = row0?.reg_year ?? 0;
  const copyProps = {
    missingFromYear: vacancyYear + 1,
    findingYear: finding.finding_year,
    vacancyYear,
  };

  const getsVacancyIncrease = row1?.gets_vacancy_increase;

  let potentialViolationBody: ReactNode;
  if (getsVacancyIncrease === false) {
    potentialViolationBody = <ResultPotentialViolationYesBody {...copyProps} />;
  } else {
    // true or null — mock BE may not echo review answers on wire rows yet
    potentialViolationBody = <ResultPotentialViolationNoBody {...copyProps} />;
  }

  const bodies: Record<FindingResult, ReactNode> = {
    potential_violation: potentialViolationBody,
    no_violation: (
      <ResultNoViolationBody missingFromYear={copyProps.missingFromYear} />
    ),
    dismissed: <ResultDismissedBody />,
  };

  return buildFindingResultContent(result, bodies);
}
