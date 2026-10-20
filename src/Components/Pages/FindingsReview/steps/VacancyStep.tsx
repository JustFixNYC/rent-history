import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { StepNumberBadge } from "../../../StepNumberBadge/StepNumberBadge";
import { FindingTenantName } from "../shared/FindingTenantName";
import {
  VacancyBodyMultipleTenants,
  VacancyBodySelfTenant,
  VacancyBodySingleTenant,
  VacancyHeading,
} from "../shared/vacancyStepCopy";
import type { VacancyStepVariant } from "../shared/validationSteps";
import { YesNoField } from "../fields/YesNoField";
import { FindingFormShell } from "../FindingFormShell";
import type { FindingStepRenderContext } from "../types/step";

export type { VacancyStepVariant };

export type VacancySharedCopyParams =
  | {
      variant: "selfTenant";
      vacancyYear: number;
      leaseSinceYear: number;
    }
  | {
      variant: "singleTenant";
      vacancyYear: number;
      tenant: string;
      year0: number;
      year1: number;
    }
  | {
      variant: "multipleTenants";
      vacancyYear: number;
      year0: number;
      year1: number;
    };

export function buildVacancySelfTenantSharedCopy(params: {
  vacancyYear: number;
  leaseSinceYear: number;
}): VacancySharedCopyParams {
  return {
    variant: "selfTenant",
    vacancyYear: params.vacancyYear,
    leaseSinceYear: params.leaseSinceYear,
  };
}

export function buildVacancyTenantChangeSharedCopy(params: {
  tenants: string[];
  vacancyYear: number;
  year0: number;
  year1: number;
}): VacancySharedCopyParams {
  const { tenants, vacancyYear, year0, year1 } = params;
  if (tenants.length > 1) {
    return { variant: "multipleTenants", vacancyYear, year0, year1 };
  }
  return {
    variant: "singleTenant",
    vacancyYear,
    tenant: tenants[0] ?? "",
    year0,
    year1,
  };
}

/** Shared Figma copy from `vacancyStepCopy.tsx` for use with `VacancyStep`. */
export function resolveVacancyStepCopy(params: VacancySharedCopyParams): {
  title: React.ReactNode;
  body: React.ReactNode;
} {
  const title = (
    <VacancyHeading variant={params.variant} vacancyYear={params.vacancyYear} />
  );

  switch (params.variant) {
    case "selfTenant":
      return {
        title,
        body: <VacancyBodySelfTenant leaseSinceYear={params.leaseSinceYear} />,
      };
    case "singleTenant":
      return {
        title,
        body: (
          <VacancyBodySingleTenant
            tenant={params.tenant}
            year0={params.year0}
            year1={params.year1}
          />
        ),
      };
    case "multipleTenants":
      return {
        title,
        body: (
          <VacancyBodyMultipleTenants
            year0={params.year0}
            year1={params.year1}
          />
        ),
      };
  }
}

export type VacancyStepProps = {
  stepNumber: number;
  idPrefix: string;
  getsVacancyIncrease: boolean | null;
  onGetsVacancyIncreaseChange: (value: boolean) => void;
  /** Set by the module stack when a later step is active. */
  isPastStep?: boolean;
  /** Figma variant; inferred from tenant count when omitted. */
  variant?: VacancyStepVariant;
  /** Shell title; use `sharedCopy` or pass explicitly until finding modules migrate. */
  title?: React.ReactNode;
  /** Step body (includes the vacancy question for standard variants). */
  body?: React.ReactNode;
  /** Builds title/body from shared vacancy copy modules. */
  sharedCopy?: VacancySharedCopyParams;
  /** Tips slot (e.g. tenant-name tips link) — after tenant list, before extra fields. */
  tips?: React.ReactNode;
  /** @deprecated Prefer `tips`. */
  afterBody?: React.ReactNode;
  /** Optional fields before yes/no (e.g. nonreg sparse user row). */
  extraFields?: React.ReactNode;
  /** Tenant names for the multiple-tenant list (length > 1). */
  tenants?: string[];
  /**
   * Legacy accessible legend when body does not carry the question (e.g. nonreg
   * until Task 4). Standard Figma variants should omit this.
   */
  yesNoLegend?: React.ReactNode;
  /** Overrides radiogroup `aria-label` when legend is hidden. */
  questionAriaLabel?: string;
};

// Vacancy questions ask if tenants match between years (or if you are the
// tenant from the prior year) and so a "yes" means there was no vacancy, so we
// need to invert the answer for backend gets_vacancy_increase.
// SuccessionStep uses direct yes/no mapping — do not copy this inversion.

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

function resolveVariant(
  variant: VacancyStepVariant | undefined,
  tenants: string[],
  sharedCopy?: VacancySharedCopyParams
): VacancyStepVariant {
  if (variant) {
    return variant;
  }
  if (sharedCopy) {
    return sharedCopy.variant;
  }
  return tenants.length > 1 ? "multipleTenants" : "singleTenant";
}

export const VacancyStep = ({
  stepNumber,
  title: titleProp,
  body: bodyProp,
  sharedCopy,
  idPrefix,
  getsVacancyIncrease,
  onGetsVacancyIncreaseChange,
  isPastStep = false,
  variant,
  yesNoLegend,
  questionAriaLabel,
  extraFields,
  tips,
  afterBody,
  tenants = [],
}: VacancyStepProps) => {
  const { _ } = useLingui();
  const resolvedVariant = resolveVariant(variant, tenants, sharedCopy);
  const shared = sharedCopy ? resolveVacancyStepCopy(sharedCopy) : null;
  const title = titleProp ?? shared?.title;
  const body = bodyProp ?? shared?.body;

  if (title == null || body == null) {
    throw new Error(
      "VacancyStep requires title and body, or sharedCopy params"
    );
  }

  const tipsSlot = tips ?? afterBody;
  const showTenantList =
    resolvedVariant === "multipleTenants" && tenants.length > 1;
  const questionId = `${idPrefix}-vacancy-question`;
  const useLegacyYesNoLegend = yesNoLegend != null;

  return (
    <FindingFormShell
      variant={isPastStep ? "completed" : "active"}
      badge={<StepNumberBadge stepNumber={stepNumber} />}
      title={title}
      body={
        <div
          className="vacancy-step"
          data-testid={`${idPrefix}-vacancy-step`}
          data-variant={resolvedVariant}
          data-has-extra-fields={extraFields ? "true" : "false"}
        >
          <div className="vacancy-step__question" id={questionId}>
            {body}
          </div>
          {showTenantList ? (
            <ul
              className="vacancy-step__tenant-list"
              aria-label={_(msg`Tenant names`)}
            >
              {tenants.map((tenant) => (
                <li key={tenant}>
                  <FindingTenantName name={tenant} />
                </li>
              ))}
            </ul>
          ) : null}
          {tipsSlot ? (
            <div className="vacancy-step__tips">{tipsSlot}</div>
          ) : null}
          {extraFields}
          <YesNoField
            id={`${idPrefix}-vacancy`}
            hideLegend={!useLegacyYesNoLegend}
            questionAriaLabel={
              useLegacyYesNoLegend ? undefined : questionAriaLabel
            }
            ariaLabelledBy={
              useLegacyYesNoLegend || questionAriaLabel != null
                ? undefined
                : questionId
            }
            labelText={
              useLegacyYesNoLegend ? (
                <span className="vacancy-step__yes-no-sr-label">
                  {yesNoLegend}
                </span>
              ) : (
                ""
              )
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
