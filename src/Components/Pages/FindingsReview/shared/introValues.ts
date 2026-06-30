import type { Finding } from "../types/finding";

export type PercentIncreaseIntroValueMap = {
  year0: (finding: Finding) => number | null | undefined;
  year1: (finding: Finding) => number | null | undefined;
  rent0: (finding: Finding) => number | string | null | undefined;
  rent1: (finding: Finding) => number | string | null | undefined;
  percentIncrease: (finding: Finding) => number | null | undefined;
};

export type PercentIncreaseIntroValues = {
  findingYear: number;
  year0: number;
  year1: number;
  rent0: number;
  rent1: number;
  percentIncrease: number;
};

type CreateIntroValuesGetterConfig = {
  findingType: string;
  valueMap: PercentIncreaseIntroValueMap;
  missingDataMessage?: string;
};

/** Factory for intro panels that derive percent-increase copy from two row rents. */
export function createIntroValuesGetter({
  findingType,
  valueMap,
  missingDataMessage,
}: CreateIntroValuesGetterConfig): (
  finding: Finding
) => PercentIncreaseIntroValues {
  const errorMessage =
    missingDataMessage ??
    `${findingType} intro requires two rows with numeric rent values`;

  return (finding: Finding): PercentIncreaseIntroValues => {
    const year0 = valueMap.year0(finding);
    const year1 = valueMap.year1(finding);
    const rent0 = valueMap.rent0(finding);
    const rent1 = valueMap.rent1(finding);
    const percentIncrease = valueMap.percentIncrease(finding);

    if (
      year0 == null ||
      year1 == null ||
      typeof rent0 !== "number" ||
      typeof rent1 !== "number" ||
      percentIncrease == null
    ) {
      throw new Error(errorMessage);
    }

    return {
      findingYear: finding.finding_year,
      year0,
      year1,
      rent0,
      rent1,
      percentIncrease,
    };
  };
}
