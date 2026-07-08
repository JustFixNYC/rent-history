import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Icon, LinkStyledButton } from "@justfixnyc/component-library";

import { FlowNav } from "../../FlowNav";

import {
  ScanReviewAddMoreCallout,
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
  onRescanPage: (id: number) => void;
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
  onRescanPage,
  onRestart,
  onNext,
  onAddMore,
  nextDisabled = false,
}: ScanReviewScreenProps) => {
  const { _ } = useLingui();

  const rescanPages = pages.filter((page) => page.needs_retake);
  const reviewPages = pages.filter((page) => !page.needs_retake);

  const handleRescanPages = () => {
    rescanPages.forEach((page) => {
      onRescanPage(page.id);
    });
  };

  return (
    <div className="scan-review-screen" aria-live="polite">
      <div className="scan-review-screen__content">
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

            <ScanReviewAddMoreCallout onAddMore={onAddMore} />
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
