import classNames from "classnames";
import { Dropdown } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";

import {
  buildYearOptions,
  buildYearRangeOptions,
  DEFAULT_YEAR_MIN,
  defaultYearMax,
} from "./validation";

type YearOption = { value: string; label: string };

export type YearFieldProps = {
  id: string;
  labelText?: React.ReactNode;
  value: number | null;
  onChange: (year: number | null) => void;
  /** Defaults to 1984 through the current year when omitted. */
  years?: number[];
  placeholder?: string;
  className?: string;
  invalid?: boolean;
  invalidText?: string;
  disabled?: boolean;
};

export const YearField: React.FC<YearFieldProps> = ({
  id,
  labelText = "",
  value,
  onChange,
  years,
  placeholder,
  className,
  invalid,
  invalidText,
  disabled = false,
}) => {
  const { _ } = useLingui();
  const options = useMemo(
    () =>
      years
        ? buildYearOptions(years)
        : buildYearRangeOptions(DEFAULT_YEAR_MIN, defaultYearMax()),
    [years]
  );
  const selectedOption =
    options.find((option) => option.value === String(value)) ?? null;

  const handleChange = (option: YearOption | null) => {
    onChange(option ? Number(option.value) : null);
  };

  return (
    <Dropdown
      inputId={id}
      labelText={labelText}
      className={classNames("findings-review-year-field", className)}
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder ?? _(msg`Select Year`)}
      isClearable={false}
      invalid={invalid}
      invalidText={invalidText}
      disabled={disabled}
    />
  );
};
