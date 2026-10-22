import { Fragment } from "react";

import { StepConnector } from "../FindingsReview/StepConnector";

export type ScanReviewStepRenderContext = {
  isPastStep: boolean;
  isActive: boolean;
};

export type ScanReviewStep = {
  id: string;
  render: (ctx: ScanReviewStepRenderContext) => React.ReactNode;
};

export type ScanReviewModuleStackProps = {
  steps: Pick<ScanReviewStep, "id" | "render">[];
  revealedCount: number;
  activeStepIndex: number;
};

export const ScanReviewModuleStack = ({
  steps,
  revealedCount,
  activeStepIndex,
}: ScanReviewModuleStackProps) => {
  const revealedSteps = steps.slice(0, revealedCount);

  return (
    <div
      className="scan-review-module-stack"
      data-testid="scan-review-module-stack"
      data-revealed-count={revealedCount}
      data-active-step-index={activeStepIndex}
    >
      {revealedSteps.map((step, index) => {
        const renderContext: ScanReviewStepRenderContext = {
          isPastStep: index < activeStepIndex,
          isActive: index === activeStepIndex,
        };

        return (
          <Fragment key={step.id}>
            {index > 0 ? <StepConnector /> : null}
            {step.render(renderContext)}
          </Fragment>
        );
      })}
    </div>
  );
};
