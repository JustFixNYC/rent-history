import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { AllowedRaiseUpToParagraph } from "../paragraphs/AllowedRaiseUpToParagraph";
import { LegalRentWithinAllowedParagraph } from "../paragraphs/IncreasePreferentialParagraphs";
import { RentInYearParagraph } from "../paragraphs/RentInYearParagraph";
import { VacancyLongevityBonusParagraph } from "../paragraphs/VacancyLongevityBonusParagraph";
import { IncreaseNoViolPrehstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeIncreaseNoViolPrehstpa(
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
  const legalRent = requireTimelineField(data.legal_rent, "legal_rent");
  const vacancyAmount = requireTimelineField(
    data.vacancy_amount,
    "vacancy_amount"
  );
  const maxRent = requireTimelineField(data.max_rent, "max_rent");

  return {
    title: <IncreaseNoViolPrehstpaTitle />,
    description: (
      <>
        <RentInYearParagraph
          rentKind="legal"
          year={previousYear}
          amount={previousRent}
        />
        <VacancyLongevityBonusParagraph
          vacancyAmount={vacancyAmount}
          longevityAmount={data.longevity_amount}
        />
        <AllowedRaiseUpToParagraph
          lead="increases"
          year={findingYear}
          amount={maxRent}
        />
        <LegalRentWithinAllowedParagraph
          year={findingYear}
          legalRent={legalRent}
        />
      </>
    ),
  };
}
