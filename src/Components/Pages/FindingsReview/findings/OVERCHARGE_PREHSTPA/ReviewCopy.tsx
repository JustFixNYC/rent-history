import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { DocumentLink } from "../../../../DocumentLink/DocumentLink";
import { FindingTenantName } from "../../shared/FindingTenantName";

import type { IntroValues } from "./spec";

type IntroTitleProps = Pick<IntroValues, "year0" | "year1">;

export const IntroTitle = ({ year0, year1 }: IntroTitleProps) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.intro.title">
    Large rent increase from {year0} to {year1}
  </Trans>
);

type VacancyHeadingProps = {
  vacancyYear: number;
};

export const VacancyHeading = ({ vacancyYear }: VacancyHeadingProps) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.vacancy.heading">
    Next, let&apos;s check if there was a vacancy in {vacancyYear}
  </Trans>
);

type VacancyBodyProps = {
  year0: number;
  year1: number;
};

type VacancyBodySingleProps = VacancyBodyProps & {
  tenant: string;
};

export const VacancyBodySingle = ({
  tenant,
  year0,
  year1,
}: VacancyBodySingleProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.OVERCHARGE_PREHSTPA.vacancy.body_single">
      Check <DocumentLink />. Is <FindingTenantName name={tenant} /> listed as
      the tenant in {year0} <em>and</em> {year1}?
    </Trans>
  </p>
);

export const VacancyBodyMultiple = ({ year0, year1 }: VacancyBodyProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.OVERCHARGE_PREHSTPA.vacancy.body_multiple">
      Check <DocumentLink />. Is one or more of the following names listed as
      the tenant in {year0} <em>and</em> {year1}?
    </Trans>
  </p>
);

export const VacancyYesNoLegend = () => {
  const { _ } = useLingui();

  return _(
    msg({
      id: "findings.OVERCHARGE_PREHSTPA.vacancy.yes_no_legend",
      message: "Are the same tenant or tenants listed in both years?",
    })
  );
};

type TenancyCopyProps = {
  tenant: string;
};

export const TenancyHeading = () => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.tenancy.heading">
    Next, let&apos;s check how long the previous tenant lived there before the
    vacancy
  </Trans>
);

export const TenancyHeadingMultiple = () => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.tenancy.heading_multiple">
    Next, let&apos;s check how long the previous tenants lived there before the
    vacancy
  </Trans>
);

export const TenancyBody = ({ tenant }: TenancyCopyProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.OVERCHARGE_PREHSTPA.tenancy.body">
      Check <DocumentLink />. What is the earliest year{" "}
      <FindingTenantName name={tenant} /> is listed as a tenant?
    </Trans>
  </p>
);

export const TenancyBodyMultiple = () => (
  <p className="finding-step-copy">
    <Trans id="findings.OVERCHARGE_PREHSTPA.tenancy.body_multiple">
      Check <DocumentLink />. What is the earliest year one or more of the
      following names is listed as a tenant?
    </Trans>
  </p>
);

type ResultCopyProps = Pick<IntroValues, "rent0" | "rent1" | "year0" | "year1">;

export const ResultPotentialViolationBody = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.result.confirmed.body">
    The rent increase from ${rent0} in year {year0} to ${rent1} in year {year1}{" "}
    does not appear to be explained by allowable bonuses. One of the only ways
    the rent could have reached ${rent1} is through Individual Apartment
    Improvements (IAIs). Your report will include this finding.
  </Trans>
);

export const ResultNoViolationBody = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.result.explained_away.body">
    The rent increase from ${rent0} in year {year0} to ${rent1} in year {year1}{" "}
    appears to be explained by allowable bonuses. Your report will include this
    finding.
  </Trans>
);

export const ResultDismissedBody = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.result.dismissed.body">
    The increase in legal regulated rent from ${rent0} in year {year0} to $
    {rent1} in year {year1} appears to be within the RGB limit.
  </Trans>
);
