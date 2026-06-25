import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { DocumentLink } from "../../../../DocumentLink/DocumentLink";
import { GlossaryLink } from "../../../../GlossaryLink/GlossaryLink";
import { TenantChip } from "../../../../InlineChip/TenantChip";
import { YearChip } from "../../../../InlineChip/YearChip";

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
  <p className="finding-step-copy">
    <Trans id="findings.OVERCHARGE_PREHSTPA.vacancy.body">
      Look at <DocumentLink /> — do any tenant(s) in year{" "}
      <YearChip year={year0} /> appear to be listed as tenants in year{" "}
      <YearChip year={year1} />?
    </Trans>
  </p>
);

export const VacancyYesNoLegend = () => {
  const { _ } = useLingui();

  return _(
    msg({
      id: "findings.OVERCHARGE_PREHSTPA.vacancy.yes_no_legend",
      message: "Did tenants in the earlier year appear in the later year?",
    })
  );
};

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
  <p className="finding-step-copy">
    <Trans id="findings.OVERCHARGE_PREHSTPA.tenancy.body">
      Look at <DocumentLink /> — What is the earliest year{" "}
      <TenantChip tenant={tenant} /> appears as a tenant in your rent history
      document?
    </Trans>
  </p>
);

export const TenancyBodyMultiple = () => (
  <p className="finding-step-copy">
    <Trans id="findings.OVERCHARGE_PREHSTPA.tenancy.body_multiple">
      Look at <DocumentLink /> — What is the earliest year any of the following
      names appear in your rent history document?
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
