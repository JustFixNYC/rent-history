import type { FindingReviewModule } from "../../types/findingModule";

import { buildAnswers, createInitialFormState } from "./answers";
import type { OverchargeCurrRentMismatchPosthstpaCurrTenantFormState } from "./answers";
import { getIntro } from "./getIntro";
import { getSteps } from "./getSteps";
import { isStepComplete } from "./isStepComplete";
import { renderOverchargeCurrRentMismatchPosthstpaCurrTenantResult } from "./ResultPanel";

export {
  TYPE,
  ROW_INDEX,
  PATCHABLE_KEYS,
  EXCLUDED_ANSWER_KEYS,
  OCR_LEFT_FIELD,
} from "./spec";
export type { IntroValues } from "./spec";

export { getIntro, getIntroValues } from "./getIntro";
export { getSteps } from "./getSteps";
export type { OverchargeCurrRentMismatchPosthstpaCurrTenantGetStepsBindings } from "./getSteps";

export { buildAnswers, createInitialFormState } from "./answers";
export type { OverchargeCurrRentMismatchPosthstpaCurrTenantFormState } from "./answers";

export { isStepComplete } from "./isStepComplete";
export { renderOverchargeCurrRentMismatchPosthstpaCurrTenantResult } from "./ResultPanel";

export {
  IntroTitle,
  ResultNoViolationBody,
  ResultPotentialViolationBody,
  ResultDismissedBody,
} from "./ReviewCopy";

export const findingReviewModule: FindingReviewModule<OverchargeCurrRentMismatchPosthstpaCurrTenantFormState> =
  {
    createInitialFormState,
    getIntro,
    getSteps,
    buildAnswers,
    isStepComplete,
    renderResult: renderOverchargeCurrRentMismatchPosthstpaCurrTenantResult,
  };
