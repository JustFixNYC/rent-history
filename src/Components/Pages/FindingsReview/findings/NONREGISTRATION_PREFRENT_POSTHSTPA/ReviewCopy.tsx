import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

export const IntroTitle = () => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.intro.title">
    Apartment missing registration
  </Trans>
);

type ResultCopyProps = Pick<IntroValues, "missingFromYear">;

export const ResultPotentialViolationBody = ({
  missingFromYear,
}: ResultCopyProps) => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.result.potential_violation.body">
    Your apartment is missing registration from year {missingFromYear} onward,
    and your current rent appears to exceed the allowable amount, based on
    standard RGB increases. Your report will include this finding.
  </Trans>
);

export const ResultNoViolationBody = ({ missingFromYear }: ResultCopyProps) => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.result.no_violation.body">
    Your apartment is missing registration from year {missingFromYear} onward,
    but it appears that you are still rent stabilized and your current rent
    appears to be in line with standard RGB increases. Your report will include
    this finding.
  </Trans>
);

export const ResultDismissedBody = () => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.result.dismissed.body">
    dismissed finding result copy TK
  </Trans>
);
