import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { ImproperOverchargeImplications } from "../implications/implications";
import {
  IaiNeededForRentParagraph,
  PreferentialTenancyLimitParagraph,
  TenantChangeParagraph,
} from "../paragraphs/IncreasePreferentialParagraphs";
import { InvestigateIaiCostsParagraph } from "../paragraphs/InvestigateIaiCostsParagraph";
import { RentInYearParagraph } from "../paragraphs/RentInYearParagraph";
import { IncreasePrefViolPosthstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeIncreasePrefViolPosthstpa(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;
  const prefRent = requireTimelineField(data.pref_rent, "pref_rent");
  const maxRent = requireTimelineField(data.max_rent, "max_rent");
  const iaiAmount = requireTimelineField(data.iai_amount, "iai_amount");

  return {
    title: <IncreasePrefViolPosthstpaTitle />,
    description: (
      <>
        <RentInYearParagraph
          rentKind="preferential"
          year={findingYear}
          amount={prefRent}
        />
        <TenantChangeParagraph changed={false} />
        <PreferentialTenancyLimitParagraph
          year={findingYear}
          prefRent={prefRent}
          maxRent={maxRent}
          outcome="exceeds"
        />
        <IaiNeededForRentParagraph year={findingYear} rent={prefRent} />
        <InvestigateIaiCostsParagraph iaiAmount={iaiAmount} />
      </>
    ),
    whatThisMeans: <ImproperOverchargeImplications />,
  };
}
