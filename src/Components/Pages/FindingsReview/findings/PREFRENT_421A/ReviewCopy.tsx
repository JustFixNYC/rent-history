import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

export const IntroEyebrow = ({
  findingYear,
}: Pick<IntroValues, "findingYear">) => (
  <Trans id="findings.PREFRENT_421A.intro.eyebrow">Year {findingYear}</Trans>
);

export const IntroTitle = () => (
  <Trans id="findings.PREFRENT_421A.intro.title">
    Preferential rent offered during initial year of this building&apos;s
    participation in 421-a tax program.
  </Trans>
);

export const IntroDescription = () => (
  <Trans id="findings.PREFRENT_421A.intro.description">
    A preferential rent appears to have been charged during the first year of
    this building&apos;s participation in 421-a tax program. We&apos;ll check if
    this can be explained.
  </Trans>
);

export const OcrHeading = () => (
  <Trans id="findings.PREFRENT_421A.ocr.heading">
    First, let&apos;s make sure we are working with the right values
  </Trans>
);

export const NO_PREF_RENT_LABEL = msg({
  id: "findings.PREFRENT_421A.ocr.no_pref_rent_label",
  message: "There is no preferential rent in this year",
});

type ResultCopyProps = Pick<IntroValues, "year0">;

export const ResultPotentialViolationBody = ({ year0 }: ResultCopyProps) => (
  <Trans id="findings.PREFRENT_421A.result.potential_violation.body">
    A preferential rent appears to have been charged during the first year of
    this building&apos;s participation in the 421a tax program (year {year0}).
    Your report will include this with additional details.
  </Trans>
);

export const ResultNoViolationBody = ({ year0 }: ResultCopyProps) => (
  <Trans id="findings.PREFRENT_421A.result.no_violation.body">
    You reported that a preferential rent was not charged during the first year
    of this building&apos;s participation in the 421a tax program (year {year0}
    ).
  </Trans>
);

export const ResultDismissedBody = ({ year0 }: ResultCopyProps) => (
  <Trans id="findings.PREFRENT_421A.result.dismissed.body">
    You reported that a preferential rent was not charged during the first year
    of this building&apos;s participation in the 421-a tax program (year {year0}
    ).
  </Trans>
);
