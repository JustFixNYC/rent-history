import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { RgbOverchargeImplications } from "../implications/implications";
import {
  CurrentRentRgbComparisonParagraph,
  RgbIncreaseFootnote,
} from "../paragraphs/CurrentRentRgbComparisonParagraph";
import { MissingRegistrationFromYearParagraph } from "../paragraphs/MissingRegistrationFromYearParagraph";
import { PosthstpaChargeJustificationList } from "../paragraphs/PosthstpaChargeJustificationList";
import { RgbProjectionParagraph } from "../paragraphs/RgbProjectionParagraph";
import { NonregViolPosthstpaSameTenantTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNonregViolPosthstpaSameTenant(
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
    title: <NonregViolPosthstpaSameTenantTitle year={findingYear} />,
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
        <PosthstpaChargeJustificationList />
      </>
    ),
    footnote: <RgbIncreaseFootnote />,
    whatThisMeans: <RgbOverchargeImplications />,
  };
}
