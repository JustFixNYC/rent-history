import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

export const IntroEyebrow = ({
  findingYear,
}: Pick<IntroValues, "findingYear">) => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.intro.eyebrow">
    Year {findingYear}
  </Trans>
);

export const IntroTitle = () => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.intro.title">
    Large increase in legal regulated rent
  </Trans>
);

export const IntroDescription = ({
  percentIncrease,
}: Pick<IntroValues, "percentIncrease">) => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.intro.description">
    The legal regulated rent jumped {percentIncrease}% in one year. We&apos;ll
    check whether this increase can be explained.
  </Trans>
);

export const OcrHeading = () => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.ocr.heading">
    First, let&apos;s make sure we are working with the right values
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
