import { Pill } from "@justfixnyc/component-library";

type StepNumberBadgeProps = {
  stepNumber: number;
};

export const StepNumberBadge = ({ stepNumber }: StepNumberBadgeProps) => (
  <Pill color="black" circle aria-hidden data-testid="step-number-badge">
    {stepNumber}
  </Pill>
);
