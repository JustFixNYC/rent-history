import { Trans } from "@lingui/react/macro";

import { SubstantialRehabLink } from "../../../GlossaryLink/glossaryTerms";

export const SubstantialRehabPossibleParagraph = () => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.substantial_rehab_possible">
      This exemption could be illegal. One way that this could have happened
      legally is if the landlord can prove a <SubstantialRehabLink /> was done
      to the apartment or building.
    </Trans>
  </div>
);
