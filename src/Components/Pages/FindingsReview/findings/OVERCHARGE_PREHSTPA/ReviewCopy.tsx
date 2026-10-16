import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { VacancyBodyMultipleTenants } from "../../shared/vacancyStepCopy";

import type { IntroValues } from "./spec";

type IntroTitleProps = Pick<IntroValues, "year0" | "year1">;

export const IntroTitle = ({ year0, year1 }: IntroTitleProps) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.intro.title">
    Large rent increase from {year0} to {year1}
  </Trans>
);

type VacancyBodyProps = {
  year0: number;
  year1: number;
};

/** @deprecated Task 5 — prefer shared vacancy copy via `VacancyStep` `sharedCopy`. */
export const VacancyBody = ({ year0, year1 }: VacancyBodyProps) => (
  <VacancyBodyMultipleTenants year0={year0} year1={year1} />
);

/** @deprecated Task 5 — standard variants use body + `aria-labelledby` instead. */
export const VacancyYesNoLegend = () => {
  const { _ } = useLingui();

  return _(
    msg({
      id: "findings.OVERCHARGE_PREHSTPA.vacancy.yes_no_legend",
      message: "Are the same tenant or tenants listed in both years?",
    })
  );
};

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
