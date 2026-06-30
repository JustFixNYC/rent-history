import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { TenantChip } from "../../../InlineChip/TenantChip";
import { StepNumberBadge } from "../../../StepNumberBadge/StepNumberBadge";
import { YearField } from "../fields/YearField";
import { FindingFormShell } from "../FindingFormShell";
import type { FindingStepRenderContext } from "../types/step";

export type TenancyStepProps = {
  stepNumber: number;
  title: React.ReactNode;
  body: React.ReactNode;
  tenants: string[];
  idPrefix: string;
  tenancyStart: number | null;
  onTenancyStartChange: (value: number | null) => void;
  /** Set by the module stack when a later step is active. */
  isPastStep?: boolean;
  yearPlaceholder?: string;
};

export const TenancyStep = ({
  stepNumber,
  title,
  body,
  tenants,
  idPrefix,
  tenancyStart,
  onTenancyStartChange,
  isPastStep = false,
  yearPlaceholder,
}: TenancyStepProps) => {
  const { _ } = useLingui();
  const isMulti = tenants.length > 1;
  const resolvedYearPlaceholder = yearPlaceholder ?? _(msg`Select Year`);

  return (
    <FindingFormShell
      variant={isPastStep ? "completed" : "active"}
      badge={<StepNumberBadge stepNumber={stepNumber} />}
      title={title}
      body={
        <div
          className="tenancy-step"
          data-testid={`${idPrefix}-tenancy-step`}
          data-tenant-mode={isMulti ? "multiple" : "single"}
        >
          {body}
          {isMulti ? (
            <ul
              className="tenancy-step__tenant-list"
              aria-label={_(msg`Tenant names`)}
            >
              {tenants.map((tenant) => (
                <li key={tenant}>
                  <TenantChip tenant={tenant} />
                </li>
              ))}
            </ul>
          ) : null}
          <YearField
            id={`${idPrefix}-tenancy-start`}
            value={tenancyStart}
            onChange={onTenancyStartChange}
            placeholder={resolvedYearPlaceholder}
          />
        </div>
      }
    />
  );
};

export type RenderTenancyStepOptions = Omit<TenancyStepProps, "isPastStep">;

/** Factory for FindingModuleStack / type modules. */
export function renderTenancyStep(
  props: RenderTenancyStepOptions
): (ctx: FindingStepRenderContext) => React.ReactNode {
  return ({ isPastStep }) => <TenancyStep {...props} isPastStep={isPastStep} />;
}
