import type { FindingReviewModule } from "../../types/findingModule";

import { buildAnswers, createInitialFormState } from "./answers";
import type { HrvdFormState } from "./answers";
import { getIntro } from "./getIntro";
import { getSteps } from "./getSteps";
import { isStepComplete } from "./isStepComplete";
import { renderHrvdResult } from "./ResultPanel";

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
export type { HrvdGetStepsBindings } from "./getSteps";

export { buildAnswers, createInitialFormState } from "./answers";
export type { HrvdFormState } from "./answers";

export { isStepComplete } from "./isStepComplete";
export { renderHrvdResult } from "./ResultPanel";

export {
  IntroEyebrow,
  IntroTitle,
  IntroDescription,
  OcrHeading,
  ResultPotentialViolationBody,
  ResultNoViolationBody,
  ResultDismissedBody,
} from "./ReviewCopy";

export const findingReviewModule: FindingReviewModule<HrvdFormState> = {
  createInitialFormState,
  getIntro,
  getSteps,
  buildAnswers,
  isStepComplete,
  renderResult: renderHrvdResult,
};
