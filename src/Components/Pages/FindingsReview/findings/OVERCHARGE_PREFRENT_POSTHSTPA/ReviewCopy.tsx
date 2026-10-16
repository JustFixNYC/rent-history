import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

export const IntroTitle = () => (
  <Trans id="findings.OVERCHARGE_PREFRENT_POSTHSTPA.intro.title">
    Large increase in preferential rent
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
