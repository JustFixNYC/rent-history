import type { Finding } from "../types/finding";

export type ParseNumericRentMessages = {
  ifMissing: string;
  ifNotNumeric: string;
};

/** Parse wire `legal_rent` (number or string) with NaN guard for intro/result copy. */
export function parseNumericRent(
  raw: number | string | null | undefined,
  messages: ParseNumericRentMessages
): number {
  if (raw == null || (typeof raw !== "number" && typeof raw !== "string")) {
    throw new Error(messages.ifMissing);
  }

  const value = typeof raw === "number" ? raw : Number.parseFloat(raw);

  if (Number.isNaN(value)) {
    throw new Error(messages.ifNotNumeric);
  }

  return value;
}

export type CurrTenantIntroValueMap = {
  year0: (finding: Finding) => number | null | undefined;
  year1: (finding: Finding) => number | null | undefined;
  lastRegistrationYear?: (finding: Finding) => number | null | undefined;
  reportedRent: (finding: Finding) => number | string | null | undefined;
};

type CreateCurrTenantIntroValuesGetterConfig = {
  valueMap: CurrTenantIntroValueMap;
  missingDataMessage: string;
  invalidReportedRentMessage: string;
  requireLastRegistrationYear?: boolean;
};

/** Factory for shape-A curr-tenant intro maps (`year0`, `year1`, optional `lastRegistrationYear`, `reportedRent`). */
export function createCurrTenantIntroValuesGetter<
  TResult extends {
    findingYear: number;
    year0: number;
    year1: number;
    reportedRent: number;
  }
>({
  valueMap,
  missingDataMessage,
  invalidReportedRentMessage,
  requireLastRegistrationYear = false,
}: CreateCurrTenantIntroValuesGetterConfig): (finding: Finding) => TResult {
  return (finding: Finding): TResult => {
    const year0 = valueMap.year0(finding);
    const year1 = valueMap.year1(finding);
    const lastRegistrationYear = valueMap.lastRegistrationYear?.(finding);

    if (
      year0 == null ||
      year1 == null ||
      (requireLastRegistrationYear && lastRegistrationYear == null)
    ) {
      throw new Error(missingDataMessage);
    }

    const reportedRent = parseNumericRent(valueMap.reportedRent(finding), {
      ifMissing: missingDataMessage,
      ifNotNumeric: invalidReportedRentMessage,
    });

    const base = {
      findingYear: finding.finding_year,
      year0,
      year1,
      reportedRent,
    };

    if (requireLastRegistrationYear && lastRegistrationYear != null) {
      return { ...base, lastRegistrationYear } as unknown as TResult;
    }

    return base as unknown as TResult;
  };
}

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
