import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";

type LegalRentLastRegYearParagraphProps = {
  lastRegYear: number;
  amount: number;
};

export const LegalRentLastRegYearParagraph = ({
  lastRegYear,
  amount,
}: LegalRentLastRegYearParagraphProps) => {
  const formattedAmount = formatTimelineCurrency(amount);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.legal_rent_last_reg_year">
        The legal rent listed for the last year of registration, {lastRegYear},
        was {formattedAmount}.
      </Trans>
    </div>
  );
};
