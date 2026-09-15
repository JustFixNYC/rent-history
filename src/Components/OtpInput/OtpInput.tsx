import classNames from "classnames";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type Ref,
} from "react";

import "./OtpInput.scss";

export const OTP_LENGTH = 6;

export const sanitizeOtpValue = (
  raw: string,
  length: number = OTP_LENGTH
): string => raw.replace(/\D/g, "").slice(0, length);

export type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: Ref<HTMLInputElement>;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  id: string;
  name: string;
  autoFocus?: boolean;
  "aria-describedby"?: string;
  "aria-label": string;
  className?: string;
};

/**
 * OTP field built on input-otp: decorative cells with a single real input.
 */
export function OtpInput({
  length = OTP_LENGTH,
  value,
  onChange,
  onKeyDown,
  inputRef,
  onComplete,
  disabled = false,
  invalid = false,
  id,
  name,
  autoFocus = false,
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  className,
}: OtpInputProps) {
  const previousLengthRef = useRef(value.length);

  useEffect(() => {
    if (
      onComplete &&
      value.length === length &&
      previousLengthRef.current < length
    ) {
      onComplete(value);
    }
    previousLengthRef.current = value.length;
  }, [length, onComplete, value]);

  return (
    <OTPInput
      maxLength={length}
      value={value}
      onChange={onChange}
      pattern={REGEXP_ONLY_DIGITS}
      textAlign="center"
      pasteTransformer={(pasted) => sanitizeOtpValue(pasted, length)}
      containerClassName={classNames("otp-input", className, {
        "otp-input--invalid": invalid,
        "otp-input--disabled": disabled,
      })}
      className="otp-input__field"
      ref={inputRef}
      id={id}
      name={name}
      disabled={disabled}
      autoFocus={autoFocus}
      autoComplete="one-time-code"
      inputMode="numeric"
      required
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-invalid={invalid || undefined}
      onKeyDown={onKeyDown}
      render={({ slots }) => (
        <div
          className="otp-input__cells"
          style={{ "--otp-length": length } as CSSProperties}
          aria-hidden="true"
        >
          {slots.map((slot, index) => (
            <span
              key={`otp-cell-${index}`}
              className={classNames("otp-input__cell", {
                "otp-input__cell--active": slot.isActive,
              })}
            >
              {slot.char}
              {slot.hasFakeCaret && (
                <span className="otp-input__caret" aria-hidden="true" />
              )}
            </span>
          ))}
        </div>
      )}
    />
  );
}

export default OtpInput;
