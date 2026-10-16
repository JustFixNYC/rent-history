import type { FindingReviewModule } from "../../types/findingModule";

import { buildAnswers, createInitialFormState } from "./answers";
import type { NonregistrationOverchargePrehstpaCurrTenantFormState } from "./answers";
import { getIntro } from "./getIntro";
import { getSteps } from "./getSteps";
import { isStepComplete } from "./isStepComplete";
import { renderNonregistrationOverchargePrehstpaCurrTenantResult } from "./ResultPanel";

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
export type { NonregistrationOverchargePrehstpaCurrTenantGetStepsBindings } from "./getSteps";

export { buildAnswers, createInitialFormState } from "./answers";
export type { NonregistrationOverchargePrehstpaCurrTenantFormState } from "./answers";

export { isStepComplete } from "./isStepComplete";
export { renderNonregistrationOverchargePrehstpaCurrTenantResult } from "./ResultPanel";

export {
  IntroTitle,
  ResultNoViolationBody,
  ResultPotentialViolationContinuousBody,
  ResultPotentialViolationNotContinuousBody,
  ResultDismissedBody,
} from "./ReviewCopy";

export const findingReviewModule: FindingReviewModule<NonregistrationOverchargePrehstpaCurrTenantFormState> =
  {
    createInitialFormState,
    getIntro,
    getSteps,
    buildAnswers,
    isStepComplete,
    renderResult: renderNonregistrationOverchargePrehstpaCurrTenantResult,
  };
