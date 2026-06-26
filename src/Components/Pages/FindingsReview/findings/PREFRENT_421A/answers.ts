import { buildRentAnswer } from "../../fields/validation";
import type { Finding, ValidateFindingAnswers } from "../../types/finding";

import { ROW_INDEX } from "./spec";

export type Prefrent421aFormState = {
  row0AptStat: string;
  row0LegalRent: string;
  row0PrefRent: string;
  row0NoPrefRent: boolean;
};

export function createInitialFormState(
  finding: Finding
): Prefrent421aFormState {
  const row0 = finding.data.rows[ROW_INDEX.context];

  return {
    row0AptStat: row0?.apt_stat ?? "",
    row0LegalRent: row0?.legal_rent != null ? String(row0.legal_rent) : "",
    row0PrefRent: row0?.pref_rent != null ? String(row0.pref_rent) : "",
    row0NoPrefRent: row0?.pref_rent == null,
  };
}

/** Map collected form state → shape-A `answers.rows` for validate-finding. */
export function buildAnswers(
  finding: Finding,
  formState: Prefrent421aFormState
): ValidateFindingAnswers {
  const row0 = finding.data.rows[ROW_INDEX.context];

  return {
    rows: [
      {
        reg_year: row0.reg_year,
        apt_stat: formState.row0AptStat,
        legal_rent: buildRentAnswer(formState.row0LegalRent),
        pref_rent: formState.row0NoPrefRent
          ? null
          : buildRentAnswer(formState.row0PrefRent),
      },
    ],
  };
}
