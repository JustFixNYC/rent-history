import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

export const IntroTitle = () => (
  <Trans id="findings.OVERCHARGE_POSTHSTPA_CURR_TENANT.intro.title">
    The rent amount listed in your rent history is less than what you reported
    currently paying.
  </Trans>
);

type ResultViolationProps = Pick<IntroValues, "rhYear" | "reportedYear">;

export const ResultPotentialViolationBody = ({
  rhYear,
  reportedYear,
}: ResultViolationProps) => (
  <>
    <p className="finding-result-copy">
      <Trans id="findings.OVERCHARGE_POSTHSTPA_CURR_TENANT.result.potential_violation.lead">
        The rent amount listed in your rent history in {rhYear} is less than
        what you let us know was the full monthly rent for the apartment in{" "}
        {reportedYear}.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.OVERCHARGE_POSTHSTPA_CURR_TENANT.result.potential_violation.footer">
        Your report will include more information about this mismatch, and what
        explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultNoViolationBody = () => (
  <Trans id="findings.OVERCHARGE_POSTHSTPA_CURR_TENANT.result.no_violation.body">
    The rent amount in your rent history appears to match what you reported
    currently paying.
  </Trans>
);

export const ResultDismissedBody = () => (
  <Trans id="findings.OVERCHARGE_POSTHSTPA_CURR_TENANT.result.dismissed.body">
    Based on what we reviewed, this finding does not apply to your situation.
  </Trans>
);
