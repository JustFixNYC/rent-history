import type { ReactNode } from "react";

import type { ValidateFindingAnswers } from "./finding";

export type FindingStepVisibilityContext = {
  answers: ValidateFindingAnswers;
};

export type FindingStepRenderContext = {
  /** Step is not the current active step in the wizard (revealed but user moved on). */
  isPastStep: boolean;
  /** Step is the current active step. */
  isActive: boolean;
};

export type FindingStep = {
  id: string;
  /** 1-based wizard step number for StepNumberBadge. */
  stepNumber: number;
  /** When false, step is omitted from visibleSteps. */
  isVisible?: (ctx: FindingStepVisibilityContext) => boolean;
  render: (ctx: FindingStepRenderContext) => ReactNode;
};
