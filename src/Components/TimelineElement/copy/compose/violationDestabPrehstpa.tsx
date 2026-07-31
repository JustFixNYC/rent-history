import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { ImproperDestabilizationImplications } from "../implications/implications";
import { AllowedRaiseUpToParagraph } from "../paragraphs/AllowedRaiseUpToParagraph";
import { HrvdThresholdParagraph } from "../paragraphs/HrvdThresholdParagraph";
import { IaiNeededParagraph } from "../paragraphs/IaiNeededParagraph";
import { RentInYearParagraph } from "../paragraphs/RentInYearParagraph";
import { VacancyLongevityBonusParagraph } from "../paragraphs/VacancyLongevityBonusParagraph";
import { ViolationDestabPrehstpaTitle } from "../titles/titles";
import type { TimelineContent } from "./types";

export function composeViolationDestabPrehstpa(
  data: TimelineElementData
): TimelineContent {
  const currentYear = requireTimelineField(data.current_year, "current_year");
  const currentRent = requireTimelineField(data.current_rent, "current_rent");
  const vacancyAmount = requireTimelineField(
    data.vacancy_amount,
    "vacancy_amount"
  );
  const maxRent = requireTimelineField(data.max_rent, "max_rent");
  const hrvdAmount = requireTimelineField(data.hrvd_amount, "hrvd_amount");
  const raiseYear = currentYear + 1;

  return {
    title: <ViolationDestabPrehstpaTitle />,
    description: (
      <>
        <RentInYearParagraph
          rentKind="legal"
          year={currentYear}
          amount={currentRent}
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
          outcome="not_met"
        />
        <IaiNeededParagraph includeAlso />
      </>
    ),
    whatThisMeans: <ImproperDestabilizationImplications />,
  };
}
