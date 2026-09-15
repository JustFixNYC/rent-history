import createClient from "openapi-fetch";
import type { paths } from "../generated/account-openapi";
import {
  attachBearerMiddleware,
  bearerHeaders,
  type OpenApiFetchResult,
  unwrapOpenApiResponse,
} from "../shared/openapiFetch";
import { accountApiErrorFromResponse } from "./errors";

export type AccountClient = ReturnType<typeof createClient<paths>>;

export type GetAccessToken = () => string | undefined;

export { bearerHeaders };

/**
 * Typed openapi-fetch client for auth-provider `/rh/*` routes.
 * When `getAccessToken` is provided, attaches `Authorization: Bearer` on every request.
 */
export const createAccountClient = (
  baseUrl: string,
  getAccessToken?: GetAccessToken
): AccountClient => {
  const client = createClient<paths>({ baseUrl });

  if (getAccessToken) {
    attachBearerMiddleware(client, getAccessToken);
  }

  return client;
};

/** Throws `AccountApiError` when openapi-fetch returns `error` or missing `data`. */
export const unwrapAccountResponse = <T>(
  result: Promise<OpenApiFetchResult<T>>
): Promise<T> => unwrapOpenApiResponse(result, accountApiErrorFromResponse);
