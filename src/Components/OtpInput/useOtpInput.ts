import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";

import { OTP_LENGTH, sanitizeOtpValue } from "./OtpInput";

export type UseOtpInputOptions = {
  length?: number;
  initialValue?: string;
  onValueChange?: (value: string) => void;
};

export type UseOtpInputResult = {
  value: string;
  setValue: (next: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  isComplete: boolean;
};

export function useOtpInput({
  length = OTP_LENGTH,
  initialValue = "",
  onValueChange,
}: UseOtpInputOptions = {}): UseOtpInputResult {
  const [value, setValueState] = useState(() =>
    sanitizeOtpValue(initialValue, length)
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const setValue = useCallback(
    (next: string) => {
      const sanitized = sanitizeOtpValue(next, length);
      setValueState(sanitized);
      onValueChange?.(sanitized);
    },
    [length, onValueChange]
  );

  const onChange = useCallback(
    (next: string) => {
      setValue(next);
    },
    [setValue]
  );

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
    }
  }, []);

  return {
    value,
    setValue,
    inputRef,
    onChange,
    onKeyDown,
    isComplete: value.length === length,
  };
}
