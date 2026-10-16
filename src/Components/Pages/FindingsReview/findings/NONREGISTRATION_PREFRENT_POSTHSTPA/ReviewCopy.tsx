import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

type IntroTitleProps = Pick<IntroValues, "missingFromYear" | "year1">;

export const IntroTitle = ({ missingFromYear, year1 }: IntroTitleProps) => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.intro.title">
    Large rent increase from {missingFromYear} to {year1}
  </Trans>
);

export const NO_PREF_RENT_LABEL = msg({
  id: "findings.NONREGISTRATION_PREFRENT_POSTHSTPA.ocr.no_pref_rent_label",
  message: "There is no preferential rent in this year",
});

type ResultYearRangeProps = Pick<IntroValues, "missingFromYear" | "year1">;

export const ResultNoViolationBody = ({
  missingFromYear,
  year1,
}: ResultYearRangeProps) => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.result.no_violation.body">
    The rent increase from {missingFromYear} to {year1} appears to be explained
    by what&apos;s in your rent history. Your report will include more details
    about the rent increase and missing registration.
  </Trans>
);

type ResultViolationProps = ResultYearRangeProps &
  Pick<IntroValues, "reportedRent">;

export const ResultPotentialViolationContinuousBody = ({
  missingFromYear,
  year1,
  reportedRent,
}: ResultViolationProps) => (
  <>
    <p className="finding-result-copy">
      <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.result.potential_violation.continuous.lead">
        There was a large rent increase from {missingFromYear} to {year1}, when
        you let us know that the full monthly rent for the apartment is $
        {reportedRent}. This rent increase does not appear to be fully explained
        by what we just reviewed.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.result.potential_violation.footer">
        Your report will explain why the increase does not add up, and what
        explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultPotentialViolationNotContinuousBody = ({
  missingFromYear,
  year1,
  reportedRent,
}: ResultViolationProps) => (
  <>
    <p className="finding-result-copy">
      <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.result.potential_violation.not_continuous.lead">
        There was a large rent increase from {missingFromYear} to {year1}, when
        you let us know that the full monthly rent for the apartment is $
        {reportedRent}.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.result.potential_violation.footer">
        Your report will explain why the increase does not add up, and what
        explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultDismissedBody = () => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.result.dismissed.body">
    Based on what we reviewed, this finding does not apply to your situation.
    Your report will include more details about the rent increase and
    registration.
  </Trans>
);
