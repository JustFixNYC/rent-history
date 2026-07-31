import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { MissingRegistrationImplications } from "../implications/implications";
import { AllowedRaiseUpToParagraph } from "../paragraphs/AllowedRaiseUpToParagraph";
import { HrvdCheckSectionHeading } from "../paragraphs/HrvdCheckSectionHeading";
import { HrvdThresholdParagraph } from "../paragraphs/HrvdThresholdParagraph";
import { IaiNeededParagraph } from "../paragraphs/IaiNeededParagraph";
import { InvestigateIaiCostsParagraph } from "../paragraphs/InvestigateIaiCostsParagraph";
import {
  MissingRegDestabilizationHeading,
  MissingRegDestabilizationIntro,
  MissingRegDestabilizationList,
} from "../paragraphs/MissingRegDestabilizationList";
import { RentInYearParagraph } from "../paragraphs/RentInYearParagraph";
import { VacancyLongevityBonusParagraph } from "../paragraphs/VacancyLongevityBonusParagraph";
import { NonregistrationPosthstpaNewTenantTitle } from "../titles/titles";
import type { TimelineContent } from "./types";

export function composeNonregistrationPosthstpaNewTenant(
  data: TimelineElementData
): TimelineContent {
  const currentYear = requireTimelineField(data.current_year, "current_year");
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
  const iaiAmount = requireTimelineField(data.iai_amount, "iai_amount");

  return {
    title: <NonregistrationPosthstpaNewTenantTitle year={currentYear} />,
    description: (
      <>
        <HrvdCheckSectionHeading year={currentYear} />
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
          lead="additions"
          year={currentYear}
          amount={maxRent}
        />
        <HrvdThresholdParagraph
          year={currentYear}
          maxRent={maxRent}
          threshold={hrvdAmount}
          outcome="not_met"
        />
        <IaiNeededParagraph />
        <InvestigateIaiCostsParagraph iaiAmount={iaiAmount} />
        <MissingRegDestabilizationHeading />
        <MissingRegDestabilizationIntro year={currentYear} />
        <MissingRegDestabilizationList />
      </>
    ),
    whatThisMeans: <MissingRegistrationImplications />,
  };
}
