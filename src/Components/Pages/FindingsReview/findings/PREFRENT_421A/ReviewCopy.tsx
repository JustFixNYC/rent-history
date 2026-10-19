import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

export const IntroTitle = () => (
  <Trans id="findings.PREFRENT_421A.intro.title">
    Preferential rent offered during initial year of this building&apos;s
    participation in 421a tax program.
  </Trans>
);

export const NO_PREF_RENT_LABEL = msg({
  id: "findings.PREFRENT_421A.ocr.no_pref_rent_label",
  message: "There is no preferential rent in this year",
});

type ResultCopyProps = Pick<IntroValues, "year0">;

export const ResultPotentialViolationBody = ({ year0 }: ResultCopyProps) => (
  <>
    <p className="finding-result-copy">
      <Trans id="findings.PREFRENT_421A.result.potential_violation.lead">
        The preferential rent offered in {year0}, the first year of this
        building&apos;s participation in the 421a tax program, does not appear
        to be explained by what we just checked.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.PREFRENT_421A.result.potential_violation.footer">
        Your report will explain why the preferential rent might not have been
        allowed, and if other legal explanations may be possible.
      </Trans>
    </p>
  </>
);

export const ResultNoViolationBody = ({ year0 }: ResultCopyProps) => (
  <Trans id="findings.PREFRENT_421A.result.no_violation.body">
    You reported that a preferential rent was not charged in year {year0}, the
    first year of this building&apos;s participation in the 421a tax program.
  </Trans>
);

export const ResultDismissedBody = (props: ResultCopyProps) => (
  <ResultNoViolationBody {...props} />
);
