import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { downloadScans } from "../api/account/scanPresign";

import { usePresignedPageImageUrls } from "./usePresignedPageImageUrls";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

vi.mock("../api/account/scanPresign", () => ({
  downloadScans: vi.fn(),
}));

const keyA = "1/history-a/page-a.jpg";
const keyB = "1/history-a/page-b.jpg";

const mockBlobResponse = (body = "image-bytes") =>
  new Response(body, {
    status: 200,
    headers: { "Content-Type": "image/jpeg" },
  });

describe("usePresignedPageImageUrls", () => {
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    i18n.load("en", {});
    i18n.activate("en");
    vi.clearAllMocks();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL,
    });
    vi.mocked(downloadScans).mockResolvedValue([
      { key: keyA, response: mockBlobResponse() },
      { key: keyB, response: mockBlobResponse() },
    ]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not download when disabled", () => {
    renderHook(
      () =>
        usePresignedPageImageUrls({
          s3Keys: [keyA],
          enabled: false,
        }),
      { wrapper }
    );

    expect(downloadScans).not.toHaveBeenCalled();
  });

  it("downloads keys and exposes blob URLs when enabled", async () => {
    const { result } = renderHook(
      () =>
        usePresignedPageImageUrls({
          s3Keys: [keyA, keyB],
          enabled: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(downloadScans).toHaveBeenCalledWith([keyA, keyB]);
    expect(result.current.urlsByKey).toEqual({
      [keyA]: "blob:mock-url",
      [keyB]: "blob:mock-url",
    });
    expect(result.current.error).toBeNull();
  });

  it("revokes URLs on unmount", async () => {
    const { result, unmount } = renderHook(
      () =>
        usePresignedPageImageUrls({
          s3Keys: [keyA],
          enabled: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.urlsByKey[keyA]).toBe("blob:mock-url");
    });

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("clear revokes current URLs and resets state", async () => {
    const { result } = renderHook(
      () =>
        usePresignedPageImageUrls({
          s3Keys: [keyA],
          enabled: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.urlsByKey[keyA]).toBe("blob:mock-url");
    });

    act(() => {
      result.current.clear();
    });

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(result.current.urlsByKey).toEqual({});
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("retries after a failed download", async () => {
    let callCount = 0;
    vi.mocked(downloadScans).mockImplementation(async () => {
      callCount += 1;
      if (callCount === 1) {
        throw new Error("network error");
      }
      return [{ key: keyA, response: mockBlobResponse() }];
    });

    const { result } = renderHook(
      () =>
        usePresignedPageImageUrls({
          s3Keys: [keyA],
          enabled: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.error).toBe("network error");
    });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.urlsByKey[keyA]).toBe("blob:mock-url");
    });

    expect(result.current.urlsByKey[keyA]).toBe("blob:mock-url");
    expect(result.current.error).toBeNull();
    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it("revokes in-flight URLs when keys change before completion", async () => {
    let resolveDownload: (value: { key: string; response: Response }[]) => void;
    const pendingDownload = new Promise<{ key: string; response: Response }[]>(
      (resolve) => {
        resolveDownload = resolve;
      }
    );

    vi.mocked(downloadScans).mockReturnValue(pendingDownload);

    const { result, rerender } = renderHook(
      ({ keys }: { keys: string[] }) =>
        usePresignedPageImageUrls({
          s3Keys: keys,
          enabled: true,
        }),
      { initialProps: { keys: [keyA] }, wrapper }
    );

    rerender({ keys: [keyB] });

    await act(async () => {
      resolveDownload!([{ key: keyA, response: mockBlobResponse() }]);
      await pendingDownload;
    });

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(result.current.urlsByKey).toEqual({});
  });
});
