import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

import type { IntroValues } from "./spec";

type IntroTitleProps = Pick<IntroValues, "year1">;

export const IntroTitle = ({ year1 }: IntroTitleProps) => (
  <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.intro.title">
    Preferential rent not offered in {year1}
  </Trans>
);

export const NO_PREF_RENT_LABEL = msg({
  id: "findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.ocr.no_pref_rent_label",
  message: "There is no preferential rent in this year",
});

type ResultYearProps = Pick<IntroValues, "year1">;

export const ResultPotentialViolationBody = ({ year1 }: ResultYearProps) => (
  <>
    <p className="finding-result-copy">
      <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.result.potential_violation.lead">
        The preferential rent was removed in {year1}. The legal removal of the
        preferential rent does not appear to be fully explained by what we just
        checked.
      </Trans>
    </p>
    <p className="finding-result-copy">
      <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.result.potential_violation.footer">
        Your report will explain why the rent increase associated with the
        removal of the preferential rent does not add up, and what explanations
        may be possible.
      </Trans>
    </p>
  </>
);

export const ResultNoViolationBody = ({ year1 }: ResultYearProps) => (
  <Trans id="findings.OVERCHARGE_PREFRENTREMOVED_POSTHSTPA.result.no_violation.body">
    The legal removal of the preferential rent in {year1} appears to be
    explained by what&apos;s in your rent history.
  </Trans>
);

export const ResultDismissedBody = (props: ResultYearProps) => (
  <ResultNoViolationBody {...props} />
);
