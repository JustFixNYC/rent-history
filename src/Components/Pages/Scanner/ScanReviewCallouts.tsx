import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, CalloutBox } from "@justfixnyc/component-library";

import "./ScanReviewScreen.scss";

export type ScanReviewTopCalloutProps = {
  missingYearRanges: string[];
  processingComplete: boolean;
};

export const ScanReviewTopCallout = ({
  missingYearRanges,
  processingComplete,
}: ScanReviewTopCalloutProps) => {
  const hasGapError = missingYearRanges.length > 0;
  const hasProcessingWarning = !processingComplete;

  if (!hasGapError && !hasProcessingWarning) {
    return null;
  }

  if (hasGapError) {
    const rangesLabel = missingYearRanges.join(", ");

    return (
      <CalloutBox
        className="scan-review-callout scan-review-callout--error"
        title={<Trans>Missing registration years</Trans>}
        headingLevel={3}
      >
        <p>
          <Trans>
            Your scanned pages are missing registration years:{" "}
            <strong>{rangesLabel}</strong>. Add or re-scan pages to fill the
            gaps before continuing.
          </Trans>
        </p>
      </CalloutBox>
    );
  }

  return (
    <CalloutBox
      className="scan-review-callout scan-review-callout--warning"
      title={<Trans>Still processing pages</Trans>}
      headingLevel={3}
    >
      <p>
        <Trans>
          We are still processing some of your scanned pages. You can continue
          with the pages we have so far, or wait for processing to finish.
        </Trans>
      </p>
    </CalloutBox>
  );
};

export type ScanReviewAddMoreCalloutProps = {
  onAddMore: () => void;
};

export const ScanReviewAddMoreCallout = ({
  onAddMore,
}: ScanReviewAddMoreCalloutProps) => {
  const { _ } = useLingui();

  return (
    <CalloutBox
      className="scan-review-callout scan-review-callout--add-more"
      title={<Trans>Something missing?</Trans>}
      headingLevel={3}
      action={
        <Button
          className="scan-review-callout__add-more-button"
          variant="secondary"
          labelIcon="cameraRegular"
          labelText={_(msg`Add missing pages`)}
          onClick={onAddMore}
        />
      }
    >
      <p>
        <Trans>
          If it seems like any pages are missing, you can add them now by
          scanning.
        </Trans>
      </p>
    </CalloutBox>
  );
};
