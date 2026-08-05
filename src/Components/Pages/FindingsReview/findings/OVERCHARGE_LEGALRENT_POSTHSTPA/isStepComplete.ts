import type { LegalrentPosthstpaFormState } from "./answers";

export function isStepComplete(
  stepId: string,
  _formState: LegalrentPosthstpaFormState,
  ctx: { ocrConfirmed: boolean }
): boolean {
  switch (stepId) {
    case "ocr_confirm":
      return ctx.ocrConfirmed;
    default:
      return false;
  }
}
