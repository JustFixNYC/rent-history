import { buildRentAnswer } from "../../fields/validation";
import type { Finding, ValidateFindingAnswers } from "../../types/finding";

import { ROW_INDEX } from "./spec";

export type NonregistrationPrefrentPosthstpaFormState = {
  row0AptStat: string;
  row0LegalRent: string;
  row0PrefRent: string;
  getsVacancyIncrease: boolean | null;
};

export function createInitialFormState(
  finding: Finding
): NonregistrationPrefrentPosthstpaFormState {
  const row0 = finding.data.rows[ROW_INDEX.context];
  const row1 = finding.data.rows[ROW_INDEX.user];

  return {
    row0AptStat: row0?.apt_stat ?? "",
    row0LegalRent: row0?.legal_rent != null ? String(row0.legal_rent) : "",
    row0PrefRent: row0?.pref_rent != null ? String(row0.pref_rent) : "",
    getsVacancyIncrease: row1?.gets_vacancy_increase ?? null,
  };
}

/** Map collected form state → shape-A `answers.rows` for validate-finding. */
export function buildAnswers(
  finding: Finding,
  formState: NonregistrationPrefrentPosthstpaFormState
): ValidateFindingAnswers {
  const row0 = finding.data.rows[ROW_INDEX.context];
  const row1 = finding.data.rows[ROW_INDEX.user];

  return {
    rows: [
      {
        reg_year: row0.reg_year,
        apt_stat: formState.row0AptStat,
        legal_rent: buildRentAnswer(formState.row0LegalRent),
        pref_rent: buildRentAnswer(formState.row0PrefRent),
      },
      {
        reg_year: row1.reg_year,
        gets_vacancy_increase: formState.getsVacancyIncrease,
      },
    ],
  };
}
