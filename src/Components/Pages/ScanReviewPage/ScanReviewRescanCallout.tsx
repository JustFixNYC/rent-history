import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { Button, Pill } from "@justfixnyc/component-library";

import {
  ScanReviewMode,
  type ScanReviewMode as ScanReviewModeType,
} from "./scanReviewModes";

export type ScanReviewRescanCalloutVariant = "page_marker" | "year_coverage";

export type ScanReviewRescanCalloutProps = {
  labels: string[];
  variant: ScanReviewRescanCalloutVariant;
  flowMode?: typeof ScanReviewMode.warningOnly;
  isRescanPending?: boolean;
  rescanError?: string | null;
  onRescan?: () => void;
};

export function formatLabelsForInstruction(
  labels: string[],
  conjunction: string
): string {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} ${conjunction} ${labels[1]}`;
  const head = labels.slice(0, -1).join(", ");
  return `${head}, ${conjunction} ${labels[labels.length - 1]}`;
}

export const ScanReviewRescanCallout = ({
  labels,
  variant,
  flowMode = ScanReviewMode.warningOnly,
  isRescanPending = false,
  rescanError = null,
  onRescan,
}: ScanReviewRescanCalloutProps) => {
  const { _ } = useLingui();

  if (labels.length === 0) {
    return null;
  }

  const labelsPhrase = formatLabelsForInstruction(labels, _(msg`and`));
  const isYearCoverage = variant === "year_coverage";

  return (
    <section
      className={
        isYearCoverage
          ? "scan-review-reg-year-error-callout"
          : "scan-review-page-error-callout"
      }
      aria-labelledby={
        isYearCoverage
          ? "scan-review-reg-year-error-callout-heading"
          : "scan-review-page-error-callout-heading"
      }
      data-testid={
        isYearCoverage
          ? "scan-review-reg-year-error-callout"
          : "scan-review-page-error-callout"
      }
      {...(isYearCoverage
        ? { "data-flow-mode": flowMode as ScanReviewModeType }
        : {})}
    >
      <Pill
        color="orange"
        className={
          isYearCoverage
            ? "scan-review-reg-year-error-callout__badge"
            : "scan-review-page-error-callout__badge"
        }
      >
        <Trans>Needs re-scan</Trans>
      </Pill>
      <ul
        id={
          isYearCoverage
            ? "scan-review-reg-year-error-callout-heading"
            : "scan-review-page-error-callout-heading"
        }
        className={
          isYearCoverage
            ? "scan-review-reg-year-error-callout__labels"
            : "scan-review-page-error-callout__labels"
        }
      >
        {labels.map((label) => (
          <li key={label}>
            <strong>{label}</strong>
          </li>
        ))}
      </ul>
      <p
        className={
          isYearCoverage
            ? "scan-review-reg-year-error-callout__instruction"
            : "scan-review-page-error-callout__instruction"
        }
      >
        {isYearCoverage ? (
          <Trans>
            Find the page(s) in your document covering{" "}
            <strong>{labelsPhrase}</strong> and re-scan in full.
          </Trans>
        ) : (
          <Trans>
            Find the page(s) in your document marked{" "}
            <strong>{labelsPhrase}</strong> at the bottom left corner and
            re-scan in full.
          </Trans>
        )}
      </p>
      {isYearCoverage && rescanError ? (
        <p
          className="scan-review-reg-year-error-callout__rescan-error"
          role="alert"
          data-testid="scan-review-reg-year-rescan-error"
        >
          {rescanError}
        </p>
      ) : null}
      {isYearCoverage && onRescan ? (
        <Button
          className="scan-review-reg-year-error-callout__cta"
          labelIcon="cameraRegular"
          labelText={_(msg`Re-scan for these years`)}
          onClick={onRescan}
          disabled={isRescanPending}
        />
      ) : null}
    </section>
  );
};
