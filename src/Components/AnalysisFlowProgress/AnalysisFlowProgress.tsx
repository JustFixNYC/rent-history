import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import classNames from "classnames";
import { ProgressBar } from "@justfixnyc/component-library";

import {
  ANALYSIS_FLOW_STEPS,
  getAnalysisFlowProgress,
  getAnalysisFlowStep,
  type AnalysisFlowStepId,
} from "./analysisFlow";
import "./AnalysisFlowProgress.scss";

export type AnalysisFlowProgressProps = {
  stepId: AnalysisFlowStepId;
  substepIndex?: number;
  substepCount?: number;
  className?: string;
};

export const AnalysisFlowProgress = ({
  stepId,
  substepIndex,
  substepCount,
  className,
}: AnalysisFlowProgressProps) => {
  const { _ } = useLingui();
  const step = getAnalysisFlowStep(stepId);
  const stepIndex = ANALYSIS_FLOW_STEPS.findIndex(
    (entry) => entry.stepId === stepId
  );
  const stepNumber = stepIndex + 1;
  const { value, max } = getAnalysisFlowProgress(stepId, {
    substepIndex,
    substepCount,
  });

  const titleText = _(step.title);
  const label = (
    <h1 className="analysis-flow-progress__title">
      {step.showStepNumber ? (
        <Trans>
          Step {stepNumber}: {titleText}
        </Trans>
      ) : (
        titleText
      )}
    </h1>
  );

  return (
    <ProgressBar
      className={classNames("analysis-flow-progress", className)}
      value={value}
      max={max}
      label={label}
      data-testid="analysis-flow-progress"
      data-step-id={stepId}
    />
  );
};
