import { useMemo } from "react";

import type { ValidateFindingAnswers } from "../types/finding";

import { filterVisibleSteps, StepWithVisibility } from "./stepVisibility";

export type UseFindingStepsResult<T extends StepWithVisibility> = {
  visibleSteps: T[];
};

export function useFindingSteps<T extends StepWithVisibility>(
  steps: T[],
  answers: ValidateFindingAnswers
): UseFindingStepsResult<T> {
  const visibleSteps = useMemo(
    () => filterVisibleSteps(steps, answers),
    [steps, answers]
  );

  return { visibleSteps };
}
