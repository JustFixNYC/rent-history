import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

type IntroTitleProps = Pick<IntroValues, "year0" | "year1">;

export const IntroTitle = ({ year0, year1 }: IntroTitleProps) => (
  <Trans id="findings.NONREGISTRATION_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT.intro.title">
    Large rent increase from {year0} to {year1}
  </Trans>
);

type ResultYearRangeProps = Pick<IntroValues, "year0" | "year1">;

export const ResultNoViolationBody = ({
  year0,
  year1,
}: ResultYearRangeProps) => (
  <Trans id="findings.NONREGISTRATION_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT.result.no_violation.body">
    The rent increase from {year0} to {year1} appears to be explained by
    what&apos;s in your rent history. Your report will include more details
    about the rent increase and missing registration.
  </Trans>
);

type ResultViolationProps = ResultYearRangeProps &
  Pick<IntroValues, "reportedRent">;

export const ResultPotentialViolationBody = ({
  year0,
  year1,
  reportedRent,
}: ResultViolationProps) => (
  <>
    <p className="finding-result-copy">
      <Trans id="findings.NONREGISTRATION_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT.result.potential_violation.lead">
        There was a large rent increase from {year0} to {year1}, when you let us
        know that the full monthly rent for the apartment is ${reportedRent}.
        This rent increase does not appear to be fully explained by what we just
        reviewed.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.NONREGISTRATION_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT.result.potential_violation.footer">
        Your report will explain why the increase does not add up, and what
        explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultDismissedBody = () => (
  <Trans id="findings.NONREGISTRATION_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT.result.dismissed.body">
    Based on what we reviewed, this finding does not apply to your situation.
    Your report will include more details about the rent increase and
    registration.
  </Trans>
);
