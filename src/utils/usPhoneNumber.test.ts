import { describe, expect, it } from "vitest";

import {
  isValidUsPhoneNumber,
  parseUsPhoneNationalDigits,
} from "./usPhoneNumber";

describe("parseUsPhoneNationalDigits", () => {
  it("parses common formatted inputs to 10-digit national", () => {
    expect(parseUsPhoneNationalDigits("(555) 123-4567")).toBe("5551234567");
    expect(parseUsPhoneNationalDigits("15551234567")).toBe("5551234567");
    expect(parseUsPhoneNationalDigits("+1 555 123 4567")).toBe("5551234567");
  });

  it("returns null for invalid lengths", () => {
    expect(parseUsPhoneNationalDigits("555-1234")).toBeNull();
    expect(parseUsPhoneNationalDigits("")).toBeNull();
  });
});

describe("isValidUsPhoneNumber", () => {
  it("accepts valid US phone numbers", () => {
    expect(isValidUsPhoneNumber("(555) 123-4567")).toBe(true);
    expect(isValidUsPhoneNumber("15551234567")).toBe(true);
    expect(isValidUsPhoneNumber("+1 555 123 4567")).toBe(true);
    expect(isValidUsPhoneNumber("2125551234")).toBe(true);
  });

  it("rejects invalid lengths", () => {
    expect(isValidUsPhoneNumber("555-1234")).toBe(false);
    expect(isValidUsPhoneNumber("")).toBe(false);
  });

  it("rejects invalid area codes starting with 0 or 1", () => {
    expect(isValidUsPhoneNumber("(012) 555-1234")).toBe(false);
    expect(isValidUsPhoneNumber("(112) 555-1234")).toBe(false);
    expect(isValidUsPhoneNumber("0125551234")).toBe(false);
    expect(isValidUsPhoneNumber("1125551234")).toBe(false);
  });
});
