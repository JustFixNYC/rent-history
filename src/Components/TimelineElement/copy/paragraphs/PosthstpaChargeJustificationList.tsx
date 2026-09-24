import { Trans } from "@lingui/react/macro";

import { showTaxExemptionProgramCopy } from "../../format";
import type { TimelineTaxExemptionProgram } from "../../types";
import {
  IaiLink,
  SubstantialRehabLink,
  TaxExemptionProgramsLink,
} from "../../../GlossaryLink/glossaryTerms";

type PosthstpaChargeJustificationListProps = {
  program?: TimelineTaxExemptionProgram | null;
};

export const PosthstpaChargeJustificationList = ({
  program,
}: PosthstpaChargeJustificationListProps) => (
  <ul className="timeline-element__bullet-list">
    <li>
      <Trans id="timeline.copy.posthstpa_charge_justification.iai">
        Documented <IaiLink /> at some point after year the missing registration
        began.
      </Trans>
    </li>
    {showTaxExemptionProgramCopy(program) ? (
      <li>
        <Trans id="timeline.copy.posthstpa_charge_justification.tax">
          Expiration of your building&apos;s participation in{" "}
          <TaxExemptionProgramsLink /> like J51 and 421-a.
        </Trans>
      </li>
    ) : null}
    <li>
      <Trans id="timeline.copy.posthstpa_charge_justification.rehab">
        A <SubstantialRehabLink /> was done to the building.
      </Trans>
    </li>
  </ul>
);
