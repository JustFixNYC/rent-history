import { buildRentAnswer } from "../../fields/validation";
import { applyTookSuccessionToAnswerRow } from "../../shared/successionAnswers";
import type { Finding, ValidateFindingAnswers } from "../../types/finding";

import { ROW_INDEX } from "./spec";

export type NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState = {
  row0AptStat: string;
  row0LegalRent: string;
  row0PrefRent: string;
  row0NoPrefRent: boolean;
  getsVacancyIncrease: boolean | null;
  /** UI-only until OpenAPI exposes a succession review field. */
  tookSuccession: boolean | null;
};

export function createInitialFormState(
  finding: Finding
): NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState {
  const row0 = finding.data.rows[ROW_INDEX.context];
  const row1 = finding.data.rows[ROW_INDEX.user];

  return {
    row0AptStat: row0?.apt_stat ?? "",
    row0LegalRent: row0?.legal_rent != null ? String(row0.legal_rent) : "",
    row0PrefRent: row0?.pref_rent != null ? String(row0.pref_rent) : "",
    row0NoPrefRent: row0?.pref_rent == null,
    getsVacancyIncrease: row1?.gets_vacancy_increase ?? null,
    tookSuccession: null,
  };
}

/** Map collected form state → shape-A `answers.rows` for validate-finding. */
export function buildAnswers(
  finding: Finding,
  formState: NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState
): ValidateFindingAnswers {
  const row0 = finding.data.rows[ROW_INDEX.context];
  const row1 = finding.data.rows[ROW_INDEX.user];

  const answersRow0: ValidateFindingAnswers["rows"][number] = {
    reg_year: row0.reg_year,
    apt_stat: formState.row0AptStat,
    legal_rent: buildRentAnswer(formState.row0LegalRent),
    pref_rent: formState.row0NoPrefRent
      ? null
      : buildRentAnswer(formState.row0PrefRent),
  };

  const answersRow1: ValidateFindingAnswers["rows"][number] = {
    reg_year: row1.reg_year,
    gets_vacancy_increase: formState.getsVacancyIncrease,
  };
  applyTookSuccessionToAnswerRow(
    answersRow1,
    formState.getsVacancyIncrease,
    formState.tookSuccession
  );

  return {
    rows: [answersRow0, answersRow1],
  };
}
