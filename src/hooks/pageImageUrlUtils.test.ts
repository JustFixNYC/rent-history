import { describe, expect, it, vi } from "vitest";

import { clearPageImageUrls } from "./pageImageUrlUtils";

describe("pageImageUrlUtils", () => {
  it("clearPageImageUrls revokes urls and clears state", () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      revokeObjectURL,
    });

    const urls = { "key-1": "blob:1", "key-2": "blob:2" };
    const setUrls = vi.fn();

    clearPageImageUrls(urls, setUrls);

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:1");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:2");
    expect(setUrls).toHaveBeenCalledWith({});

    vi.unstubAllGlobals();
  });
});
