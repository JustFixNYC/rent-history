export type OtpRequestStatus = "sent" | "pending";
export type OtpRequestResponse = { status: OtpRequestStatus; message?: string };

export type RhProfile = {
  id: number;
  phone_number: string;
  rent_history_id: string;
};

export type RhPhoneUpsertResult = {
  profile: RhProfile;
  existed: boolean;
};

export type RhOtpTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  profile: RhProfile;
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

const getRhOauthClientId = (): string => {
  const clientId = import.meta.env.VITE_RH_OAUTH_CLIENT_ID as string | undefined;
  if (!clientId) {
    throw new Error("VITE_RH_OAUTH_CLIENT_ID is not configured.");
  }
  return clientId;
};

const getRhOauthClientSecret = (): string | undefined => {
  const clientSecret = import.meta.env.VITE_RH_OAUTH_CLIENT_SECRET as
    | string
    | undefined;
  return clientSecret || undefined;
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

export const upsertRhPhone = async (
  phoneNumber: string,
): Promise<RhPhoneUpsertResult> => {
  const response = await fetch(new URL("/rh/phone", getAuthProviderBaseUrl()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone_number: phoneNumber }),
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

  return {
    profile: data as RhProfile,
    existed: response.status === 200,
  };
};

export const verifyRhOtp = (
  phoneNumber: string,
  code: string,
): Promise<RhOtpTokenResponse> => {
  const clientId = getRhOauthClientId();
  const clientSecret = getRhOauthClientSecret();
  return postRh<RhOtpTokenResponse>("/rh/verify-otp-token", {
    phone_number: phoneNumber,
    code,
    client_id: clientId,
    grant_type: "password",
    ...(clientSecret ? { client_secret: clientSecret } : {}),
  });
};
