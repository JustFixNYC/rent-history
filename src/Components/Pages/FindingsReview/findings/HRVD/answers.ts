import { buildRentAnswer } from "../../fields/validation";
import type { Finding, ValidateFindingAnswers } from "../../types/finding";

import { ROW_INDEX } from "./spec";

export type HrvdFormState = {
  row0AptStat: string;
  row0LegalRent: string;
  tenancyStart: number | null;
};

export function createInitialFormState(finding: Finding): HrvdFormState {
  const row0 = finding.data.rows[ROW_INDEX.tenancy];

  return {
    row0AptStat: row0?.apt_stat ?? "",
    row0LegalRent: row0?.legal_rent != null ? String(row0.legal_rent) : "",
    tenancyStart: row0?.tenancy_start ?? null,
  };
}

/** Map collected form state → shape-A `answers.rows` for validate-finding. */
export function buildAnswers(
  finding: Finding,
  formState: HrvdFormState
): ValidateFindingAnswers {
  const row0 = finding.data.rows[ROW_INDEX.tenancy];

  const answersRow0: ValidateFindingAnswers["rows"][number] = {
    reg_year: row0.reg_year,
    apt_stat: formState.row0AptStat,
    legal_rent: buildRentAnswer(formState.row0LegalRent),
  };

  if (formState.tenancyStart != null) {
    answersRow0.tenancy_start = formState.tenancyStart;
  }

  return {
    rows: [answersRow0],
  };
}
