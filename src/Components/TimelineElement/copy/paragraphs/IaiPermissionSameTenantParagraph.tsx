import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";
import { IaiLink } from "../../../GlossaryLink/glossaryTerms";

type IaiPermissionSameTenantParagraphProps = {
  findingYear: number;
  comparisonYear: number;
  currentRent: number;
};

export const IaiPermissionSameTenantParagraph = ({
  findingYear,
  comparisonYear,
  currentRent,
}: IaiPermissionSameTenantParagraphProps) => {
  const formattedCurrentRent = formatTimelineCurrency(currentRent);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.iai_permission_same_tenant">
        For your landlord to charge {formattedCurrentRent}, they would have
        needed to document <IaiLink /> at some point between year {findingYear}{" "}
        and year {comparisonYear}. Since you were the tenant during this period,
        your landlord would have needed to ask your permission to make such
        improvements.
      </Trans>
    </div>
  );
};
