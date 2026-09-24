import { Trans } from "@lingui/react/macro";

type MissingRegExplainedByHrvdParagraphProps = {
  year: number;
};

export const MissingRegExplainedByHrvdParagraph = ({
  year,
}: MissingRegExplainedByHrvdParagraphProps) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.missing_reg_explained_by_hrvd">
      The apartment is missing registration from {year} onward, and this appears
      to be explained by high rent vacancy destabilization.
    </Trans>
  </div>
);

export const LandlordStoppedRegisteringParagraph = () => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.landlord_stopped_registering">
      It is likely that your landlord stopped registering your apartment after
      it met the high rent destabilization threshold.
    </Trans>
  </div>
);
