import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { Program421aPrefImplications } from "../implications/implications";
import {
  Program421aParticipationParagraph,
  Program421aRentParagraph,
} from "../paragraphs/IncreasePreferentialParagraphs";
import { Pref421aViolTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composePref421aViol(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;
  const programStartYear = requireTimelineField(
    data.program_start_year,
    "program_start_year"
  );
  const legalRent = requireTimelineField(data.legal_rent, "legal_rent");
  const prefRent = requireTimelineField(data.pref_rent, "pref_rent");

  return {
    title: <Pref421aViolTitle />,
    description: (
      <>
        <Program421aParticipationParagraph
          programStartYear={programStartYear}
        />
        <Program421aRentParagraph
          year={findingYear}
          legalRent={legalRent}
          prefRent={prefRent}
        />
      </>
    ),
    whatThisMeans: <Program421aPrefImplications />,
  };
}
