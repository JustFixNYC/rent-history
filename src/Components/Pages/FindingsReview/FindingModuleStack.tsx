import { Fragment } from "react";

import { StepConnector } from "./StepConnector";
import type { FindingStep, FindingStepRenderContext } from "./types/step";

export type FindingModuleStackProps = {
  steps: Pick<FindingStep, "id" | "render">[];
  revealedCount: number;
  activeStepIndex: number;
};

export const FindingModuleStack = ({
  steps,
  revealedCount,
  activeStepIndex,
}: FindingModuleStackProps) => {
  const revealedSteps = steps.slice(0, revealedCount);

  return (
    <div
      className="finding-module-stack"
      data-testid="finding-module-stack"
      data-revealed-count={revealedCount}
      data-active-step-index={activeStepIndex}
    >
      {revealedSteps.map((step, index) => {
        const renderContext: FindingStepRenderContext = {
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
