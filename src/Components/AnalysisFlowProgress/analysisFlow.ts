import { msg } from "@lingui/core/macro";
import type { MessageDescriptor } from "@lingui/core";

export const ANALYSIS_FLOW_STEP_IDS = [
  "scanner",
  "scan-review",
  "confirm-address",
  "rent-questions",
  "findings-overview",
  "findings-review",
  "report",
] as const;

export type AnalysisFlowStepId = (typeof ANALYSIS_FLOW_STEP_IDS)[number];

export type AnalysisFlowStep = {
  stepId: AnalysisFlowStepId;
  title: MessageDescriptor;
  showStepNumber: boolean;
};

export const ANALYSIS_FLOW_STEPS: readonly AnalysisFlowStep[] = [
  { stepId: "scanner", title: msg`Scan`, showStepNumber: true },
  { stepId: "scan-review", title: msg`Review Scan`, showStepNumber: true },
  {
    stepId: "confirm-address",
    title: msg`Confirm address`,
    showStepNumber: true,
  },
  {
    stepId: "rent-questions",
    title: msg`Your rent amount`,
    showStepNumber: true,
  },
  {
    stepId: "findings-overview",
    title: msg`What we found`,
    showStepNumber: true,
  },
  { stepId: "findings-review", title: msg`Review`, showStepNumber: true },
  {
    stepId: "report",
    title: msg`Analysis complete`,
    showStepNumber: false,
  },
];

export type GetProgressValueParams = {
  stepIndex: number;
  stepCount: number;
  substepIndex?: number;
  substepCount?: number;
};

export type ProgressValue = {
  value: number;
  max: number;
};

const PROGRESS_MAX = 100;

/**
 * Equal-weight main steps; optional substeps subdivide the current step only.
 * `value` is at the start of the current substep (0-based).
 */
export function getProgressValue({
  stepIndex,
  stepCount,
  substepIndex = 0,
  substepCount = 1,
}: GetProgressValueParams): ProgressValue {
  if (stepCount <= 0) {
    return { value: 0, max: PROGRESS_MAX };
  }

  const safeSubstepCount = Math.max(substepCount, 1);
  const clampedStepIndex = Math.min(Math.max(stepIndex, 0), stepCount - 1);
  const clampedSubstepIndex = Math.min(
    Math.max(substepIndex, 0),
    safeSubstepCount - 1
  );

  const value = Math.round(
    ((clampedStepIndex + clampedSubstepIndex / safeSubstepCount) / stepCount) *
      PROGRESS_MAX
  );

  return { value, max: PROGRESS_MAX };
}

export type FindingsReviewQueueInput = {
  findings_current: readonly unknown[];
  review_queue: { ordered_ids: readonly string[] };
};

/** subdivide findings-review by queue findings only. */
export function getFindingsReviewSubsteps(
  data: FindingsReviewQueueInput | null | undefined
): { substepIndex: number; substepCount: number } {
  const totalFindings = data?.findings_current.length ?? 0;
  const remaining = data?.review_queue.ordered_ids.length ?? 0;
  const substepCount = Math.max(totalFindings, 1);
  const validated = Math.max(totalFindings - remaining, 0);
  const substepIndex = Math.min(validated, substepCount - 1);
  return { substepIndex, substepCount };
}

export function getAnalysisFlowStep(
  stepId: AnalysisFlowStepId
): AnalysisFlowStep {
  const step = ANALYSIS_FLOW_STEPS.find((entry) => entry.stepId === stepId);
  if (!step) {
    throw new Error(`Unknown analysis flow step: ${stepId}`);
  }
  return step;
}

export function getAnalysisFlowProgress(
  stepId: AnalysisFlowStepId,
  substep?: { substepIndex?: number; substepCount?: number }
): ProgressValue {
  if (stepId === "report") {
    return { value: PROGRESS_MAX, max: PROGRESS_MAX };
  }

  const stepIndex = ANALYSIS_FLOW_STEPS.findIndex(
    (entry) => entry.stepId === stepId
  );

  return getProgressValue({
    stepIndex,
    stepCount: ANALYSIS_FLOW_STEPS.length,
    substepIndex: substep?.substepIndex,
    substepCount: substep?.substepCount,
  });
}
