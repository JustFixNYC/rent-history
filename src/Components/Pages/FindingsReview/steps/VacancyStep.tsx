import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { StepNumberBadge } from "../../../StepNumberBadge/StepNumberBadge";
import { YesNoField } from "../fields/YesNoField";
import { FindingFormShell } from "../FindingFormShell";
import type { FindingStepRenderContext } from "../types/step";

export type VacancyStepVariant = "default" | "userRow";

export type VacancyStepProps = {
  stepNumber: number;
  title: React.ReactNode;
  body: React.ReactNode;
  idPrefix: string;
  getsVacancyIncrease: boolean | null;
  onGetsVacancyIncreaseChange: (value: boolean) => void;
  /** Set by the module stack when a later step is active. */
  isPastStep?: boolean;
  /** Accessible legend for the yes/no control (copy slot). */
  yesNoLegend?: React.ReactNode;
  /** Optional fields between body copy and yes/no (e.g. nonreg user row). */
  extraFields?: React.ReactNode;
  /** `userRow` — vacancy step also collects sparse row 1 fields (nonreg types). */
  variant?: VacancyStepVariant;
};

export const VacancyStep = ({
  stepNumber,
  title,
  body,
  idPrefix,
  getsVacancyIncrease,
  onGetsVacancyIncreaseChange,
  isPastStep = false,
  yesNoLegend,
  extraFields,
  variant = "default",
}: VacancyStepProps) => {
  const { _ } = useLingui();
  const resolvedYesNoLegend =
    yesNoLegend ??
    _(msg`Did tenants in the earlier year appear in the later year?`);

  return (
    <FindingFormShell
      variant={isPastStep ? "completed" : "active"}
      badge={<StepNumberBadge stepNumber={stepNumber} />}
      title={title}
      body={
        <div
          className="vacancy-step"
          data-testid={`${idPrefix}-vacancy-step`}
          data-variant={variant}
        >
          {body}
          {extraFields}
          <YesNoField
            id={`${idPrefix}-vacancy`}
            labelText={
              <span className="vacancy-step__yes-no-sr-label">
                {resolvedYesNoLegend}
              </span>
            }
            value={getsVacancyIncrease}
            onChange={onGetsVacancyIncreaseChange}
          />
        </div>
      }
    />
  );
};

export type RenderVacancyStepOptions = Omit<VacancyStepProps, "isPastStep">;

/** Factory for FindingModuleStack / type modules. */
export function renderVacancyStep(
  props: RenderVacancyStepOptions
): (ctx: FindingStepRenderContext) => React.ReactNode {
  return ({ isPastStep }) => <VacancyStep {...props} isPastStep={isPastStep} />;
}
