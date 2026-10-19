import type { NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState } from "./answers";

export function isStepComplete(
  stepId: string,
  formState: NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState,
  ctx: { ocrConfirmed: boolean }
): boolean {
  switch (stepId) {
    case "ocr_confirm":
      return ctx.ocrConfirmed;
    case "vacancy":
      return formState.getsVacancyIncrease !== null;
    case "succession":
      return formState.tookSuccession !== null;
    default:
      return false;
  }
}
