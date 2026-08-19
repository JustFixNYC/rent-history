import { useState } from "react";
import { plural } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";
import { Button, Icon, LinkStyledButton } from "@justfixnyc/component-library";

import { InfoModal } from "../../InfoModal/InfoModal";
import { getDhcrRentHistoryRequestUrl } from "./scanReviewExternalLinks";
import { RentHistoryExampleModalContent } from "./RentHistoryExampleModalContent";
import { ScanReviewPageErrorCallout } from "./ScanReviewPageErrorCallout";
import type { ScanReviewErrorState } from "./scanReviewErrorState";

import "./ScanReviewScreen.scss";

export type ScanReviewErrorScreenProps = {
  errorState: ScanReviewErrorState;
  isLoading?: boolean;
  onPartialRescan: () => void;
  onTotalRescan: () => void;
};

export const ScanReviewErrorScreen = ({
  errorState,
  isLoading = false,
  onPartialRescan,
  onTotalRescan,
}: ScanReviewErrorScreenProps) => {
  const { _, i18n } = useLingui();
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);

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

  if (errorState.kind === "partial") {
    const pageCount = errorState.pages.length;

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
            pages={errorState.pages}
            documentTotalPages={errorState.documentTotalPages}
          />
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
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="scan-review-error-screen"
        data-testid="scan-review-total-error"
        aria-live="polite"
      >
        <div className="scan-review-error-screen__content">
          <h2 className="scan-review-error-screen__title">
            <Trans>We weren&apos;t able to read your document</Trans>
          </h2>
          <p className="scan-review-error-screen__body">
            <Trans>
              Your rent history document should be a registration printout from
              the Division of Housing and Community Renewal (DHCR). If you
              don&apos;t have one, you can request it from DHCR before scanning
              again.
            </Trans>
          </p>
          <p className="scan-review-error-screen__example-link">
            <LinkStyledButton
              className="scan-review-error-screen__example-link-button"
              onClick={() => setIsExampleModalOpen(true)}
              aria-haspopup="dialog"
            >
              <Trans>See an example</Trans>
            </LinkStyledButton>
          </p>
          <div className="scan-review-error-screen__actions">
            <Button
              className="scan-review-error-screen__cta"
              labelIcon="cameraRegular"
              labelText={_(msg`Re-scan document`)}
              onClick={onTotalRescan}
            />
            <Button
              className="scan-review-error-screen__cta scan-review-error-screen__cta--secondary"
              variant="secondary"
              labelText={_(msg`Request your rent history`)}
              onClick={() => {
                window.open(
                  getDhcrRentHistoryRequestUrl(i18n.locale),
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            />
          </div>
        </div>
      </div>
      <InfoModal
        isOpen={isExampleModalOpen}
        title={_(msg`Example rent history`)}
        onClose={() => setIsExampleModalOpen(false)}
      >
        {isExampleModalOpen ? <RentHistoryExampleModalContent /> : null}
      </InfoModal>
    </>
  );
};
