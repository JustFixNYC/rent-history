import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rightsPagesDir = dirname(fileURLToPath(import.meta.url));

describe("rights accordion deep-link ids", () => {
  it("includes smoke-test ids for hash navigation in section configs", () => {
    const assertConfig = readFileSync(
      join(rightsPagesDir, "AssertYourRights/assertYourRightsSections.tsx"),
      "utf8"
    );
    const knowConfig = readFileSync(
      join(rightsPagesDir, "KnowYourRights/knowYourRightsSections.tsx"),
      "utf8"
    );

    expect(assertConfig).toContain('id: "ayr-dhcr-complaint"');
    expect(knowConfig).toContain('id: "rs-rent-increase-limits"');
    expect(knowConfig).toContain('id: "nycha-repairs"');
  });
});
