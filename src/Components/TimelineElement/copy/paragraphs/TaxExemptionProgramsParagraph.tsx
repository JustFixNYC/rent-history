import { Trans } from "@lingui/react/macro";

import { TaxExemptionProgramsLink } from "../../../GlossaryLink/glossaryTerms";

export const TaxExemptionProgramsParagraph = () => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.tax_exemption_programs">
      Another way that this exemption could have happened legally is through
      expiration of your building&apos;s participation in{" "}
      <TaxExemptionProgramsLink /> like J51 and 421-a.
    </Trans>
  </div>
);
