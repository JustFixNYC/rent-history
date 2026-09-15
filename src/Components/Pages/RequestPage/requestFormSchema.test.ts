import { i18n } from "@lingui/core";
import { beforeEach, describe, expect, it } from "vitest";

import { createRequestFormSchema } from "./requestFormSchema";

describe("createRequestFormSchema", () => {
  beforeEach(() => {
    i18n.activate("en");
  });

  it("accepts valid form values", () => {
    const schema = createRequestFormSchema(i18n);
    const result = schema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      apartmentNumber: "4B",
      phone: "(555) 444-3333",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty required fields", () => {
    const schema = createRequestFormSchema(i18n);
    const result = schema.safeParse({
      firstName: "",
      lastName: "",
      apartmentNumber: "",
      phone: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual([
        "firstName",
        "lastName",
        "apartmentNumber",
        "phone",
      ]);
    }
  });

  it("rejects phone numbers that are not 10 digits", () => {
    const schema = createRequestFormSchema(i18n);
    const result = schema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      apartmentNumber: "4B",
      phone: "555-1234",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["phone"]);
    }
  });

  it("rejects phone numbers with invalid area codes", () => {
    const schema = createRequestFormSchema(i18n);
    const result = schema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      apartmentNumber: "4B",
      phone: "(012) 555-1234",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["phone"]);
    }
  });

  it("enforces max lengths", () => {
    const schema = createRequestFormSchema(i18n);
    const result = schema.safeParse({
      firstName: "a".repeat(31),
      lastName: "b".repeat(151),
      apartmentNumber: "c".repeat(16),
      phone: "(555) 444-3333",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual([
        "firstName",
        "lastName",
        "apartmentNumber",
      ]);
    }
  });
});
