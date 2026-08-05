import { buildRentAnswer } from "../../fields/validation";
import type { Finding, ValidateFindingAnswers } from "../../types/finding";

import { ROW_INDEX } from "./spec";

export type NonregistrationPosthstpaFormState = {
  row0AptStat: string;
  row0LegalRent: string;
};

export function createInitialFormState(
  finding: Finding
): NonregistrationPosthstpaFormState {
  const row0 = finding.data.rows[ROW_INDEX.context];

  return {
    row0AptStat: row0?.apt_stat ?? "",
    row0LegalRent: row0?.legal_rent != null ? String(row0.legal_rent) : "",
  };
}

/** Map collected form state → shape-A `answers.rows` for validate-finding. */
export function buildAnswers(
  finding: Finding,
  formState: NonregistrationPosthstpaFormState
): ValidateFindingAnswers {
  const row0 = finding.data.rows[ROW_INDEX.context];

  return {
    rows: [
      {
        reg_year: row0.reg_year,
        apt_stat: formState.row0AptStat,
        legal_rent: buildRentAnswer(formState.row0LegalRent),
      },
    ],
  };
}
