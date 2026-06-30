import { buildRentAnswer } from "../../fields/validation";
import type { Finding, ValidateFindingAnswers } from "../../types/finding";

import { ROW_INDEX } from "./spec";

export type LegalrentPosthstpaFormState = {
  row0AptStat: string;
  row1AptStat: string;
  row0LegalRent: string;
  row1LegalRent: string;
};

export function createInitialFormState(
  finding: Finding
): LegalrentPosthstpaFormState {
  const row0 = finding.data.rows[ROW_INDEX.row0];
  const row1 = finding.data.rows[ROW_INDEX.row1];

  return {
    row0AptStat: row0?.apt_stat ?? "",
    row1AptStat: row1?.apt_stat ?? "",
    row0LegalRent: row0?.legal_rent != null ? String(row0.legal_rent) : "",
    row1LegalRent: row1?.legal_rent != null ? String(row1.legal_rent) : "",
  };
}

/** Map collected form state → shape-A `answers.rows` for validate-finding. */
export function buildAnswers(
  finding: Finding,
  formState: LegalrentPosthstpaFormState
): ValidateFindingAnswers {
  const row0 = finding.data.rows[ROW_INDEX.row0];
  const row1 = finding.data.rows[ROW_INDEX.row1];

  return {
    rows: [
      {
        reg_year: row0.reg_year,
        apt_stat: formState.row0AptStat,
        legal_rent: buildRentAnswer(formState.row0LegalRent),
      },
      {
        reg_year: row1.reg_year,
        apt_stat: formState.row1AptStat,
        legal_rent: buildRentAnswer(formState.row1LegalRent),
      },
    ],
  };
}
