import type { components } from "../generated/requester-openapi";

export type RequesterServiceErrorEnum = components["schemas"]["ErrorEnum"];

export type RequesterApiErrorBody = {
  error: string;
  details?: unknown;
};

export class RequesterApiError extends Error {
  readonly name = "RequesterApiError";

  constructor(
    readonly status: number,
    readonly body: RequesterApiErrorBody,
    readonly raw?: unknown
  ) {
    super(body.error);
  }
}

export const parseRequesterErrorBody = (
  data: unknown,
  response: Response
): RequesterApiErrorBody => {
  const fallbackMessage = `Request failed with status ${response.status}.`;
  if (typeof data === "object" && data !== null && "error" in data) {
    const record = data as Record<string, unknown>;
    return {
      error: String(record.error),
      details: "details" in record ? record.details : undefined,
    };
  }
  return { error: fallbackMessage };
};

export const requesterApiErrorFromResponse = (
  status: number,
  data: unknown,
  response: Response
): RequesterApiError =>
  new RequesterApiError(status, parseRequesterErrorBody(data, response), data);

export const isRequesterApiError = (
  error: unknown
): error is RequesterApiError => error instanceof RequesterApiError;

/** True when POST send-request failed with 503 and `email_send_failed`. */
export const isEmailSendFailedError = (error: unknown): boolean =>
  isRequesterApiError(error) &&
  error.status === 503 &&
  error.body.error === "email_send_failed";
