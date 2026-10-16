import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

type IntroTitleProps = Pick<IntroValues, "year0" | "year1">;

export const IntroTitle = ({ year0, year1 }: IntroTitleProps) => (
  <Trans id="findings.OVERCHARGE_PREHSTPA.intro.title">
    Large rent increase from {year0} to {year1}
  </Trans>
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
