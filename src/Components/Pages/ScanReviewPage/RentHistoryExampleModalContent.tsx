import { Trans } from "@lingui/react/macro";

import "./RentHistoryExampleModalContent.scss";

const EXAMPLE_PAGE_COUNT = 3;

export const RentHistoryExampleModalContent = () => (
  <div
    className="rent-history-example-modal"
    data-testid="rent-history-example-modal-content"
  >
    <p className="rent-history-example-modal__intro">
      <Trans>
        A DHCR rent registration printout is usually several pages long. Each
        page should show <strong>Page N of M</strong> in the bottom left corner,
        like the examples below.
      </Trans>
    </p>
    <div className="rent-history-example-modal__page-list">
      {Array.from({ length: EXAMPLE_PAGE_COUNT }, (_, index) => {
        const pageNumber = index + 1;
        return (
          <div
            key={pageNumber}
            className="rent-history-example-modal__page-placeholder"
            data-testid={`rent-history-example-page-${pageNumber}`}
          >
            <p className="rent-history-example-modal__page-label">
              <Trans>Example page {pageNumber}</Trans>
            </p>
            <p className="rent-history-example-modal__page-placeholder-text">
              <Trans>
                Placeholder — example rent history image will appear here.
              </Trans>
            </p>
          </div>
        );
      })}
    </div>
  </div>
);
