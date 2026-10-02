import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it, vi } from "vitest";
import { OtpInput } from "../Components/OtpInput/OtpInput";

class BrokenEvent {
  type: string;
  bubbles = false;
  cancelable = false;
  constructor(type: string) {
    this.type = type;
  }
}

describe("input-otp async timers", () => {
  afterEach(() => {
    cleanup();
    globalThis.Event = window.Event;
  });

  it("does not throw when input-otp timers fire with a foreign Event constructor", async () => {
    render(
      <OtpInput
        id="verification-code"
        name="otp"
        value=""
        onChange={vi.fn()}
        autoFocus
        aria-label="Verification code"
      />
    );

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "1" },
    });

    // Simulate Node's Event winning over jsdom's before input-otp timers fire.
    globalThis.Event = BrokenEvent as typeof Event;

    await new Promise((resolve) => setTimeout(resolve, 100));
  });
});
