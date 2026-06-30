import type { HrvdFormState } from "./answers";

export function isStepComplete(
  stepId: string,
  formState: HrvdFormState,
  ctx: { ocrConfirmed: boolean }
): boolean {
  switch (stepId) {
    case "ocr_confirm":
      return ctx.ocrConfirmed;
    case "tenancy_start":
      return formState.tenancyStart !== null;
    default:
      return false;
  }
}
