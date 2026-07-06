import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";

const DEFAULT_LENGTH = 6;

function sanitizeOtpValue(raw: string, length: number): string {
  return raw.replace(/\D/g, "").slice(0, length);
}

export type UseOtpInputOptions = {
  length?: number;
  initialValue?: string;
  onValueChange?: (value: string) => void;
};

export type UseOtpInputResult = {
  value: string;
  setValue: (next: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  isComplete: boolean;
};

export function useOtpInput({
  length = DEFAULT_LENGTH,
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
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    [setValue]
  );

  const onPaste = useCallback(
    (event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      setValue(event.clipboardData.getData("text"));
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
    onPaste,
    isComplete: value.length === length,
  };
}
