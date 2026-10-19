import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

type IntroTitleProps = Pick<IntroValues, "year0" | "year1">;

export const IntroTitle = ({ year0, year1 }: IntroTitleProps) => (
  <Trans id="findings.OUTDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT.intro.title">
    Large rent increase from {year0} to {year1}
  </Trans>
);

type ResultYearRangeProps = Pick<IntroValues, "year0" | "year1">;

export const ResultNoViolationBody = ({
  year0,
  year1,
}: ResultYearRangeProps) => (
  <Trans id="findings.OUTDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT.result.no_violation.body">
    The rent increase from {year0} to {year1} appears to be explained by
    what&apos;s in your rent history.
  </Trans>
);

type ResultViolationProps = ResultYearRangeProps & {
  reportedRent: number;
};

export const ResultPotentialViolationContinuousBody = ({
  year0,
  year1,
  reportedRent,
}: ResultViolationProps) => (
  <>
    <p className="finding-result-copy">
      <Trans id="findings.OUTDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT.result.potential_violation.continuous.lead">
        There was a large rent increase from {year0} to {year1}, when you let us
        know that the full monthly rent for the apartment is ${reportedRent}.
        This rent increase does not appear to be fully explained by what we just
        checked.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.OUTDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT.result.potential_violation.footer">
        Your report will explain why the increase does not add up, and what
        explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultPotentialViolationNotContinuousBody = ({
  year0,
  year1,
  reportedRent,
}: ResultViolationProps) => (
  <>
    <p className="finding-result-copy">
      <Trans id="findings.OUTDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT.result.potential_violation.not_continuous.lead">
        There was a large rent increase from {year0} to {year1}, when you let us
        know that the full monthly rent for the apartment is ${reportedRent}.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.OUTDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT.result.potential_violation.footer">
        Your report will explain why the increase does not add up, and what
        explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultDismissedBody = () => (
  <Trans id="findings.OUTDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT.result.dismissed.body">
    Based on what we reviewed, this finding does not apply to your situation.
    Your report will include more details about the rent increase.
  </Trans>
);
