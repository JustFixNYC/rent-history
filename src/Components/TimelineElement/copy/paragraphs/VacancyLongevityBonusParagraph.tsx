import { Trans } from "@lingui/react/macro";

import { formatTimelineCurrency } from "../../format";
import {
  LongevityBonusLink,
  VacancyBonusLink,
} from "../../../GlossaryLink/glossaryTerms";

type VacancyLongevityBonusParagraphProps = {
  vacancyAmount: number;
  longevityAmount?: number | null;
};

export const VacancyLongevityBonusParagraph = ({
  vacancyAmount,
  longevityAmount,
}: VacancyLongevityBonusParagraphProps) => {
  const vacancyFormatted = formatTimelineCurrency(vacancyAmount);
  const includeLongevity = longevityAmount != null;

  if (includeLongevity) {
    const longevityFormatted = formatTimelineCurrency(longevityAmount);

    return (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.vacancy_longevity_bonus.with_longevity">
          The landlord could have increased the rent by {vacancyFormatted}{" "}
          through the use of a <VacancyBonusLink /> and {longevityFormatted}{" "}
          through the use of a <LongevityBonusLink />.
        </Trans>
      </div>
    );
  }

  return (
    <div className="timeline-element__copy-paragraph">
      <Trans id="timeline.copy.vacancy_longevity_bonus.vacancy_only">
        The landlord could have increased the rent by {vacancyFormatted} through
        the use of a <VacancyBonusLink />.
      </Trans>
    </div>
  );
};
