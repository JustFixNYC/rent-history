import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { components } from "../generated/account-openapi";

export type AccountApiErrorBody = {
  error: string;
  error_code?: components["schemas"]["ErrorCodeEnum"];
  details?: unknown;
};

export class AccountApiError extends Error {
  readonly name = "AccountApiError";

  constructor(
    readonly status: number,
    readonly body: AccountApiErrorBody,
    readonly raw?: unknown
  ) {
    super(body.error);
  }

  get errorCode(): AccountApiErrorBody["error_code"] {
    return this.body.error_code;
  }
}

export const parseAccountErrorBody = (
  data: unknown,
  response: Response
): AccountApiErrorBody => {
  const fallbackMessage = `Request failed with status ${response.status}.`;
  if (typeof data === "object" && data !== null && "error" in data) {
    const record = data as Record<string, unknown>;
    const errorCode = record.error_code;
    return {
      error: String(record.error),
      error_code:
        typeof errorCode === "string"
          ? (errorCode as AccountApiErrorBody["error_code"])
          : undefined,
      details: "details" in record ? record.details : undefined,
    };
  }
  return { error: fallbackMessage };
};

export const accountApiErrorFromResponse = (
  status: number,
  data: unknown,
  response: Response
): AccountApiError =>
  new AccountApiError(status, parseAccountErrorBody(data, response), data);

export const accountApiUnexpectedShapeError = (
  status: number,
  message: string,
  raw?: unknown
): AccountApiError => new AccountApiError(status, { error: message }, raw);

export const isAccountApiError = (error: unknown): error is AccountApiError =>
  error instanceof AccountApiError;

type TranslateFn = (descriptor: MessageDescriptor) => string;

export const phoneLoginMessage = (
  error: AccountApiError,
  _: TranslateFn
): string => {
  if (error.errorCode === "invalid_phone_number") {
    return _(msg`Please enter a valid phone number.`);
  }
  return error.message;
};

export const phoneResendMessage = (
  error: AccountApiError,
  _: TranslateFn
): string => {
  if (
    error.errorCode === "invalid_phone_number" ||
    error.errorCode === "validation_error"
  ) {
    return _(msg`Please confirm your phone number and try again.`);
  }
  return error.message;
};

export const otpVerificationMessage = (
  error: AccountApiError,
  _: TranslateFn
): string => {
  switch (error.errorCode) {
    case "otp_locked":
      return _(msg`Too many invalid attempts. Request a new code.`);
    case "otp_expired":
      return _(msg`Your code expired. Request a new code.`);
    case "otp_invalid":
      return _(msg`That code is incorrect. Try again.`);
    case "profile_not_found":
      return _(msg`We could not find an account for this phone number.`);
    default:
      return error.message;
  }
};
