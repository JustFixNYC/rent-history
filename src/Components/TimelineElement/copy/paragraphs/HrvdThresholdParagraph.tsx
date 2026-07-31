import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";
import { HrvdLink } from "../../../GlossaryLink/glossaryTerms";

type HrvdThresholdParagraphProps = {
  year: number;
  maxRent: number;
  threshold: number;
  outcome: "met" | "not_met";
};

export const HrvdThresholdParagraph = ({
  year,
  maxRent,
  threshold,
  outcome,
}: HrvdThresholdParagraphProps) => {
  const maxFormatted = formatTimelineCurrency(maxRent);
  const thresholdFormatted = formatTimelineCurrency(threshold);

  if (outcome === "met") {
    return (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.hrvd_threshold.met">
          The maximum the landlord was allowed to charge in year {year} (
          {maxFormatted}) meets the <HrvdLink /> threshold of{" "}
          {thresholdFormatted}.
        </Trans>
      </div>
    );
  }

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.hrvd_threshold.not_met">
        The maximum the landlord was allowed to charge in year {year} (
        {maxFormatted}) did not reach the <HrvdLink /> threshold of{" "}
        {thresholdFormatted}.
      </Trans>
    </div>
  );
};
