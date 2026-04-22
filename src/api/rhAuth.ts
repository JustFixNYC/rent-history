export type OtpRequestStatus = "sent" | "pending";
export type OtpRequestResponse = { status: OtpRequestStatus; message?: string };

export type RhProfile = {
  id: number;
  phone_number: string;
  rent_history_id: string;
};

export class RhAuthApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly info?: { error?: string; message?: string } | unknown,
  ) {
    super(message);
  }
}

const getAuthProviderBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_AUTH_PROVIDER_BASE_URL as string | undefined;
  if (!baseUrl) {
    throw new Error("VITE_AUTH_PROVIDER_BASE_URL is not configured.");
  }
  return baseUrl;
};

const postRh = async <T>(path: string, body: object): Promise<T> => {
  const response = await fetch(new URL(path, getAuthProviderBaseUrl()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data: unknown = undefined;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}.`;
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: string }).error)
        : fallbackMessage;
    throw new RhAuthApiError(response.status, message, data);
  }

  return data as T;
};

export const requestRhOtp = (phoneNumber: string): Promise<OtpRequestResponse> =>
  postRh("/rh/request-otp", { phone_number: phoneNumber });

export const verifyRhOtp = (
  phoneNumber: string,
  code: string,
): Promise<RhProfile> => postRh("/rh/verify-otp", { phone_number: phoneNumber, code });
