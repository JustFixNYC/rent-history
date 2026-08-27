import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { MissingRegistrationImplications } from "../implications/implications";
import { HrvdPrehstpaCheckSection } from "../paragraphs/HrvdPrehstpaCheckSection";
import {
  MissingRegDestabilizationHeading,
  MissingRegDestabilizationIntro,
  MissingRegDestabilizationList,
} from "../paragraphs/MissingRegDestabilizationList";
import { NonregViolPrehstpaNewTenantTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNonregViolPrehstpaNewTenant(
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
  const iaiAmount = requireTimelineField(data.iai_amount, "iai_amount");

  return {
    title: <NonregViolPrehstpaNewTenantTitle year={findingYear} />,
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
          thresholdOutcome="not_met"
          includeIaiInvestigate
          iaiAmount={iaiAmount}
        />
        <MissingRegDestabilizationHeading />
        <MissingRegDestabilizationIntro year={findingYear} />
        <MissingRegDestabilizationList variant="prehstpa" />
      </>
    ),
    whatThisMeans: <MissingRegistrationImplications />,
  };
}
