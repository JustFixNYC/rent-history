import classNames from "classnames";
import { Trans } from "@lingui/react/macro";

import {
  formatRegYearRange,
  type RentHistoryPageCardData,
} from "./pageCardUtils";

import "./RentHistoryPageCard.scss";

export type RentHistoryPageCardProps = {
  page: RentHistoryPageCardData;
  variant?: "default" | "retake";
  className?: string;
};

export const RentHistoryPageCard = ({
  page,
  variant = "default",
  className,
}: RentHistoryPageCardProps) => {
  const yearRange = formatRegYearRange(page.start_year, page.end_year);
  const testId = page.id
    ? `rent-history-page-card-${page.id}`
    : `rent-history-page-card-${page.s3_key}`;

  return (
    <article
      className={classNames(
        "rent-history-page-card",
        variant === "retake" && "rent-history-page-card--retake",
        className
      )}
      data-testid={testId}
    >
      {yearRange && (
        <h2 className="rent-history-page-card__title">{yearRange}</h2>
      )}
      <div className="rent-history-page-card__image-wrap">
        {page.imageUrl ? (
          <img
            className="rent-history-page-card__image"
            src={page.imageUrl}
            alt=""
          />
        ) : (
          <div
            className="rent-history-page-card__image-placeholder"
            aria-hidden="true"
          />
        )}
        {!page.imageUrl && (
          <span className="rent-history-page-card__sr-only">
            <Trans>Page scan preview</Trans>
          </span>
        )}
      </div>
    </article>
  );
};
