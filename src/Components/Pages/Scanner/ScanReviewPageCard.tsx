import classNames from "classnames";
import { Trans } from "@lingui/react/macro";

import type { RhPageSummary } from "../../../api/account/types";

import { formatRegYearRange } from "./scanReviewUtils";

import "./ScanReviewScreen.scss";

export type ScanReviewPage = RhPageSummary & {
  imageUrl?: string | null;
};

export type ScanReviewPageCardProps = {
  page: ScanReviewPage;
  variant?: "default" | "retake";
  className?: string;
};

export const ScanReviewPageCard = ({
  page,
  variant = "default",
  className,
}: ScanReviewPageCardProps) => {
  const yearRange = formatRegYearRange(page.start_year, page.end_year);

  return (
    <article
      className={classNames(
        "scan-review-page-card",
        variant === "retake" && "scan-review-page-card--retake",
        className
      )}
      data-testid={`scan-review-page-card-${page.id}`}
    >
      {yearRange && (
        <h2 className="scan-review-page-card__title">{yearRange}</h2>
      )}
      <div className="scan-review-page-card__image-wrap">
        {page.imageUrl ? (
          <img
            className="scan-review-page-card__image"
            src={page.imageUrl}
            alt=""
          />
        ) : (
          <div
            className="scan-review-page-card__image-placeholder"
            aria-hidden="true"
          />
        )}
        {!page.imageUrl && (
          <span className="scan-review-page-card__sr-only">
            <Trans>Page scan preview</Trans>
          </span>
        )}
      </div>
    </article>
  );
};
