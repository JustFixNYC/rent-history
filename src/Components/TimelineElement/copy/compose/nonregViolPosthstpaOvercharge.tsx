import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { RgbOverchargeImplications } from "../implications/implications";
import { RgbIncreaseFootnote } from "../paragraphs/CurrentRentRgbComparisonParagraph";
import { LegalRentLastRegYearParagraph } from "../paragraphs/LegalRentLastRegYearParagraph";
import { MissingRegistrationFromYearParagraph } from "../paragraphs/MissingRegistrationFromYearParagraph";
import {
  NonregOverchargeDestabIntro,
  NonregOverchargeDestabilizationList,
} from "../paragraphs/MissingRegDestabilizationList";
import { IaiDuringMissingRegParagraph } from "../paragraphs/NonregSameTenantOverchargeSteps";
import { NonregViolEvidenceIntroParagraph } from "../paragraphs/NonregEvidenceIntroParagraph";
import {
  ReportedRentRgbComparisonParagraph,
  ReportedRentRgbProjectionParagraph,
} from "../paragraphs/ReportedRentRgbParagraphs";
import { NonregViolPosthstpaOverchargeTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNonregViolPosthstpaOvercharge(
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
    title: <NonregViolPosthstpaOverchargeTitle year={findingYear} />,
    description: (
      <>
        <NonregViolEvidenceIntroParagraph />
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
          reportedRent={reportedRent}
          outcome="exceeds"
        />
        <IaiDuringMissingRegParagraph reportedRent={reportedRent} />
        <NonregOverchargeDestabIntro year={findingYear} />
        <NonregOverchargeDestabilizationList program={data.program} />
      </>
    ),
    footnote: <RgbIncreaseFootnote />,
    whatThisMeans: <RgbOverchargeImplications />,
  };
}
