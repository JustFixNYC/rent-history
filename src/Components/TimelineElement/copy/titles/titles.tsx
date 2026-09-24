import { Trans } from "@lingui/react/macro";

import { HrvdLink } from "../../../GlossaryLink/glossaryTerms";

export const DestabViolPrehstpaTitle = () => (
  <Trans id="timeline.title.destab_viol_prehstpa">
    Apartment listed as exempt from rent stabilization and may have been
    improperly destabilized.
  </Trans>
);

export const DestabNoViolPrehstpaTitle = () => (
  <Trans id="timeline.title.destab_no_viol_prehstpa">
    Apartment listed as exempt from rent stabilization. This appears to be
    explained by <HrvdLink />.
  </Trans>
);

export const DestabViolPosthstpaTitle = () => (
  <Trans id="timeline.title.destab_viol_posthstpa">
    Apartment listed as exempt from rent stabilization without a specified
    reason.
  </Trans>
);

type NonregViolPrehstpaNewTenantTitleProps = {
  year: number;
};

export const NonregViolPrehstpaNewTenantTitle = ({
  year,
}: NonregViolPrehstpaNewTenantTitleProps) => (
  <Trans id="timeline.title.nonreg_viol_prehstpa_new_tenant">
    Apartment missing registration from {year} onward. The information we
    checked in your rent history does not seem to explain the missing
    registration.
  </Trans>
);

type NonregViolPrehstpaSameTenantTitleProps = {
  year: number;
};

export const NonregViolPrehstpaSameTenantTitle = ({
  year,
}: NonregViolPrehstpaSameTenantTitleProps) => (
  <Trans id="timeline.title.nonreg_viol_prehstpa_same_tenant">
    Apartment missing registration from {year} onward, and your current rent
    amount may be more than what it should be. The information we checked in
    your rent history does not seem to explain the missing registration or
    current rent amount.
  </Trans>
);

type NonregNoViolSameTenantTitleProps = {
  year: number;
};

export const NonregNoViolSameTenantTitle = ({
  year,
}: NonregNoViolSameTenantTitleProps) => (
  <Trans id="timeline.title.nonreg_no_viol_same_tenant">
    Apartment missing registration from {year} onward, and your current rent
    amount suggests that your apartment is being treated as rent stabilized.
  </Trans>
);

export const IncreaseViolPrehstpaTitle = () => (
  <Trans id="timeline.title.increase_viol_prehstpa">
    Large increase in legal regulated rent that does not appear to be explained
    by allowable bonuses alone.
  </Trans>
);

export const IncreaseNoViolPrehstpaTitle = () => (
  <Trans id="timeline.title.increase_no_viol_prehstpa">
    Increase in legal regulated rent that appears to be within allowable limits.
  </Trans>
);

type NonregViolPosthstpaNewTenantTitleProps = {
  year: number;
};

export const NonregViolPosthstpaNewTenantTitle = ({
  year,
}: NonregViolPosthstpaNewTenantTitleProps) => (
  <Trans id="timeline.title.nonreg_viol_posthstpa_new_tenant">
    Apartment missing registration from {year} onward. The information we
    checked in your rent history does not seem to explain the missing
    registration.
  </Trans>
);

type NonregViolPosthstpaOverchargeTitleProps = {
  year: number;
};

export const NonregViolPosthstpaOverchargeTitle = ({
  year,
}: NonregViolPosthstpaOverchargeTitleProps) => (
  <Trans id="timeline.title.nonreg_viol_posthstpa_overcharge">
    Apartment is missing registration from {year} onward, and the rent amount
    you reported may be more than what it should be. The information we checked
    in your rent history does not seem to explain the missing registration or
    current rent amount.
  </Trans>
);

type NonregNoViolPosthstpaTitleProps = {
  year: number;
};

export const NonregNoViolPosthstpaTitle = ({
  year,
}: NonregNoViolPosthstpaTitleProps) => (
  <Trans id="timeline.title.nonreg_no_viol_posthstpa">
    Apartment missing registration from year {year} onward. The most recent rent
    amount you reported appears to be in line with standard increases, which
    suggests that your apartment was being treated as rent stabilized during the
    years of missing registration.
  </Trans>
);

export const IncreaseLegalViolPosthstpaTitle = () => (
  <Trans id="timeline.title.increase_legal_viol_posthstpa">
    Increase in legal regulated rent that does not appear to be explained by the
    standard RGB increase alone.
  </Trans>
);

export const IncreasePrefViolPosthstpaTitle = () => (
  <Trans id="timeline.title.increase_pref_viol_posthstpa">
    Increase in preferential rent that does not appear to be explained by the
    standard RGB increase alone.
  </Trans>
);

export const IncreasePrefNoViolPosthstpaTitle = () => (
  <Trans id="timeline.title.increase_pref_no_viol_posthstpa">
    Increase in preferential rent that appears to be explained by a change in
    tenancy.
  </Trans>
);

export const RevokePrefViolPosthstpaTitle = () => (
  <Trans id="timeline.title.revoke_pref_viol_posthstpa">
    Preferential rent was not offered when it should have been.
  </Trans>
);

export const Pref421aViolTitle = () => (
  <Trans id="timeline.title.pref_421a_viol">
    Preferential rent charged during the first year of this building&apos;s
    participation in the 421a tax program.
  </Trans>
);

export const MissingRegTitle = () => (
  <Trans id="timeline.title.missing_reg">
    The apartment is missing registration.
  </Trans>
);

export const TempExemptionTitle = () => (
  <Trans id="timeline.title.temp_exemption">
    The apartment was temporarily exempt from stabilization.
  </Trans>
);

export const StillStabTitle = () => (
  <Trans id="timeline.title.still_stab">
    Your apartment appears to be currently registered as rent stabilized.
  </Trans>
);

export const DestabSubRehabPosthstpaTitle = () => (
  <Trans id="timeline.title.destab_sub_rehab_posthstpa">
    The apartment was listed as exempt from rent stabilization. This appears to
    be explained by substantial rehabilitation.
  </Trans>
);

export const NoFindingTitle = () => (
  <Trans id="timeline.title.no_finding">
    No large rent increases or suspicious deregulations found.
  </Trans>
);
