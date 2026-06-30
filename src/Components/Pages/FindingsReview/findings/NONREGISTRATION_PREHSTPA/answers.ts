import { buildRentAnswer } from "../../fields/validation";
import type { Finding, ValidateFindingAnswers } from "../../types/finding";

import { ROW_INDEX } from "./spec";

export type NonregistrationPrehstpaFormState = {
  row0AptStat: string;
  row0LegalRent: string;
  getsVacancyIncrease: boolean | null;
  tenancyStart: number | null;
};

export function createInitialFormState(
  finding: Finding
): NonregistrationPrehstpaFormState {
  const row0 = finding.data.rows[ROW_INDEX.context];
  const row1 = finding.data.rows[ROW_INDEX.user];

  return {
    row0AptStat: row0?.apt_stat ?? "",
    row0LegalRent: row0?.legal_rent != null ? String(row0.legal_rent) : "",
    getsVacancyIncrease: row1?.gets_vacancy_increase ?? null,
    tenancyStart: row0?.tenancy_start ?? null,
  };
}

/** Map collected form state → shape-A `answers.rows` for validate-finding. */
export function buildAnswers(
  finding: Finding,
  formState: NonregistrationPrehstpaFormState
): ValidateFindingAnswers {
  const row0 = finding.data.rows[ROW_INDEX.context];
  const row1 = finding.data.rows[ROW_INDEX.user];

  const answersRow0: ValidateFindingAnswers["rows"][number] = {
    reg_year: row0.reg_year,
    apt_stat: formState.row0AptStat,
    legal_rent: buildRentAnswer(formState.row0LegalRent),
  };

  if (formState.getsVacancyIncrease === false) {
    answersRow0.tenancy_start = null;
  } else if (
    formState.getsVacancyIncrease === true &&
    formState.tenancyStart != null
  ) {
    answersRow0.tenancy_start = formState.tenancyStart;
  }

  const answersRow1: ValidateFindingAnswers["rows"][number] = {
    reg_year: row1.reg_year,
    gets_vacancy_increase: formState.getsVacancyIncrease,
  };

  return {
    rows: [answersRow0, answersRow1],
  };
}
