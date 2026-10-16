import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

export const IntroTitle = ({
  findingYear,
}: Pick<IntroValues, "findingYear">) => (
  <Trans id="findings.HRVD.intro.title">
    Apartment destabilized in {findingYear}
  </Trans>
);

type ResultCopyProps = {
  year: number;
};

export const ResultPotentialViolationBody = ({ year }: ResultCopyProps) => (
  <>
    <p className="finding-step-copy">
      <Trans id="findings.HRVD.result.potential_violation.body">
        The apartment was listed as exempt from rent stabilization in {year},
        which means it was destabilized. This does not appear to be fully
        explained by what we just reviewed.
      </Trans>
    </p>
    <p className="finding-step-copy">
      <Trans id="findings.HRVD.result.potential_violation.body_followup">
        Your report will explain why the destabilization might not have been
        allowed, and what explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultNoViolationBody = ({ year }: ResultCopyProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.HRVD.result.no_violation.body">
      The apartment was listed as exempt from rent stabilization in {year},
      which means it was destabilized. This appears to be explained by
      what&apos;s in your rent history. Your report will include more details.
    </Trans>
  </p>
);

export const ResultDismissedBody = ({ year }: ResultCopyProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.HRVD.result.dismissed.body">
      The apartment was listed as exempt from rent stabilization in {year},
      which means it was destabilized. Based on what we reviewed, this finding
      does not apply to your situation. Your report will include more details.
    </Trans>
  </p>
);
