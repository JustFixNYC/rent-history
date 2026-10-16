import type { FindingReviewModule } from "../../types/findingModule";

import { buildAnswers, createInitialFormState } from "./answers";
import type { NonregistrationPrehstpaCurrTenantFormState } from "./answers";
import { getIntro } from "./getIntro";
import { getSteps } from "./getSteps";
import { isStepComplete } from "./isStepComplete";
import { renderNonregistrationPrehstpaCurrTenantResult } from "./ResultPanel";

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
export type { NonregistrationPrehstpaCurrTenantGetStepsBindings } from "./getSteps";

export { buildAnswers, createInitialFormState } from "./answers";
export type { NonregistrationPrehstpaCurrTenantFormState } from "./answers";

export { isStepComplete } from "./isStepComplete";
export { renderNonregistrationPrehstpaCurrTenantResult } from "./ResultPanel";

export {
  IntroTitle,
  ResultNoViolationBody,
  ResultPotentialViolationContinuousBody,
  ResultPotentialViolationNotContinuousBody,
  ResultDismissedBody,
} from "./ReviewCopy";

export const findingReviewModule: FindingReviewModule<NonregistrationPrehstpaCurrTenantFormState> =
  {
    createInitialFormState,
    getIntro,
    getSteps,
    buildAnswers,
    isStepComplete,
    renderResult: renderNonregistrationPrehstpaCurrTenantResult,
  };
