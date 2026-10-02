import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";

type LegalRentInLastRegYearParagraphProps = {
  lastRegYear: number;
  amount: number;
};

/** Pre-HSTPA same-tenant step: legal rent in the last registered year. */
export const LegalRentInLastRegYearParagraph = ({
  lastRegYear,
  amount,
}: LegalRentInLastRegYearParagraphProps) => {
  const formattedAmount = formatTimelineCurrency(amount);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.legal_rent_in_last_reg_year">
        The legal rent listed for {lastRegYear}, the last year of registration,
        was {formattedAmount}.
      </Trans>
    </div>
  );
};
