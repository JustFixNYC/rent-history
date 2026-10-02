import { Trans } from "@lingui/react/macro";

import { IaiLink } from "../../../GlossaryLink/glossaryTerms";
import { formatTimelineCurrency } from "../../format";

type LegalRentExceedsAllowedParagraphProps = {
  year: number;
  legalRent: number;
  variant?: "bonus_only" | "rgb";
};

export const LegalRentExceedsAllowedParagraph = ({
  year,
  legalRent,
  variant = "bonus_only",
}: LegalRentExceedsAllowedParagraphProps) => {
  const formattedRent = formatTimelineCurrency(legalRent);

  if (variant === "rgb") {
    return (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.legal_rent_exceeds_allowed.rgb">
          The legal regulated rent of {formattedRent} in year {year} is more
          than what the landlord was allowed to charge, and does not appear to
          be explained by the standard RGB increase alone.
        </Trans>
      </div>
    );
  }

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.legal_rent_exceeds_allowed.bonus_only">
        The legal regulated rent of {formattedRent} in year {year} is more than
        what the landlord was allowed to charge, and does not appear to be
        explained by vacancy bonus alone.
      </Trans>
    </div>
  );
};

type LegalRentWithinAllowedParagraphProps = {
  year: number;
  legalRent: number;
};

export const LegalRentWithinAllowedParagraph = ({
  year,
  legalRent,
}: LegalRentWithinAllowedParagraphProps) => {
  const formattedRent = formatTimelineCurrency(legalRent);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.legal_rent_within_allowed">
        The legal regulated rent of {formattedRent} in year {year} appears to be
        within what the landlord was allowed to charge.
      </Trans>
    </div>
  );
};

type RgbIncreaseParagraphProps = {
  year: number;
  legalRent: number;
  rgbIncreasePercentage: number;
};

export const RgbIncreaseParagraph = ({
  year,
  legalRent,
  rgbIncreasePercentage,
}: RgbIncreaseParagraphProps) => {
  const formattedRent = formatTimelineCurrency(legalRent);
  const formattedPercentage = `${rgbIncreasePercentage}%`;

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.rgb_increase">
        The legal regulated rent in year {year} was {formattedRent}. The
        landlord was allowed to increase the rent by {formattedPercentage} based
        on the standard RGB increase.
      </Trans>
    </div>
  );
};

type TenantChangeParagraphProps = {
  changed: boolean;
};

export const TenantChangeParagraph = ({
  changed,
}: TenantChangeParagraphProps) => {
  if (changed) {
    return (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.tenant_change.changed">
          The tenant in the apartment changed from the prior year.
        </Trans>
      </div>
    );
  }

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.tenant_change.unchanged">
        The tenant in the apartment did not change from the prior year.
      </Trans>
    </div>
  );
};

type PreferentialTenancyLimitParagraphProps = {
  year: number;
  prefRent: number;
  maxRent: number;
  outcome: "exceeds" | "within";
};

export const PreferentialTenancyLimitParagraph = ({
  year,
  prefRent,
  maxRent,
  outcome,
}: PreferentialTenancyLimitParagraphProps) => {
  const formattedPrefRent = formatTimelineCurrency(prefRent);
  const formattedMaxRent = formatTimelineCurrency(maxRent);

  if (outcome === "within") {
    return (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.preferential_tenancy_limit.within">
          The preferential rent of {formattedPrefRent} in year {year} appears to
          be within the RGB limit ({formattedMaxRent}).
        </Trans>
      </div>
    );
  }

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.preferential_tenancy_limit.exceeds">
        The preferential rent of {formattedPrefRent} in year {year} is more than
        the RGB limit ({formattedMaxRent}), and does not appear to be explained
        by the standard RGB increase alone.
      </Trans>
    </div>
  );
};

type PreferentialRentRequiredParagraphProps = {
  previousYear: number;
  prefRent: number;
};

export const PreferentialRentRequiredParagraph = ({
  previousYear,
  prefRent,
}: PreferentialRentRequiredParagraphProps) => {
  const formattedPrefRent = formatTimelineCurrency(prefRent);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.preferential_rent_required">
        A preferential rent of {formattedPrefRent} was offered in year{" "}
        {previousYear}. Because the tenant did not change, the landlord was
        required to offer a preferential rent in the following year.
      </Trans>
    </div>
  );
};

type Program421aParticipationParagraphProps = {
  programStartYear: number;
};

export const Program421aParticipationParagraph = ({
  programStartYear,
}: Program421aParticipationParagraphProps) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.program_421a_participation">
      This building began participation in the 421a program in year{" "}
      {programStartYear}.
    </Trans>
  </div>
);

type Program421aRentParagraphProps = {
  year: number;
  legalRent: number;
  prefRent: number;
};

export const Program421aRentParagraph = ({
  year,
  legalRent,
  prefRent,
}: Program421aRentParagraphProps) => {
  const formattedLegalRent = formatTimelineCurrency(legalRent);
  const formattedPrefRent = formatTimelineCurrency(prefRent);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.program_421a_rent">
        In year {year}, the legal regulated rent was {formattedLegalRent}, and a
        preferential rent of {formattedPrefRent} was offered.
      </Trans>
    </div>
  );
};

type PreferentialRentExplainedByTenancyParagraphProps = {
  year: number;
  prefRent: number;
};

export const PreferentialRentExplainedByTenancyParagraph = ({
  year,
  prefRent,
}: PreferentialRentExplainedByTenancyParagraphProps) => {
  const formattedPrefRent = formatTimelineCurrency(prefRent);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.preferential_rent_explained_by_tenancy">
        The preferential rent of {formattedPrefRent} in year {year} appears to
        be explained by a change in tenancy.
      </Trans>
    </div>
  );
};

type IaiNeededForRentParagraphProps = {
  year: number;
  rent: number;
};

export const IaiNeededForRentParagraph = ({
  year,
  rent,
}: IaiNeededForRentParagraphProps) => {
  const formattedRent = formatTimelineCurrency(rent);

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.iai_needed_for_rent">
        For the landlord to charge {formattedRent} in year {year}, they would
        have needed to document <IaiLink />.
      </Trans>
    </div>
  );
};
