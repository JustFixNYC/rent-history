import { requireTimelineField } from "../../format";
import type { TimelineElementData } from "../../types";
import { ImproperOverchargeImplications } from "../implications/implications";
import {
  IaiNeededForRentParagraph,
  LegalRentExceedsAllowedParagraph,
  RgbIncreaseParagraph,
} from "../paragraphs/IncreasePreferentialParagraphs";
import { InvestigateIaiCostsParagraph } from "../paragraphs/InvestigateIaiCostsParagraph";
import { IncreaseLegalViolPosthstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeIncreaseLegalViolPosthstpa(
  data: TimelineElementData,
  context: TimelineComposerContext
): TimelineContent {
  const findingYear = context.findingYear;
  const legalRent = requireTimelineField(data.legal_rent, "legal_rent");
  const rgbIncreasePercentage = requireTimelineField(
    data.rgb_increase_percentage,
    "rgb_increase_percentage"
  );
  const iaiAmount = requireTimelineField(data.iai_amount, "iai_amount");

  return {
    title: <IncreaseLegalViolPosthstpaTitle />,
    description: (
      <>
        <RgbIncreaseParagraph
          year={findingYear}
          legalRent={legalRent}
          rgbIncreasePercentage={rgbIncreasePercentage}
        />
        <LegalRentExceedsAllowedParagraph
          year={findingYear}
          legalRent={legalRent}
          variant="rgb"
        />
        <IaiNeededForRentParagraph year={findingYear} rent={legalRent} />
        <InvestigateIaiCostsParagraph iaiAmount={iaiAmount} />
      </>
    ),
    whatThisMeans: <ImproperOverchargeImplications />,
  };
}
