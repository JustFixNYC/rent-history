import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { PosthstpaDestabImplications } from "../implications/implications";
import { ExemptStartingYearParagraph } from "../paragraphs/ExemptStartingYearParagraph";
import { InvestigateRehabParagraph } from "../paragraphs/InvestigateRehabParagraph";
import { NoReasonProvidedParagraph } from "../paragraphs/NoReasonProvidedParagraph";
import { SubstantialRehabPossibleParagraph } from "../paragraphs/SubstantialRehabPossibleParagraph";
import { TaxExemptionProgramsParagraph } from "../paragraphs/TaxExemptionProgramsParagraph";
import { ViolationDestabPosthstpaTitle } from "../titles/titles";
import type { TimelineContent } from "./types";

export function composeViolationDestabPosthstpa(
  data: TimelineElementData
): TimelineContent {
  const currentYear = requireTimelineField(data.current_year, "current_year");

  return {
    title: <ViolationDestabPosthstpaTitle />,
    description: (
      <>
        <ExemptStartingYearParagraph year={currentYear} />
        <NoReasonProvidedParagraph />
        <SubstantialRehabPossibleParagraph />
        <TaxExemptionProgramsParagraph />
        <InvestigateRehabParagraph />
      </>
    ),
    whatThisMeans: <PosthstpaDestabImplications />,
  };
}
