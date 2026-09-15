import createClient from "openapi-fetch";
import type { paths } from "../generated/requester-openapi";
import {
  bearerHeaders,
  type OpenApiFetchResult,
  unwrapOpenApiResponse,
} from "../shared/openapiFetch";
import { requesterApiErrorFromResponse } from "./errors";

export type RequesterClient = ReturnType<typeof createClient<paths>>;

export { bearerHeaders };

/** Typed openapi-fetch client for auth-provider `/rh-request/*` routes. */
export const createRequesterClient = (baseUrl: string): RequesterClient =>
  createClient<paths>({ baseUrl });

/** Throws `RequesterApiError` when openapi-fetch returns `error` or missing `data`. */
export const unwrapRequesterResponse = <T>(
  result: Promise<OpenApiFetchResult<T>>
): Promise<T> => unwrapOpenApiResponse(result, requesterApiErrorFromResponse);
