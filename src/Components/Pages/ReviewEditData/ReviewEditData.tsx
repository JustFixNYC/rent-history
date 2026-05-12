import { EmblaOptionsType } from "embla-carousel";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button } from "@justfixnyc/component-library";

import { useRhSessionScanBlobs } from "../../../hooks/useRhSessionScanBlobs";
import BlobImage from "../../EmblaCarousel/BlobImage";
import EmblaCarousel from "../../EmblaCarousel/EmblaCarousel";
import { EditableTable } from "../../EditableTable/EditableTable";

const REVIEW_CAROUSEL_OPTIONS: EmblaOptionsType = {};

const ReviewScansCarousel: React.FC = () => {
  const { _ } = useLingui();
  const { state, retry } = useRhSessionScanBlobs();

  if (state.status === "empty") {
    return null;
  }

  if (state.status === "loading") {
    return (
      <p role="status">
        <Trans>Loading scan previews…</Trans>
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <section aria-live="polite">
        <p role="alert">{state.message}</p>
        <Button
          labelText={_(msg`Retry`)}
          onClick={retry}
          variant="secondary"
        />
      </section>
    );
  }

  const slides = state.items.map((item, index) => (
    <BlobImage
      key={item.key}
      blobData={item.blob}
      alt={_(msg`Page ${index + 1} scan image`)}
    />
  ));

  return (
    <section className="review-scans">
      <h2>
        <Trans>Your scanned pages</Trans>
      </h2>
      <EmblaCarousel slides={slides} options={REVIEW_CAROUSEL_OPTIONS} />
    </section>
  );
};

export const ReviewEditData: React.FC = () => {
  return (
    <div id="home-page" className="page">
      <section className="page__hero">
        <h1>
          <Trans>Rent History Analyzer</Trans>
        </h1>
        <p>
          <Trans>Review and edit your rent history</Trans>
        </p>
      </section>
      <div className="page__content">
        <ReviewScansCarousel />
        <EditableTable />
      </div>
    </div>
  );
};
