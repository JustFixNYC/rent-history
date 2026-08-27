import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { RgbOverchargeImplications } from "../implications/implications";
import {
  CurrentRentRgbComparisonParagraph,
  RgbIncreaseFootnote,
} from "../paragraphs/CurrentRentRgbComparisonParagraph";
import { IaiPermissionSameTenantParagraph } from "../paragraphs/IaiPermissionSameTenantParagraph";
import { MissingRegistrationFromYearParagraph } from "../paragraphs/MissingRegistrationFromYearParagraph";
import { RgbProjectionParagraph } from "../paragraphs/RgbProjectionParagraph";
import { StillStabilizedSameTenantParagraph } from "../paragraphs/StillStabilizedSameTenantParagraph";
import { NonregViolPrehstpaSameTenantTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNonregViolPrehstpaSameTenant(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;
  const comparisonYear = requireTimelineField(
    data.current_year,
    "current_year"
  );
  const currentRent = requireTimelineField(data.current_rent, "current_rent");
  const maxRent = requireTimelineField(data.max_rent, "max_rent");

  return {
    title: <NonregViolPrehstpaSameTenantTitle year={findingYear} />,
    description: (
      <>
        <MissingRegistrationFromYearParagraph year={findingYear} />
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
        <IaiPermissionSameTenantParagraph
          findingYear={findingYear}
          comparisonYear={comparisonYear}
          currentRent={currentRent}
        />
        <StillStabilizedSameTenantParagraph findingYear={findingYear} />
      </>
    ),
    footnote: <RgbIncreaseFootnote />,
    whatThisMeans: <RgbOverchargeImplications />,
  };
}
