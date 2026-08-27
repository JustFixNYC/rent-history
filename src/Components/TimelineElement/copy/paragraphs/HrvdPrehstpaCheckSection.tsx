import { AllowedRaiseUpToParagraph } from "./AllowedRaiseUpToParagraph";
import { HrvdCheckSectionHeading } from "./HrvdCheckSectionHeading";
import { HrvdThresholdParagraph } from "./HrvdThresholdParagraph";
import { IaiNeededParagraph } from "./IaiNeededParagraph";
import { InvestigateIaiCostsParagraph } from "./InvestigateIaiCostsParagraph";
import { RentInYearParagraph } from "./RentInYearParagraph";
import { VacancyLongevityBonusParagraph } from "./VacancyLongevityBonusParagraph";

type HrvdPrehstpaCheckSectionProps = {
  findingYear: number;
  previousYear: number;
  previousRent: number;
  vacancyAmount: number;
  longevityAmount: number | null | undefined;
  maxRent: number;
  hrvdAmount: number;
  thresholdOutcome: "met" | "not_met";
  includeIaiInvestigate?: boolean;
  iaiAmount?: number;
};

export const HrvdPrehstpaCheckSection = ({
  findingYear,
  previousYear,
  previousRent,
  vacancyAmount,
  longevityAmount,
  maxRent,
  hrvdAmount,
  thresholdOutcome,
  includeIaiInvestigate = false,
  iaiAmount,
}: HrvdPrehstpaCheckSectionProps) => (
  <>
    <HrvdCheckSectionHeading year={findingYear} />
    <RentInYearParagraph
      rentKind="legal"
      year={previousYear}
      amount={previousRent}
    />
    <VacancyLongevityBonusParagraph
      vacancyAmount={vacancyAmount}
      longevityAmount={longevityAmount}
    />
    <AllowedRaiseUpToParagraph
      lead="additions"
      year={findingYear}
      amount={maxRent}
    />
    <HrvdThresholdParagraph
      year={findingYear}
      maxRent={maxRent}
      threshold={hrvdAmount}
      outcome={thresholdOutcome}
    />
    {includeIaiInvestigate ? (
      <>
        <IaiNeededParagraph />
        {iaiAmount != null ? (
          <InvestigateIaiCostsParagraph iaiAmount={iaiAmount} />
        ) : null}
      </>
    ) : null}
  </>
);
