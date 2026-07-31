import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { GlossaryLink } from "./GlossaryLink";

/** Shared glossary term links (modal bodies stubbed for now). */
export const VacancyBonusLink = () => {
  const { _ } = useLingui();
  return (
    <GlossaryLink
      term={_(msg`vacancy bonus`)}
      modalTitle={_(msg`Vacancy bonus`)}
    />
  );
};

export const LongevityBonusLink = () => {
  const { _ } = useLingui();
  return (
    <GlossaryLink
      term={_(msg`longevity bonus`)}
      modalTitle={_(msg`Longevity bonus`)}
    />
  );
};

export const HrvdLink = () => {
  const { _ } = useLingui();
  return (
    <GlossaryLink
      term={_(msg`high rent vacancy destabilization`)}
      modalTitle={_(msg`High rent vacancy destabilization`)}
    />
  );
};

export const IaiLink = () => {
  const { _ } = useLingui();
  return (
    <GlossaryLink
      term={_(msg`Individual Apartment Improvements (IAIs)`)}
      modalTitle={_(msg`Individual Apartment Improvements (IAIs)`)}
    />
  );
};

export const SubstantialRehabLink = () => {
  const { _ } = useLingui();
  return (
    <GlossaryLink
      term={_(msg`substantial rehabilitation`)}
      modalTitle={_(msg`Substantial rehabilitation`)}
    />
  );
};

export const TaxExemptionProgramsLink = () => {
  const { _ } = useLingui();
  return (
    <GlossaryLink
      term={_(msg`tax exemption programs`)}
      modalTitle={_(msg`Tax exemption programs`)}
    />
  );
};

export const OverchargeDamagesLink = () => {
  const { _ } = useLingui();
  return (
    <GlossaryLink
      term={_(msg`overcharge damages`)}
      modalTitle={_(msg`Overcharge damages`)}
    />
  );
};

export const BaseRentLink = () => {
  const { _ } = useLingui();
  return (
    <GlossaryLink term={_(msg`base rent`)} modalTitle={_(msg`Base rent`)} />
  );
};
