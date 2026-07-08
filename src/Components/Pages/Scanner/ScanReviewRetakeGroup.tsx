import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, Pill } from "@justfixnyc/component-library";

import { ScanReviewPageCard, type ScanReviewPage } from "./ScanReviewPageCard";

import "./ScanReviewScreen.scss";

export type ScanReviewRetakeGroupProps = {
  pages: ScanReviewPage[];
  onRescanClick: () => void;
};

export const ScanReviewRetakeGroup = ({
  pages,
  onRescanClick,
}: ScanReviewRetakeGroupProps) => {
  const { _ } = useLingui();

  if (pages.length === 0) {
    return null;
  }

  return (
    <section
      className="scan-review-retake-group"
      aria-labelledby="scan-review-retake-heading"
      data-testid="scan-review-retake-group"
    >
      <Pill color="orange" className="scan-review-retake-group__badge">
        <Trans>Needs re-scan</Trans>
      </Pill>
      <p
        id="scan-review-retake-heading"
        className="scan-review-retake-group__message"
      >
        <Trans>
          We had some trouble reading the scan of the following pages:
        </Trans>
      </p>
      <div className="scan-review-retake-group__pages">
        {pages.map((page) => (
          <ScanReviewPageCard key={page.id} page={page} variant="retake" />
        ))}
      </div>
      <Button
        className="scan-review-retake-group__cta"
        labelIcon="cameraRegular"
        labelText={_(msg`Re-scan these pages`)}
        onClick={onRescanClick}
      />
    </section>
  );
};
