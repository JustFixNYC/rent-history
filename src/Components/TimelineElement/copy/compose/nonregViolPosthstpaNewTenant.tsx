import type { TimelineElementData } from "../../types";
import { PosthstpaMissingRegImplications } from "../implications/implications";
import {
  MissingRegDestabilizationIntro,
  MissingRegDestabilizationList,
} from "../paragraphs/MissingRegDestabilizationList";
import { MissingRegistrationFromYearParagraph } from "../paragraphs/MissingRegistrationFromYearParagraph";
import { PosthstpaNonregInvestigateParagraph } from "../paragraphs/PosthstpaNonregInvestigateParagraph";
import { NonregViolPosthstpaNewTenantTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNonregViolPosthstpaNewTenant(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;

  return {
    title: <NonregViolPosthstpaNewTenantTitle year={findingYear} />,
    description: (
      <>
        <MissingRegistrationFromYearParagraph year={findingYear} />
        <MissingRegDestabilizationIntro year={findingYear} />
        <MissingRegDestabilizationList
          variant="posthstpa"
          program={data.program}
        />
        <PosthstpaNonregInvestigateParagraph />
      </>
    ),
    whatThisMeans: <PosthstpaMissingRegImplications />,
  };
}
