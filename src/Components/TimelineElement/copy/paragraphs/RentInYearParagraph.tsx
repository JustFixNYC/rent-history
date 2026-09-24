import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";
import type { TimelineRentKind } from "../../types";

type RentInYearParagraphProps = {
  rentKind: TimelineRentKind;
  year: number;
  amount: number;
};

export const RentInYearParagraph = ({
  rentKind,
  year,
  amount,
}: RentInYearParagraphProps) => {
  const formattedAmount = formatTimelineCurrency(amount);

  if (rentKind === "preferential") {
    return (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.rent_in_year.preferential">
          The preferential rent in year {year} was {formattedAmount}.
        </Trans>
      </div>
    );
  }

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.rent_in_year.legal">
        The legal regulated rent in year {year} was {formattedAmount}.
      </Trans>
    </div>
  );
};
