import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { ImproperOverchargeImplications } from "../implications/implications";
import {
  PreferentialRentRequiredParagraph,
  TenantChangeParagraph,
} from "../paragraphs/IncreasePreferentialParagraphs";
import { RentInYearParagraph } from "../paragraphs/RentInYearParagraph";
import { RevokePrefViolPosthstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeRevokePrefViolPosthstpa(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const previousYear = requireTimelineField(
    data.previous_year,
    "previous_year"
  );
  const prefRent = requireTimelineField(data.pref_rent, "pref_rent");

  return {
    title: <RevokePrefViolPosthstpaTitle />,
    description: (
      <>
        <RentInYearParagraph
          rentKind="preferential"
          year={previousYear}
          amount={prefRent}
        />
        <TenantChangeParagraph changed={false} />
        <PreferentialRentRequiredParagraph
          previousYear={previousYear}
          prefRent={prefRent}
        />
      </>
    ),
    whatThisMeans: <ImproperOverchargeImplications />,
  };
}
