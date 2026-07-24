import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { postRhHistoryScanPresign } from "./api";
import { PresignApiError, uploadScan } from "./scanPresign";
import { setRhAuthSession } from "../../session/rhSessionStorage";

vi.mock("./api", () => ({
  postRhHistoryScanPresign: vi.fn(),
}));

const uploadKey = "1/history-id/page.jpg";
const jpegBlob = new Blob(["jpeg"], { type: "image/jpeg" });

const presignResponse = {
  urls: [
    {
      key: uploadKey,
      url: "https://s3.example.com/upload",
      expires_in: 300,
    },
  ],
};

describe("uploadScan", () => {
  beforeEach(() => {
    setRhAuthSession({
      access_token: "access-token",
      refresh_token: "refresh-token",
      token_type: "Bearer",
      expires_in: 300,
      scope: "read write",
      profile: { id: 1, phone_number: "15554443333" },
    });
    vi.mocked(postRhHistoryScanPresign).mockResolvedValue(presignResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws PresignApiError when S3 PUT returns non-ok", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 403 }));

    await expect(uploadScan(uploadKey, jpegBlob)).rejects.toMatchObject({
      message: "S3 upload failed (HTTP 403).",
      status: 403,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(postRhHistoryScanPresign).toHaveBeenCalledTimes(1);
  });

  it("with retries: 0 makes a single attempt", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      uploadScan(uploadKey, jpegBlob, { retries: 0 })
    ).rejects.toBeInstanceOf(PresignApiError);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(postRhHistoryScanPresign).toHaveBeenCalledTimes(1);
  });

  it("with retries: 1 re-presigns and succeeds on second attempt", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    await expect(
      uploadScan(uploadKey, jpegBlob, { retries: 1 })
    ).resolves.toBeUndefined();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(postRhHistoryScanPresign).toHaveBeenCalledTimes(2);
  });

  it("with retries: 1 throws when both attempts fail", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      uploadScan(uploadKey, jpegBlob, { retries: 1 })
    ).rejects.toMatchObject({
      message: "S3 upload failed (HTTP 500).",
      status: 500,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(postRhHistoryScanPresign).toHaveBeenCalledTimes(2);
  });
});
