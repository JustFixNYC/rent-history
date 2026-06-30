import type { NonregistrationPrefrentPosthstpaFormState } from "./answers";

export function isStepComplete(
  stepId: string,
  formState: NonregistrationPrefrentPosthstpaFormState,
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
