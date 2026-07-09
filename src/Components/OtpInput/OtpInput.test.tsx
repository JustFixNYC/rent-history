import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OtpInput } from "./OtpInput";
import { useOtpInput } from "./useOtpInput";
import "./OtpInput.scss";

type HarnessProps = {
  onComplete?: (value: string) => void;
  initialValue?: string;
};

function OtpInputHarness({ onComplete, initialValue = "" }: HarnessProps) {
  const otp = useOtpInput({ initialValue });

  return (
    <OtpInput
      value={otp.value}
      onChange={otp.onChange}
      onKeyDown={otp.onKeyDown}
      onPaste={otp.onPaste}
      inputRef={otp.inputRef}
      onComplete={onComplete}
      id="verification-code"
      name="otp"
      aria-label="Verification code"
    />
  );
}

describe("OtpInput", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders six visual cells", () => {
    const { container } = render(<OtpInputHarness />);

    expect(container.querySelectorAll(".otp-input__cell")).toHaveLength(6);
  });

  it("typing advances value and calls onComplete at six digits", () => {
    const onComplete = vi.fn();
    render(<OtpInputHarness onComplete={onComplete} />);

    const input = screen.getByLabelText("Verification code");

    fireEvent.change(input, { target: { value: "1" } });
    expect(input).toHaveValue("1");

    fireEvent.change(input, { target: { value: "12" } });
    expect(input).toHaveValue("12");

    fireEvent.change(input, { target: { value: "123456" } });
    expect(input).toHaveValue("123456");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("pastes a full code into the single input and calls onComplete", () => {
    const onComplete = vi.fn();
    render(<OtpInputHarness onComplete={onComplete} />);

    const input = screen.getByLabelText("Verification code");

    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "123456",
      },
    });

    expect(input).toHaveValue("123456");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("accepts multi-character autofill via change event", () => {
    render(<OtpInputHarness />);

    const input = screen.getByLabelText("Verification code");

    fireEvent.change(input, { target: { value: "123456" } });

    expect(input).toHaveValue("123456");
  });

  it("removes digits with backspace", () => {
    render(<OtpInputHarness initialValue="123456" />);

    const input = screen.getByLabelText("Verification code");

    fireEvent.change(input, { target: { value: "12345" } });

    expect(input).toHaveValue("12345");
  });

  it("exposes one-time-code autocomplete on the real input", () => {
    render(<OtpInputHarness />);

    const input = screen.getByLabelText("Verification code");

    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("maxlength", "6");
    expect(input).toHaveAttribute("pattern", "\\d{6}");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("name", "otp");
  });

  it("reflects typed digits in decorative cells", () => {
    const { container } = render(<OtpInputHarness />);
    const input = screen.getByLabelText("Verification code");

    fireEvent.change(input, { target: { value: "123" } });

    const cells = container.querySelectorAll(".otp-input__cell");
    expect(cells[0]).toHaveTextContent("1");
    expect(cells[1]).toHaveTextContent("2");
    expect(cells[2]).toHaveTextContent("3");
    expect(cells[3]).toHaveTextContent("");
  });
});
