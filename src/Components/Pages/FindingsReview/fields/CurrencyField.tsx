import classNames from "classnames";
import { TextInput } from "@justfixnyc/component-library";

export type CurrencyFieldProps = {
  id: string;
  labelText: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  readonly?: boolean;
  className?: string;
  invalid?: boolean;
  invalidText?: string;
  placeholder?: string;
  "aria-label"?: string;
};

export const CurrencyField: React.FC<CurrencyFieldProps> = ({
  id,
  labelText,
  value,
  onChange,
  onBlur,
  readonly = false,
  className,
  invalid,
  invalidText,
  placeholder,
  "aria-label": ariaLabel,
}) => (
  <TextInput
    id={id}
    labelText={labelText}
    type="text"
    inputMode="decimal"
    className={classNames(
      "findings-review-currency-field",
      readonly && "findings-review-currency-field--readonly",
      className
    )}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    onBlur={onBlur}
    disabled={readonly}
    invalid={invalid}
    invalidText={invalidText}
    placeholder={placeholder}
    aria-label={ariaLabel}
  />
);
