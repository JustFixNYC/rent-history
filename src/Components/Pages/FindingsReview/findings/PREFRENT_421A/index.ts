import type { FindingReviewModule } from "../../types/findingModule";

import { buildAnswers, createInitialFormState } from "./answers";
import type { Prefrent421aFormState } from "./answers";
import { getIntro } from "./getIntro";
import { getSteps } from "./getSteps";
import { isStepComplete } from "./isStepComplete";
import { renderPrefrent421aResult } from "./ResultPanel";

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
export type { Prefrent421aGetStepsBindings } from "./getSteps";

export { buildAnswers, createInitialFormState } from "./answers";
export type { Prefrent421aFormState } from "./answers";

export { isStepComplete } from "./isStepComplete";
export { renderPrefrent421aResult } from "./ResultPanel";

export {
  IntroEyebrow,
  IntroTitle,
  IntroDescription,
  OcrHeading,
  NO_PREF_RENT_LABEL,
  ResultPotentialViolationBody,
  ResultNoViolationBody,
  ResultDismissedBody,
} from "./ReviewCopy";

export const findingReviewModule: FindingReviewModule<Prefrent421aFormState> = {
  createInitialFormState,
  getIntro,
  getSteps,
  buildAnswers,
  isStepComplete,
  renderResult: renderPrefrent421aResult,
};
