import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { DocumentLink } from "../../DocumentLink";
import { GlossaryLink } from "../../GlossaryLink";
import { TenantChip } from "../../TenantChip";
import { YearChip } from "../../YearChip";

import type { IntroValues } from "./spec";

export const IntroEyebrow = ({
  findingYear,
}: Pick<IntroValues, "findingYear">) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.intro.eyebrow">
    Year {findingYear}
  </Trans>
);

export const IntroTitle = () => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.intro.title">
    Large rent increase
  </Trans>
);

export const IntroDescription = ({
  percentIncrease,
}: Pick<IntroValues, "percentIncrease">) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.intro.description">
    The rent jumped {percentIncrease}% in one year. We&apos;ll check whether
    this increase can be explained by allowable bonuses.
  </Trans>
);

export const OcrHeading = () => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.ocr.heading">
    First, let&apos;s make sure we are working with the right values
  </Trans>
);

type VacancyCopyProps = {
  year0: number;
  year1: number;
};

export const VacancyHeading = () => {
  const { _ } = useLingui();

  return (
    <Trans id="findings.OVERCHARGE_PREHSTPA.vacancy.heading">
      Next, let&apos;s check to see if the landlord used something called a{" "}
      <GlossaryLink
        term={_(msg`vacancy bonus`)}
        modalTitle={_(msg`Vacancy bonus`)}
      />
      .
    </Trans>
  );
};

export const VacancyBody = ({ year0, year1 }: VacancyCopyProps) => (
  <p className="prehstpa-step-copy">
    <Trans id="findings.OVERCHARGE_PREHSTPA.vacancy.body">
      Look at <DocumentLink /> — do any tenant(s) in year{" "}
      <YearChip year={year0} /> appear to be listed as tenants in year{" "}
      <YearChip year={year1} />?
    </Trans>
  </p>
);

type TenancyCopyProps = {
  tenant: string;
};

export const TenancyHeading = () => {
  const { _ } = useLingui();

  return (
    <Trans id="findings.OVERCHARGE_PREHSTPA.tenancy.heading">
      Next, let&apos;s check to see if the landlord used something called a{" "}
      <GlossaryLink
        term={_(msg`longevity bonus`)}
        modalTitle={_(msg`Longevity bonus`)}
      />
      .
    </Trans>
  );
};

export const TenancyBody = ({ tenant }: TenancyCopyProps) => (
  <p className="prehstpa-step-copy">
    <Trans id="findings.OVERCHARGE_PREHSTPA.tenancy.body">
      Look at <DocumentLink /> — What is the earliest year{" "}
      <TenantChip tenant={tenant} /> appears as a tenant in your rent history
      document?
    </Trans>
  </p>
);

type ResultCopyProps = Pick<IntroValues, "rent0" | "rent1" | "year0" | "year1">;

export const ResultConfirmedCopy = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.result.confirmed">
    Potential violation found. The legal regulated rent increased from ${rent0}{" "}
    in {year0} to ${rent1} in {year1}, and allowable bonuses may not fully
    explain the jump.
  </Trans>
);

export const ResultExplainedAwayCopy = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.result.explained_away">
    No violation found. The increase from ${rent0} in {year0} to ${rent1} in{" "}
    {year1} can be explained by allowable bonuses.
  </Trans>
);
