import { Trans } from "@lingui/react/macro";

import { YearChip } from "../../../../InlineChip/YearChip";

import type { IntroValues } from "./spec";

export const IntroEyebrow = ({
  findingYear,
}: Pick<IntroValues, "findingYear">) => (
  <Trans id="findings.OVERCHARGE_PREFRENT_POSTHSTPA.intro.eyebrow">
    Year {findingYear}
  </Trans>
);

export const IntroTitle = () => (
  <Trans id="findings.OVERCHARGE_PREFRENT_POSTHSTPA.intro.title">
    Large increase in preferential rent
  </Trans>
);

export const IntroDescription = ({
  percentIncrease,
}: Pick<IntroValues, "percentIncrease">) => (
  <Trans id="findings.OVERCHARGE_PREFRENT_POSTHSTPA.intro.description">
    The preferential rent jumped {percentIncrease}% in one year. We&apos;ll
    check whether this increase can be explained by a change in tenancy.
  </Trans>
);

export const OcrHeading = () => (
  <Trans id="findings.OVERCHARGE_PREFRENT_POSTHSTPA.ocr.heading">
    First, let&apos;s make sure we are working with the right values
  </Trans>
);

type VacancyHeadingProps = Pick<IntroValues, "year0" | "year1">;

export const VacancyHeading = ({ year0, year1 }: VacancyHeadingProps) => (
  <Trans id="findings.OVERCHARGE_PREFRENT_POSTHSTPA.vacancy.heading">
    Next, let&apos;s check to see if there was a change in tenancy from{" "}
    <YearChip year={year0} /> to <YearChip year={year1} />.
  </Trans>
);

type ResultCopyProps = Pick<IntroValues, "rent0" | "rent1" | "year0" | "year1">;

export const ResultPotentialViolationVacancyBody = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_PREFRENT_POSTHSTPA.result.potential_violation.vacancy.body">
    The increase in preferential rent from ${rent0} in year {year0} to ${rent1}{" "}
    in year {year1} is more than the allowed increase. Your report will include
    this with additional details.
  </Trans>
);

export const ResultPotentialViolationNoVacancyBody = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_PREFRENT_POSTHSTPA.result.potential_violation.no_vacancy.body">
    The increase in preferential rent from ${rent0} in year {year0} to ${rent1}{" "}
    in year {year1} does not appear to be explained by a change in tenancy. Your
    report will include this with additional details.
  </Trans>
);

export const ResultNoViolationBody = ({
  rent0,
  rent1,
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_PREFRENT_POSTHSTPA.result.no_violation.body">
    The increase in preferential rent from ${rent0} in year {year0} to ${rent1}{" "}
    in year {year1} appears to be explained by a change in tenancy. Your report
    will include this with additional details.
  </Trans>
);

export const ResultDismissedBody = (props: ResultCopyProps) => (
  <ResultNoViolationBody {...props} />
);
