import { requireTimelineField } from "../../format";
import { ImproperOverchargeImplications } from "../implications/implications";
import {
  PreferentialRentRequiredParagraph,
  TenantChangeParagraph,
} from "../paragraphs/IncreasePreferentialParagraphs";
import { RentInYearParagraph } from "../paragraphs/RentInYearParagraph";
import { RevokePrefViolPosthstpaTitle } from "../titles/titles";
import type { TimelineComposer } from "./types";

export const composeRevokePrefViolPosthstpa: TimelineComposer = (data) => {
  const previousYear = requireTimelineField(
    data.previous_year,
    "previous_year"
  );
  const prefRent = requireTimelineField(data.pref_rent, "pref_rent");

  return {
    title: <RevokePrefViolPosthstpaTitle />,
    description: (
      <>
        <RentInYearParagraph
          rentKind="preferential"
          year={previousYear}
          amount={prefRent}
        />
        <TenantChangeParagraph changed={false} />
        <PreferentialRentRequiredParagraph
          previousYear={previousYear}
          prefRent={prefRent}
        />
      </>
    ),
    whatThisMeans: <ImproperOverchargeImplications />,
  };
};
