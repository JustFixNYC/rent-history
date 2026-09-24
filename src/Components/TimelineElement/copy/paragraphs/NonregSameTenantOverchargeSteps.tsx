import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";
import { IaiLink } from "../../../GlossaryLink/glossaryTerms";

type IaiPossibleSameTenantParagraphProps = {
  lastRegYear: number;
  comparisonYear: number;
};

export const IaiPossibleSameTenantParagraph = ({
  lastRegYear,
  comparisonYear,
}: IaiPossibleSameTenantParagraphProps) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.iai_possible_same_tenant">
      One way your rent could have reached the current amount is if the landlord
      made an <IaiLink /> between {lastRegYear} and {comparisonYear}.
    </Trans>
  </div>
);

export const IaiPermissionRequiredSameTenantParagraph = () => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.iai_permission_required_same_tenant">
      Your landlord would have needed to get your permission to perform
      individual apartment improvements while you were living there.
    </Trans>
  </div>
);

type StillStabilizedSinceLastRegYearParagraphProps = {
  lastRegYear: number;
};

export const StillStabilizedSinceLastRegYearParagraph = ({
  lastRegYear,
}: StillStabilizedSinceLastRegYearParagraphProps) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.still_stabilized_since_last_reg_year">
      Because you&apos;ve lived in the apartment since {lastRegYear}, the most
      recent year of registration, your apartment should still be rent
      stabilized, even though your landlord has not been registering it.
    </Trans>
  </div>
);

type IaiDuringMissingRegParagraphProps = {
  reportedRent: number;
};

export const IaiDuringMissingRegParagraph = ({
  reportedRent,
}: IaiDuringMissingRegParagraphProps) => {
  const formattedReportedRent = formatTimelineCurrency(reportedRent);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.iai_during_missing_reg">
        One way the rent could have reached {formattedReportedRent}, is if the
        landlord made an <IaiLink /> during the years of missing registration.
      </Trans>
    </div>
  );
};

export const NonregNoViolSameTenantStabilizedParagraph = () => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.nonreg_no_viol_same_tenant_stabilized">
      Your current rent amount suggests that your apartment is being treated as
      rent stabilized, even though your landlord has not been registering your
      apartment.
    </Trans>
  </div>
);
