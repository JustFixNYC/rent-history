import {
  bearerHeaders,
  createAccountClient,
  unwrapAccountResponse,
} from "./client";
import {
  accountApiErrorFromResponse,
  accountReportEmailErrorFromResponse,
} from "./errors";
import type {
  RhAnalysisPage,
  RhFindingsStateResponse,
  RhHistoryCombinePagesResponse,
  RhHistoryConfirmAddressRequest,
  RhHistoryConfirmAddressResponse,
  RhHistorySetCurrentRentRequest,
  RhHistorySetCurrentRentResponse,
  RhHistoryDeleteResponse,
  RhHistoryList,
  RhDeleteAllScannedPagesResponse,
  RhDeleteScannedPagesResponse,
  RhHistoryRecord,
  RhHistoryReportEmailRequest,
  RhHistoryReportEmailResponse,
  RhHistoryReportPdfCreateRequest,
  RhHistoryReportPdfCreateResponse,
  RhScanReviewResponse,
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
  phoneNumber: string,
  source: "desktop" | "mobile" = "mobile"
): Promise<RhLoginStartResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/login/start", {
      body: {
        phone_number: phoneNumber,
        source,
        otp_domain: window.location.hostname,
      },
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

/** `GET /rh/histories` — OAuth2 bearer; list all owned histories. */
export const listRhHistories = (
  accessToken: string
): Promise<RhHistoryList[]> =>
  unwrapAccountResponse(
    getAccountClient().GET("/rh/histories", {
      headers: bearerHeaders(accessToken),
    })
  ).then((body) => body as RhHistoryList[]);

/** `POST /rh/history/delete` — Delete one RhHistory and best-effort S3 cleanup. */
export const deleteRhHistory = (
  accessToken: string,
  body: { history_id: string }
): Promise<RhHistoryDeleteResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/delete", {
      headers: bearerHeaders(accessToken),
      body,
    })
  );

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

/** `POST /rh/history/current-rent` — Persist monthly rent on an owned RhHistory. */
export const setRhHistoryCurrentRent = (
  accessToken: string,
  body: RhHistorySetCurrentRentRequest
): Promise<RhHistorySetCurrentRentResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/current-rent", {
      headers: bearerHeaders(accessToken),
      body,
    })
  );

/** `POST /rh/history/delete-all-scanned-pages` — Delete all uploaded page scans for one history id. */
export const deleteAllRhScannedPages = (
  accessToken: string,
  historyId: string
): Promise<RhDeleteAllScannedPagesResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/delete-all-scanned-pages", {
      headers: bearerHeaders(accessToken),
      body: { history_id: historyId },
    })
  );

/** `POST /rh/history/delete-scanned-pages` — Delete specific RhPage records by id. */
export const deleteRhScannedPages = (
  accessToken: string,
  historyId: string,
  pageIds: number[]
): Promise<RhDeleteScannedPagesResponse> =>
  unwrapAccountResponse(
    getAccountClient().POST("/rh/history/delete-scanned-pages", {
      headers: bearerHeaders(accessToken),
      body: { history_id: historyId, page_ids: pageIds },
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

export type GetRhHistoryScanReviewOptions = {
  acceptPartial?: boolean;
};

/**
 * `GET /rh/history/scan-review` — OAuth2 bearer.
 * HTTP 200 with `status`: `ready` | `pending`. Query validation and server
 * errors throw `AccountApiError`.
 */
export const getRhHistoryScanReview = (
  accessToken: string,
  historyId: string,
  expectedPageCount: number,
  options?: GetRhHistoryScanReviewOptions
): Promise<RhScanReviewResponse> =>
  unwrapAccountResponse(
    getAccountClient().GET("/rh/history/scan-review", {
      headers: bearerHeaders(accessToken),
      params: {
        query: {
          history_id: historyId,
          expected_page_count: expectedPageCount,
          ...(options?.acceptPartial ? { accept_partial: true } : {}),
        },
      },
    })
  ) as Promise<RhScanReviewResponse>;

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
