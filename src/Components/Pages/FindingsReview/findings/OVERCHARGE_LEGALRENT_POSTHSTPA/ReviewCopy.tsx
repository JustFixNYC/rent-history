import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

export const IntroTitle = () => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.intro.title">
    Large increase in legal regulated rent
  </Trans>
);

type ResultCopyProps = Pick<IntroValues, "rent0" | "rent1" | "year0" | "year1">;

export const ResultPotentialViolationBody = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.result.potential_violation.body">
    The increase in legal regulated rent from ${rent0} in year {year0} to $
    {rent1} in year {year1} does not appear to be explained by the standard RGB
    increase alone. One of the only ways the rent could have reached ${rent1} in
    year {year1} is through Individual Apartment Improvements (IAIs). Your
    report will include this with additional details.
  </Trans>
);

export const ResultDismissedBody = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.result.dismissed.body">
    The increase in legal regulated rent from ${rent0} in year {year0} to $
    {rent1} in year {year1} appears to be within the limits of the standard RGB
    increase.
  </Trans>
);

export const ResultNoViolationBody = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.result.no_violation.body">
    The increase in legal regulated rent from ${rent0} in year {year0} to $
    {rent1} in year {year1} appears to be within the limits of the standard RGB
    increase.
  </Trans>
);
