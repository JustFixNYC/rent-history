import { Trans } from "@lingui/react/macro";

import { DocumentLink } from "../../../DocumentLink/DocumentLink";
import { FindingTenantName } from "./FindingTenantName";

import type { VacancyStepVariant } from "./validationSteps";

type VacancyHeadingProps = {
  variant: VacancyStepVariant;
  vacancyYear: number;
};

export const VacancyHeading = ({
  variant,
  vacancyYear,
}: VacancyHeadingProps) => {
  if (variant === "selfTenant") {
    return (
      <Trans id="findings.shared.vacancy.heading.self_tenant">
        Next, let&apos;s check if you were the tenant in {vacancyYear}
      </Trans>
    );
  }

  return (
    <Trans id="findings.shared.vacancy.heading.tenant_change">
      Next, let&apos;s check if there was a vacancy in {vacancyYear}
    </Trans>
  );
};

type VacancyBodySelfTenantProps = {
  leaseSinceYear: number;
};

export const VacancyBodySelfTenant = ({
  leaseSinceYear,
}: VacancyBodySelfTenantProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.shared.vacancy.body.self_tenant">
      Have you been on the lease for this apartment since {leaseSinceYear}?
    </Trans>
  </p>
);

type VacancyBodySingleTenantProps = {
  tenant: string;
  year0: number;
  year1: number;
};

export const VacancyBodySingleTenant = ({
  tenant,
  year0,
  year1,
}: VacancyBodySingleTenantProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.shared.vacancy.body.single_tenant">
      Check <DocumentLink />. Is <FindingTenantName name={tenant} /> listed as
      the tenant in {year0} <em>and</em> {year1}?
    </Trans>
  </p>
);

type VacancyBodyMultipleTenantsProps = {
  year0: number;
  year1: number;
};

export const VacancyBodyMultipleTenants = ({
  year0,
  year1,
}: VacancyBodyMultipleTenantsProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.shared.vacancy.body.multiple_tenants">
      Check <DocumentLink />. Is one or more of the following names listed as
      the tenant in {year0} <em>and</em> {year1}?
    </Trans>
  </p>
);
