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

/** Response body from `POST /rh/history` (create only — `id` only). */
export type RhHistoryRecord = {
  id: string;
};

/** `POST /rh/history/combine-pages` success body. */
export type RhHistoryCombinePagesResponse = {
  status: "ok";
};

/** `POST /rh/history/confirm-address` request (OpenAPI `RhHistoryConfirmAddressRequestRequest`). */
export type RhHistoryConfirmAddressRequest =
  Schemas["RhHistoryConfirmAddressRequestRequest"];

/** `POST /rh/history/confirm-address` response. */
export type RhHistoryConfirmAddressResponse =
  Schemas["RhHistoryConfirmAddressResponse"];

export type RhHistoryPageDeleteResponse =
  Schemas["RhHistoryPageDeleteResponse"];

/** Axis from `GET /rh/history/pages-readiness`. */
export type RhReadinessAxis = Schemas["RhReadinessAxis"];

/** `RhPageSummary` — pages list when readiness returns 200 `ready`. */
export type RhPageSummary = Schemas["RhPageSummary"];

/** `RhAnalysisPage` — pages kept for analysis after combine-pages. */
export type RhAnalysisPage = Omit<
  Schemas["RhAnalysisPage"],
  "start_year" | "end_year"
> & {
  start_year: number | null;
  end_year: number | null;
};

/** `GET /rh/history/address` response. */
export type RhHistoryAddressResponse = Schemas["RhHistoryAddressResponse"];

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

/** `GET /rh/history/pages-readiness` response (discriminated by `status`). */
export type RhPagesReadinessResponse =
  | {
      status: "ready";
      pages: RhPageSummary[];
      s3: RhReadinessAxis;
      database: RhReadinessAxis;
    }
  | {
      status: "pending";
      s3: RhReadinessAxis;
      database: RhReadinessAxis;
    }
  | {
      status: "excess";
      s3: RhReadinessAxis;
      database: RhReadinessAxis;
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

/** `POST /rh/history/run-analysis` request body. */
export type RhRunAnalysisRequestRequest =
  Schemas["RhRunAnalysisRequestRequest"];

/** `POST /rh/history/run-analysis` response. */
export type RhRunAnalysisResponse = Schemas["RhRunAnalysisResponse"];

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
