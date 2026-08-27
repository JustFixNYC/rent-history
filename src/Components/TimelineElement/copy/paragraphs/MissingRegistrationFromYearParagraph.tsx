import { Trans } from "@lingui/react/macro";

type MissingRegistrationFromYearParagraphProps = {
  year: number;
};

export const MissingRegistrationFromYearParagraph = ({
  year,
}: MissingRegistrationFromYearParagraphProps) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.missing_registration_from_year">
      The apartment is missing registration from year {year} onward.
    </Trans>
  </div>
);
