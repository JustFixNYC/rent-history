import type { components } from "../generated/account-openapi";

type Schemas = components["schemas"];

export type RhProfile = Schemas["RhProfile"];

/** `POST /rh/login/start` response (profile upsert + OTP delivery). */
export type RhLoginStartResponse = Schemas["RhLoginStartResponse"];

export type RhOtpTokenResponse = Omit<
  Schemas["OtpTokenResponse"],
  "profile"
> & {
  profile: RhProfile;
};

/** `POST /rh/verify-magic-link` response (OAuth session + history resume metadata). */
export type RhMagicLinkVerifyResponse = Omit<
  Schemas["RhMagicLinkVerifyResponse"],
  "profile"
> & {
  profile: RhProfile;
};

/** `POST /rh/login/send-magic-link-sms` response. */
export type RhSendMagicLinkSmsResponse = Schemas["RhSendMagicLinkSmsResponse"];

/** Response body from `POST /rh/history` (create only — `id` only). */
export type RhHistoryRecord = {
  id: string;
};

/** `POST /rh/history/confirm-address` request (OpenAPI `RhHistoryConfirmAddressRequestRequest`). */
export type RhHistoryConfirmAddressRequest =
  Schemas["RhHistoryConfirmAddressRequestRequest"];

/** `POST /rh/history/confirm-address` response. */
export type RhHistoryConfirmAddressResponse =
  Schemas["RhHistoryConfirmAddressResponse"];

/** `POST /rh/history/confirm-last-reg-year` request. */
export type RhConfirmLastRegYearRequest =
  Schemas["RhConfirmLastRegYearRequestRequest"];

/** `POST /rh/history/confirm-last-reg-year` response. */
export type RhConfirmLastRegYearResponse =
  Schemas["RhConfirmLastRegYearResponse"];

/** `POST /rh/history/current-rent` request (OpenAPI `RhHistorySetCurrentRentRequestRequest`). */
export type RhHistorySetCurrentRentRequest =
  Schemas["RhHistorySetCurrentRentRequestRequest"];

/** `POST /rh/history/current-rent` response. */
export type RhHistorySetCurrentRentResponse =
  Schemas["RhHistorySetCurrentRentResponse"];

/** `POST /rh/history/delete-all-scanned-pages` success body. */
export type RhDeleteAllScannedPagesResponse =
  Schemas["RhDeleteAllScannedPagesResponse"];

/** `POST /rh/history/delete-scanned-pages` success body. */
export type RhDeleteScannedPagesResponse =
  Schemas["RhDeleteScannedPagesResponse"];

/** Legacy scan-review page summary until Task 5 removes thumbnail UI. */
export type RhPageSummary = {
  id: number;
  extraction_status: string;
  needs_retake: boolean;
  quality_issue_reason?: string | null;
  error?: string | null;
  s3_key: string;
  start_year?: number | null;
  end_year?: number | null;
  is_coverpage?: boolean | null;
};

/** Rescan target from pipeline-status `early_validation.pages_needing_rescan`. */
export type RhPageRescanInfo = Schemas["RhPageRescanInfo"];

/** Pipeline early coverage result on `GET /rh/history/scan-pipeline-status`. */
export type RhEarlyValidation = Schemas["RhEarlyValidation"];

/** `RhAnalysisPage` — pages kept for analysis after scan pipeline combine. */
export type RhAnalysisPage = Omit<
  Schemas["RhAnalysisPage"],
  "start_year" | "end_year"
> & {
  start_year: number | null;
  end_year: number | null;
};

/** `POST /rh/history/report-pdf` request body. */
export type RhHistoryReportPdfCreateRequest =
  Schemas["RhHistoryReportPdfCreateRequestRequest"];

/** `POST /rh/history/report-pdf` success body. */
export type RhHistoryReportPdfCreateResponse =
  Schemas["RhHistoryReportPdfCreateResponse"];

/** `POST /rh/history/report-email` request body. */
export type RhHistoryReportEmailRequest =
  Schemas["RhHistoryReportEmailCreateRequestRequest"];

/** PDF step in `POST /rh/history/report-email` response (and non-200 bodies). */
export type RhHistoryReportEmailPdfStep =
  Schemas["RhHistoryReportEmailPdfStep"];

/** Email step in `POST /rh/history/report-email` response (and non-200 bodies). */
export type RhHistoryReportEmailEmailStep =
  Schemas["RhHistoryReportEmailEmailStep"];

/** `POST /rh/history/report-email` success body. */
export type RhHistoryReportEmailResponse =
  Schemas["RhHistoryReportEmailResponse"];

/** Step status for report-email PDF and email steps. */
export type RhHistoryReportEmailStepStatus =
  Schemas["ReportEmailStepStatusEnum"];

/** PDF/email step fields merged into report-email error bodies (partial on failures). */
export type RhHistoryReportEmailStepFields = {
  history_id?: string;
  pdf?: RhHistoryReportEmailPdfStep;
  email?: RhHistoryReportEmailEmailStep;
};

/** Locale sent when generating a report PDF (`en` | `es`). */
export type ReportPdfLocale = Schemas["ReportPdfLocaleEnum"];

/** `POST /rh/history/scan-presign` request body. */
export type RhScanPresignRequest = Schemas["RhScanPresignRequestRequest"];

/** `POST /rh/history/scan-presign` success body. */
export type RhScanPresignResponse = Schemas["RhScanPresignResponse"];

export type RhScanPresignUrlEntry = Schemas["RhScanPresignUrlEntry"];

/** Legacy scan-review poll response until Task 5 removes polling hooks. */
export type RhScanReviewResponse =
  | {
      status: "ready";
      db_count: number;
      expected_page_count: number;
      processing_complete: boolean;
      pages: RhPageSummary[];
      missing_year_ranges?: string[];
    }
  | {
      status: "pending";
      db_count: number;
      expected_page_count: number;
    };

/** MVP finding wire object (`findings_current` / validate-finding response). */
export type RhFinding = Schemas["RhFinding"];

/** One element of `finding.data.rows`. */
export type RhFindingRow = Schemas["RhFindingRow"];

/** Finding payload: registration-year rows. */
export type RhFindingData = Schemas["RhFindingData"];

/** Composite finding identity (`type` + `finding_year` + optional `subtype`). */
export type RhFindingKey = Schemas["RhFindingKey"];

/** Finding review status (`pending` | `validated` | `dismissed`). */
export type RhFindingStatusEnum = Schemas["RhFindingStatusEnum"];

/** Finding outcome (`no_violation` | `potential_violation` | `dismissed`). */
export type RhFindingResult = Schemas["ResultEnum"];

/** Ordered finding ids for review navigation. */
export type RhReviewQueue = Schemas["RhReviewQueue"];

/** Queue changes after reconcile / validate-finding. */
export type RhQueueDelta = Schemas["RhQueueDelta"];

/** `POST /rh/history/validate-finding` request body. */
export type RhValidateFindingRequestRequest =
  Schemas["RhValidateFindingRequestRequest"];

/** `POST /rh/history/validate-finding` response. */
export type RhValidateFindingResponse = Schemas["RhValidateFindingResponse"];

/** Validate-finding answers payload (shape A). */
export type RhValidateFindingAnswersRequest =
  Schemas["RhValidateFindingAnswersRequest"];

/** One element of validate-finding `answers.rows`. */
export type RhFindingAnswerRowRequest = Schemas["RhFindingAnswerRowRequest"];

/** `GET /rh/history/findings-state` response. */
export type RhFindingsStateResponse = Schemas["RhFindingsStateResponse"];

/** `GET /rh/history/scan-pipeline-status` response. */
export type RhScanPipelineStatusResponse =
  Schemas["RhScanPipelineStatusResponse"];

/** `POST /rh/history/finalize-scan` request body. */
export type RhFinalizeScanRequest = Schemas["RhFinalizeScanRequestRequest"];

/** `POST /rh/history/finalize-scan` response. */
export type RhFinalizeScanResponse = Schemas["RhFinalizeScanResponse"];

/** One item from `GET /rh/histories`. */
export type RhHistoryList = Schemas["RhHistoryList"];

/** `POST /rh/history/delete` success body. */
export type RhHistoryDeleteResponse = Schemas["RhHistoryDeleteResponse"];
