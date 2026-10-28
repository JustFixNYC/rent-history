import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

type IntroTitleProps = Pick<IntroValues, "rhYear">;

export const IntroTitle = ({ rhYear }: IntroTitleProps) => (
  <Trans id="findings.OVERCHARGE_EXPIREDLEASE_POSTHSTPA_CURR_TENANT.intro.title">
    Large rent increase from {rhYear} to the apartment&apos;s current monthly
    rent
  </Trans>
);

type ResultViolationProps = Pick<IntroValues, "rhYear" | "reportedRent">;

export const ResultPotentialViolationBody = ({
  rhYear,
  reportedRent,
}: ResultViolationProps) => (
  <>
    <p className="finding-result-copy">
      <Trans id="findings.OVERCHARGE_EXPIREDLEASE_POSTHSTPA_CURR_TENANT.result.potential_violation.lead">
        There was a large increase from {rhYear} to the apartment&apos;s current
        monthly rent of ${reportedRent}. This rent increase does not appear to
        be fully explained by what&apos;s in your rent history.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.OVERCHARGE_EXPIREDLEASE_POSTHSTPA_CURR_TENANT.result.potential_violation.footer">
        Your report will explain why the increase does not add up, and what
        explanations may be possible.
      </Trans>
    </p>
  </>
);

type ResultNoViolationProps = Pick<IntroValues, "rhYear" | "reportedYear">;

export const ResultNoViolationBody = ({
  rhYear,
  reportedYear,
}: ResultNoViolationProps) => (
  <Trans id="findings.OVERCHARGE_EXPIREDLEASE_POSTHSTPA_CURR_TENANT.result.no_violation.body">
    The rent increase from {rhYear} to {reportedYear} appears to be explained by
    the standard allowable increase between {rhYear} and {reportedYear}.
  </Trans>
);

export const ResultDismissedBody = () => (
  <Trans id="findings.OVERCHARGE_EXPIREDLEASE_POSTHSTPA_CURR_TENANT.result.dismissed.body">
    Based on what we reviewed, this finding does not apply to your situation.
  </Trans>
);
