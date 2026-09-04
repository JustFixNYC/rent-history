import { Trans } from "@lingui/react/macro";

export const NonregViolEvidenceIntroParagraph = () => (
  <div className="timeline-element__copy-paragraph timeline-element__copy-paragraph--intro">
    <Trans id="timeline.copy.nonreg_viol_evidence_intro">
      In this section, we go step by step to see what can be explained and what
      may be missing.
    </Trans>
  </div>
);

export const NonregNoViolDetailsIntroParagraph = () => (
  <div className="timeline-element__copy-paragraph timeline-element__copy-paragraph--intro">
    <Trans id="timeline.copy.nonreg_no_viol_details_intro">
      In this section, we go step by step to see how the missing registration is
      explained.
    </Trans>
  </div>
);
