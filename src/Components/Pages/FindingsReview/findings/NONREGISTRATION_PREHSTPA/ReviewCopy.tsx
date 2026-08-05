import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { GlossaryLink } from "../../../../GlossaryLink/GlossaryLink";
import { YearChip } from "../../../../InlineChip/YearChip";

import type { IntroValues } from "./spec";

export const IntroEyebrow = ({
  findingYear,
}: Pick<IntroValues, "findingYear">) => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA.intro.eyebrow">
    Year {findingYear}
  </Trans>
);

export const IntroTitle = () => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA.intro.title">
    Apartment missing registration
  </Trans>
);

export const IntroDescription = ({
  missingFromYear,
}: Pick<IntroValues, "missingFromYear">) => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA.intro.description">
    Apartment is missing registration from year {missingFromYear} onward.
    We&apos;ll check whether this non registration can be explained by
    destabilization.
  </Trans>
);

export const OcrHeading = () => (
  <Trans id="findings.NONREGISTRATION_PREHSTPA.ocr.heading">
    First, let&apos;s make sure we are working with the right values
  </Trans>
);

export const VacancyHeading = () => {
  const { _ } = useLingui();

  return (
    <Trans id="findings.NONREGISTRATION_PREHSTPA.vacancy.heading">
      Next, let&apos;s check to see if the landlord used something called a{" "}
      <GlossaryLink
        term={_(msg`vacancy bonus`)}
        modalTitle={_(msg`Vacancy bonus`)}
      />
      .
    </Trans>
  );
};

type VacancyCopyProps = Pick<IntroValues, "vacancyYear">;

export const VacancyBody = ({ vacancyYear }: VacancyCopyProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.NONREGISTRATION_PREHSTPA.vacancy.body">
      Were you living in this apartment in <YearChip year={vacancyYear} />?
    </Trans>
  </p>
);

export const VacancyYesNoLegend = ({ vacancyYear }: VacancyCopyProps) => {
  const { _ } = useLingui();

  return _(
    msg({
      id: "findings.NONREGISTRATION_PREHSTPA.vacancy.yes_no_legend",
      message: `Were you living in this apartment in year ${vacancyYear}?`,
    })
  );
};

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
