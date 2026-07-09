import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
  CalloutBox,
  Icon,
  LinkStyledButton,
} from "@justfixnyc/component-library";

import { FlowNav } from "../../FlowNav";

import {
  ScanReviewAddMoreCallout,
  ScanReviewRescanSuccessInfo,
  ScanReviewTopCallout,
} from "./ScanReviewCallouts";
import { ScanReviewPageCard, type ScanReviewPage } from "./ScanReviewPageCard";
import { ScanReviewRetakeGroup } from "./ScanReviewRetakeGroup";

import "./ScanReviewScreen.scss";

export type ScanReviewScreenProps = {
  pages: ScanReviewPage[];
  missingYearRanges: string[];
  processingComplete: boolean;
  isLoading: boolean;
  showRescanSuccess?: boolean;
  reviewError?: string | null;
  onRescanPages: (ids: number[]) => void;
  onRestart: () => void;
  onNext: () => void;
  onAddMore: () => void;
  nextDisabled?: boolean;
};

export const ScanReviewScreen = ({
  pages,
  missingYearRanges,
  processingComplete,
  isLoading,
  showRescanSuccess = false,
  reviewError = null,
  onRescanPages,
  onRestart,
  onNext,
  onAddMore,
  nextDisabled = false,
}: ScanReviewScreenProps) => {
  const { _ } = useLingui();

  const rescanPages = pages.filter((page) => page.needs_retake);
  const reviewPages = pages.filter((page) => !page.needs_retake);

  const handleRescanPages = () => {
    onRescanPages(rescanPages.map((page) => page.id));
  };

  return (
    <div className="scan-review-screen" aria-live="polite">
      <div className="scan-review-screen__content">
        {showRescanSuccess && <ScanReviewRescanSuccessInfo />}

        <div className="scan-review-screen__intro">
          <p className="scan-review-screen__intro-text">
            <Trans>
              Before we analyze your rent history, let&apos;s make sure we have
              all pages of your rent history.
            </Trans>
          </p>
          <p className="scan-review-screen__intro-text">
            <Trans>
              If any pages are missing, you can{" "}
              <LinkStyledButton
                className="scan-review-screen__add-page-link"
                onClick={onAddMore}
              >
                add a page
              </LinkStyledButton>
              .
            </Trans>
          </p>
        </div>

        {reviewError && (
          <CalloutBox
            className="scan-review-callout scan-review-callout--error"
            title={<Trans>Unable to load scan review</Trans>}
            headingLevel={3}
          >
            <p>{reviewError}</p>
          </CalloutBox>
        )}

        {isLoading ? (
          <div
            className="scan-review-screen__loading"
            role="status"
            data-testid="scan-review-loading"
          >
            <Icon icon="spinner" aria-hidden="true" />
            <p className="scan-review-screen__loading-text">
              <Trans>Processing your scanned pages…</Trans>
            </p>
          </div>
        ) : (
          <>
            <ScanReviewTopCallout
              missingYearRanges={missingYearRanges}
              processingComplete={processingComplete}
              onAddMore={onAddMore}
            />

            <div className="scan-review-screen__page-list">
              {rescanPages.length > 0 && (
                <ScanReviewRetakeGroup
                  pages={rescanPages}
                  onRescanClick={handleRescanPages}
                />
              )}

              {reviewPages.map((page) => (
                <ScanReviewPageCard key={page.id} page={page} />
              ))}
            </div>

            {missingYearRanges.length === 0 && (
              <ScanReviewAddMoreCallout onAddMore={onAddMore} />
            )}
          </>
        )}
      </div>

      <FlowNav
        onBack={onRestart}
        onNext={onNext}
        backLabel={_(msg`Restart scan`)}
        nextDisabled={isLoading || nextDisabled}
        nextLabel={_(msg`Next`)}
        ariaLabel={_(msg`Scan review navigation`)}
      />
    </div>
  );
};
