import type { FindingReviewModule } from "../../types/findingModule";

import { buildAnswers, createInitialFormState } from "./answers";
import type { NonregistrationOverchargeLegalrentPosthstpaCurrTenantFormState } from "./answers";
import { getIntro } from "./getIntro";
import { getSteps } from "./getSteps";
import { isStepComplete } from "./isStepComplete";
import { renderNonregistrationOverchargeLegalrentPosthstpaCurrTenantResult } from "./ResultPanel";

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
export type { NonregistrationOverchargeLegalrentPosthstpaCurrTenantGetStepsBindings } from "./getSteps";

export { buildAnswers, createInitialFormState } from "./answers";
export type { NonregistrationOverchargeLegalrentPosthstpaCurrTenantFormState } from "./answers";

export { isStepComplete } from "./isStepComplete";
export { renderNonregistrationOverchargeLegalrentPosthstpaCurrTenantResult } from "./ResultPanel";

export {
  IntroTitle,
  ResultNoViolationBody,
  ResultPotentialViolationBody,
  ResultDismissedBody,
} from "./ReviewCopy";

export const findingReviewModule: FindingReviewModule<NonregistrationOverchargeLegalrentPosthstpaCurrTenantFormState> =
  {
    createInitialFormState,
    getIntro,
    getSteps,
    buildAnswers,
    isStepComplete,
    renderResult:
      renderNonregistrationOverchargeLegalrentPosthstpaCurrTenantResult,
  };
