import type { PrefrentPosthstpaFormState } from "./answers";

export function isStepComplete(
  stepId: string,
  formState: PrefrentPosthstpaFormState,
  ctx: { ocrConfirmed: boolean }
): boolean {
  switch (stepId) {
    case "ocr_confirm":
      return ctx.ocrConfirmed;
    case "vacancy":
      return formState.getsVacancyIncrease !== null;
    default:
      return false;
  }
}
