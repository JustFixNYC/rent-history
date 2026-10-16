/**
 * Tenancy / longevity validation step (Figma 7198:12739).
 *
 * Slot order inside the shell body:
 * 1. `body` — question copy (often from `tenancyStepCopy.tsx`)
 * 2. `tips` — optional tips link (`afterBody` alias)
 * 3. tenant list — only when `tenants.length > 1`
 * 4. `YearField` — earliest tenancy year
 */
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { StepNumberBadge } from "../../../StepNumberBadge/StepNumberBadge";
import { FindingTenantName } from "../shared/FindingTenantName";
import {
  TenancyBodyMultipleTenants,
  TenancyBodySingleTenant,
  TenancyHeading,
} from "../shared/tenancyStepCopy";
import type { TenancyStepVariant } from "../shared/validationSteps";
import { YearField } from "../fields/YearField";
import { FindingFormShell } from "../FindingFormShell";
import type { FindingStepRenderContext } from "../types/step";

export type { TenancyStepVariant };

export type TenancySharedCopyParams =
  | {
      variant: "singleTenant";
      tenant: string;
    }
  | {
      variant: "multipleTenants";
    };

/** Builds `sharedCopy` from tenant list (single vs multiple variant). */
export function buildTenancySharedCopy(
  tenants: string[]
): TenancySharedCopyParams {
  if (tenants.length > 1) {
    return { variant: "multipleTenants" };
  }
  return { variant: "singleTenant", tenant: tenants[0] ?? "" };
}

/** Shared Figma copy from `tenancyStepCopy.tsx` for use with `TenancyStep`. */
export function resolveTenancyStepCopy(params: TenancySharedCopyParams): {
  title: React.ReactNode;
  body: React.ReactNode;
  variant: TenancyStepVariant;
} {
  const variant = params.variant;
  const title = <TenancyHeading variant={variant} />;

  if (variant === "singleTenant") {
    return {
      title,
      body: <TenancyBodySingleTenant tenant={params.tenant} />,
      variant,
    };
  }

  return {
    title,
    body: <TenancyBodyMultipleTenants />,
    variant,
  };
}

export type TenancyStepProps = {
  stepNumber: number;
  idPrefix: string;
  tenants: string[];
  tenancyStart: number | null;
  onTenancyStartChange: (value: number | null) => void;
  /** Set by the module stack when a later step is active. */
  isPastStep?: boolean;
  /** Figma variant; inferred from tenant count when omitted. */
  variant?: TenancyStepVariant;
  /** Shell title; use `sharedCopy` or pass explicitly until finding modules migrate. */
  title?: React.ReactNode;
  /** Step body before tips and tenant list. */
  body?: React.ReactNode;
  /** Builds title/body from shared tenancy copy modules. */
  sharedCopy?: TenancySharedCopyParams;
  /** Tips slot (e.g. tenant-name tips link) — after body, before tenant list / year. */
  tips?: React.ReactNode;
  /** @deprecated Prefer `tips`. */
  afterBody?: React.ReactNode;
  yearPlaceholder?: string;
};

function resolveVariant(
  variant: TenancyStepVariant | undefined,
  tenants: string[],
  sharedCopy?: TenancySharedCopyParams
): TenancyStepVariant {
  if (variant) {
    return variant;
  }
  if (sharedCopy) {
    return sharedCopy.variant;
  }
  return tenants.length > 1 ? "multipleTenants" : "singleTenant";
}

export const TenancyStep = ({
  stepNumber,
  title: titleProp,
  body: bodyProp,
  sharedCopy,
  tenants,
  idPrefix,
  tenancyStart,
  onTenancyStartChange,
  isPastStep = false,
  variant,
  tips,
  afterBody,
  yearPlaceholder,
}: TenancyStepProps) => {
  const { _ } = useLingui();
  const resolvedVariant = resolveVariant(variant, tenants, sharedCopy);
  const shared = sharedCopy ? resolveTenancyStepCopy(sharedCopy) : null;
  const title = titleProp ?? shared?.title;
  const body = bodyProp ?? shared?.body;

  if (title == null || body == null) {
    throw new Error(
      "TenancyStep requires title and body, or sharedCopy params"
    );
  }

  const tipsSlot = tips ?? afterBody;
  const showTenantList =
    resolvedVariant === "multipleTenants" && tenants.length > 1;
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
          data-variant={resolvedVariant}
          data-tenant-mode={showTenantList ? "multiple" : "single"}
        >
          {body}
          {tipsSlot}
          {showTenantList ? (
            <ul
              className="tenancy-step__tenant-list"
              aria-label={_(msg`Tenant names`)}
            >
              {tenants.map((tenant) => (
                <li key={tenant}>
                  <FindingTenantName name={tenant} />
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

/** Resolves shared copy then returns `renderTenancyStep` for `getSteps` wiring. */
export function renderTenancyStepFromVariant(
  props: RenderTenancyStepOptions & { sharedCopy: TenancySharedCopyParams }
): (ctx: FindingStepRenderContext) => React.ReactNode {
  const { sharedCopy, ...rest } = props;
  const { title, body, variant } = resolveTenancyStepCopy(sharedCopy);
  return renderTenancyStep({
    ...rest,
    title,
    body,
    variant,
    sharedCopy,
  });
}
