import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";

import { Pill } from "@justfixnyc/component-library";

import type { RhPageRescanInfo } from "../../../api/account/types";
import { formatPageRescanLabel } from "./scanReviewScreenState";

import "./ScanReviewScreen.scss";

export type ScanReviewPageErrorCalloutProps = {
  pages: RhPageRescanInfo[];
  documentTotalPages: number | null;
};

function formatLabelsForInstruction(
  labels: string[],
  conjunction: string
): string {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} ${conjunction} ${labels[1]}`;
  const head = labels.slice(0, -1).join(", ");
  return `${head}, ${conjunction} ${labels[labels.length - 1]}`;
}

export const ScanReviewPageErrorCallout = ({
  pages,
  documentTotalPages,
}: ScanReviewPageErrorCalloutProps) => {
  const { _ } = useLingui();

  const labels = pages.flatMap((page) => {
    const label = formatPageRescanLabel(page, documentTotalPages);
    return label ? [label] : [];
  });

  if (labels.length === 0) {
    return null;
  }

  const labelsPhrase = formatLabelsForInstruction(labels, _(msg`and`));

  return (
    <section
      className="scan-review-page-error-callout"
      aria-labelledby="scan-review-page-error-callout-heading"
      data-testid="scan-review-page-error-callout"
    >
      <Pill color="orange" className="scan-review-page-error-callout__badge">
        <Trans>Needs re-scan</Trans>
      </Pill>
      <ul
        id="scan-review-page-error-callout-heading"
        className="scan-review-page-error-callout__labels"
      >
        {labels.map((label) => (
          <li key={label}>
            <strong>{label}</strong>
          </li>
        ))}
      </ul>
      <p className="scan-review-page-error-callout__instruction">
        <Trans>
          Find the page(s) in your document marked{" "}
          <strong>{labelsPhrase}</strong> at the bottom left corner and re-scan
          in full.
        </Trans>
      </p>
    </section>
  );
};
