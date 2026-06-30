import type { FindingReviewModule } from "../../types/findingModule";

import { buildAnswers, createInitialFormState } from "./answers";
import type { PrefrentPosthstpaFormState } from "./answers";
import { getIntro } from "./getIntro";
import { getSteps } from "./getSteps";
import { isStepComplete } from "./isStepComplete";
import { renderPrefrentPosthstpaResult } from "./ResultPanel";

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
export type { PrefrentPosthstpaGetStepsBindings } from "./getSteps";

export { buildAnswers, createInitialFormState } from "./answers";
export type { PrefrentPosthstpaFormState } from "./answers";

export { isStepComplete } from "./isStepComplete";
export { renderPrefrentPosthstpaResult } from "./ResultPanel";

export {
  IntroEyebrow,
  IntroTitle,
  IntroDescription,
  OcrHeading,
  VacancyHeading,
  ResultPotentialViolationVacancyBody,
  ResultPotentialViolationNoVacancyBody,
  ResultNoViolationBody,
  ResultDismissedBody,
} from "./ReviewCopy";

export const findingReviewModule: FindingReviewModule<PrefrentPosthstpaFormState> =
  {
    createInitialFormState,
    getIntro,
    getSteps,
    buildAnswers,
    isStepComplete,
    renderResult: renderPrefrentPosthstpaResult,
  };
