export {
  bearerHeaders,
  createAccountClient,
  unwrapAccountResponse,
  type AccountClient,
  type GetAccessToken,
} from "./client";
export {
  AccountApiError,
  accountApiErrorFromResponse,
  accountApiUnexpectedShapeError,
  isAccountApiError,
  otpVerificationMessage,
  parseAccountErrorBody,
  phoneLoginMessage,
  phoneResendMessage,
  type AccountApiErrorBody,
} from "./errors";
export type {
  OtpRequestResponse,
  OtpRequestStatus,
  RhAnalysisPage,
  RhHistoryAddressResponse,
  RhHistoryCombinePagesResponse,
  RhHistoryConfirmAddressRequest,
  RhHistoryConfirmAddressResponse,
  RhHistoryPageDeleteResponse,
  RhHistoryRecord,
  RhOtpTokenResponse,
  RhPageSummary,
  RhPagesReadinessResponse,
  RhPhoneUpsertResponse,
  RhProfile,
  RhReadinessAxis,
} from "./types";
export { accountQueryKeys } from "./queryKeys";
export {
  useUpsertRhPhone,
  useRequestRhOtp,
  useVerifyRhOtp,
} from "./hooks/login";
export { useCreateRhHistory } from "./hooks/history";
export {
  RhPagesReadinessExcessError,
  useCombineRhHistoryPages,
  useRhHistoryAnalysisPages,
  useRhPagesReadiness,
} from "./hooks/scanner";
export {
  useConfirmRhHistoryAddress,
  useRhHistoryAddress,
} from "./hooks/confirmAddress";
export {
  combineRhHistoryPages,
  confirmRhHistoryAddress,
  createRhHistory,
  deleteRhHistoryPages,
  getRhHistoryAddress,
  getRhHistoryAnalysisPages,
  getRhHistoryPagesReadiness,
  requestRhOtp,
  upsertRhPhone,
  verifyRhOtp,
} from "./api";
