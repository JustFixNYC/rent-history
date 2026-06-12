import { useCallback, useEffect, useState } from "react";

export type UseProgressiveRevealOptions = {
  /** Number of visible steps (typically from useFindingSteps). */
  stepCount: number;
  /** Whether the active step is complete enough to advance via Next. */
  isActiveStepComplete: boolean;
};

export type UseProgressiveRevealResult = {
  revealedCount: number;
  activeStepIndex: number;
  goNext: () => void;
  goBack: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
};

export function useProgressiveReveal({
  stepCount,
  isActiveStepComplete,
}: UseProgressiveRevealOptions): UseProgressiveRevealResult {
  const [revealedCount, setRevealedCount] = useState(1);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const safeStepCount = Math.max(stepCount, 0);
  const clampedActiveIndex =
    safeStepCount === 0
      ? 0
      : Math.min(activeStepIndex, safeStepCount - 1);

  useEffect(() => {
    if (safeStepCount === 0) return;
    if (activeStepIndex >= safeStepCount) {
      setActiveStepIndex(safeStepCount - 1);
    }
  }, [activeStepIndex, safeStepCount]);

  const goNext = useCallback(() => {
    if (!isActiveStepComplete || safeStepCount === 0) return;
    if (activeStepIndex >= safeStepCount - 1) return;

    const nextIndex = activeStepIndex + 1;
    setActiveStepIndex(nextIndex);
    setRevealedCount((prev) => Math.max(prev, nextIndex + 1));
  }, [activeStepIndex, isActiveStepComplete, safeStepCount]);

  const goBack = useCallback(() => {
    if (activeStepIndex <= 0) return;
    setActiveStepIndex((prev) => prev - 1);
  }, [activeStepIndex]);

  return {
    revealedCount: safeStepCount === 0 ? 0 : revealedCount,
    activeStepIndex: clampedActiveIndex,
    goNext,
    goBack,
    canGoBack: activeStepIndex > 0,
    canGoNext:
      isActiveStepComplete &&
      safeStepCount > 0 &&
      activeStepIndex < safeStepCount - 1,
    isLastStep:
      safeStepCount > 0 && activeStepIndex >= safeStepCount - 1,
  };
}
