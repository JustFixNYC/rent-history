import { Trans } from "@lingui/react/macro";

import { showTaxExemptionProgramCopy } from "../../format";
import type { TimelineTaxExemptionProgram } from "../../types";
import {
  HrvdLink,
  SubstantialRehabLink,
  TaxExemptionProgramsLink,
} from "../../../GlossaryLink/glossaryTerms";
import { SectionHeading } from "./SectionHeading";

type MissingRegDestabilizationListProps = {
  year: number;
  variant?: "prehstpa" | "posthstpa";
  program?: TimelineTaxExemptionProgram | null;
  hrvdStartYear?: number;
  rehabAfterYear?: number;
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
}: Pick<MissingRegDestabilizationListProps, "year">) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.missing_reg_destab_intro">
      It is also possible that the apartment was legally destabilized some time
      after year {year} through the use of one of the following:
    </Trans>
  </div>
);

export const MissingRegCouldIndicateDestabIntro = () => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.missing_reg_could_indicate_destab">
      The missing registration could indicate that the apartment may have
      destabilized through the use of one of the following:
    </Trans>
  </div>
);

export const NonregOverchargeDestabIntro = ({
  year,
}: Pick<MissingRegDestabilizationListProps, "year">) => (
  <div className="timeline-element__copy-paragraph">
    <Trans id="timeline.copy.nonreg_overcharge_destab_intro">
      It is also possible that the rent increased as a result of destabilization
      some time after {year} through the use of one of the following:
    </Trans>
  </div>
);

export const MissingRegDestabilizationList = ({
  variant = "prehstpa",
  program,
  hrvdStartYear,
  rehabAfterYear,
}: Pick<
  MissingRegDestabilizationListProps,
  "variant" | "program" | "hrvdStartYear" | "rehabAfterYear"
>) => (
  <ul className="timeline-element__bullet-list">
    {variant === "prehstpa" && hrvdStartYear != null ? (
      <li>
        <Trans id="timeline.copy.missing_reg_destab_list.hrvd">
          <HrvdLink /> between {hrvdStartYear} and 2019.
        </Trans>
      </li>
    ) : null}
    {showTaxExemptionProgramCopy(program) ? (
      <li>
        <Trans id="timeline.copy.missing_reg_destab_list.tax">
          Expiration of the building&apos;s participation in{" "}
          <TaxExemptionProgramsLink /> like j51 and 421a.
        </Trans>
      </li>
    ) : null}
    <li>
      {rehabAfterYear != null ? (
        <Trans id="timeline.copy.missing_reg_destab_list.rehab_after_year">
          A <SubstantialRehabLink /> to the building some time after{" "}
          {rehabAfterYear}.
        </Trans>
      ) : (
        <Trans id="timeline.copy.missing_reg_destab_list.rehab">
          A <SubstantialRehabLink /> was done to the building.
        </Trans>
      )}
    </li>
  </ul>
);

export const NonregOverchargeDestabilizationList = ({
  program,
  rehabAfterYear = 2000,
}: Pick<MissingRegDestabilizationListProps, "program" | "rehabAfterYear">) => (
  <ul className="timeline-element__bullet-list">
    {showTaxExemptionProgramCopy(program) ? (
      <li>
        <Trans id="timeline.copy.nonreg_overcharge_destab_list.tax">
          Expiration of the building&apos;s participation in{" "}
          <TaxExemptionProgramsLink /> like j51 and 421a.
        </Trans>
      </li>
    ) : null}
    <li>
      <Trans id="timeline.copy.nonreg_overcharge_destab_list.rehab">
        A <SubstantialRehabLink /> to the building some time after{" "}
        {rehabAfterYear}.
      </Trans>
    </li>
  </ul>
);
