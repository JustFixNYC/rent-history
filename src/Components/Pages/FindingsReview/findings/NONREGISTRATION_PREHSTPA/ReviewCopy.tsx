import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { GlossaryLink } from "../../../../GlossaryLink/GlossaryLink";

import type { IntroValues } from "./spec";

export const IntroTitle = () => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA.intro.title">
    Apartment missing registration
  </Trans>
);

type ResultCopyProps = Pick<IntroValues, "missingFromYear" | "findingYear">;

export const ResultPotentialViolationYesBody = ({
  missingFromYear,
}: ResultCopyProps) => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA.result.potential_violation.yes.body">
    Your apartment is missing registration from year {missingFromYear} onward,
    and your current rent appears to exceed the allowable amount, based on
    standard RGB increases. Your report will include this with additional
    details.
  </Trans>
);

export const ResultPotentialViolationNoBody = ({
  missingFromYear,
  findingYear,
}: ResultCopyProps) => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA.result.potential_violation.no.body">
    Your apartment is missing registration from year {missingFromYear} onward.
    This could indicate that your landlord is currently treating your apartment
    as not rent stabilized, or your apartment was legally destabilized at some
    point between year {missingFromYear} and year {findingYear}. Your report
    will include this with additional details.
  </Trans>
);

export const ResultNoViolationBody = ({
  missingFromYear,
}: Pick<ResultCopyProps, "missingFromYear">) => {
  const { _ } = useLingui();

  return (
    <Trans id="findings.NONREGISTRATION_PREHSTPA.result.no_violation.body">
      Your apartment is missing registration from year {missingFromYear} onward.
      This appears to be explained by{" "}
      <GlossaryLink
        term={_(msg`high rent vacancy destabilization.`)}
        modalTitle={_(msg`High rent vacancy destabilization`)}
      />{" "}
      Your report will include this with additional details.
    </Trans>
  );
};

export const ResultDismissedBody = () => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA.result.dismissed.body">
    dismissed finding result copy TK
  </Trans>
);
