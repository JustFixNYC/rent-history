import { getRhAuthSession } from "../../session/rhSessionStorage";
import { postRhHistoryScanPresign } from "./api";
import { AccountApiError } from "./errors";
import type { RhScanPresignUrlEntry } from "./types";

export type PresignedUrlEntry = RhScanPresignUrlEntry;

export type ScanPresignOptions = { retries?: number };

export class PresignApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly info?: unknown
  ) {
    super(message);
    this.name = "PresignApiError";
  }
}

const getAccessToken = (): string => {
  const session = getRhAuthSession();
  if (!session?.accessToken) {
    throw new PresignApiError("No active session. Sign in again.", 401);
  }
  return session.accessToken;
};

const accountErrorToPresignError = (err: AccountApiError): PresignApiError =>
  new PresignApiError(err.message, err.status, err.body);

const PRESIGN_KEY_PATTERN = /^\d+\/[^/]+\/[^/]+$/;
const JPEG_FILENAME_PATTERN = /\.jpe?g$/i;

const validateUploadKey = (key: string): void => {
  const normalized = key.trim().replace(/^\/+/, "");
  if (!PRESIGN_KEY_PATTERN.test(normalized)) {
    throw new PresignApiError(
      "Upload key must match profile_id/history_id/filename.",
      400,
      { key }
    );
  }

  const filename = normalized.split("/")[2] ?? "";
  if (!JPEG_FILENAME_PATTERN.test(filename)) {
    throw new PresignApiError(
      "Upload filename must end with .jpg or .jpeg.",
      400,
      { key }
    );
  }
};

const validateUploadBody = (body: Blob): void => {
  const contentType = body.type?.toLowerCase().trim();
  if (
    contentType &&
    contentType !== "image/jpeg" &&
    contentType !== "image/jpg"
  ) {
    throw new PresignApiError("Upload body must be a JPEG image.", 400, {
      contentType: body.type,
    });
  }
};

const fetchPresignedUrls = async (
  operation: "upload" | "download",
  keys: string[]
): Promise<PresignedUrlEntry[]> => {
  try {
    const body = await postRhHistoryScanPresign(getAccessToken(), {
      operation,
      keys,
    });
    return body.urls;
  } catch (error) {
    if (error instanceof AccountApiError) {
      throw accountErrorToPresignError(error);
    }
    throw error;
  }
};

const presignedUpload = async (
  signedUrl: string,
  body: Blob
): Promise<Response> => {
  return fetch(signedUrl, {
    method: "PUT",
    body,
    headers: {
      "Content-Type": "image/jpeg",
    },
  });
};

const presignedDownload = async (signedUrl: string): Promise<Response> => {
  return fetch(signedUrl, { method: "GET" });
};

export const uploadScan = async (
  key: string,
  body: Blob,
  options?: ScanPresignOptions
): Promise<void> => {
  const maxAttempts = 1 + (options?.retries ?? 0);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      validateUploadKey(key);
      validateUploadBody(body);
      const urls = await fetchPresignedUrls("upload", [key]);
      const entry = urls[0];
      if (!entry?.url) {
        throw new PresignApiError("Presign response missing URL for key.", 500);
      }
      const response = await presignedUpload(entry.url, body);
      if (!response.ok) {
        throw new PresignApiError(
          `S3 upload failed (HTTP ${response.status}).`,
          response.status
        );
      }
      return;
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }
};

export const downloadScans = async (
  keys: string[]
): Promise<{ key: string; response: Response }[]> => {
  const urls = await fetchPresignedUrls("download", keys);
  const promises = urls.map(async ({ key, url }) => {
    const response = await presignedDownload(url);
    return { key, response };
  });
  return Promise.all(promises);
};
