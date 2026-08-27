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

export const PosthstpaMissingRegImplications = () => (
  <Trans id="timeline.implications.posthstpa_missing_registration">
    Unless there is proof of legal destabilization by way of substantial
    rehabilitation during the years of missing registration, your apartment may
    still be rent stabilized.
  </Trans>
);

export const ImproperOverchargeImplications = () => (
  <Trans id="timeline.implications.improper_overcharge">
    There is a chance your rent may have been unlawfully or improperly raised,
    which means that you could be entitled to <OverchargeDamagesLink /> and your{" "}
    <BaseRentLink /> could be recalculated.
  </Trans>
);

export const RgbOverchargeImplications = () => (
  <Trans id="timeline.implications.rgb_overcharge">
    You may need to investigate further as to any alleged IAIs your landlord may
    have performed, because this would have been one of the only ways to have
    raised the rent beyond the standard RGB increase amount. If your landlord
    cannot prove how they legally increased your rent, there is a chance your
    rent may have been unlawfully or improperly raised, which means that you
    could be entitled to <OverchargeDamagesLink /> and your <BaseRentLink />{" "}
    could be recalculated.
  </Trans>
);

export const Program421aPrefImplications = () => (
  <Trans id="timeline.implications.program_421a_pref">
    It is illegal to offer a preferential rent during the first year of a
    building&apos;s participation in the 421a program, which means that your{" "}
    <BaseRentLink /> could be recalculated.
  </Trans>
);
