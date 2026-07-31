import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";

type InvestigateIaiCostsParagraphProps = {
  iaiAmount: number;
};

export const InvestigateIaiCostsParagraph = ({
  iaiAmount,
}: InvestigateIaiCostsParagraphProps) => {
  const formattedAmount = formatTimelineCurrency(iaiAmount);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.investigate_iai_costs">
        You may need to investigate further as to any alleged IAIs your landlord
        may have performed. Your landlord would have to prove a total of{" "}
        {formattedAmount} in IAI costs.
      </Trans>
    </div>
  );
};
