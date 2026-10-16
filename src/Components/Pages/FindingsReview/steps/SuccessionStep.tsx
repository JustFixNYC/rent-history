/**
 * Succession validation step (Figma 7502:9736): heading, body with lease year, Yes/No.
 *
 * Wire mapping is direct — affirmative UI "Yes" → `true`, "No" → `false`.
 * Do not copy VacancyStep's `gets_vacancy_increase` inversion.
 */
import { StepNumberBadge } from "../../../StepNumberBadge/StepNumberBadge";
import {
  SuccessionBody,
  SuccessionHeading,
} from "../shared/successionStepCopy";
import { YesNoField } from "../fields/YesNoField";
import { FindingFormShell } from "../FindingFormShell";
import type { FindingStepRenderContext } from "../types/step";

export type SuccessionSharedCopyParams = {
  year: number;
};

/** Shared Figma copy from `successionStepCopy.tsx` for use with `SuccessionStep`. */
export function resolveSuccessionStepCopy(params: SuccessionSharedCopyParams): {
  title: React.ReactNode;
  body: React.ReactNode;
} {
  return {
    title: <SuccessionHeading />,
    body: <SuccessionBody year={params.year} />,
  };
}

export type SuccessionStepProps = {
  stepNumber: number;
  idPrefix: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  /** Set by the module stack when a later step is active. */
  isPastStep?: boolean;
  /** Shell title; use `sharedCopy` or pass explicitly until finding modules migrate. */
  title?: React.ReactNode;
  /** Step body (includes the succession question). */
  body?: React.ReactNode;
  /** Builds title/body from shared succession copy modules. */
  sharedCopy?: SuccessionSharedCopyParams;
};

export const SuccessionStep = ({
  stepNumber,
  title: titleProp,
  body: bodyProp,
  sharedCopy,
  idPrefix,
  value,
  onChange,
  isPastStep = false,
}: SuccessionStepProps) => {
  const shared = sharedCopy ? resolveSuccessionStepCopy(sharedCopy) : null;
  const title = titleProp ?? shared?.title;
  const body = bodyProp ?? shared?.body;

  if (title == null || body == null) {
    throw new Error(
      "SuccessionStep requires title and body, or sharedCopy params"
    );
  }

  const questionId = `${idPrefix}-succession-question`;

  return (
    <FindingFormShell
      variant={isPastStep ? "completed" : "active"}
      badge={<StepNumberBadge stepNumber={stepNumber} />}
      title={title}
      body={
        <div
          className="succession-step"
          data-testid={`${idPrefix}-succession-step`}
        >
          <div className="succession-step__question" id={questionId}>
            {body}
          </div>
          <YesNoField
            id={`${idPrefix}-succession`}
            hideLegend
            ariaLabelledBy={questionId}
            labelText=""
            value={value}
            onChange={onChange}
          />
        </div>
      }
    />
  );
};

export type RenderSuccessionStepOptions = Omit<
  SuccessionStepProps,
  "isPastStep"
>;

/** Factory for FindingModuleStack / type modules. */
export function renderSuccessionStep(
  props: RenderSuccessionStepOptions
): (ctx: FindingStepRenderContext) => React.ReactNode {
  return ({ isPastStep }) => (
    <SuccessionStep {...props} isPastStep={isPastStep} />
  );
}
