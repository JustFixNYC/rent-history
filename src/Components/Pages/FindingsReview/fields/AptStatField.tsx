import classNames from "classnames";
import { Dropdown } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";

/** Common apartment status values from OCR and review tables. */
export const DEFAULT_APT_STAT_OPTIONS = [
  "RS",
  "RS-V",
  "RS-TE",
  "PE",
  "RC",
  "RS-NH",
] as const;

type AptStatOption = { value: string; label: string };

const toOptions = (values: readonly string[]): AptStatOption[] =>
  values.map((value) => ({ value, label: value }));

export type AptStatFieldProps = {
  id: string;
  labelText?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options?: readonly string[];
  placeholder?: string;
  className?: string;
  invalid?: boolean;
  invalidText?: string;
  disabled?: boolean;
};

export const AptStatField: React.FC<AptStatFieldProps> = ({
  id,
  labelText = "",
  value,
  onChange,
  options = DEFAULT_APT_STAT_OPTIONS,
  placeholder,
  className,
  invalid,
  invalidText,
  disabled = false,
}) => {
  const { _ } = useLingui();
  const dropdownOptions = useMemo(() => {
    const merged =
      value && !options.includes(value) ? [...options, value] : options;
    return toOptions(merged);
  }, [options, value]);

  const selectedOption =
    dropdownOptions.find((option) => option.value === value) ?? null;

  const handleChange = (option: AptStatOption | null) => {
    onChange(option?.value ?? "");
  };

  return (
    <Dropdown
      inputId={id}
      labelText={labelText}
      className={classNames("findings-review-apt-stat-field", className)}
      options={dropdownOptions}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder ?? _(msg`Select Apt Stat`)}
      isClearable={false}
      invalid={invalid}
      invalidText={invalidText}
      disabled={disabled}
    />
  );
};
