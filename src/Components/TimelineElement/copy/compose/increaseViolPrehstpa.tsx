import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { ImproperOverchargeImplications } from "../implications/implications";
import { AllowedRaiseUpToParagraph } from "../paragraphs/AllowedRaiseUpToParagraph";
import {
  IaiNeededForRentParagraph,
  LegalRentExceedsAllowedParagraph,
} from "../paragraphs/IncreasePreferentialParagraphs";
import { InvestigateIaiCostsParagraph } from "../paragraphs/InvestigateIaiCostsParagraph";
import { RentInYearParagraph } from "../paragraphs/RentInYearParagraph";
import { VacancyLongevityBonusParagraph } from "../paragraphs/VacancyLongevityBonusParagraph";
import { IncreaseViolPrehstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeIncreaseViolPrehstpa(
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
  const iaiAmount = requireTimelineField(data.iai_amount, "iai_amount");

  return {
    title: <IncreaseViolPrehstpaTitle />,
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
        <LegalRentExceedsAllowedParagraph
          year={findingYear}
          legalRent={legalRent}
        />
        <IaiNeededForRentParagraph year={findingYear} rent={legalRent} />
        <InvestigateIaiCostsParagraph iaiAmount={iaiAmount} />
      </>
    ),
    whatThisMeans: <ImproperOverchargeImplications />,
  };
}
