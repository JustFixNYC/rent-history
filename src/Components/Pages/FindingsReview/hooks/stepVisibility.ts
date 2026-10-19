import type { ValidateFindingAnswers } from "../types/finding";
import type { FindingStep, FindingStepVisibilityContext } from "../types/step";

export type StepWithVisibility = Pick<FindingStep, "id" | "isVisible">;

/** Filter steps by per-step `isVisible` callbacks (branch eval). */
export function filterVisibleSteps<T extends StepWithVisibility>(
  steps: T[],
  answers: ValidateFindingAnswers
): T[] {
  const ctx: FindingStepVisibilityContext = { answers };
  return steps.filter((step) => (step.isVisible ? step.isVisible(ctx) : true));
}

/**
 * PREHSTPA follow-up after vacancy: show `tenancy_start` or `succession` when
 * row 1 `gets_vacancy_increase` is true.
 */
export function isVacancyGatedFollowUpVisible(
  ctx: FindingStepVisibilityContext
): boolean {
  return ctx.answers.rows[1]?.gets_vacancy_increase === true;
}
