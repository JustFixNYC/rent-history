import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppScrollProvider } from "./AppScrollContext";
import { useScrollToTopWhen } from "./useScrollToTopWhen";

function Harness({ scrollKey }: { scrollKey: string | null | undefined }) {
  useScrollToTopWhen(scrollKey);
  return null;
}

describe("useScrollToTopWhen", () => {
  it("scrolls when key is set and when it changes", () => {
    const el = document.createElement("div");
    el.scrollTop = 100;
    const containerRef = { current: el };

    const { rerender } = render(
      <AppScrollProvider containerRef={containerRef}>
        <Harness scrollKey="first" />
      </AppScrollProvider>
    );
    expect(el.scrollTop).toBe(0);

    el.scrollTop = 200;
    rerender(
      <AppScrollProvider containerRef={containerRef}>
        <Harness scrollKey="second" />
      </AppScrollProvider>
    );
    expect(el.scrollTop).toBe(0);
  });

  it("does not scroll when key is null", () => {
    const el = document.createElement("div");
    el.scrollTop = 50;
    const containerRef = { current: el };

    render(
      <AppScrollProvider containerRef={containerRef}>
        <Harness scrollKey={null} />
      </AppScrollProvider>
    );
    expect(el.scrollTop).toBe(50);
  });
});
