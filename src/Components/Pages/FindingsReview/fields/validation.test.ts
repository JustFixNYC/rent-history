import { describe, expect, it } from "vitest";

import { buildRentAnswer, createRentValueStringSchema } from "./validation";

describe("createRentValueStringSchema", () => {
  const schema = createRentValueStringSchema();

  it("accepts empty and whitespace-only input", () => {
    expect(schema.safeParse("").success).toBe(true);
    expect(schema.safeParse("   ").success).toBe(true);
  });

  it("accepts numeric, weekly, and non-numeric rent labels", () => {
    expect(schema.safeParse("2590.86").success).toBe(true);
    expect(schema.safeParse("$2,590.86").success).toBe(true);
    expect(schema.safeParse("500.00W").success).toBe(true);
    expect(schema.safeParse("$500.00 W").success).toBe(true);
    expect(schema.safeParse("EXEMPT").success).toBe(true);
    expect(schema.safeParse("MISSING").success).toBe(true);
  });
});

describe("buildRentAnswer", () => {
  it("returns null for empty input", () => {
    expect(buildRentAnswer("")).toBe(null);
    expect(buildRentAnswer("   ")).toBe(null);
  });

  it("returns a number for currency-like input", () => {
    expect(buildRentAnswer("2590.86")).toBe(2590.86);
    expect(buildRentAnswer("$2,590.86")).toBe(2590.86);
  });

  it("returns text labels unchanged for non-numeric input", () => {
    expect(buildRentAnswer("EXEMPT")).toBe("EXEMPT");
    expect(buildRentAnswer("MISSING")).toBe("MISSING");
  });

  it("returns weekly rent strings unchanged for backend normalization", () => {
    expect(buildRentAnswer("500.00W")).toBe("500.00W");
    expect(buildRentAnswer("$500.00W")).toBe("$500.00W");
    expect(buildRentAnswer("500.00 W")).toBe("500.00 W");
  });
});
