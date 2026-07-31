import { Trans } from "@lingui/react/macro";

import { HrvdLink } from "../../../GlossaryLink/glossaryTerms";

export const ViolationDestabPrehstpaTitle = () => (
  <Trans id="timeline.title.violation_destab_prehstpa">
    Apartment listed as exempt from rent stabilization and may have been
    improperly destabilized.
  </Trans>
);

export const NoViolationDestabPrehstpaTitle = () => (
  <Trans id="timeline.title.no_violation_destab_prehstpa">
    Apartment listed as exempt from rent stabilization. This appears to be
    explained by <HrvdLink />
  </Trans>
);

export const ViolationDestabPosthstpaTitle = () => (
  <Trans id="timeline.title.violation_destab_posthstpa">
    Apartment listed as exempt from rent stabilization without a specified
    reason.
  </Trans>
);

type NonregistrationPosthstpaNewTenantTitleProps = {
  year: number;
};

export const NonregistrationPosthstpaNewTenantTitle = ({
  year,
}: NonregistrationPosthstpaNewTenantTitleProps) => (
  <Trans id="timeline.title.nonregistration_posthstpa_new_tenant">
    The apartment is missing registration from year {year} onward. This may
    indicate that your apartment is currently being treated as unofficially
    destabilized.
  </Trans>
);
