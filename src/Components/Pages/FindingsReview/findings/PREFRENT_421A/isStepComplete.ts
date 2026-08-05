import type { Prefrent421aFormState } from "./answers";

export function isStepComplete(
  stepId: string,
  _formState: Prefrent421aFormState,
  ctx: { ocrConfirmed: boolean }
): boolean {
  switch (stepId) {
    case "ocr_confirm":
      return ctx.ocrConfirmed;
    default:
      return false;
  }
}
