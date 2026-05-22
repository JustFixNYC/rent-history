import createClient from "openapi-fetch";
import type { paths } from "../generated/account-openapi";
import { parseRhJsonError, RhAuthApiError } from "./errors";

export type AccountClient = ReturnType<typeof createClient<paths>>;

export type GetAccessToken = () => string | undefined;

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
    client.use({
      async onRequest({ request }) {
        const token = getAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
        return request;
      },
    });
  }

  return client;
};

export const bearerHeaders = (
  accessToken: string
): { Authorization: string } => ({
  Authorization: `Bearer ${accessToken}`,
});

type FetchResult<T> = {
  data?: T;
  error?: unknown;
  response: Response;
};

/** Throws `RhAuthApiError` when openapi-fetch returns `error` or missing `data`. */
export const unwrapAccountResponse = async <T>(
  result: Promise<FetchResult<T>>
): Promise<T> => {
  const { data, error, response } = await result;

  if (error !== undefined) {
    throw new RhAuthApiError(
      response.status,
      parseRhJsonError(error, response),
      error
    );
  }

  if (data === undefined) {
    throw new RhAuthApiError(
      response.status,
      `Request failed with status ${response.status}.`,
      undefined
    );
  }

  return data;
};
