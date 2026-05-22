import {
  bearerHeaders,
  createAccountClient,
  unwrapAccountResponse,
} from "./client";
import { accountApiUnexpectedShapeError } from "./errors";
import type {
  RhAnalysisPage,
  RhHistoryAddressResponse,
  RhHistoryCombinePagesResponse,
  RhHistoryConfirmAddressRequest,
  RhHistoryConfirmAddressResponse,
  RhHistoryPageDeleteResponse,
  RhHistoryRecord,
  RhPagesReadinessResponse,
  RhPhoneUpsertResponse,
  OtpRequestResponse,
  RhOtpTokenResponse,
} from "./types";

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

const getAccountClient = () => createAccountClient(getAuthProviderBaseUrl());

export const requestRhOtp = (
  phoneNumber: string
): Promise<OtpRequestResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/request-otp", {
      body: { phone_number: phoneNumber },
    })
  );

export const upsertRhPhone = (
  phoneNumber: string
): Promise<RhPhoneUpsertResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/phone", {
      body: { phone_number: phoneNumber },
    })
  ) as Promise<RhPhoneUpsertResponse>;

export const verifyRhOtp = (
  phoneNumber: string,
  code: string
): Promise<RhOtpTokenResponse> => {
  const clientId = getRhOauthClientId();
  const clientSecret = getRhOauthClientSecret();
  return unwrapAccountResponse(
    getAccountClient().POST("/rh/verify-otp-token", {
      body: {
        phone_number: phoneNumber,
        code,
        client_id: clientId,
        grant_type: "password",
        ...(clientSecret ? { client_secret: clientSecret } : {}),
      },
    })
  ) as Promise<RhOtpTokenResponse>;
};

/** `POST /rh/history` — OpenAPI: Bearer token only, response 201 + `RhHistory`. */
export const createRhHistory = (
  accessToken: string
): Promise<RhHistoryRecord> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history", {
      headers: bearerHeaders(accessToken),
    })
  ).then((body) => ({ id: body.id }));

/** `POST /rh/history/confirm-address` — Confirm address, NYCDB building lookup, and advance flow. */
export const confirmRhHistoryAddress = (
  accessToken: string,
  body: RhHistoryConfirmAddressRequest
): Promise<RhHistoryConfirmAddressResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/confirm-address", {
      headers: bearerHeaders(accessToken),
      body,
    })
  );

/** `POST /rh/history/delete-pages` — Delete all uploaded page scans for one history id. */
export const deleteRhHistoryPages = (
  accessToken: string,
  historyId: string
): Promise<RhHistoryPageDeleteResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/delete-pages", {
      headers: bearerHeaders(accessToken),
      body: { history_id: historyId },
    })
  );

/**
 * `POST /rh/history/combine-pages` — Merge pages into `data_initial` (success returns `{ status: "ok" }` only).
 */
export const combineRhHistoryPages = (
  accessToken: string,
  historyId: string
): Promise<RhHistoryCombinePagesResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/combine-pages", {
      headers: bearerHeaders(accessToken),
      body: { history_id: historyId },
    })
  ) as Promise<RhHistoryCombinePagesResponse>;

/**
 * `GET /rh/history/pages-readiness` — OAuth2 bearer.
 * HTTP 200 with `status`: `ready` | `pending` | `excess`. Query validation and
 * server errors throw `AccountApiError`.
 */
export const getRhHistoryPagesReadiness = (
  accessToken: string,
  historyId: string,
  numPages: number
): Promise<RhPagesReadinessResponse> =>
  unwrapAccountResponse(
    getAccountClient().GET("/rh/history/pages-readiness", {
      headers: bearerHeaders(accessToken),
      params: {
        query: {
          history_id: historyId,
          num_pages: numPages,
        },
      },
    })
  ) as Promise<RhPagesReadinessResponse>;

/**
 * `GET /rh/history/analysis-pages` — OAuth2 bearer.
 * Returns pages with keep=True (used in analysis), sorted by start_year ascending.
 */
export const getRhHistoryAnalysisPages = async (
  accessToken: string,
  historyId: string
): Promise<RhAnalysisPage[]> => {
  const data = await unwrapAccountResponse(
    getAccountClient().GET("/rh/history/analysis-pages", {
      headers: bearerHeaders(accessToken),
      params: { query: { history_id: historyId } },
    })
  );

  if (!Array.isArray(data)) {
    throw accountApiUnexpectedShapeError(
      200,
      "Unexpected analysis-pages response shape.",
      data
    );
  }

  return data as RhAnalysisPage[];
};

/**
 * `GET /rh/history/address` — OAuth2 bearer.
 * Returns scan-extracted apartment and address from combine-pages.
 */
export const getRhHistoryAddress = async (
  accessToken: string,
  historyId: string
): Promise<RhHistoryAddressResponse> => {
  const data = await unwrapAccountResponse(
    getAccountClient().GET("/rh/history/address", {
      headers: bearerHeaders(accessToken),
      params: { query: { history_id: historyId } },
    })
  );

  if (
    typeof data !== "object" ||
    data === null ||
    !("apartment" in data) ||
    !("address" in data)
  ) {
    throw accountApiUnexpectedShapeError(
      200,
      "Unexpected history address response shape.",
      data
    );
  }

  return data;
};
