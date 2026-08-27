import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";
import { StandardRgbIncreasesLink } from "../../../GlossaryLink/glossaryTerms";

type RgbProjectionParagraphProps = {
  comparisonYear: number;
  maxRent: number;
};

export const RgbProjectionParagraph = ({
  comparisonYear,
  maxRent,
}: RgbProjectionParagraphProps) => {
  const formattedAmount = formatTimelineCurrency(maxRent);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.rgb_projection">
        Based on the <StandardRgbIncreasesLink />, the rent could have reached{" "}
        {formattedAmount} in year {comparisonYear}.
      </Trans>
    </div>
  );
};
