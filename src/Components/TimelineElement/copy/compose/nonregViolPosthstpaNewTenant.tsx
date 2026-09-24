import type { TimelineElementData } from "../../types";
import { MissingRegistrationImplications } from "../implications/implications";
import {
  MissingRegCouldIndicateDestabIntro,
  MissingRegDestabilizationList,
} from "../paragraphs/MissingRegDestabilizationList";
import { MissingRegNoReasonProvidedParagraph } from "../paragraphs/MissingRegNoReasonProvidedParagraph";
import { MissingRegistrationFromYearParagraph } from "../paragraphs/MissingRegistrationFromYearParagraph";
import { NonregViolEvidenceIntroParagraph } from "../paragraphs/NonregEvidenceIntroParagraph";
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
        <NonregViolEvidenceIntroParagraph />
        <MissingRegistrationFromYearParagraph year={findingYear} />
        <MissingRegNoReasonProvidedParagraph />
        <MissingRegCouldIndicateDestabIntro />
        <MissingRegDestabilizationList
          variant="posthstpa"
          program={data.program}
          rehabAfterYear={findingYear}
        />
      </>
    ),
    whatThisMeans: <MissingRegistrationImplications />,
  };
}
