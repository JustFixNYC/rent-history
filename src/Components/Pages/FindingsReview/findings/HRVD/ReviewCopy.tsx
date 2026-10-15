import { Trans } from "@lingui/react/macro";

import { DocumentLink } from "../../../../DocumentLink/DocumentLink";
import { FindingTenantName } from "../../shared/FindingTenantName";

import type { IntroValues } from "./spec";

export const IntroTitle = ({
  findingYear,
}: Pick<IntroValues, "findingYear">) => (
  <Trans id="findings.HRVD.intro.title">
    Apartment destabilized in {findingYear}
  </Trans>
);

type TenancyCopyProps = {
  tenant: string;
};

export const TenancyHeading = () => (
  <Trans id="findings.HRVD.tenancy.heading">
    Next, let&apos;s check how long the previous tenant lived there before the
    vacancy
  </Trans>
);

export const TenancyHeadingMultiple = () => (
  <Trans id="findings.HRVD.tenancy.heading_multiple">
    Next, let&apos;s check how long the previous tenants lived there before the
    vacancy
  </Trans>
);

export const TenancyBody = ({ tenant }: TenancyCopyProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.HRVD.tenancy.body">
      Check <DocumentLink />. What is the earliest year{" "}
      <FindingTenantName name={tenant} /> is listed as a tenant?
    </Trans>
  </p>
);

export const TenancyBodyMultiple = () => (
  <p className="finding-step-copy">
    <Trans id="findings.HRVD.tenancy.body_multiple">
      Check <DocumentLink />. What is the earliest year one or more of the
      following names is listed as a tenant?
    </Trans>
  </p>
);

type ResultCopyProps = {
  year: number;
};

export const ResultPotentialViolationBody = ({ year }: ResultCopyProps) => (
  <>
    <p className="finding-step-copy">
      <Trans id="findings.HRVD.result.potential_violation.body">
        The apartment was listed as exempt from rent stabilization in {year},
        which means it was destabilized. This does not appear to be fully
        explained by what we just reviewed.
      </Trans>
    </p>
    <p className="finding-step-copy">
      <Trans id="findings.HRVD.result.potential_violation.body_followup">
        Your report will explain why the destabilization might not have been
        allowed, and what explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultNoViolationBody = ({ year }: ResultCopyProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.HRVD.result.no_violation.body">
      The apartment was listed as exempt from rent stabilization in {year},
      which means it was destabilized. This appears to be explained by
      what&apos;s in your rent history. Your report will include more details.
    </Trans>
  </p>
);

export const ResultDismissedBody = () => (
  <Trans id="findings.HRVD.result.dismissed.body">
    dismissed finding result copy TK
  </Trans>
);
