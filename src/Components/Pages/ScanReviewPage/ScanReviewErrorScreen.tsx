import { msg, plural } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button } from "@justfixnyc/component-library";

import { ScanReviewRescanCallout } from "./ScanReviewRescanCallout";
import type { ScanReviewPartialPageErrorsState } from "./scanReviewScreenState";

import "./ScanReviewScreen.scss";

export type ScanReviewErrorLabelVariant = "page" | "reg_year";

export type ScanReviewErrorScreenProps = {
  screenState: ScanReviewPartialPageErrorsState;
  labelVariant?: ScanReviewErrorLabelVariant;
  isRescanPending?: boolean;
  rescanError?: string | null;
  onPartialRescan: () => void;
};

export const ScanReviewErrorScreen = ({
  screenState,
  labelVariant = "page",
  isRescanPending = false,
  rescanError = null,
  onPartialRescan,
}: ScanReviewErrorScreenProps) => {
  const { _ } = useLingui();

  const pageCount = screenState.labels.length;
  const isRegYear = labelVariant === "reg_year";

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
        <ScanReviewRescanCallout
          labels={screenState.labels}
          variant={isRegYear ? "year_coverage" : "page_marker"}
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
          labelText={
            isRegYear
              ? _(msg`Re-scan for these years`)
              : _(
                  plural(pageCount, {
                    one: "Re-scan this page",
                    other: "Re-scan these pages",
                  })
                )
          }
          onClick={onPartialRescan}
          disabled={isRescanPending}
        />
      </div>
    </div>
  );
};
