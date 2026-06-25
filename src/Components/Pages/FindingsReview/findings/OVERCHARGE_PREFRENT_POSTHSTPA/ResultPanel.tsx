import type { ReactNode } from "react";

import { buildFindingResultContent } from "../../resultCopy";
import type { Finding, FindingResult } from "../../types/finding";
import type { FindingResultContent } from "../../types/findingModule";

import {
  ResultDismissedBody,
  ResultNoViolationBody,
  ResultPotentialViolationNoVacancyBody,
  ResultPotentialViolationVacancyBody,
} from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

export function renderPrefrentPosthstpaResult(
  finding: Finding
): FindingResultContent | null {
  const result = finding.result;
  if (!result) {
    return null;
  }

  const row0 = finding.data.rows[ROW_INDEX.row0];
  const row1 = finding.data.rows[ROW_INDEX.row1];
  const copyProps = {
    rent0: Number(row0?.pref_rent ?? 0),
    rent1: Number(row1?.pref_rent ?? 0),
    year0: row0?.reg_year ?? 0,
    year1: row1?.reg_year ?? 0,
  };

  const getsVacancyIncrease = row1?.gets_vacancy_increase;

  let potentialViolationBody: ReactNode;
  if (getsVacancyIncrease === false) {
    potentialViolationBody = (
      <ResultPotentialViolationVacancyBody {...copyProps} />
    );
  } else {
    // true or null — mock BE may not echo review answers on wire rows yet
    potentialViolationBody = (
      <ResultPotentialViolationNoVacancyBody {...copyProps} />
    );
  }

  const bodies: Record<FindingResult, ReactNode> = {
    potential_violation: potentialViolationBody,
    no_violation: <ResultNoViolationBody {...copyProps} />,
    dismissed: <ResultDismissedBody {...copyProps} />,
  };

  return buildFindingResultContent(result, bodies);
}
