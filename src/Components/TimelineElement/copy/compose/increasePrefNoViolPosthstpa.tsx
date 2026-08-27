import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import {
  PreferentialRentExplainedByTenancyParagraph,
  TenantChangeParagraph,
} from "../paragraphs/IncreasePreferentialParagraphs";
import { RentInYearParagraph } from "../paragraphs/RentInYearParagraph";
import { IncreasePrefNoViolPosthstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeIncreasePrefNoViolPosthstpa(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;
  const prefRent = requireTimelineField(data.pref_rent, "pref_rent");

  return {
    title: <IncreasePrefNoViolPosthstpaTitle />,
    description: (
      <>
        <RentInYearParagraph
          rentKind="preferential"
          year={findingYear}
          amount={prefRent}
        />
        <TenantChangeParagraph changed />
        <PreferentialRentExplainedByTenancyParagraph
          year={findingYear}
          prefRent={prefRent}
        />
      </>
    ),
  };
}
