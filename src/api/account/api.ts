import {
  bearerHeaders,
  createAccountClient,
  unwrapAccountResponse,
} from "./client";
import {
  accountApiErrorFromResponse,
  accountApiUnexpectedShapeError,
  accountReportEmailErrorFromResponse,
} from "./errors";
import type {
  RhAnalysisPage,
  RhFindingsStateResponse,
  RhHistoryAddressResponse,
  RhHistoryCombinePagesResponse,
  RhHistoryConfirmAddressRequest,
  RhHistoryConfirmAddressResponse,
  RhHistoryPageDeleteResponse,
  RhHistoryRecord,
  RhHistoryReportEmailRequest,
  RhHistoryReportEmailResponse,
  RhHistoryReportPdfCreateRequest,
  RhHistoryReportPdfCreateResponse,
  RhPagesReadinessResponse,
  RhLoginStartResponse,
  RhOtpTokenResponse,
  RhRunAnalysisResponse,
  RhScanPresignRequest,
  RhScanPresignResponse,
  RhValidateFindingRequestRequest,
  RhValidateFindingResponse,
} from "./types";

export const getAuthProviderBaseUrl = (): string => {
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

export const startRhLogin = (
  phoneNumber: string
): Promise<RhLoginStartResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/login/start", {
      body: { phone_number: phoneNumber },
    })
  ) as Promise<RhLoginStartResponse>;

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
export const getRhHistoryAnalysisPages = (
  accessToken: string,
  historyId: string
): Promise<RhAnalysisPage[]> =>
  unwrapAccountResponse(
    getAccountClient().GET("/rh/history/analysis-pages", {
      headers: bearerHeaders(accessToken),
      params: { query: { history_id: historyId } },
    })
  ).then((body) => body.pages as RhAnalysisPage[]);

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

/**
 * `POST /rh/history/scan-presign` — OAuth2 bearer; batch presigned PUT/GET URLs for scan keys.
 */
export const postRhHistoryScanPresign = (
  accessToken: string,
  body: RhScanPresignRequest
): Promise<RhScanPresignResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/scan-presign", {
      headers: bearerHeaders(accessToken),
      body,
    })
  );

/** `POST /rh/history/report-pdf` — render HTML to PDF, upload to S3, return metadata. */
export const createRhHistoryReportPdf = (
  accessToken: string,
  body: RhHistoryReportPdfCreateRequest
): Promise<RhHistoryReportPdfCreateResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/report-pdf", {
      headers: bearerHeaders(accessToken),
      body,
    })
  );

/**
 * `POST /rh/history/report-email` — render PDF, store in S3, and email to the user.
 * Non-200 responses throw `AccountApiError` with `reportEmailSteps` when the body
 * includes `pdf` / `email` step status (e.g. 503 `email_send_failed` partial success).
 */
export const emailRhHistoryReportPdf = async (
  accessToken: string,
  body: RhHistoryReportEmailRequest
): Promise<RhHistoryReportEmailResponse> => {
  const { data, error, response } = await getAccountClient().POST(
    "/rh/history/report-email",
    {
      headers: bearerHeaders(accessToken),
      body,
    }
  );

  if (error !== undefined || data === undefined) {
    throw accountReportEmailErrorFromResponse(response.status, error, response);
  }

  return data;
};

/**
 * `GET /rh/history/report-pdf` — OAuth2 bearer; returns PDF bytes as a Blob.
 */
export const downloadRhHistoryReportPdf = async (
  accessToken: string,
  historyId: string
): Promise<Blob> => {
  const { data, error, response } = await getAccountClient().GET(
    "/rh/history/report-pdf",
    {
      headers: bearerHeaders(accessToken),
      params: { query: { history_id: historyId } },
    }
  );

  if (!response.ok) {
    let errorBody: unknown = error;
    if (errorBody === undefined) {
      try {
        errorBody = await response.clone().json();
      } catch {
        errorBody = undefined;
      }
    }
    throw accountApiErrorFromResponse(response.status, errorBody, response);
  }

  void data;
  return response.blob();
};

/**
 * `POST /rh/history/run-analysis` — OAuth2 bearer; run analysis and return findings + queue.
 */
export const postRhHistoryRunAnalysis = (
  accessToken: string,
  historyId: string
): Promise<RhRunAnalysisResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/run-analysis", {
      headers: bearerHeaders(accessToken),
      body: { history_id: historyId },
    })
  );

/**
 * `POST /rh/history/validate-finding` — OAuth2 bearer; validate one finding and return queue delta.
 */
export const validateRhFinding = (
  accessToken: string,
  body: RhValidateFindingRequestRequest
): Promise<RhValidateFindingResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/validate-finding", {
      headers: bearerHeaders(accessToken),
      body,
    })
  );

/**
 * `GET /rh/history/findings-state` — OAuth2 bearer; current findings and review queue.
 */
export const getRhFindingsState = (
  accessToken: string,
  historyId: string
): Promise<RhFindingsStateResponse> =>
  unwrapAccountResponse(
    getAccountClient().GET("/rh/history/findings-state", {
      headers: bearerHeaders(accessToken),
      params: { query: { history_id: historyId } },
    })
  );
