import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

type IntroTitleProps = Pick<IntroValues, "year0" | "year1">;

export const IntroTitle = ({ year0, year1 }: IntroTitleProps) => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.intro.title">
    Large rent increase from {year0} to {year1}
  </Trans>
);

type ResultYearRangeProps = Pick<IntroValues, "year0" | "year1">;

export const ResultPotentialViolationBody = ({
  year0,
  year1,
}: ResultYearRangeProps) => (
  <>
    <p className="finding-result-copy">
      <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.result.potential_violation.lead">
        There was a large rent increase from {year0} to {year1}. This rent
        increase does not appear to be fully explained by what&apos;s in your
        rent history.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.result.potential_violation.footer">
        Your report will explain why the increase does not add up, and what
        explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultDismissedBody = ({ year0, year1 }: ResultYearRangeProps) => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.result.dismissed.body">
    The rent increase from {year0} to {year1} appears to be explained by
    what&apos;s in your rent history.
  </Trans>
);

export const ResultNoViolationBody = ({
  year0,
  year1,
}: ResultYearRangeProps) => (
  <Trans id="findings.OVERCHARGE_LEGALRENT_POSTHSTPA.result.no_violation.body">
    The rent increase from {year0} to {year1} appears to be explained by
    what&apos;s in your rent history.
  </Trans>
);
