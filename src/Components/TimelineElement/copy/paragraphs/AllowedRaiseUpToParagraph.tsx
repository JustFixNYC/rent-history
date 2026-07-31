import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";

type AllowedRaiseUpToParagraphProps = {
  year: number;
  amount: number;
  /** "increase" → "With this increase"; "additions" → "With these additions" */
  lead: "increase" | "additions";
};

export const AllowedRaiseUpToParagraph = ({
  year,
  amount,
  lead,
}: AllowedRaiseUpToParagraphProps) => {
  const formattedAmount = formatTimelineCurrency(amount);

  if (lead === "additions") {
    return (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.allowed_raise.additions">
          With these additions, the landlord was allowed to raise the rent in
          year {year} up to {formattedAmount}.
        </Trans>
      </div>
    );
  }

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.allowed_raise.increase">
        With this increase, the landlord was allowed to raise the rent in year{" "}
        {year} up to {formattedAmount}.
      </Trans>
    </div>
  );
};
