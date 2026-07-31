import { Trans } from "@lingui/react/macro";

import {
  BaseRentLink,
  OverchargeDamagesLink,
} from "../../../GlossaryLink/glossaryTerms";

export const ImproperDestabilizationImplications = () => (
  <Trans id="timeline.implications.improper_destabilization">
    If this proves true, there is a chance your apartment was unlawfully or
    improperly destabilized, which means that your apartment could be returned
    to rent stabilization, and you may be entitled to <OverchargeDamagesLink />{" "}
    and your <BaseRentLink /> could be recalculated.
  </Trans>
);

export const PosthstpaDestabImplications = () => (
  <Trans id="timeline.implications.posthstpa_destab">
    If there is no proof of a substantial rehabilitation or other reason for
    legitimate destabilization, there is a chance your apartment was unlawfully
    or improperly destabilized, which means that your apartment could be
    returned to rent stabilization, and you may be entitled to{" "}
    <OverchargeDamagesLink />, and your <BaseRentLink /> could be recalculated.
  </Trans>
);

export const MissingRegistrationImplications = () => (
  <Trans id="timeline.implications.missing_registration">
    Unless there is proof of legal destabilization during the years of missing
    registration, your apartment may still be rent stabilized.
  </Trans>
);
