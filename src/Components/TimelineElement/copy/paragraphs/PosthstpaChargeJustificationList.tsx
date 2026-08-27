import { Trans } from "@lingui/react/macro";

import {
  IaiLink,
  SubstantialRehabLink,
  TaxExemptionProgramsLink,
} from "../../../GlossaryLink/glossaryTerms";

export const PosthstpaChargeJustificationList = () => (
  <ul className="timeline-element__bullet-list">
    <li>
      <Trans id="timeline.copy.posthstpa_charge_justification.iai">
        Documented <IaiLink /> at some point after year the missing registration
        began.
      </Trans>
    </li>
    <li>
      <Trans id="timeline.copy.posthstpa_charge_justification.tax">
        Expiration of your building&apos;s participation in{" "}
        <TaxExemptionProgramsLink /> like J51 and 421-a.
      </Trans>
    </li>
    <li>
      <Trans id="timeline.copy.posthstpa_charge_justification.rehab">
        A <SubstantialRehabLink /> was done to the building.
      </Trans>
    </li>
  </ul>
);
