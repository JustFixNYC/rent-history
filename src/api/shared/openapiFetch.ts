export type OpenApiFetchResult<T> = {
  data?: T;
  error?: unknown;
  response: Response;
};

export type OpenApiErrorFromResponse = (
  status: number,
  data: unknown,
  response: Response
) => Error;

export const bearerHeaders = (token: string): { Authorization: string } => ({
  Authorization: `Bearer ${token}`,
});

type BearerMiddlewareClient = {
  use: (middleware: {
    onRequest: (context: { request: Request }) => Promise<Request>;
  }) => void;
};

/** Attach `Authorization: Bearer` on every request when a token is available. */
export const attachBearerMiddleware = (
  client: BearerMiddlewareClient,
  getToken: () => string | undefined
): void => {
  client.use({
    async onRequest({ request }) {
      const token = getToken();
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
      return request;
    },
  });
};

/** Throws via `toError` when openapi-fetch returns `error` or missing `data`. */
export const unwrapOpenApiResponse = async <T>(
  result: Promise<OpenApiFetchResult<T>>,
  toError: OpenApiErrorFromResponse
): Promise<T> => {
  const { data, error, response } = await result;

  if (error !== undefined) {
    throw toError(response.status, error, response);
  }

  if (data === undefined) {
    throw toError(response.status, undefined, response);
  }

  return data;
};
