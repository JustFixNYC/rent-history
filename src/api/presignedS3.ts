export type PresignedUrlEntry = {
  key: string;
  url: string;
  expires_in: number;
};

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

const getPresignApiUrl = (): URL => {
  const raw = import.meta.env.VITE_PRESIGN_S3_API_BASE_URL?.trim();
  if (!raw) {
    throw new Error("VITE_PRESIGN_S3_API_BASE_URL is not configured.");
  }
  const baseWithSlash = raw.endsWith("/") ? raw : `${raw}/`;
  return new URL("presign", baseWithSlash);
};

const getBearerToken = (): string => {
  const token = import.meta.env.VITE_PRESIGNED_S3_API_TOKEN?.trim();
  if (!token) {
    throw new Error("VITE_PRESIGNED_S3_API_TOKEN is not configured.");
  }
  return token;
};

const parseErrorBody = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

const messageFromErrorBody = (data: unknown): string | undefined => {
  if (typeof data === "object" && data && "error" in data) {
    return String((data as { error: string }).error);
  }
  return undefined;
};

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
  if (contentType && contentType !== "image/jpeg" && contentType !== "image/jpg") {
    throw new PresignApiError("Upload body must be a JPEG image.", 400, {
      contentType: body.type,
    });
  }
};

const fetchPresignedUrls = async (
  operation: "upload" | "download",
  keys: string[]
): Promise<PresignedUrlEntry[]> => {
  const url = getPresignApiUrl();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getBearerToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ operation, keys }),
  });

  const data: unknown = await parseErrorBody(response);

  if (!response.ok) {
    throw new PresignApiError(
      messageFromErrorBody(data) ??
        `Presign request failed with status ${response.status}.`,
      response.status,
      data
    );
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("urls" in data) ||
    !Array.isArray((data as { urls: unknown }).urls)
  ) {
    throw new PresignApiError(
      "Presign response missing urls array.",
      response.status,
      data
    );
  }

  const urls = (data as { urls: PresignedUrlEntry[] }).urls;
  return urls;
};

const presignedUpload = async (signedUrl: string, body: Blob): Promise<Response> => {
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

export const uploadScan = async (key: string, body: Blob): Promise<Response> => {
  validateUploadKey(key);
  validateUploadBody(body);
  const urls = await fetchPresignedUrls("upload", [key]);
  const entry = urls[0];
  if (!entry?.url) {
    throw new PresignApiError("Presign response missing URL for key.", 500);
  }
  return presignedUpload(entry.url, body);
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
