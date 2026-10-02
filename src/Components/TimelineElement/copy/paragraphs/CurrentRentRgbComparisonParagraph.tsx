import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";
import { StandardRgbIncreasesLink } from "../../../GlossaryLink/glossaryTerms";

type CurrentRentRgbComparisonParagraphProps = {
  comparisonYear: number;
  currentRent: number;
  maxRent: number;
  outcome: "exceeds" | "within";
};

export const CurrentRentRgbComparisonParagraph = ({
  comparisonYear,
  currentRent,
  maxRent,
  outcome,
}: CurrentRentRgbComparisonParagraphProps) => {
  const formattedCurrentRent = formatTimelineCurrency(currentRent);
  const formattedMaxRent = formatTimelineCurrency(maxRent);

  if (outcome === "within") {
    return (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.current_rent_rgb_comparison.within">
          Your current rent amount of {formattedCurrentRent} appears to be equal
          to or less than what your landlord may charge in year {comparisonYear}
          , based on <StandardRgbIncreasesLink /> ({formattedMaxRent}).
        </Trans>
      </div>
    );
  }

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.current_rent_rgb_comparison.exceeds">
        Your current rent amount of {formattedCurrentRent} appears to be more
        than what your landlord may charge in year {comparisonYear}, based on{" "}
        <StandardRgbIncreasesLink />* ({formattedMaxRent}).
      </Trans>
    </div>
  );
};

export const RgbIncreaseFootnote = () => (
  <p className="timeline-element__copy-footnote">
    <Trans id="timeline.copy.rgb_increase_footnote">
      *percentage increases based on 1-year leases
    </Trans>
  </p>
);
