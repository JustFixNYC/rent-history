import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

export const IntroEyebrow = ({
  findingYear,
}: Pick<IntroValues, "findingYear">) => (
  <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.intro.eyebrow">
    Year {findingYear}
  </Trans>
);

export const IntroTitle = () => (
  <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.intro.title">
    Preferential rent not offered
  </Trans>
);

export const IntroDescription = ({
  year0,
  year1,
}: Pick<IntroValues, "year0" | "year1">) => (
  <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.intro.description">
    A preferential rent was offered in year {year0}, but then not offered in
    year {year1}. We&apos;ll check to see if this is due to a change in tenancy.
  </Trans>
);

export const OcrHeading = () => (
  <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.ocr.heading">
    First, let&apos;s make sure we are working with the right values
  </Trans>
);

export const NO_PREF_RENT_LABEL = msg({
  id: "findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.ocr.no_pref_rent_label",
  message: "There is no preferential rent in this year",
});

type ResultCopyProps = Pick<IntroValues, "year0" | "year1">;

export const ResultPotentialViolationBody = ({
  year0,
  year1,
}: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.result.potential_violation.body">
    Since a preferential rent was offered in {year0}, and there was no change in
    tenancy in {year1}, the landlord was required to offer a preferential rent
    in {year1}. Your report will include this with additional details.
  </Trans>
);

export const ResultNoViolationBody = ({ year0, year1 }: ResultCopyProps) => (
  <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.result.no_violation.body">
    Since there was a change in tenancy from year {year0} to year {year1}, the
    landlord was not required to offer a preferential rent in {year1}. Your
    report will include this with additional details.
  </Trans>
);

export const ResultDismissedBody = () => (
  <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.result.dismissed.body">
    dismissed fidning copy TK
  </Trans>
);
