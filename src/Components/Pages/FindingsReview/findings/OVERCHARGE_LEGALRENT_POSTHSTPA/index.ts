import type { FindingReviewModule } from "../../types/findingModule";

import { buildAnswers, createInitialFormState } from "./answers";
import type { LegalrentPosthstpaFormState } from "./answers";
import { getIntro } from "./getIntro";
import { getSteps } from "./getSteps";
import { isStepComplete } from "./isStepComplete";
import { renderLegalrentPosthstpaResult } from "./ResultPanel";

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
export type { LegalrentPosthstpaGetStepsBindings } from "./getSteps";

export { buildAnswers, createInitialFormState } from "./answers";
export type { LegalrentPosthstpaFormState } from "./answers";

export { isStepComplete } from "./isStepComplete";
export { renderLegalrentPosthstpaResult } from "./ResultPanel";

export {
  IntroEyebrow,
  IntroTitle,
  IntroDescription,
  OcrHeading,
  ResultPotentialViolationBody,
  ResultNoViolationBody,
  ResultDismissedBody,
} from "./ReviewCopy";

export const findingReviewModule: FindingReviewModule<LegalrentPosthstpaFormState> =
  {
    createInitialFormState,
    getIntro,
    getSteps,
    buildAnswers,
    isStepComplete,
    renderResult: renderLegalrentPosthstpaResult,
  };
