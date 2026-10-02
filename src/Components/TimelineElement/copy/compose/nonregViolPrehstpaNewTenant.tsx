import type { TimelineElementData } from "../../types";
import { MissingRegistrationImplications } from "../implications/implications";
import {
  MissingRegCouldIndicateDestabIntro,
  MissingRegDestabilizationList,
} from "../paragraphs/MissingRegDestabilizationList";
import { MissingRegNoReasonProvidedParagraph } from "../paragraphs/MissingRegNoReasonProvidedParagraph";
import { MissingRegistrationFromYearParagraph } from "../paragraphs/MissingRegistrationFromYearParagraph";
import { NonregViolEvidenceIntroParagraph } from "../paragraphs/NonregEvidenceIntroParagraph";
import { NonregViolPrehstpaNewTenantTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNonregViolPrehstpaNewTenant(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;

  return {
    title: <NonregViolPrehstpaNewTenantTitle year={findingYear} />,
    description: (
      <>
        <NonregViolEvidenceIntroParagraph />
        <MissingRegistrationFromYearParagraph year={findingYear} />
        <MissingRegNoReasonProvidedParagraph />
        <MissingRegCouldIndicateDestabIntro />
        <MissingRegDestabilizationList
          variant="prehstpa"
          program={data.program}
          hrvdStartYear={findingYear}
          rehabAfterYear={findingYear}
        />
      </>
    ),
    whatThisMeans: <MissingRegistrationImplications />,
  };
}
