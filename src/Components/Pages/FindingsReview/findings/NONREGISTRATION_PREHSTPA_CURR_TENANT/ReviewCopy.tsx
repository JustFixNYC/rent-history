import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

type IntroTitleProps = Pick<IntroValues, "year0" | "year1">;

export const IntroTitle = ({ year0, year1 }: IntroTitleProps) => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA_CURR_TENANT.intro.title">
    Large rent increase from {year0} to {year1}
  </Trans>
);

type VacancyCopyProps = Pick<IntroValues, "lastRegistrationYear" | "year0">;

export const VacancyHeading = ({
  lastRegistrationYear,
}: Pick<VacancyCopyProps, "lastRegistrationYear">) => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA_CURR_TENANT.vacancy.heading">
    Next, let&apos;s check if you were the tenant in {lastRegistrationYear}
  </Trans>
);

export const VacancyBody = ({ year0 }: Pick<VacancyCopyProps, "year0">) => (
  <p className="finding-step-copy">
    <Trans id="findings.NONREGISTRATION_PREHSTPA_CURR_TENANT.vacancy.body">
      Have you been on the lease for this apartment since {year0}?
    </Trans>
  </p>
);

export { SuccessionHeading } from "../../shared/successionStepCopy";

type SuccessionBodyProps = {
  year: number;
};

export const SuccessionBody = ({ year }: SuccessionBodyProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.NONREGISTRATION_PREHSTPA_CURR_TENANT.succession.body">
      Did you inherit the lease through a process called
      &ldquo;Succession&rdquo; from someone who was on the lease in {year}?
    </Trans>
  </p>
);

type ResultYearRangeProps = Pick<IntroValues, "year0" | "year1">;

export const ResultNoViolationBody = ({
  year0,
  year1,
}: ResultYearRangeProps) => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA_CURR_TENANT.result.no_violation.body">
    The rent increase from {year0} to {year1} appears to be explained by
    what&apos;s in your rent history. Your report will include more details
    about the rent increase and missing registration.
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
      <Trans id="findings.NONREGISTRATION_PREHSTPA_CURR_TENANT.result.potential_violation.continuous.lead">
        There was a large rent increase from {year0} to {year1}, when you let us
        know that the full monthly rent for the apartment is ${reportedRent}.
        This rent increase does not appear to be fully explained by what we just
        checked.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.NONREGISTRATION_PREHSTPA_CURR_TENANT.result.potential_violation.footer">
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
      <Trans id="findings.NONREGISTRATION_PREHSTPA_CURR_TENANT.result.potential_violation.not_continuous.lead">
        There was a large rent increase from {year0} to {year1}, when you let us
        know that the full monthly rent for the apartment is ${reportedRent}.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.NONREGISTRATION_PREHSTPA_CURR_TENANT.result.potential_violation.footer">
        Your report will explain why the increase does not add up, and what
        explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultDismissedBody = () => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA_CURR_TENANT.result.dismissed.body">
    dismissed finding result copy TK
  </Trans>
);
