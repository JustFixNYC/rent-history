import { z } from "zod";

/** Default min year for `YearField` options and year zod schemas. */
export const DEFAULT_YEAR_MIN = 1984;

export function defaultYearMax(): number {
  return new Date().getFullYear();
}

/** Strip currency formatting and parse to a finite number, or null if invalid. */
export function parseCurrencyInput(value: string): number | null {
  const normalized = value.replace(/[$,\s]/g, "");
  if (normalized === "") {
    return null;
  }
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

export function createCurrencyStringSchema(messages: {
  required: string;
  invalid: string;
}) {
  return z
    .string()
    .trim()
    .min(1, messages.required)
    .refine((value) => {
      const parsed = parseCurrencyInput(value);
      return parsed !== null && parsed >= 0;
    }, messages.invalid);
}

export function createYearSchema(
  messages: { required: string; invalid: string },
  range?: { min?: number; max?: number }
) {
  const min = range?.min ?? DEFAULT_YEAR_MIN;
  const max = range?.max ?? defaultYearMax();

  return z
    .number({
      error: messages.invalid,
    })
    .int()
    .min(min, messages.invalid)
    .max(max, messages.invalid);
}

export function createRequiredYearSchema(
  messages: { required: string; invalid: string },
  range?: { min?: number; max?: number }
) {
  return createYearSchema(messages, range)
    .nullable()
    .refine((value): value is number => value !== null, messages.required);
}

export function createYesNoSchema(requiredMessage: string) {
  return z
    .boolean({
      error: requiredMessage,
    })
    .nullable()
    .refine((value): value is boolean => value !== null, requiredMessage);
}

export function buildYearOptions(
  years: number[]
): { value: string; label: string }[] {
  return [...years]
    .sort((a, b) => b - a)
    .map((year) => ({
      value: String(year),
      label: String(year),
    }));
}

export function buildYearRangeOptions(
  minYear: number,
  maxYear: number
): { value: string; label: string }[] {
  const years: number[] = [];
  for (let year = maxYear; year >= minYear; year -= 1) {
    years.push(year);
  }
  return buildYearOptions(years);
}
