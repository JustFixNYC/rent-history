import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { Button, Pill } from "@justfixnyc/component-library";

import {
  ScanReviewMode,
  type ScanReviewMode as ScanReviewModeType,
} from "./scanReviewModes";

export type ScanReviewRegYearErrorCalloutProps = {
  regYearRanges: string[];
  flowMode:
    | typeof ScanReviewMode.warningOnly
    | typeof ScanReviewMode.errorsAndWarning;
  isRescanPending?: boolean;
  rescanError?: string | null;
  onRescan: () => void;
};

function formatRangesForInstruction(
  ranges: string[],
  conjunction: string
): string {
  if (ranges.length === 0) return "";
  if (ranges.length === 1) return ranges[0];
  if (ranges.length === 2) return `${ranges[0]} ${conjunction} ${ranges[1]}`;
  const head = ranges.slice(0, -1).join(", ");
  return `${head}, ${conjunction} ${ranges[ranges.length - 1]}`;
}

export function mergeRegYearCalloutRanges(
  pageErrorRanges: string[] | undefined,
  missingRanges: string[] | undefined
): string[] {
  return [...(pageErrorRanges ?? []), ...(missingRanges ?? [])];
}

export const ScanReviewRegYearErrorCallout = ({
  regYearRanges,
  flowMode,
  isRescanPending = false,
  rescanError = null,
  onRescan,
}: ScanReviewRegYearErrorCalloutProps) => {
  const { _ } = useLingui();

  if (regYearRanges.length === 0) {
    return null;
  }

  const rangesPhrase = formatRangesForInstruction(regYearRanges, _(msg`and`));

  return (
    <section
      className="scan-review-reg-year-error-callout"
      aria-labelledby="scan-review-reg-year-error-callout-heading"
      data-testid="scan-review-reg-year-error-callout"
      data-flow-mode={flowMode as ScanReviewModeType}
    >
      <Pill
        color="orange"
        className="scan-review-reg-year-error-callout__badge"
      >
        <Trans>Needs re-scan</Trans>
      </Pill>
      <ul
        id="scan-review-reg-year-error-callout-heading"
        className="scan-review-reg-year-error-callout__labels"
      >
        {regYearRanges.map((range) => (
          <li key={range}>
            <strong>{range}</strong>
          </li>
        ))}
      </ul>
      <p className="scan-review-reg-year-error-callout__instruction">
        <Trans>
          Find the page(s) in your document covering{" "}
          <strong>{rangesPhrase}</strong> and re-scan in full.
        </Trans>
      </p>
      {rescanError ? (
        <p
          className="scan-review-reg-year-error-callout__rescan-error"
          role="alert"
          data-testid="scan-review-reg-year-rescan-error"
        >
          {rescanError}
        </p>
      ) : null}
      <Button
        className="scan-review-reg-year-error-callout__cta"
        labelIcon="cameraRegular"
        labelText={_(msg`Re-scan for these years`)}
        onClick={onRescan}
        disabled={isRescanPending}
      />
    </section>
  );
};
