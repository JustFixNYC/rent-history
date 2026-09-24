import { Trans } from "@lingui/react/macro";

type StillStabilizedSameTenantParagraphProps = {
  findingYear: number;
};

export const StillStabilizedSameTenantParagraph = ({
  findingYear,
}: StillStabilizedSameTenantParagraphProps) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.still_stabilized_same_tenant">
      Because you have been the tenant since year {findingYear}, your apartment
      should still be rent stabilized, even though your landlord has not been
      registering.
    </Trans>
  </div>
);
