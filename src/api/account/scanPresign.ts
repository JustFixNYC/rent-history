import { getRhAuthSession } from "../../session/rhSessionStorage";
import { ackRhHistoryScanUpload, postRhHistoryScanPresign } from "./api";
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

const ACK_ATTEMPTS = 3;
const ACK_BACKOFF_MS = [100, 200, 300];

const getAccessToken = (): string => {
  const session = getRhAuthSession();
  if (!session?.accessToken) {
    throw new PresignApiError("No active session. Sign in again.", 401);
  }
  return session.accessToken;
};

const accountErrorToPresignError = (err: AccountApiError): PresignApiError =>
  new PresignApiError(err.message, err.status, err.body);

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const PRESIGN_KEY_PATTERN = /^\d+\/[^/]+\/[^/]+$/;
const JPEG_FILENAME_PATTERN = /\.jpe?g$/i;

const normalizeUploadKey = (key: string): string =>
  key.trim().replace(/^\/+/, "");

const validateUploadKey = (key: string): void => {
  const normalized = normalizeUploadKey(key);
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

const historyIdFromUploadKey = (key: string): string => {
  const normalized = normalizeUploadKey(key);
  const historyId = normalized.split("/")[1];
  if (!historyId) {
    throw new PresignApiError(
      "Upload key must match profile_id/history_id/filename.",
      400,
      { key }
    );
  }
  return historyId;
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

const isRetriableAckError = (error: unknown): boolean => {
  if (error instanceof AccountApiError) {
    if (error.status >= 500) {
      return true;
    }
    return error.status === 400 && error.errorCode === "presign_not_found";
  }
  return true;
};

const ackUploadWithRetry = async (
  historyId: string,
  s3Key: string
): Promise<void> => {
  for (let attempt = 0; attempt < ACK_ATTEMPTS; attempt++) {
    try {
      await ackRhHistoryScanUpload(getAccessToken(), {
        history_id: historyId,
        s3_key: s3Key,
      });
      return;
    } catch (error) {
      if (!isRetriableAckError(error) || attempt === ACK_ATTEMPTS - 1) {
        if (error instanceof AccountApiError) {
          throw accountErrorToPresignError(error);
        }
        throw error;
      }
      await sleep(ACK_BACKOFF_MS[attempt] ?? 300);
    }
  }
};

const uploadToS3WithRetry = async (
  key: string,
  body: Blob,
  options?: ScanPresignOptions
): Promise<void> => {
  const maxAttempts = 1 + (options?.retries ?? 0);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
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

export const uploadScan = async (
  key: string,
  body: Blob,
  options?: ScanPresignOptions
): Promise<void> => {
  validateUploadKey(key);
  validateUploadBody(body);
  const normalizedKey = normalizeUploadKey(key);
  const historyId = historyIdFromUploadKey(key);

  await uploadToS3WithRetry(normalizedKey, body, options);
  await ackUploadWithRetry(historyId, normalizedKey);
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
