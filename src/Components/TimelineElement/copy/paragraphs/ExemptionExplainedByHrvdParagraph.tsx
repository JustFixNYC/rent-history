import { Trans } from "@lingui/react/macro";

import { HrvdLink } from "../../../GlossaryLink/glossaryTerms";

type ExemptionExplainedByHrvdParagraphProps = {
  year: number;
};

export const ExemptionExplainedByHrvdParagraph = ({
  year,
}: ExemptionExplainedByHrvdParagraphProps) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.exemption_explained_by_hrvd">
      The exemption starting in year {year} appears to be explained by{" "}
      <HrvdLink />.
    </Trans>
  </div>
);
