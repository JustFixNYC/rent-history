import type { TimelineElementData } from "../../types";
import { PosthstpaDestabImplications } from "../implications/implications";
import { ExemptStartingYearParagraph } from "../paragraphs/ExemptStartingYearParagraph";
import { InvestigateRehabParagraph } from "../paragraphs/InvestigateRehabParagraph";
import { NoReasonProvidedParagraph } from "../paragraphs/NoReasonProvidedParagraph";
import { SubstantialRehabPossibleParagraph } from "../paragraphs/SubstantialRehabPossibleParagraph";
import { TaxExemptionProgramsParagraph } from "../paragraphs/TaxExemptionProgramsParagraph";
import { DestabViolPosthstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeDestabViolPosthstpa(
  _data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  return {
    title: <DestabViolPosthstpaTitle />,
    description: (
      <>
        <ExemptStartingYearParagraph year={context.findingYear} />
        <NoReasonProvidedParagraph />
        <SubstantialRehabPossibleParagraph />
        <TaxExemptionProgramsParagraph />
        <InvestigateRehabParagraph />
      </>
    ),
    whatThisMeans: <PosthstpaDestabImplications />,
  };
}
