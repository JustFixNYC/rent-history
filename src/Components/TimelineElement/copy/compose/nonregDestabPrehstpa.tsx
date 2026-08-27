import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { HrvdPrehstpaCheckSection } from "../paragraphs/HrvdPrehstpaCheckSection";
import {
  LandlordStoppedRegisteringParagraph,
  MissingRegExplainedByHrvdParagraph,
} from "../paragraphs/MissingRegExplainedByHrvdParagraph";
import { NonregDestabPrehstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNonregDestabPrehstpa(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;
  const previousYear = requireTimelineField(
    data.previous_year,
    "previous_year"
  );
  const previousRent = requireTimelineField(
    data.previous_rent,
    "previous_rent"
  );
  const vacancyAmount = requireTimelineField(
    data.vacancy_amount,
    "vacancy_amount"
  );
  const maxRent = requireTimelineField(data.max_rent, "max_rent");
  const hrvdAmount = requireTimelineField(data.hrvd_amount, "hrvd_amount");

  return {
    title: <NonregDestabPrehstpaTitle year={findingYear} />,
    description: (
      <>
        <HrvdPrehstpaCheckSection
          findingYear={findingYear}
          previousYear={previousYear}
          previousRent={previousRent}
          vacancyAmount={vacancyAmount}
          longevityAmount={data.longevity_amount}
          maxRent={maxRent}
          hrvdAmount={hrvdAmount}
          thresholdOutcome="met"
        />
        <MissingRegExplainedByHrvdParagraph year={findingYear} />
        <LandlordStoppedRegisteringParagraph />
      </>
    ),
  };
}
