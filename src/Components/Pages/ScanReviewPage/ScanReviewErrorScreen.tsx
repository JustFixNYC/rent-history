import { plural } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, Icon } from "@justfixnyc/component-library";

import { ScanReviewPageErrorCallout } from "./ScanReviewPageErrorCallout";
import type { ScanReviewPartialPageErrorsState } from "./scanReviewScreenState";

import "./ScanReviewScreen.scss";

export type ScanReviewErrorScreenProps = {
  screenState: ScanReviewPartialPageErrorsState;
  isLoading?: boolean;
  isRescanPending?: boolean;
  rescanError?: string | null;
  onPartialRescan: () => void;
};

export const ScanReviewErrorScreen = ({
  screenState,
  isLoading = false,
  isRescanPending = false,
  rescanError = null,
  onPartialRescan,
}: ScanReviewErrorScreenProps) => {
  const { _ } = useLingui();

  if (isLoading) {
    return (
      <div className="scan-review-error-screen" aria-live="polite">
        <div
          className="scan-review-error-screen__loading"
          role="status"
          data-testid="scan-review-loading"
        >
          <Icon icon="spinner" aria-hidden="true" />
          <p className="scan-review-error-screen__loading-text">
            <Trans>Loading scan status…</Trans>
          </p>
        </div>
      </div>
    );
  }

  const pageCount = screenState.pages.length;

  return (
    <div
      className="scan-review-error-screen"
      data-testid="scan-review-partial-error"
      aria-live="polite"
    >
      <div className="scan-review-error-screen__content">
        <h2 className="scan-review-error-screen__title">
          <Trans>
            We weren&apos;t able to capture all of your rent history.
          </Trans>
        </h2>
        <ScanReviewPageErrorCallout
          pages={screenState.pages}
          documentTotalPages={screenState.documentTotalPages}
        />
        {rescanError ? (
          <p
            className="scan-review-error-screen__rescan-error"
            role="alert"
            data-testid="scan-review-rescan-error"
          >
            {rescanError}
          </p>
        ) : null}
        <Button
          className="scan-review-error-screen__cta"
          labelIcon="cameraRegular"
          labelText={_(
            plural(pageCount, {
              one: "Re-scan this page",
              other: "Re-scan these pages",
            })
          )}
          onClick={onPartialRescan}
          disabled={isRescanPending}
        />
      </div>
    </div>
  );
};
