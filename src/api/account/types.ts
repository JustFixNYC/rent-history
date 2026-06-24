import type { components } from "../generated/account-openapi";

type Schemas = components["schemas"];

export type RhProfile = Schemas["RhProfile"];

/** `POST /rh/login/start` response (profile upsert + OTP delivery). */
export type RhLoginStartResponse = Schemas["RhLoginStartResponse"];

export type RhOtpTokenResponse = Omit<Schemas["OtpTokenResponse"], "profile"> & {
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

export type RhHistoryPageDeleteResponse = Schemas["RhHistoryPageDeleteResponse"];

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
