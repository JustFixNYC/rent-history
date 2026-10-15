import { Trans } from "@lingui/react/macro";

import { DocumentLink } from "../../../DocumentLink/DocumentLink";

export const OcrConfirmHeading = () => (
  <Trans id="findings.ocr_confirm.heading">
    First, let&apos;s confirm we have the correct information
  </Trans>
);

type OcrConfirmIntroProps = {
  years: number[];
};

export const OcrConfirmIntro = ({ years }: OcrConfirmIntroProps) => {
  if (years.length === 0) {
    return (
      <p className="ocr-confirm-step__intro">
        <Trans id="findings.ocr_confirm.intro.no_years">
          Check <DocumentLink />. Does what you see match what&apos;s below? If
          not, please update below.
        </Trans>
      </p>
    );
  }

  if (years.length === 1) {
    return (
      <p className="ocr-confirm-step__intro">
        <Trans id="findings.ocr_confirm.intro.one_year">
          Check <DocumentLink />. Does what you see in {years[0]} match
          what&apos;s below? If not, please update below.
        </Trans>
      </p>
    );
  }

  if (years.length === 2) {
    return (
      <p className="ocr-confirm-step__intro">
        <Trans id="findings.ocr_confirm.intro.two_years">
          Check <DocumentLink />. Does what you see in {years[0]} and {years[1]}{" "}
          match what&apos;s below? If not, please update below.
        </Trans>
      </p>
    );
  }

  const lastYear = years[years.length - 1];
  const leadingYears = years.slice(0, -1).join(", ");

  return (
    <p className="ocr-confirm-step__intro">
      <Trans id="findings.ocr_confirm.intro.many_years">
        Check <DocumentLink />. Does what you see in {leadingYears}, and{" "}
        {lastYear} match what&apos;s below? If not, please update below.
      </Trans>
    </p>
  );
};
