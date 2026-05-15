export type OtpRequestStatus = "sent" | "pending";
export type OtpRequestResponse = { status: OtpRequestStatus; message?: string };

export type RhProfile = {
  id: number;
  phone_number: string;
  rent_history_id: string;
};

export type RhPhoneUpsertResult = {
  profile: RhProfile;
  existed: boolean;
};

export type RhOtpTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  profile: RhProfile;
};

/** Response body from `POST /rh/history` (create only — `id` only). */
export type RhHistoryRecord = {
  id: string;
};

/** `POST /rh/history/combine-pages` success body. */
export type RhHistoryCombinePagesResponse = {
  status: "ok";
};

export type RhHistoryPageDeleteResponse = {
  deleted_pages: number;
  s3_cleanup_status: string;
  s3_deleted_versions?: number;
};

/** Axis from `GET /rh/history/pages-readiness` (OpenAPI `RhReadinessS3Axis` / `RhReadinessDatabaseAxis`). */
export type RhReadinessAxis = {
  count: number;
  expected: number;
  relation: "less" | "equal" | "more";
};

/** `RhPageSummary` from OpenAPI — pages list when readiness returns 200. */
export type RhPageSummary = {
  needs_retake: boolean;
  quality_issue_reason?: string | null;
  error?: string | null;
  scan_url: string;
  start_year: number | null;
  end_year: number | null;
  is_coverpage: boolean | null;
};

export type RhPagesReadinessMismatchBody = {
  s3: RhReadinessAxis;
  database: RhReadinessAxis;
};

export type RhPagesReadinessOkBody = RhPagesReadinessMismatchBody & {
  pages: RhPageSummary[];
};

export type RhPagesReadinessResult =
  | { outcome: "ready"; body: RhPagesReadinessOkBody }
  | { outcome: "mismatch"; body: RhPagesReadinessMismatchBody };

export class RhAuthApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly info?: { error?: string; message?: string } | unknown
  ) {
    super(message);
  }
}

const getAuthProviderBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_AUTH_PROVIDER_BASE_URL as
    | string
    | undefined;
  if (!baseUrl) {
    throw new Error("VITE_AUTH_PROVIDER_BASE_URL is not configured.");
  }
  return baseUrl;
};

const getRhOauthClientId = (): string => {
  const clientId = import.meta.env.VITE_RH_OAUTH_CLIENT_ID as
    | string
    | undefined;
  if (!clientId) {
    throw new Error("VITE_RH_OAUTH_CLIENT_ID is not configured.");
  }
  return clientId;
};

const getRhOauthClientSecret = (): string | undefined => {
  const clientSecret = import.meta.env.VITE_RH_OAUTH_CLIENT_SECRET as
    | string
    | undefined;
  return clientSecret || undefined;
};

const parseRhJsonError = (data: unknown, response: Response): string => {
  const fallbackMessage = `Request failed with status ${response.status}.`;
  if (typeof data === "object" && data && "error" in data) {
    return String((data as { error: string }).error);
  }
  return fallbackMessage;
};

const postRh = async <T>(path: string, body: object): Promise<T> => {
  const response = await fetch(new URL(path, getAuthProviderBaseUrl()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data: unknown = undefined;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    throw new RhAuthApiError(
      response.status,
      parseRhJsonError(data, response),
      data
    );
  }

  return data as T;
};

/**
 * POST with `Authorization: Bearer` only (no JSON body). For OAuth2-protected `/rh/*` routes.
 * Success is any `response.ok` status (e.g. 201 for `POST /rh/history`).
 */
const postRhAuthorized = async <T>(
  path: string,
  accessToken: string
): Promise<T> => {
  const response = await fetch(new URL(path, getAuthProviderBaseUrl()), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  let data: unknown = undefined;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    throw new RhAuthApiError(
      response.status,
      parseRhJsonError(data, response),
      data
    );
  }

  return data as T;
};

const isRhReadinessAxis = (value: unknown): value is RhReadinessAxis => {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.count === "number" &&
    typeof o.expected === "number" &&
    (o.relation === "less" ||
      o.relation === "equal" ||
      o.relation === "more")
  );
};

const isRhPagesReadinessMismatchBody = (
  data: unknown
): data is RhPagesReadinessMismatchBody => {
  if (typeof data !== "object" || data === null) return false;
  const o = data as Record<string, unknown>;
  return isRhReadinessAxis(o.s3) && isRhReadinessAxis(o.database);
};

const postRhAuthorizedWithBody = async <T>(
  path: string,
  accessToken: string,
  body: object
): Promise<T> => {
  const response = await fetch(new URL(path, getAuthProviderBaseUrl()), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data: unknown = undefined;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    throw new RhAuthApiError(
      response.status,
      parseRhJsonError(data, response),
      data
    );
  }

  return data as T;
};

export const requestRhOtp = (
  phoneNumber: string
): Promise<OtpRequestResponse> =>
  postRh("/rh/request-otp", { phone_number: phoneNumber });

export const upsertRhPhone = async (
  phoneNumber: string
): Promise<RhPhoneUpsertResult> => {
  const response = await fetch(new URL("/rh/phone", getAuthProviderBaseUrl()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });

  let data: unknown = undefined;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}.`;
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: string }).error)
        : fallbackMessage;
    throw new RhAuthApiError(response.status, message, data);
  }

  return {
    profile: data as RhProfile,
    existed: response.status === 200,
  };
};

export const verifyRhOtp = (
  phoneNumber: string,
  code: string
): Promise<RhOtpTokenResponse> => {
  const clientId = getRhOauthClientId();
  const clientSecret = getRhOauthClientSecret();
  return postRh<RhOtpTokenResponse>("/rh/verify-otp-token", {
    phone_number: phoneNumber,
    code,
    client_id: clientId,
    grant_type: "password",
    ...(clientSecret ? { client_secret: clientSecret } : {}),
  });
};

/** `POST /rh/history` — OpenAPI: Bearer token only, response 201 + `RhHistory`. */
export const createRhHistory = (
  accessToken: string
): Promise<RhHistoryRecord> =>
  postRhAuthorized<RhHistoryRecord>("/rh/history", accessToken);

/** `POST /rh/history/delete-pages` — Delete all uploaded page scans for one history id. */
export const deleteRhHistoryPages = (
  accessToken: string,
  historyId: string
): Promise<RhHistoryPageDeleteResponse> =>
  postRhAuthorizedWithBody<RhHistoryPageDeleteResponse>(
    "/rh/history/delete-pages",
    accessToken,
    { history_id: historyId }
  );

/**
 * `POST /rh/history/combine-pages` — Merge pages into `data_initial` (success returns `{ status: "ok" }` only).
 */
export const combineRhHistoryPages = (
  accessToken: string,
  historyId: string
): Promise<RhHistoryCombinePagesResponse> =>
  postRhAuthorizedWithBody<RhHistoryCombinePagesResponse>(
    "/rh/history/combine-pages",
    accessToken,
    { history_id: historyId }
  );

/**
 * `GET /rh/history/pages-readiness` — OAuth2 bearer.
 * Returns `ready` with `pages` on HTTP 200, or `mismatch` on HTTP 400 when the body
 * includes `s3` and `database` readiness axes (still processing or count skew).
 * Other HTTP 400 responses (query validation) and non-OK statuses throw `RhAuthApiError`.
 */
export const getRhHistoryPagesReadiness = async (
  accessToken: string,
  historyId: string,
  numPages: number
): Promise<RhPagesReadinessResult> => {
  const url = new URL("/rh/history/pages-readiness", getAuthProviderBaseUrl());
  url.searchParams.set("history_id", historyId);
  url.searchParams.set("num_pages", String(numPages));

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  let data: unknown = undefined;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (response.status === 200) {
    if (
      typeof data !== "object" ||
      data === null ||
      !isRhPagesReadinessMismatchBody(data) ||
      !("pages" in data) ||
      !Array.isArray((data as { pages: unknown }).pages)
    ) {
      throw new RhAuthApiError(
        response.status,
        "Unexpected pages-readiness response shape.",
        data
      );
    }
    return { outcome: "ready", body: data as RhPagesReadinessOkBody };
  }

  if (response.status === 400 && isRhPagesReadinessMismatchBody(data)) {
    return { outcome: "mismatch", body: data };
  }

  throw new RhAuthApiError(
    response.status,
    parseRhJsonError(data, response),
    data
  );
};
