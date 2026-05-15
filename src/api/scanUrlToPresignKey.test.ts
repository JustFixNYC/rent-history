import { describe, expect, it } from "vitest";
import { scanUrlToPresignKey, ScanUrlToKeyError } from "./scanUrlToPresignKey";

describe("scanUrlToPresignKey", () => {
  it("extracts key from virtual-hosted S3 URL", () => {
    expect(
      scanUrlToPresignKey(
        "https://my-bucket.s3.amazonaws.com/42/aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee/page1.jpg"
      )
    ).toBe("42/aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee/page1.jpg");
  });

  it("strips leading slashes on pathname", () => {
    expect(
      scanUrlToPresignKey("https://b.s3.amazonaws.com/1/h/page.jpeg")
    ).toBe("1/h/page.jpeg");
  });

  it("decodes percent-encoded path segments", () => {
    expect(
      scanUrlToPresignKey(
        "https://b.s3.amazonaws.com/1/aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee/page%201.jpg"
      )
    ).toBe("1/aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee/page 1.jpg");
  });

  it("throws ScanUrlToKeyError on malformed URL", () => {
    expect(() => scanUrlToPresignKey("not-a-url")).toThrow(ScanUrlToKeyError);
  });

  it("throws when path does not match presign key pattern", () => {
    expect(() =>
      scanUrlToPresignKey("https://b.s3.amazonaws.com/wrong/path/only.jpg")
    ).toThrow(ScanUrlToKeyError);
  });
});
