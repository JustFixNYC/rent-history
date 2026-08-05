import type { PrehstpaFormState } from "./answers";

export function isStepComplete(
  stepId: string,
  formState: PrehstpaFormState,
  ctx: { ocrConfirmed: boolean }
): boolean {
  switch (stepId) {
    case "ocr_confirm":
      return ctx.ocrConfirmed;
    case "vacancy":
      return formState.getsVacancyIncrease !== null;
    case "tenancy_start":
      return formState.tenancyStart !== null;
    default:
      return false;
  }
}
