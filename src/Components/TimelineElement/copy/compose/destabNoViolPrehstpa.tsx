import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { AllowedRaiseUpToParagraph } from "../paragraphs/AllowedRaiseUpToParagraph";
import { ExemptionExplainedByHrvdParagraph } from "../paragraphs/ExemptionExplainedByHrvdParagraph";
import { HrvdThresholdParagraph } from "../paragraphs/HrvdThresholdParagraph";
import { RentInYearParagraph } from "../paragraphs/RentInYearParagraph";
import { VacancyLongevityBonusParagraph } from "../paragraphs/VacancyLongevityBonusParagraph";
import { DestabNoViolPrehstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeDestabNoViolPrehstpa(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;
  const legalRent = requireTimelineField(data.legal_rent, "legal_rent");
  const vacancyAmount = requireTimelineField(
    data.vacancy_amount,
    "vacancy_amount"
  );
  const maxRent = requireTimelineField(data.max_rent, "max_rent");
  const hrvdAmount = requireTimelineField(data.hrvd_amount, "hrvd_amount");
  const raiseYear = findingYear + 1;

  return {
    title: <DestabNoViolPrehstpaTitle />,
    description: (
      <>
        <RentInYearParagraph
          rentKind="legal"
          year={findingYear}
          amount={legalRent}
        />
        <VacancyLongevityBonusParagraph
          vacancyAmount={vacancyAmount}
          longevityAmount={data.longevity_amount}
        />
        <AllowedRaiseUpToParagraph
          lead="increase"
          year={raiseYear}
          amount={maxRent}
        />
        <HrvdThresholdParagraph
          year={raiseYear}
          maxRent={maxRent}
          threshold={hrvdAmount}
          outcome="met"
        />
        <ExemptionExplainedByHrvdParagraph year={raiseYear} />
      </>
    ),
  };
}
