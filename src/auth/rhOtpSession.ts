import type { RhOtpTokenResponse, RhProfile } from "../api/rhAuth";

const RH_OTP_SESSION_KEY = "rhOtpSession";
const RH_HISTORY_ID_KEY = "history_id";

export type RhOtpSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  scope: string;
  expiresAtMs: number;
  profile: RhProfile;
};

function isRhOtpSession(value: unknown): value is RhOtpSession {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    typeof candidate.tokenType === "string" &&
    typeof candidate.scope === "string" &&
    typeof candidate.expiresAtMs === "number" &&
    Number.isFinite(candidate.expiresAtMs) &&
    !!candidate.profile &&
    typeof candidate.profile === "object"
  );
}

export const setRhOtpSession = (
  payload: RhOtpTokenResponse,
  nowMs = Date.now()
): RhOtpSession => {
  const session: RhOtpSession = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    tokenType: payload.token_type,
    scope: payload.scope,
    expiresAtMs: nowMs + payload.expires_in * 1000,
    profile: payload.profile,
  };

  window.sessionStorage.setItem(RH_OTP_SESSION_KEY, JSON.stringify(session));
  return session;
};

export const getRhOtpSession = (nowMs = Date.now()): RhOtpSession | null => {
  const raw = window.sessionStorage.getItem(RH_OTP_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRhOtpSession(parsed)) {
      window.sessionStorage.removeItem(RH_OTP_SESSION_KEY);
      return null;
    }

    if (parsed.expiresAtMs <= nowMs) {
      window.sessionStorage.removeItem(RH_OTP_SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.sessionStorage.removeItem(RH_OTP_SESSION_KEY);
    return null;
  }
};

export const getValidRhAccessToken = (nowMs = Date.now()): string | null => {
  const session = getRhOtpSession(nowMs);
  if (!session) return null;
  return session.accessToken;
};

export const clearRhOtpSession = (): void => {
  window.sessionStorage.removeItem(RH_OTP_SESSION_KEY);
};

export const setRhHistoryId = (historyId: string): void => {
  window.sessionStorage.setItem(RH_HISTORY_ID_KEY, historyId);
};

export const getRhHistoryId = (): string | null =>
  window.sessionStorage.getItem(RH_HISTORY_ID_KEY);

export const clearRhHistoryId = (): void => {
  window.sessionStorage.removeItem(RH_HISTORY_ID_KEY);
};
