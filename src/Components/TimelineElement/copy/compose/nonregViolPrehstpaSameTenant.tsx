import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { RgbOverchargeImplications } from "../implications/implications";
import {
  CurrentRentRgbComparisonParagraph,
  RgbIncreaseFootnote,
} from "../paragraphs/CurrentRentRgbComparisonParagraph";
import { NonregViolEvidenceIntroParagraph } from "../paragraphs/NonregEvidenceIntroParagraph";
import { LegalRentInLastRegYearParagraph } from "../paragraphs/LegalRentInLastRegYearParagraph";
import { MissingRegistrationFromYearParagraph } from "../paragraphs/MissingRegistrationFromYearParagraph";
import {
  IaiPermissionRequiredSameTenantParagraph,
  IaiPossibleSameTenantParagraph,
  StillStabilizedSinceLastRegYearParagraph,
} from "../paragraphs/NonregSameTenantOverchargeSteps";
import { RgbProjectionParagraph } from "../paragraphs/RgbProjectionParagraph";
import { NonregViolPrehstpaSameTenantTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNonregViolPrehstpaSameTenant(
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
    title: <NonregViolPrehstpaSameTenantTitle year={findingYear} />,
    description: (
      <>
        <NonregViolEvidenceIntroParagraph />
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
          outcome="exceeds"
        />
        <IaiPossibleSameTenantParagraph
          lastRegYear={lastRegYear}
          comparisonYear={comparisonYear}
        />
        <IaiPermissionRequiredSameTenantParagraph />
        <StillStabilizedSinceLastRegYearParagraph lastRegYear={lastRegYear} />
      </>
    ),
    footnote: <RgbIncreaseFootnote />,
    whatThisMeans: <RgbOverchargeImplications />,
  };
}
