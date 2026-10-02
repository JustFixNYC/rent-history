import { describe, expect, it } from "vitest";

class BrokenEvent {
  type: string;
  constructor(type: string) {
    this.type = type;
  }
}

describe("dispatchEvent patch", () => {
  it("accepts non-jsdom Event instances", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);

    expect(() => {
      input.dispatchEvent(new BrokenEvent("input") as unknown as Event);
    }).not.toThrow();
  });
});
