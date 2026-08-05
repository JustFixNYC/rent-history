import type { FindingReviewModule } from "../../types/findingModule";

import { buildAnswers, createInitialFormState } from "./answers";
import type { NonregistrationPrefrentPosthstpaFormState } from "./answers";
import { getIntro } from "./getIntro";
import { getSteps } from "./getSteps";
import { isStepComplete } from "./isStepComplete";
import { renderNonregistrationPrefrentPosthstpaResult } from "./ResultPanel";

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
export type { NonregistrationPrefrentPosthstpaGetStepsBindings } from "./getSteps";

export { buildAnswers, createInitialFormState } from "./answers";
export type { NonregistrationPrefrentPosthstpaFormState } from "./answers";

export { isStepComplete } from "./isStepComplete";
export { renderNonregistrationPrefrentPosthstpaResult } from "./ResultPanel";

export {
  IntroEyebrow,
  IntroTitle,
  IntroDescription,
  OcrHeading,
  VacancyHeading,
  VacancyBody,
  VacancyYesNoLegend,
  ResultPotentialViolationBody,
  ResultNoViolationBody,
  ResultDismissedBody,
} from "./ReviewCopy";

export const findingReviewModule: FindingReviewModule<NonregistrationPrefrentPosthstpaFormState> =
  {
    createInitialFormState,
    getIntro,
    getSteps,
    buildAnswers,
    isStepComplete,
    renderResult: renderNonregistrationPrefrentPosthstpaResult,
  };
