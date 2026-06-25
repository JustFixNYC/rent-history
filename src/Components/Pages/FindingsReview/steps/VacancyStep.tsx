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

// Vacancy questions ask if tenants match between years (or if you are the
// tenant from the prior year) and so a "yes" means there was no vacancy, so we
// need to invert the answer for backend gets_vacancy_increase.

/** Map wire `gets_vacancy_increase` to yes/no UI (affirmative answer → false). */
function wireToUiValue(getsVacancyIncrease: boolean | null): boolean | null {
  if (getsVacancyIncrease === null) {
    return null;
  }
  return !getsVacancyIncrease;
}

/** Map yes/no UI selection to wire `gets_vacancy_increase`. */
function uiToWireValue(uiAnswer: boolean): boolean {
  return !uiAnswer;
}

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
            value={wireToUiValue(getsVacancyIncrease)}
            onChange={(uiAnswer) =>
              onGetsVacancyIncreaseChange(uiToWireValue(uiAnswer))
            }
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
