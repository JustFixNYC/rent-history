import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { GlossaryLink } from "../../../../GlossaryLink/GlossaryLink";

import type { IntroValues } from "./spec";

export const IntroEyebrow = ({
  findingYear,
}: Pick<IntroValues, "findingYear">) => (
  <Trans id="findings.HRVD.intro.eyebrow">Year {findingYear}</Trans>
);

export const IntroTitle = () => (
  <Trans id="findings.HRVD.intro.title">
    Apartment claimed exempt from rent stabilization
  </Trans>
);

export const IntroDescription = () => {
  const { _ } = useLingui();

  return (
    <Trans id="findings.HRVD.intro.description">
      Before HSTPA, the most common way to destabilize a unit was through{" "}
      <GlossaryLink
        term={_(msg`high rent vacancy destabilization.`)}
        modalTitle={_(msg`High rent vacancy destabilization`)}
      />{" "}
      We&apos;ll check whether this exemption from rent stabilization can be
      explained.
    </Trans>
  );
};

export const OcrHeading = () => (
  <Trans id="findings.HRVD.ocr.heading">
    First, let&apos;s make sure we are working with the right values
  </Trans>
);

type ResultCopyProps = {
  year: number;
};

export const ResultPotentialViolationBody = ({ year }: ResultCopyProps) => {
  const { _ } = useLingui();

  return (
    <Trans id="findings.HRVD.result.potential_violation.body">
      The destabilization in {year} does not appear to be explained by high rent
      vacancy. One of the only ways the apartment could have reached the{" "}
      <GlossaryLink
        term={_(msg`high rent vacancy destabilization.`)}
        modalTitle={_(msg`High rent vacancy destabilization`)}
      />{" "}
      threshold is through Individual Apartment Improvements (IAIs). Your report
      will include this with additional details.
    </Trans>
  );
};

export const ResultNoViolationBody = ({ year }: ResultCopyProps) => {
  const { _ } = useLingui();

  return (
    <Trans id="findings.HRVD.result.no_violation.body">
      The destabilization in {year} appears to be explained by{" "}
      <GlossaryLink
        term={_(msg`high rent vacancy destabilization.`)}
        modalTitle={_(msg`High rent vacancy destabilization`)}
      />{" "}
      The threshold appears to have been reached through the use of allowable
      bonuses. Your report will include this with additional details.
    </Trans>
  );
};

export const ResultDismissedBody = () => (
  <Trans id="findings.HRVD.result.dismissed.body">
    dismissed finding result copy TK
  </Trans>
);
