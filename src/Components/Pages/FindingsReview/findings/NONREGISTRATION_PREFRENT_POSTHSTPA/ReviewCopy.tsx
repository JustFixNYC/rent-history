import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { YearChip } from "../../../../InlineChip/YearChip";

import type { IntroValues } from "./spec";

export const IntroEyebrow = ({
  findingYear,
}: Pick<IntroValues, "findingYear">) => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.intro.eyebrow">
    Year {findingYear}
  </Trans>
);

export const IntroTitle = () => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.intro.title">
    Apartment missing registration
  </Trans>
);

export const IntroDescription = ({
  missingFromYear,
}: Pick<IntroValues, "missingFromYear">) => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.intro.description">
    Apartment is missing registration from year {missingFromYear} onward.
    We&apos;ll check whether this missing registration can be explained by
    destabilization.
  </Trans>
);

export const OcrHeading = () => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.ocr.heading">
    First, let&apos;s make sure we are working with the right values
  </Trans>
);

type VacancyCopyProps = Pick<IntroValues, "year0">;

export const VacancyHeading = ({ year0 }: VacancyCopyProps) => (
  <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.vacancy.heading">
    Let&apos;s check to see if you were the tenant receiving preferential rent
    in year {year0}.
  </Trans>
);

export const VacancyBody = ({ year0 }: VacancyCopyProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.NONREGISTRATION_PREFRENT_POSTHSTPA.vacancy.body">
      Were you living in this apartment in <YearChip year={year0} />?
    </Trans>
  </p>
);

export const VacancyYesNoLegend = ({ year0 }: VacancyCopyProps) => {
  const { _ } = useLingui();

  return _(
    msg({
      id: "findings.NONREGISTRATION_PREFRENT_POSTHSTPA.vacancy.yes_no_legend",
      message: `Were you living in this apartment in year ${year0}?`,
    })
  );
};

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
