import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { RgbIncreaseFootnote } from "../paragraphs/CurrentRentRgbComparisonParagraph";
import { LegalRentLastRegYearParagraph } from "../paragraphs/LegalRentLastRegYearParagraph";
import { MissingRegistrationFromYearParagraph } from "../paragraphs/MissingRegistrationFromYearParagraph";
import { NonregNoViolDetailsIntroParagraph } from "../paragraphs/NonregEvidenceIntroParagraph";
import {
  NonregStabilizedDespiteMissingRegParagraph,
  ReportedRentRgbComparisonParagraph,
  ReportedRentRgbProjectionParagraph,
} from "../paragraphs/ReportedRentRgbParagraphs";
import { NonregNoViolPosthstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNonregNoViolPosthstpa(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;
  const lastRegYear = requireTimelineField(data.previous_year, "previous_year");
  const reportedYear = requireTimelineField(data.current_year, "current_year");
  const legalRent = requireTimelineField(data.legal_rent, "legal_rent");
  const reportedRent = requireTimelineField(data.current_rent, "current_rent");
  const maxRent = requireTimelineField(data.max_rent, "max_rent");

  return {
    title: <NonregNoViolPosthstpaTitle year={findingYear} />,
    description: (
      <>
        <NonregNoViolDetailsIntroParagraph />
        <MissingRegistrationFromYearParagraph year={findingYear} />
        <LegalRentLastRegYearParagraph
          lastRegYear={lastRegYear}
          amount={legalRent}
        />
        <ReportedRentRgbProjectionParagraph
          reportedYear={reportedYear}
          maxRent={maxRent}
        />
        <ReportedRentRgbComparisonParagraph
          reportedYear={reportedYear}
          outcome="within"
        />
        <NonregStabilizedDespiteMissingRegParagraph
          reportedYear={reportedYear}
          reportedRent={reportedRent}
        />
      </>
    ),
    footnote: <RgbIncreaseFootnote />,
  };
}
