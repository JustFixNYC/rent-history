import type { FindingReviewModule } from "../../types/findingModule";

import { buildAnswers, createInitialFormState } from "./answers";
import type { NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState } from "./answers";
import { getIntro } from "./getIntro";
import { getSteps } from "./getSteps";
import { isStepComplete } from "./isStepComplete";
import { renderNonregistrationOverchargePrefrentPosthstpaCurrTenantResult } from "./ResultPanel";

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
export type { NonregistrationOverchargePrefrentPosthstpaCurrTenantGetStepsBindings } from "./getSteps";

export { buildAnswers, createInitialFormState } from "./answers";
export type { NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState } from "./answers";

export { isStepComplete } from "./isStepComplete";
export { renderNonregistrationOverchargePrefrentPosthstpaCurrTenantResult } from "./ResultPanel";

export {
  IntroTitle,
  ResultNoViolationBody,
  ResultPotentialViolationContinuousBody,
  ResultPotentialViolationNotContinuousBody,
  ResultDismissedBody,
} from "./ReviewCopy";

export const findingReviewModule: FindingReviewModule<NonregistrationOverchargePrefrentPosthstpaCurrTenantFormState> =
  {
    createInitialFormState,
    getIntro,
    getSteps,
    buildAnswers,
    isStepComplete,
    renderResult:
      renderNonregistrationOverchargePrefrentPosthstpaCurrTenantResult,
  };
