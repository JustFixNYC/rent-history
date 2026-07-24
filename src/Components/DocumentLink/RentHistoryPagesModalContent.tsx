import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, Icon } from "@justfixnyc/component-library";

import { RentHistoryPageCard } from "../RentHistoryPageCard/RentHistoryPageCard";
import { useRentHistoryDocumentPages } from "../../hooks/useRentHistoryDocumentPages";

import "./RentHistoryPagesModalContent.scss";

export type RentHistoryPagesModalContentProps = {
  enabled: boolean;
};

export const RentHistoryPagesModalContent = ({
  enabled,
}: RentHistoryPagesModalContentProps) => {
  const { _ } = useLingui();
  const { pages, isLoading, error, retry } = useRentHistoryDocumentPages({
    enabled,
  });

  if (isLoading) {
    return (
      <div
        className="document-pages-modal__loading"
        role="status"
        data-testid="document-pages-modal-loading"
      >
        <Icon icon="spinner" aria-hidden="true" />
        <p className="document-pages-modal__loading-text">
          <Trans>Loading your rent history pages…</Trans>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="document-pages-modal"
        data-testid="document-pages-modal-error"
      >
        <p className="document-pages-modal__error" role="alert">
          {error}
        </p>
        <Button labelText={_(msg`Retry`)} onClick={retry} variant="secondary" />
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <p
        className="document-pages-modal__error"
        data-testid="document-pages-modal-empty"
      >
        <Trans>No rent history pages are available yet.</Trans>
      </p>
    );
  }

  return (
    <div
      className="document-pages-modal"
      data-testid="document-pages-modal-content"
    >
      <div className="document-pages-modal__page-list">
        {pages.map((page) => (
          <RentHistoryPageCard key={page.s3_key} page={page} />
        ))}
      </div>
    </div>
  );
};
