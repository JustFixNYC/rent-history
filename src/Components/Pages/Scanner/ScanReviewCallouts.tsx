import { msg, plural } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
  Button,
  CalloutBox,
  Icon,
  InfoBox,
  LinkStyledButton,
} from "@justfixnyc/component-library";

import "./ScanReviewScreen.scss";

export const ScanReviewRescanSuccessInfo = () => (
  <InfoBox
    color="blue"
    role="status"
    className="scan-review-success-info"
    data-testid="scan-review-rescan-success"
  >
    <div className="scan-review-success-info__content">
      <Icon
        icon="check"
        className="scan-review-success-info__icon"
        aria-hidden="true"
      />
      <p className="scan-review-success-info__text">
        <Trans>Page(s) successfully scanned.</Trans>
      </p>
    </div>
  </InfoBox>
);

export const ScanReviewLaunchFailureInfo = () => (
  <InfoBox
    color="orange"
    role="alert"
    className="scan-review-launch-failure-info"
    data-testid="scan-review-launch-failure"
  >
    <Trans>Unable to open the scanner. Please try again.</Trans>
  </InfoBox>
);

export type ScanReviewUploadFailureInfoProps = {
  failedUploadCount: number;
  onAddMore: () => void;
};

export const ScanReviewUploadFailureInfo = ({
  failedUploadCount,
  onAddMore,
}: ScanReviewUploadFailureInfoProps) => {
  const { _ } = useLingui();
  const summary = _(
    plural(failedUploadCount, {
      one: "# page was not properly captured.",
      other: "# pages were not properly captured.",
    })
  );

  return (
    <InfoBox
      color="orange"
      role="alert"
      className="scan-review-launch-failure-info"
      data-testid="scan-review-upload-failure"
    >
      <p className="scan-review-launch-failure-info__text">
        {summary}{" "}
        <Trans>
          Please{" "}
          <LinkStyledButton
            className="scan-review-screen__add-page-link"
            onClick={onAddMore}
          >
            re-scan the missing{" "}
            {_(
              plural(failedUploadCount, {
                one: "page",
                other: "pages",
              })
            )}
          </LinkStyledButton>
          .
        </Trans>
      </p>
    </InfoBox>
  );
};

const ScanReviewAddMoreButton = ({ onAddMore }: { onAddMore: () => void }) => {
  const { _ } = useLingui();

  return (
    <Button
      className="scan-review-callout__add-more-button"
      variant="secondary"
      labelIcon="cameraRegular"
      labelText={_(msg`Add missing pages`)}
      onClick={onAddMore}
    />
  );
};

export type ScanReviewTopCalloutProps = {
  missingYearRanges: string[];
  processingComplete: boolean;
  onAddMore: () => void;
};

export const ScanReviewTopCallout = ({
  missingYearRanges,
  processingComplete,
  onAddMore,
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
        action={<ScanReviewAddMoreButton onAddMore={onAddMore} />}
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
  return (
    <CalloutBox
      className="scan-review-callout scan-review-callout--add-more"
      title={<Trans>Something missing?</Trans>}
      headingLevel={3}
      action={<ScanReviewAddMoreButton onAddMore={onAddMore} />}
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
