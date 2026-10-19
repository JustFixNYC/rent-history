import type { ValidateFindingAnswers } from "../types/finding";

/** Attach succession answer to shape-A row 1 when vacancy follow-up applies. */
export function applyTookSuccessionToAnswerRow(
  row: ValidateFindingAnswers["rows"][number],
  getsVacancyIncrease: boolean | null,
  tookSuccession: boolean | null
): void {
  if (getsVacancyIncrease !== true) {
    return;
  }
  if (tookSuccession === null) {
    return;
  }
  row.took_succession = tookSuccession;
}
