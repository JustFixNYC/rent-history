import { Trans } from "@lingui/react/macro";

type ExemptStartingYearParagraphProps = {
  year: number;
};

export const ExemptStartingYearParagraph = ({
  year,
}: ExemptStartingYearParagraphProps) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.exempt_starting_year">
      The apartment was listed as exempt from rent stabilization starting in
      year {year}.
    </Trans>
  </div>
);
