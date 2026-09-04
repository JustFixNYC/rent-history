import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";
import { StandardRgbIncreasesLink } from "../../../GlossaryLink/glossaryTerms";

type ReportedRentRgbProjectionParagraphProps = {
  reportedYear: number;
  maxRent: number;
};

export const ReportedRentRgbProjectionParagraph = ({
  reportedYear,
  maxRent,
}: ReportedRentRgbProjectionParagraphProps) => {
  const formattedAmount = formatTimelineCurrency(maxRent);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.reported_rent_rgb_projection">
        Based on the <StandardRgbIncreasesLink />, the rent could have reached{" "}
        {formattedAmount} in {reportedYear}.
      </Trans>
    </div>
  );
};

type ReportedRentRgbComparisonParagraphProps = {
  reportedYear: number;
  reportedRent: number;
  outcome: "exceeds" | "within";
};

export const ReportedRentRgbComparisonParagraph = ({
  reportedYear,
  reportedRent,
  outcome,
}: ReportedRentRgbComparisonParagraphProps) => {
  const formattedReportedRent = formatTimelineCurrency(reportedRent);

  if (outcome === "within") {
    return (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.reported_rent_rgb_comparison.within">
          The rent amount you reported for {reportedYear}, appears to be equal
          to or less than what the rent could have reached in {reportedYear},
          based on standard RGB increases*.
        </Trans>
      </div>
    );
  }

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.reported_rent_rgb_comparison.exceeds">
        The rent amount you reported for {reportedYear}, appears to be more than
        what the rent could have reached in {reportedYear}, based on standard
        RGB increases*.
      </Trans>
    </div>
  );
};

type NonregStabilizedDespiteMissingRegParagraphProps = {
  reportedYear: number;
  reportedRent: number;
};

export const NonregStabilizedDespiteMissingRegParagraph = ({
  reportedYear,
  reportedRent,
}: NonregStabilizedDespiteMissingRegParagraphProps) => {
  const formattedReportedRent = formatTimelineCurrency(reportedRent);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.nonreg_stabilized_despite_missing_reg">
        The rent amount of {formattedReportedRent} in {reportedYear} suggests
        that the apartment was being treated as rent stabilized during the years
        of missing registration, even though the landlord has not been
        registering the apartment.
      </Trans>
    </div>
  );
};
