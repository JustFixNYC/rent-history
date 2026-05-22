import type { components } from "../generated/account-openapi";

type Schemas = components["schemas"];

/** OpenAPI `OtpRequestResponseStatusEnum`. */
export type OtpRequestStatus = Schemas["OtpRequestResponseStatusEnum"];

export type OtpRequestResponse = Schemas["OtpRequestResponse"];

/**
 * OpenAPI `RhProfile` plus `rent_history_id` returned at runtime by OTP/profile
 * endpoints but not yet in the committed spec.
 */
export type RhProfile = Schemas["RhProfile"] & {
  rent_history_id: string;
};

/** `POST /rh/phone` response (OpenAPI `RhPhoneUpsertResponse`). */
export type RhPhoneUpsertResponse = Omit<
  Schemas["RhPhoneUpsertResponse"],
  "profile"
> & {
  profile: RhProfile;
};

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
