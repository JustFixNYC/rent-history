import { describe, expect, it } from "vitest";

import { buildLocalePath, removeLocalePrefix } from "./i18n";

describe("removeLocalePrefix", () => {
  it("strips a locale prefix from nested paths", () => {
    expect(removeLocalePrefix("/en/about")).toBe("/about");
  });

  it("returns root for locale-only paths", () => {
    expect(removeLocalePrefix("/en")).toBe("/");
  });

  it("returns the path unchanged when there is no locale prefix", () => {
    expect(removeLocalePrefix("/about")).toBe("/about");
  });
});

describe("buildLocalePath", () => {
  it("builds a path for the same page in another locale", () => {
    expect(buildLocalePath("es", "/en/about")).toBe("/es/about");
  });

  it("handles locale-only root paths", () => {
    expect(buildLocalePath("es", "/en")).toBe("/es/");
  });

  it("preserves query strings", () => {
    expect(buildLocalePath("es", "/en/about", "?foo=1")).toBe(
      "/es/about?foo=1"
    );
  });

  it("passes through unprefixed paths", () => {
    expect(buildLocalePath("en", "/about")).toBe("/en/about");
  });
});
