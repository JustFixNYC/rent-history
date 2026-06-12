import { parseCurrencyInput } from "../../fields/validation";
import type { Finding, ValidateFindingAnswers } from "../../types/finding";

import { ROW_INDEX } from "./spec";

export type PrehstpaFormState = {
  row0LegalRent: string;
  row1LegalRent: string;
  getsVacancyIncrease: boolean | null;
  tenancyStart: number | null;
};

export function createInitialFormState(finding: Finding): PrehstpaFormState {
  const row0 = finding.data.rows[ROW_INDEX.tenancy];
  const row1 = finding.data.rows[ROW_INDEX.vacancy];

  return {
    row0LegalRent: row0?.legal_rent != null ? String(row0.legal_rent) : "",
    row1LegalRent: row1?.legal_rent != null ? String(row1.legal_rent) : "",
    getsVacancyIncrease: row1?.gets_vacancy_increase ?? null,
    tenancyStart: row0?.tenancy_start ?? null,
  };
}

/** Map collected form state → shape-A `answers.rows` for validate-finding. */
export function buildAnswers(
  finding: Finding,
  formState: PrehstpaFormState
): ValidateFindingAnswers {
  const row0 = finding.data.rows[ROW_INDEX.tenancy];
  const row1 = finding.data.rows[ROW_INDEX.vacancy];

  const legalRent0 = parseCurrencyInput(formState.row0LegalRent);
  const legalRent1 = parseCurrencyInput(formState.row1LegalRent);

  const answersRow0: ValidateFindingAnswers["rows"][number] = {
    reg_year: row0.reg_year,
    legal_rent: legalRent0 ?? row0.legal_rent,
  };

  if (
    formState.getsVacancyIncrease === true &&
    formState.tenancyStart != null
  ) {
    answersRow0.tenancy_start = formState.tenancyStart;
  }

  const answersRow1: ValidateFindingAnswers["rows"][number] = {
    reg_year: row1.reg_year,
    legal_rent: legalRent1 ?? row1.legal_rent,
    gets_vacancy_increase: formState.getsVacancyIncrease,
  };

  return {
    rows: [answersRow0, answersRow1],
  };
}
