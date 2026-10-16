import { Trans } from "@lingui/react/macro";

import { DocumentLink } from "../../../DocumentLink/DocumentLink";
import { FindingTenantName } from "./FindingTenantName";

import type { TenancyStepVariant } from "./validationSteps";

type TenancyHeadingProps = {
  variant: TenancyStepVariant;
};

export const TenancyHeading = ({ variant }: TenancyHeadingProps) => {
  if (variant === "multipleTenants") {
    return (
      <Trans id="findings.shared.tenancy.heading.multiple">
        Next, let&apos;s check how long the previous tenants lived there before
        the vacancy
      </Trans>
    );
  }

  return (
    <Trans id="findings.shared.tenancy.heading.single">
      Next, let&apos;s check how long the previous tenant lived there before the
      vacancy
    </Trans>
  );
};

type TenancyBodySingleTenantProps = {
  tenant: string;
};

export const TenancyBodySingleTenant = ({
  tenant,
}: TenancyBodySingleTenantProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.shared.tenancy.body.single">
      Check <DocumentLink />. What is the earliest year{" "}
      <FindingTenantName name={tenant} /> is listed as a tenant?
    </Trans>
  </p>
);

export const TenancyBodyMultipleTenants = () => (
  <p className="finding-step-copy">
    <Trans id="findings.shared.tenancy.body.multiple">
      Check <DocumentLink />. What is the earliest year one or more of the
      following names is listed as a tenant?
    </Trans>
  </p>
);
