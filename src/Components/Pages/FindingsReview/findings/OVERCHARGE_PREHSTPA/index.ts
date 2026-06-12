export {
  TYPE,
  ROW_INDEX,
  PATCHABLE_KEYS,
  EXCLUDED_ANSWER_KEYS,
  DEFERRED_OCR_LEFT_FIELD,
} from "./spec";
export type { IntroValues } from "./spec";

export { getIntro, getIntroValues } from "./getIntro";
export { getSteps } from "./getSteps";
export type { PrehstpaGetStepsBindings } from "./getSteps";

export {
  buildAnswers,
  createInitialFormState,
} from "./answers";
export type { PrehstpaFormState } from "./answers";

export {
  IntroEyebrow,
  IntroTitle,
  IntroDescription,
  OcrHeading,
  VacancyHeading,
  VacancyBody,
  TenancyHeading,
  TenancyBody,
  ResultConfirmedCopy,
  ResultExplainedAwayCopy,
} from "./ReviewCopy";
