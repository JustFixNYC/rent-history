import { Trans } from "@lingui/react/macro";

import {
  SubstantialRehabLink,
  TaxExemptionProgramsLink,
} from "../../../GlossaryLink/glossaryTerms";
import { SectionHeading } from "./SectionHeading";

type MissingRegDestabilizationListProps = {
  year: number;
};

export const MissingRegDestabilizationHeading = () => (
  <SectionHeading>
    <Trans id="timeline.copy.missing_reg_destab_heading">
      Potential Destabilization during years of missing registration
    </Trans>
  </SectionHeading>
);

export const MissingRegDestabilizationIntro = ({
  year,
}: MissingRegDestabilizationListProps) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.missing_reg_destab_intro">
      It is also possible that the apartment was legally destabilized some time
      after year {year} through the use of one of the following:
    </Trans>
  </div>
);

export const MissingRegDestabilizationList = () => (
  <ul className="timeline-element__bullet-list">
    <li>
      <Trans id="timeline.copy.missing_reg_destab_list.bonuses">
        Allowable bonuses and/or IAIs that reached the high rent vacancy
        destabilization threshold.
      </Trans>
    </li>
    <li>
      <Trans id="timeline.copy.missing_reg_destab_list.tax">
        Expiration of your building&apos;s participation in{" "}
        <TaxExemptionProgramsLink /> like J51 and 421-a.
      </Trans>
    </li>
    <li>
      <Trans id="timeline.copy.missing_reg_destab_list.rehab">
        A <SubstantialRehabLink /> was done to the building.
      </Trans>
    </li>
  </ul>
);
