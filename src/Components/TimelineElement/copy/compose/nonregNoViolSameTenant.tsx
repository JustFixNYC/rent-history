import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import {
  CurrentRentRgbComparisonParagraph,
  RgbIncreaseFootnote,
} from "../paragraphs/CurrentRentRgbComparisonParagraph";
import { NonregNoViolDetailsIntroParagraph } from "../paragraphs/NonregEvidenceIntroParagraph";
import { LegalRentInLastRegYearParagraph } from "../paragraphs/LegalRentInLastRegYearParagraph";
import { MissingRegistrationFromYearParagraph } from "../paragraphs/MissingRegistrationFromYearParagraph";
import { NonregNoViolSameTenantStabilizedParagraph } from "../paragraphs/NonregSameTenantOverchargeSteps";
import { RgbProjectionParagraph } from "../paragraphs/RgbProjectionParagraph";
import { NonregNoViolSameTenantTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNonregNoViolSameTenant(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;
  const lastRegYear = requireTimelineField(data.previous_year, "previous_year");
  const comparisonYear = requireTimelineField(
    data.current_year,
    "current_year"
  );
  const legalRent = requireTimelineField(data.legal_rent, "legal_rent");
  const currentRent = requireTimelineField(data.current_rent, "current_rent");
  const maxRent = requireTimelineField(data.max_rent, "max_rent");

  return {
    title: <NonregNoViolSameTenantTitle year={findingYear} />,
    description: (
      <>
        <NonregNoViolDetailsIntroParagraph />
        <MissingRegistrationFromYearParagraph year={findingYear} />
        <LegalRentInLastRegYearParagraph
          lastRegYear={lastRegYear}
          amount={legalRent}
        />
        <RgbProjectionParagraph
          comparisonYear={comparisonYear}
          maxRent={maxRent}
        />
        <CurrentRentRgbComparisonParagraph
          comparisonYear={comparisonYear}
          currentRent={currentRent}
          maxRent={maxRent}
          outcome="within"
        />
        <NonregNoViolSameTenantStabilizedParagraph />
      </>
    ),
    footnote: <RgbIncreaseFootnote />,
  };
}
