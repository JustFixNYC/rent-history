export class RhAuthApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly info?: { error?: string; message?: string } | unknown
  ) {
    super(message);
  }
}

export const parseRhJsonError = (data: unknown, response: Response): string => {
  const fallbackMessage = `Request failed with status ${response.status}.`;
  if (typeof data === "object" && data && "error" in data) {
    return String((data as { error: string }).error);
  }
  return fallbackMessage;
};
